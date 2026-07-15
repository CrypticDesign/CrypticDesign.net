import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCharacterStore } from "@/lib/character-store";
import { firstSignalCondition, firstSignalProposal, type FirstSignalChoice } from "@/lib/first-signal";
import { validateExperienceResult } from "@/lib/interactive-experience";
import { membershipSandboxEnabled } from "@/lib/membership-store";
import { getRpgContentStore } from "@/lib/rpg-content-store";
import { getRpgExperienceStore } from "@/lib/rpg-experience-store";
import { requireSandboxMember } from "@/lib/sandbox-session";

async function ownedActiveCharacter(request: NextRequest, id: string) {
  const accountId = requireSandboxMember(request);
  if (!accountId) return { error: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  const character = await getCharacterStore().findByOwner(accountId);
  if (!character || character.id !== id) return { error: NextResponse.json({ error: "Character not found" }, { status: 404 }) };
  if (character.status !== "active") return { error: NextResponse.json({ error: "Only active characters can enter First Signal" }, { status: 409 }) };
  return { accountId, character };
}

async function state(id: string) {
  const [content, rpg] = await Promise.all([getRpgContentStore().snapshot(id), getRpgExperienceStore().projection(id)]);
  const firstSignal = content.quests.find(({ definition }) => definition.id === "onboarding-first-signal")!;
  const openDoor = content.quests.find(({ definition }) => definition.id === "discovery-open-door")!;
  return { content, rpg, firstSignal, openDoor };
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!membershipSandboxEnabled()) return NextResponse.json({ error: "RPG sandbox is disabled" }, { status: 503 });
  const { id } = await context.params; const ownership = await ownedActiveCharacter(request, id);
  if ("error" in ownership) return ownership.error;
  return NextResponse.json(await state(id));
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!membershipSandboxEnabled()) return NextResponse.json({ error: "RPG sandbox is disabled" }, { status: 503 });
  const { id } = await context.params; const ownership = await ownedActiveCharacter(request, id);
  if ("error" in ownership) return ownership.error;
  try {
    const body = await request.json() as { action: "start" | "meet" | "discover" | "resolve" | "practice"; sessionId?: string; choice?: FirstSignalChoice };
    const requestId = request.headers.get("idempotency-key") ?? randomUUID(); const now = new Date().toISOString(); const contentStore = getRpgContentStore();
    if (body.action === "start") {
      await contentStore.start({ characterId: id, questId: "onboarding-first-signal", requestId: `${requestId}:first`, occurredAt: now });
      await contentStore.start({ characterId: id, questId: "discovery-open-door", requestId: `${requestId}:door`, occurredAt: now });
    } else if (body.action === "meet") {
      const current = await state(id); if (!current.firstSignal.run) throw new Error("First Signal has not started");
      await contentStore.evidence({ characterId: id, questId: "onboarding-first-signal", objectiveId: "meet-character", evidenceEventId: `guide:${current.firstSignal.run.id}`, requestId, occurredAt: now });
    } else if (body.action === "discover") {
      const current = await state(id); if (!current.openDoor.run) throw new Error("Discovery quest has not started");
      await contentStore.evidence({ characterId: id, questId: "discovery-open-door", objectiveId: "discover-release", evidenceEventId: `release:visual-study-01:${current.openDoor.run.id}`, requestId, occurredAt: now });
    } else if (body.action === "resolve" || body.action === "practice") {
      if (!body.sessionId || !body.choice) throw new Error("Signal Run requires a session and choice");
      const current = await state(id);
      const practice = body.action === "practice";
      const metGuide = current.firstSignal.run?.progress.find(({ objectiveId }) => objectiveId === "meet-character")?.count;
      if (!practice && (!metGuide || current.openDoor.run?.status !== "completed")) throw new Error("Meet the guide and discover the release before entering Signal Run");
      if (practice && current.firstSignal.run?.status !== "completed") throw new Error("Practice replay unlocks after First Signal is complete");
      const proposal = firstSignalProposal({ characterId: id, sessionId: body.sessionId, snapshotVersion: current.rpg.timeLedger.length + 1, choice: body.choice, occurredAt: now, practice });
      const validated = validateExperienceResult({ characterId: id, snapshotVersion: current.rpg.timeLedger.length + 1, level: current.rpg.level.level, totalTime: current.rpg.totalTime, baseAttributes: current.rpg.attributes, effectiveAttributes: current.rpg.attributes, conditionIds: [] }, proposal);
      if (!validated.persistent) return NextResponse.json({ ...current, resolution: { outcome: validated.outcome, timeAwarded: 0, context: validated.context, condition: firstSignalCondition(body.choice, body.sessionId), questCompleted: true, practice: true } }, { status: 200 });
      const experienceStore = getRpgExperienceStore();
      const timeEntry = await experienceStore.record({ characterId: id, accountId: ownership.accountId, experienceId: validated.experienceId, experienceVersion: validated.experienceVersion, sessionId: validated.sessionId, source: validated.source, verifiedActiveMinutes: validated.verifiedActiveMinutes, context: validated.context, challengeFactor: validated.challengeFactor, noveltyFactor: validated.noveltyFactor, valueFactor: validated.valueFactor, outcome: validated.outcome, evidenceIds: validated.evidenceIds, requestId, occurredAt: validated.occurredAt, recordedAt: now });
      const condition = firstSignalCondition(body.choice, body.sessionId, timeEntry.sourceEventId, now);
      if (condition) {
        const { explanation, ...persistedCondition } = condition;
        void explanation;
        await experienceStore.applyCondition({ characterId: id, accountId: ownership.accountId, condition: persistedCondition, requestId: `${requestId}:condition`, recordedAt: now });
      }
      if (validated.outcome === "success") await contentStore.evidence({ characterId: id, questId: "onboarding-first-signal", objectiveId: "enter-arcade", evidenceEventId: validated.evidenceIds[0], requestId: `${requestId}:quest`, occurredAt: now });
      const updated = await state(id);
      return NextResponse.json({ ...updated, resolution: { outcome: validated.outcome, timeAwarded: validated.verifiedActiveMinutes, context: validated.context, condition, questCompleted: updated.firstSignal.run?.status === "completed" } }, { status: 201 });
    } else throw new Error("Unknown First Signal action");
    return NextResponse.json(await state(id), { status: 201 });
  } catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: /Idempotency|already recorded/.test((error as Error).message) ? 409 : 422 }); }
}
