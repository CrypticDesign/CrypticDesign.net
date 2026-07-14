import assert from "node:assert/strict";
import test from "node:test";
import { validateExperienceResult, type CharacterExperienceSnapshot, type ExperienceResultProposal } from "./interactive-experience.ts";
import { startingAttributes } from "./rpg-experience.ts";

const snapshot: CharacterExperienceSnapshot = { characterId: "char_1", snapshotVersion: 1, level: 2, totalTime: 30, baseAttributes: startingAttributes(), effectiveAttributes: startingAttributes(), conditionIds: [] };
const result: ExperienceResultProposal = { experienceId: "signal-run", experienceVersion: 1, kind: "arcade", mode: "character", sessionId: "session_1", characterId: "char_1", snapshotVersion: 1, source: "approved-fixture", verifiedActiveMinutes: 12, context: { strength: 0, agility: 0.4, vitality: 0, intelligence: 0.1, perception: 0.3, creativity: 0, presence: 0, resolve: 0.2 }, challengeFactor: 1, noveltyFactor: 1, valueFactor: 1, outcome: "failure", score: 2400, evidenceIds: ["evidence_1"], occurredAt: "2026-07-13T00:12:00Z" };

test("accepts trusted Arcade evidence even when the player fails", () => {
  const validated = validateExperienceResult(snapshot, result);
  assert.equal(validated.persistent, true);
  assert.equal(validated.verifiedActiveMinutes, 12);
  assert.equal(validated.outcome, "failure");
});

test("practice mode produces no persistent Time", () => {
  const validated = validateExperienceResult(snapshot, { ...result, mode: "practice" });
  assert.equal(validated.persistent, false);
  assert.equal(validated.verifiedActiveMinutes, 0);
  assert.equal(validated.valueFactor, 0);
});

test("rejects untrusted, stale, contradictory, and impossible results", () => {
  assert.throws(() => validateExperienceResult(snapshot, { ...result, source: "untrusted-client" }), /Untrusted/);
  assert.throws(() => validateExperienceResult(snapshot, { ...result, snapshotVersion: 2 }), /stale/);
  assert.throws(() => validateExperienceResult(snapshot, { ...result, verifiedActiveMinutes: 721 }), /impossible/);
  assert.throws(() => validateExperienceResult(snapshot, { ...result, evidenceIds: [] }), /evidence/);
  assert.throws(() => validateExperienceResult(snapshot, { ...result, context: { ...result.context, strength: 0.2 } }), /total 1/);
});

test("supports branching-video results through the same contract", () => {
  const validated = validateExperienceResult(snapshot, { ...result, kind: "branching-video", experienceId: "the-first-door", outcome: "partial", score: null });
  assert.equal(validated.kind, "branching-video");
  assert.equal(validated.persistent, true);
});

