import assert from "node:assert/strict";
import test from "node:test";
import { applyQuestEvidence, awardAchievement, grantCollectible, resolveQuest, startQuest, transitionAchievement, type QuestDefinition } from "./rpg-content.ts";

const quest: QuestDefinition = { id: "onboarding", version: 1, title: "First Signal", issuerCharacterId: "system_guide", objectives: [{ id: "create", eventType: "character_created", requiredCount: 1, optional: false }, { id: "discover", eventType: "release_discovered", requiredCount: 1, optional: false }], startsAt: null, endsAt: null, repeatable: false };

test("completes versioned quest objectives idempotently", () => {
  let run = startQuest(quest, { runId: "run_1", characterId: "char_1", repeatWindow: "once", startedAt: "2026-07-13T00:00:00Z" });
  run = applyQuestEvidence(quest, run, { objectiveId: "create", evidenceEventId: "event_1", occurredAt: "2026-07-13T00:01:00Z" });
  run = applyQuestEvidence(quest, run, { objectiveId: "create", evidenceEventId: "event_1", occurredAt: "2026-07-13T00:02:00Z" });
  assert.equal(run.progress[0].count, 1);
  run = applyQuestEvidence(quest, run, { objectiveId: "discover", evidenceEventId: "event_2", occurredAt: "2026-07-13T00:03:00Z" });
  assert.equal(run.status, "completed");
  assert.equal(run.questVersion, 1);
});

test("preserves failed and abandoned quest outcomes", () => {
  const run = startQuest(quest, { runId: "run_1", characterId: "char_1", repeatWindow: "once", startedAt: "2026-07-13T00:00:00Z" });
  assert.equal(resolveQuest(run, "failed", "challenge_failed", "2026-07-13T00:10:00Z").status, "failed");
  assert.equal(resolveQuest(run, "abandoned", "player_choice", "2026-07-13T00:10:00Z").resolutionReason, "player_choice");
});

test("preserves achievement evidence and lifecycle", () => {
  const award = awardAchievement({ id: "first-signal", version: 1, title: "First Signal", evidenceType: "quest_completed" }, { id: "award_1", characterId: "char_1", evidenceEventIds: ["event_2", "event_2"], explanation: "Completed the onboarding signal.", awardedAt: "2026-07-13T00:03:00Z" });
  assert.deepEqual(award.evidenceEventIds, ["event_2"]);
  assert.equal(transitionAchievement(award, "hidden").status, "hidden");
  assert.equal(transitionAchievement(award, "superseded", "award_2").supersedesAwardId, "award_2");
  assert.throws(() => transitionAchievement(award, "superseded"), /replacement/);
});

test("creates only noncommercial nontransferable collectible grants", () => {
  assert.deepEqual(grantCollectible({ id: "grant_1", characterId: "char_1", collectibleId: "signal-fragment", definitionVersion: 1, sourceEventId: "event_2", grantedAt: "2026-07-13T00:03:00Z" }), { id: "grant_1", characterId: "char_1", collectibleId: "signal-fragment", definitionVersion: 1, sourceEventId: "event_2", grantedAt: "2026-07-13T00:03:00Z", revokedAt: null, transferable: false, commercialValue: null });
});

