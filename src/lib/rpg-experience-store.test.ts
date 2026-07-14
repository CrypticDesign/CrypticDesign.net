import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { RpgExperienceStore } from "./rpg-experience-store.ts";
import type { ContextVector } from "./rpg-experience.ts";

const context: ContextVector = { strength: 0, agility: 0.4, vitality: 0, intelligence: 0.1, perception: 0.3, creativity: 0, presence: 0, resolve: 0.2 };
const activity = { characterId: "char_1", accountId: "member_1", experienceId: "arcade_signal_run", experienceVersion: 1, sessionId: "session_1", source: "approved-fixture" as const, verifiedActiveMinutes: 30, context, challengeFactor: 1, noveltyFactor: 1, valueFactor: 1, requestId: "request_1", occurredAt: "2026-07-13T00:00:00Z", recordedAt: "2026-07-13T00:30:00Z" };

test("persists Time and contextual usage as replay-safe ledgers", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cryptic-rpg-")); t.after(() => rm(directory, { recursive: true, force: true }));
  const store = new RpgExperienceStore(path.join(directory, "rpg.json"));
  const first = await store.record(activity);
  const replay = await store.record(activity);
  assert.equal(replay.id, first.id);
  const projection = await store.projection("char_1");
  assert.equal(projection.totalTime, 30);
  assert.equal(projection.level.level, 2);
  assert.equal(projection.attributeUsage.agility, 12);
  assert.equal(projection.attributes.agility, 10);
  assert.equal(projection.events.length, 1);
});

test("rejects duplicate sessions and conflicting idempotency payloads", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cryptic-rpg-")); t.after(() => rm(directory, { recursive: true, force: true }));
  const store = new RpgExperienceStore(path.join(directory, "rpg.json"));
  await store.record(activity);
  await assert.rejects(() => store.record({ ...activity, verifiedActiveMinutes: 31 }), /reused with different/);
  await assert.rejects(() => store.record({ ...activity, requestId: "request_2" }), /already recorded/);
});

test("reverses Time and attribute usage additively", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cryptic-rpg-")); t.after(() => rm(directory, { recursive: true, force: true }));
  const store = new RpgExperienceStore(path.join(directory, "rpg.json"));
  const original = await store.record(activity);
  const correction = await store.reverse({ characterId: "char_1", accountId: "member_1", timeEntryId: original.id, requestId: "reverse_1", recordedAt: "2026-07-13T01:00:00Z" });
  const replay = await store.reverse({ characterId: "char_1", accountId: "member_1", timeEntryId: original.id, requestId: "reverse_1", recordedAt: "2026-07-13T01:00:00Z" });
  assert.equal(replay.id, correction.id);
  const projection = await store.projection("char_1");
  assert.equal(projection.totalTime, 0);
  assert.equal(projection.attributeUsage.agility, 0);
  assert.equal(projection.timeLedger.length, 2);
  await assert.rejects(() => store.reverse({ characterId: "char_1", accountId: "member_1", timeEntryId: original.id, requestId: "reverse_2", recordedAt: "2026-07-13T02:00:00Z" }), /already reversed/);
});

