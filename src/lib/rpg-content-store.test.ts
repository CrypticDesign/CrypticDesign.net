import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { RpgContentStore } from "./rpg-content-store.ts";

test("persists an idempotent onboarding quest and grants explainable noncommercial rewards", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cryptic-content-")); t.after(() => rm(directory, { recursive: true, force: true })); const store = new RpgContentStore(path.join(directory, "content.json"));
  await store.start({ characterId: "char_1", questId: "onboarding-first-signal", requestId: "start", occurredAt: "2026-07-13T00:00:00Z" });
  await store.evidence({ characterId: "char_1", questId: "onboarding-first-signal", objectiveId: "meet-character", evidenceEventId: "event_1", requestId: "evidence_1", occurredAt: "2026-07-13T00:01:00Z" });
  await store.evidence({ characterId: "char_1", questId: "onboarding-first-signal", objectiveId: "enter-arcade", evidenceEventId: "event_2", requestId: "evidence_2", occurredAt: "2026-07-13T00:02:00Z" });
  const replay = await store.evidence({ characterId: "char_1", questId: "onboarding-first-signal", objectiveId: "enter-arcade", evidenceEventId: "event_2", requestId: "evidence_2", occurredAt: "2026-07-13T00:02:00Z" });
  assert.equal(replay.status, "completed");
  const snapshot = await store.snapshot("char_1");
  assert.equal(snapshot.achievements.length, 1); assert.equal(snapshot.achievements[0].explanation, "Completed the First Signal onboarding quest.");
  assert.equal(snapshot.collectibles.length, 1); assert.equal(snapshot.collectibles[0].transferable, false); assert.equal(snapshot.collectibles[0].commercialValue, null);
  const completion = snapshot.evidence.find((entry) => entry.type === "quest_completed");
  assert.equal(completion?.title, "First Signal");
  assert.equal(completion?.occurredAt, "2026-07-13T00:02:00Z");
  assert.match(completion?.detail ?? "", /objectives completed/);
});

