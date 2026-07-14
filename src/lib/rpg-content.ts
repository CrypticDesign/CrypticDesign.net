export type QuestStatus = "available" | "active" | "completed" | "failed" | "abandoned" | "expired";
export type AchievementStatus = "earned" | "revoked" | "superseded" | "hidden";

export interface QuestObjectiveDefinition { id: string; eventType: string; requiredCount: number; optional: boolean }
export interface QuestDefinition {
  id: string;
  version: number;
  title: string;
  issuerCharacterId: string;
  objectives: QuestObjectiveDefinition[];
  startsAt: string | null;
  endsAt: string | null;
  repeatable: boolean;
}
export interface QuestProgress { objectiveId: string; count: number; evidenceEventIds: string[] }
export interface QuestRun {
  id: string;
  characterId: string;
  questId: string;
  questVersion: number;
  repeatWindow: string;
  status: QuestStatus;
  progress: QuestProgress[];
  startedAt: string | null;
  resolvedAt: string | null;
  resolutionReason: string | null;
}

export function startQuest(definition: QuestDefinition, input: { runId: string; characterId: string; repeatWindow: string; startedAt: string }): QuestRun {
  const startedAt = Date.parse(input.startedAt);
  if (definition.startsAt && startedAt < Date.parse(definition.startsAt)) throw new Error("Quest is not available yet");
  if (definition.endsAt && startedAt >= Date.parse(definition.endsAt)) throw new Error("Quest has expired");
  return { id: input.runId, characterId: input.characterId, questId: definition.id, questVersion: definition.version, repeatWindow: input.repeatWindow, status: "active", progress: definition.objectives.map(({ id }) => ({ objectiveId: id, count: 0, evidenceEventIds: [] })), startedAt: input.startedAt, resolvedAt: null, resolutionReason: null };
}

export function applyQuestEvidence(definition: QuestDefinition, run: QuestRun, input: { objectiveId: string; evidenceEventId: string; occurredAt: string }): QuestRun {
  if (run.status !== "active") throw new Error("Quest is not active");
  if (run.questId !== definition.id || run.questVersion !== definition.version) throw new Error("Quest definition version does not match the run");
  if (definition.endsAt && Date.parse(input.occurredAt) >= Date.parse(definition.endsAt)) return { ...run, status: "expired", resolvedAt: input.occurredAt, resolutionReason: "window_expired" };
  const objective = definition.objectives.find(({ id }) => id === input.objectiveId);
  if (!objective) throw new Error("Quest objective does not exist");
  const progress = run.progress.map((item) => {
    if (item.objectiveId !== objective.id || item.evidenceEventIds.includes(input.evidenceEventId)) return item;
    return { ...item, count: Math.min(objective.requiredCount, item.count + 1), evidenceEventIds: [...item.evidenceEventIds, input.evidenceEventId] };
  });
  const requiredComplete = definition.objectives.filter(({ optional }) => !optional).every((required) => progress.find(({ objectiveId }) => objectiveId === required.id)!.count >= required.requiredCount);
  return requiredComplete ? { ...run, progress, status: "completed", resolvedAt: input.occurredAt, resolutionReason: "objectives_completed" } : { ...run, progress };
}

export function resolveQuest(run: QuestRun, status: Extract<QuestStatus, "failed" | "abandoned" | "expired">, reason: string, resolvedAt: string): QuestRun {
  if (run.status !== "active") throw new Error("Quest is not active");
  return { ...run, status, resolutionReason: reason, resolvedAt };
}

export interface AchievementDefinition { id: string; version: number; title: string; evidenceType: string }
export interface AchievementAward { id: string; characterId: string; definitionId: string; definitionVersion: number; status: AchievementStatus; evidenceEventIds: string[]; explanation: string; awardedAt: string; supersedesAwardId: string | null }

export function awardAchievement(definition: AchievementDefinition, input: { id: string; characterId: string; evidenceEventIds: string[]; explanation: string; awardedAt: string }): AchievementAward {
  if (!input.evidenceEventIds.length) throw new Error("Achievement evidence is required");
  if (!input.explanation.trim()) throw new Error("Achievement explanation is required");
  return { id: input.id, characterId: input.characterId, definitionId: definition.id, definitionVersion: definition.version, status: "earned", evidenceEventIds: [...new Set(input.evidenceEventIds)], explanation: input.explanation.trim(), awardedAt: input.awardedAt, supersedesAwardId: null };
}

export function transitionAchievement(award: AchievementAward, status: Exclude<AchievementStatus, "earned">, replacementAwardId: string | null = null): AchievementAward {
  if (award.status !== "earned" && award.status !== "hidden") throw new Error("Achievement award is already terminal");
  if (status === "superseded" && !replacementAwardId) throw new Error("Superseded achievements require a replacement award");
  return { ...award, status, supersedesAwardId: status === "superseded" ? replacementAwardId : award.supersedesAwardId };
}

export interface CollectibleGrant { id: string; characterId: string; collectibleId: string; definitionVersion: number; sourceEventId: string; grantedAt: string; revokedAt: string | null; transferable: false; commercialValue: null }
export const grantCollectible = (input: Omit<CollectibleGrant, "transferable" | "commercialValue" | "revokedAt">): CollectibleGrant => ({ ...input, revokedAt: null, transferable: false, commercialValue: null });

