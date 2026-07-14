import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCharacterStore } from "@/lib/character-store";
import { validateExperienceResult, type ExperienceResultProposal } from "@/lib/interactive-experience";
import { membershipSandboxEnabled } from "@/lib/membership-store";
import { getRpgExperienceStore } from "@/lib/rpg-experience-store";
import { requireSandboxMember } from "@/lib/sandbox-session";

async function ownedCharacter(request: NextRequest, id: string) {
  const accountId = requireSandboxMember(request);
  if (!accountId) return { error: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  const character = await getCharacterStore().findByOwner(accountId);
  if (!character || character.id !== id) return { error: NextResponse.json({ error: "Character not found" }, { status: 404 }) };
  return { accountId, character };
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!membershipSandboxEnabled()) return NextResponse.json({ error: "RPG sandbox is disabled" }, { status: 503 });
  const { id } = await context.params; const ownership = await ownedCharacter(request, id);
  if ("error" in ownership) return ownership.error;
  return NextResponse.json({ rpg: await getRpgExperienceStore().projection(id) });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!membershipSandboxEnabled()) return NextResponse.json({ error: "RPG sandbox is disabled" }, { status: 503 });
  const { id } = await context.params; const ownership = await ownedCharacter(request, id);
  if ("error" in ownership) return ownership.error;
  if (ownership.character.status !== "active") return NextResponse.json({ error: "Only active characters can receive RPG experience" }, { status: 409 });
  try {
    const body = await request.json() as Pick<ExperienceResultProposal, "experienceId" | "sessionId" | "snapshotVersion">;
    if (body.experienceId !== "signal-run-fixture") return NextResponse.json({ error: "Only the approved local RPG fixture is available" }, { status: 422 });
    const current = await getRpgExperienceStore().projection(id);
    const proposal: ExperienceResultProposal = { experienceId: "signal-run-fixture", experienceVersion: 1, kind: "arcade", mode: "character", sessionId: body.sessionId, characterId: id, snapshotVersion: body.snapshotVersion, source: "approved-fixture", verifiedActiveMinutes: 12, context: { strength: 0, agility: 0.4, vitality: 0, intelligence: 0.1, perception: 0.3, creativity: 0, presence: 0, resolve: 0.2 }, challengeFactor: 1, noveltyFactor: 1, valueFactor: 1, outcome: "failure", score: 2400, evidenceIds: [`fixture:${body.sessionId}`], occurredAt: new Date().toISOString() };
    const validated = validateExperienceResult({ characterId: id, snapshotVersion: current.timeLedger.length + 1, level: current.level.level, totalTime: current.totalTime, baseAttributes: current.attributes, effectiveAttributes: current.attributes, conditionIds: [] }, proposal);
    if (!validated.persistent) return NextResponse.json({ rpg: current, message: "Practice sessions do not change persistent RPG state" });
    const now = new Date().toISOString();
    await getRpgExperienceStore().record({ characterId: id, accountId: ownership.accountId, experienceId: validated.experienceId, experienceVersion: validated.experienceVersion, sessionId: validated.sessionId, source: validated.source, verifiedActiveMinutes: validated.verifiedActiveMinutes, context: validated.context, challengeFactor: validated.challengeFactor, noveltyFactor: validated.noveltyFactor, valueFactor: validated.valueFactor, outcome: validated.outcome, evidenceIds: validated.evidenceIds, requestId: request.headers.get("idempotency-key") ?? randomUUID(), occurredAt: validated.occurredAt, recordedAt: now });
    return NextResponse.json({ rpg: await getRpgExperienceStore().projection(id) }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: /Idempotency|already recorded/.test((error as Error).message) ? 409 : 422 }); }
}
