import type { ExperienceResultProposal } from "./interactive-experience.ts";
import type { ContextVector } from "./rpg-experience.ts";

export const FIRST_SIGNAL_EXPERIENCE = { id: "first-signal-run", version: 1, verifiedActiveMinutes: 3 } as const;
export type FirstSignalChoice = "trace" | "force";

const CONTEXT: Record<FirstSignalChoice, ContextVector> = {
  trace: { strength: 0, agility: 0.1, vitality: 0, intelligence: 0.25, perception: 0.35, creativity: 0.1, presence: 0, resolve: 0.2 },
  force: { strength: 0.25, agility: 0.2, vitality: 0.1, intelligence: 0.05, perception: 0.1, creativity: 0, presence: 0, resolve: 0.3 },
};

export function firstSignalProposal(input: { characterId: string; sessionId: string; snapshotVersion: number; choice: FirstSignalChoice; occurredAt: string; practice?: boolean }): ExperienceResultProposal {
  if (!input.sessionId.trim()) throw new Error("Session identity is required");
  if (input.choice !== "trace" && input.choice !== "force") throw new Error("Unknown First Signal choice");
  const success = input.choice === "trace";
  return {
    experienceId: FIRST_SIGNAL_EXPERIENCE.id,
    experienceVersion: FIRST_SIGNAL_EXPERIENCE.version,
    kind: "branching-video",
    mode: input.practice ? "practice" : "character",
    sessionId: input.sessionId,
    characterId: input.characterId,
    snapshotVersion: input.snapshotVersion,
    source: "sandbox-server",
    verifiedActiveMinutes: FIRST_SIGNAL_EXPERIENCE.verifiedActiveMinutes,
    context: CONTEXT[input.choice],
    challengeFactor: success ? 1 : 0.9,
    noveltyFactor: 1,
    valueFactor: 1,
    outcome: success ? "success" : "failure",
    score: success ? 100 : 40,
    evidenceIds: [`first-signal:${input.sessionId}:${input.choice}`],
    occurredAt: input.occurredAt,
  };
}

export function firstSignalCondition(choice: FirstSignalChoice, sessionId: string, sourceEventId = `first-signal:${sessionId}:force`, effectiveAt = new Date().toISOString()) {
  return choice === "force" ? { id: `signal-fatigue:${sessionId}`, definitionId: "signal-fatigue", definitionVersion: 1, scope: "session" as const, campaignId: null, sessionId, severity: 1, attributeModifiers: {}, resourceModifiers: { focus: -5 }, effectiveAt, expiresAt: effectiveAt, removedAt: null, sourceEventId, explanation: "Forcing the unstable signal caused fatigue for that Signal Run. The condition remains in history, but the completed session no longer changes current capability." } : null;
}
