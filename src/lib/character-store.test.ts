import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { CharacterStore } from "./character-store.ts";

test("persists one account-owned character with immutable history", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cryptic-character-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const store = new CharacterStore(path.join(directory, "characters.json"));
  const created = await store.create({ id: "char_1", accountId: "member_1", name: "Nova", archetype: "Navigator", requestId: "create_1", occurredAt: "2026-07-13T00:00:00Z" });
  assert.equal(created.ownerAccountId, "member_1");
  await assert.rejects(() => store.create({ id: "char_2", accountId: "member_1", name: "Echo", archetype: "Builder", requestId: "create_2", occurredAt: "2026-07-13T01:00:00Z" }), /already has/);
  const updated = await store.update({ characterId: "char_1", accountId: "member_1", name: "Nova", archetype: "Navigator", bio: "Explorer", requestId: "update_1", occurredAt: "2026-07-13T02:00:00Z" });
  assert.equal(updated.bio, "Explorer");
  assert.equal((await store.historyFor("char_1", "member_1")).length, 2);
  await assert.rejects(() => store.historyFor("char_1", "member_2"), /not found/);
});

