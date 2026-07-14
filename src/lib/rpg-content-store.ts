import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { applyQuestEvidence, awardAchievement, grantCollectible, startQuest, type AchievementAward, type CollectibleGrant, type QuestDefinition, type QuestRun } from "./rpg-content.ts";

export const QUEST_FIXTURES: readonly QuestDefinition[] = [
  { id: "onboarding-first-signal", version: 1, title: "First Signal", issuerCharacterId: "system-guide", objectives: [{ id: "meet-character", eventType: "character_profile_viewed", requiredCount: 1, optional: false }, { id: "enter-arcade", eventType: "arcade_session_completed", requiredCount: 1, optional: false }], startsAt: null, endsAt: null, repeatable: false },
  { id: "discovery-open-door", version: 1, title: "Open the Door", issuerCharacterId: "system-guide", objectives: [{ id: "discover-release", eventType: "release_discovered", requiredCount: 1, optional: false }], startsAt: null, endsAt: null, repeatable: false },
];

interface Idempotency { scope: string; requestId: string; payloadHash: string }
interface ContentData { runs: QuestRun[]; achievements: AchievementAward[]; collectibles: CollectibleGrant[]; idempotency: Idempotency[] }
const EMPTY: ContentData = { runs: [], achievements: [], collectibles: [], idempotency: [] };
const queues = new Map<string, Promise<void>>();
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export interface RpgEvidenceEntry {
  id: string;
  type: "quest_started" | "quest_completed" | "quest_failed" | "quest_abandoned" | "quest_expired" | "achievement_earned" | "collectible_granted";
  title: string;
  detail: string;
  occurredAt: string;
}

export interface RpgContentSnapshot { quests: Array<{ definition: QuestDefinition; run: QuestRun | null }>; achievements: AchievementAward[]; collectibles: CollectibleGrant[]; evidence: RpgEvidenceEntry[] }

export class RpgContentStore {
  private readonly filePath: string;
  constructor(filePath: string) { this.filePath = path.resolve(filePath); }

  async snapshot(characterId: string): Promise<RpgContentSnapshot> { return this.withLock(async () => {
    const data = await this.readUnlocked();
    const quests = QUEST_FIXTURES.map((definition) => ({ definition, run: data.runs.find((run) => run.characterId === characterId && run.questId === definition.id && run.questVersion === definition.version) ?? null }));
    const achievements = data.achievements.filter((award) => award.characterId === characterId);
    const collectibles = data.collectibles.filter((grant) => grant.characterId === characterId);
    const evidence: RpgEvidenceEntry[] = [];
    for (const { definition, run } of quests) {
      if (!run) continue;
      if (run.startedAt) evidence.push({ id: `${run.id}:started`, type: "quest_started", title: definition.title, detail: `Quest started · definition v${definition.version}`, occurredAt: run.startedAt });
      if (run.resolvedAt && run.status !== "active" && run.status !== "available") evidence.push({ id: `${run.id}:resolved`, type: `quest_${run.status}`, title: definition.title, detail: `Quest ${run.status.replaceAll("_", " ")} · ${run.resolutionReason?.replaceAll("_", " ") ?? "resolved"} · definition v${definition.version}`, occurredAt: run.resolvedAt });
    }
    for (const award of achievements) evidence.push({ id: `${award.id}:awarded`, type: "achievement_earned", title: award.definitionId.replaceAll("-", " "), detail: `${award.explanation} · definition v${award.definitionVersion}`, occurredAt: award.awardedAt });
    for (const grant of collectibles) evidence.push({ id: `${grant.id}:granted`, type: "collectible_granted", title: grant.collectibleId.replaceAll("-", " "), detail: `Collectible granted · definition v${grant.definitionVersion}`, occurredAt: grant.grantedAt });
    evidence.sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt));
    return { quests, achievements, collectibles, evidence };
  }); }

  async start(input: { characterId: string; questId: string; requestId: string; occurredAt: string }) { return this.mutate(`quest-start:${input.characterId}`, input.requestId, { questId: input.questId }, async (data) => { const definition = this.definition(input.questId); const existing = data.runs.find((run) => run.characterId === input.characterId && run.questId === definition.id && run.questVersion === definition.version); if (existing) return existing; const run = startQuest(definition, { runId: randomUUID(), characterId: input.characterId, repeatWindow: "once", startedAt: input.occurredAt }); data.runs.push(run); return run; }); }

  async evidence(input: { characterId: string; questId: string; objectiveId: string; evidenceEventId: string; requestId: string; occurredAt: string }) { return this.mutate(`quest-evidence:${input.characterId}`, input.requestId, { questId: input.questId, objectiveId: input.objectiveId, evidenceEventId: input.evidenceEventId }, async (data) => { const definition = this.definition(input.questId); const index = data.runs.findIndex((run) => run.characterId === input.characterId && run.questId === definition.id && run.questVersion === definition.version); if (index < 0) throw new Error("Quest has not been started"); const current = data.runs[index]; if (current.progress.some((progress) => progress.objectiveId === input.objectiveId && progress.evidenceEventIds.includes(input.evidenceEventId))) return current; const updated = applyQuestEvidence(definition, current, input); data.runs[index] = updated; if (updated.status === "completed" && definition.id === "onboarding-first-signal" && !data.achievements.some((award) => award.characterId === input.characterId && award.definitionId === "first-signal")) { const award = awardAchievement({ id: "first-signal", version: 1, title: "First Signal", evidenceType: "quest_completed" }, { id: randomUUID(), characterId: input.characterId, evidenceEventIds: updated.progress.flatMap(({ evidenceEventIds }) => evidenceEventIds), explanation: "Completed the First Signal onboarding quest.", awardedAt: input.occurredAt }); data.achievements.push(award); data.collectibles.push(grantCollectible({ id: randomUUID(), characterId: input.characterId, collectibleId: "signal-fragment", definitionVersion: 1, sourceEventId: input.evidenceEventId, grantedAt: input.occurredAt })); } return updated; }); }

  private definition(id: string) { const definition = QUEST_FIXTURES.find((candidate) => candidate.id === id); if (!definition) throw new Error("Quest definition not found"); return definition; }
  private async mutate<T>(scope: string, requestId: string, payload: unknown, operation: (data: ContentData) => Promise<T>): Promise<T> { return this.withLock(async () => { const data = await this.readUnlocked(); const payloadHash = hash(payload); const replay = data.idempotency.find((item) => item.scope === scope && item.requestId === requestId); if (replay) { if (replay.payloadHash !== payloadHash) throw new Error("Idempotency key was reused with different quest data"); return operation(data); } const result = await operation(data); data.idempotency.push({ scope, requestId, payloadHash }); await this.writeUnlocked(data); return result; }); }
  private async readUnlocked(): Promise<ContentData> { try { return JSON.parse(await readFile(this.filePath, "utf8")) as ContentData; } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; await this.writeUnlocked(EMPTY); return structuredClone(EMPTY); } }
  private async writeUnlocked(data: ContentData) { await mkdir(path.dirname(this.filePath), { recursive: true }); const temporary = `${this.filePath}.${process.pid}.${randomUUID()}.tmp`; await writeFile(temporary, JSON.stringify(data, null, 2), "utf8"); await rename(temporary, this.filePath); }
  private async withLock<T>(operation: () => Promise<T>): Promise<T> { const previous = queues.get(this.filePath) ?? Promise.resolve(); let release!: () => void; const current = new Promise<void>((resolve) => { release = resolve; }); const queued = previous.then(() => current); queues.set(this.filePath, queued); await previous; try { return await operation(); } finally { release(); if (queues.get(this.filePath) === queued) queues.delete(this.filePath); } }
}

export function getRpgContentStore() { return new RpgContentStore(path.join(process.cwd(), ".data", "rpg-content-sandbox.json")); }
