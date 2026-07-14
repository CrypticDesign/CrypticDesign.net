import { CORE_ATTRIBUTES, type AttributeScores, type ContextVector } from "./rpg-experience.ts";

export type ExperienceMode = "pure" | "character" | "campaign" | "challenge" | "practice";
export type ExperienceKind = "arcade" | "branching-video" | "room" | "event";

export interface CharacterExperienceSnapshot {
  characterId: string;
  snapshotVersion: number;
  level: number;
  totalTime: number;
  baseAttributes: AttributeScores;
  effectiveAttributes: AttributeScores;
  conditionIds: string[];
}

export interface ExperienceResultProposal {
  experienceId: string;
  experienceVersion: number;
  kind: ExperienceKind;
  mode: ExperienceMode;
  sessionId: string;
  characterId: string;
  snapshotVersion: number;
  source: "sandbox-server" | "approved-fixture" | "untrusted-client";
  verifiedActiveMinutes: number;
  context: ContextVector;
  challengeFactor: number;
  noveltyFactor: number;
  valueFactor: number;
  outcome: "success" | "partial" | "failure" | "abandoned";
  score: number | null;
  evidenceIds: string[];
  occurredAt: string;
}

export type ValidatedExperienceResult = Omit<ExperienceResultProposal, "source"> & { source: "sandbox-server" | "approved-fixture"; persistent: boolean };

export function validateExperienceResult(snapshot: CharacterExperienceSnapshot, proposal: ExperienceResultProposal): ValidatedExperienceResult {
  if (proposal.characterId !== snapshot.characterId) throw new Error("Experience result belongs to a different character");
  if (proposal.snapshotVersion !== snapshot.snapshotVersion) throw new Error("Experience result uses a stale character snapshot");
  if (proposal.source === "untrusted-client") throw new Error("Untrusted clients cannot verify experience results");
  if (!Number.isSafeInteger(proposal.experienceVersion) || proposal.experienceVersion < 1) throw new Error("Invalid experience version");
  if (!proposal.sessionId.trim()) throw new Error("Session identity is required");
  if (!Number.isSafeInteger(proposal.verifiedActiveMinutes) || proposal.verifiedActiveMinutes < 0 || proposal.verifiedActiveMinutes > 720) throw new Error("Verified active minutes are impossible or invalid");
  if (!proposal.evidenceIds.length && proposal.verifiedActiveMinutes > 0) throw new Error("Active Time requires evidence");
  if (proposal.score !== null && (!Number.isFinite(proposal.score) || proposal.score < 0)) throw new Error("Invalid experience score");
  const contextTotal = CORE_ATTRIBUTES.reduce((sum, attribute) => sum + proposal.context[attribute], 0);
  if (Math.abs(contextTotal - 1) > 0.000001) throw new Error("Experience Context must total 1");
  const persistent = proposal.mode !== "practice";
  const trusted = { ...proposal, source: proposal.source as ValidatedExperienceResult["source"] };
  return persistent ? { ...trusted, persistent } : { ...trusted, persistent, verifiedActiveMinutes: 0, valueFactor: 0 };
}
