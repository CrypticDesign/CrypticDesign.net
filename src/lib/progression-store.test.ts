import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { ProgressionStore } from "./progression-store.ts";

test("records activity once and preserves rule evidence", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cryptic-progression-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const store = new ProgressionStore(path.join(directory, "progression.json"));
  const input = { characterId: "char_1", accountId: "member_1", type: "media_completed" as const, requestId: "request_1", occurredAt: "2026-07-13T00:00:00Z", recordedAt: "2026-07-13T00:01:00Z" };
  const first = await store.recordActivity(input);
  const replay = await store.recordActivity(input);
  assert.equal(replay.id, first.id);
  assert.equal(first.ruleVersion, 1);
  assert.equal((await store.snapshot("char_1")).internalBalance, 2);
  assert.equal((await store.snapshot("char_1")).events.length, 1);
  await assert.rejects(() => store.recordActivity({ ...input, type: "release_discovered" }), /reused with different/);
});

test("reverses by adding one immutable correction", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cryptic-progression-correction-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const store = new ProgressionStore(path.join(directory, "progression.json"));
  const award = await store.recordActivity({ characterId: "char_1", accountId: "member_1", type: "test_event_participated", requestId: "award_1", occurredAt: "2026-07-13T00:00:00Z", recordedAt: "2026-07-13T00:01:00Z" });
  const correction = await store.reverse({ characterId: "char_1", accountId: "member_1", entryId: award.id, requestId: "reverse_1", recordedAt: "2026-07-13T00:02:00Z" });
  assert.equal(correction.delta, -award.delta);
  assert.equal(correction.reversesEntryId, award.id);
  assert.equal((await store.snapshot("char_1")).internalBalance, 0);
  await assert.rejects(() => store.reverse({ characterId: "char_1", accountId: "member_1", entryId: award.id, requestId: "reverse_2", recordedAt: "2026-07-13T00:03:00Z" }), /already reversed/);
});

test("scopes idempotency and snapshots to a character", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cryptic-progression-scope-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const store = new ProgressionStore(path.join(directory, "progression.json"));
  await Promise.all([
    store.recordActivity({ characterId: "char_1", accountId: "member_1", type: "release_discovered", requestId: "shared", occurredAt: "2026-07-13T00:00:00Z", recordedAt: "2026-07-13T00:01:00Z" }),
    store.recordActivity({ characterId: "char_2", accountId: "member_2", type: "release_discovered", requestId: "shared", occurredAt: "2026-07-13T00:00:00Z", recordedAt: "2026-07-13T00:01:00Z" }),
  ]);
  assert.equal((await store.snapshot("char_1")).ledger.length, 1);
  assert.equal((await store.snapshot("char_2")).ledger.length, 1);
});
