import assert from "node:assert/strict";
import test from "node:test";
import { firstSignalCondition, firstSignalProposal } from "./first-signal.ts";
import { validateExperienceResult } from "./interactive-experience.ts";
import { startingAttributes } from "./rpg-experience.ts";

const snapshot = { characterId: "char_1", snapshotVersion: 1, level: 1, totalTime: 0, baseAttributes: startingAttributes(), effectiveAttributes: startingAttributes(), conditionIds: [] };

test("trace resolves First Signal successfully with server-owned Time and Context", () => {
  const proposal = firstSignalProposal({ characterId: "char_1", sessionId: "session_1", snapshotVersion: 1, choice: "trace", occurredAt: "2026-07-14T00:00:00Z" });
  const result = validateExperienceResult(snapshot, proposal);
  assert.equal(result.outcome, "success");
  assert.equal(result.verifiedActiveMinutes, 3);
  assert.equal(result.context.perception, 0.35);
  assert.equal(firstSignalCondition("trace", "session_1"), null);
});

test("force fails but preserves legitimate Time and applies only a session condition", () => {
  const proposal = firstSignalProposal({ characterId: "char_1", sessionId: "session_2", snapshotVersion: 1, choice: "force", occurredAt: "2026-07-14T00:00:00Z" });
  const result = validateExperienceResult(snapshot, proposal);
  assert.equal(result.outcome, "failure");
  assert.equal(result.verifiedActiveMinutes, 3);
  assert.equal(firstSignalCondition("force", "session_2")?.scope, "session");
});

test("completed characters can replay in practice without persistent Time", () => {
  const proposal = firstSignalProposal({ characterId: "char_1", sessionId: "session_3", snapshotVersion: 1, choice: "trace", occurredAt: "2026-07-14T00:00:00Z", practice: true });
  const result = validateExperienceResult(snapshot, proposal);
  assert.equal(result.persistent, false);
  assert.equal(result.verifiedActiveMinutes, 0);
});
