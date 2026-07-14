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

test("serializes concurrent creation and enforces one character per account", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cryptic-character-concurrency-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const filePath = path.join(directory, "characters.json");
  const firstStore = new CharacterStore(filePath);
  const secondStore = new CharacterStore(filePath);
  const results = await Promise.allSettled([
    firstStore.create({ id: "char_1", accountId: "member_1", name: "Nova", archetype: "Navigator", requestId: "create_1", occurredAt: "2026-07-13T00:00:00Z" }),
    secondStore.create({ id: "char_2", accountId: "member_1", name: "Echo", archetype: "Builder", requestId: "create_2", occurredAt: "2026-07-13T00:00:00Z" }),
  ]);
  assert.equal(results.filter(({ status }) => status === "fulfilled").length, 1);
  assert.equal(results.filter(({ status }) => status === "rejected").length, 1);
  assert.equal((await firstStore.read()).characters.length, 1);
});

test("scopes idempotency by operation, account, character, and payload", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cryptic-character-idempotency-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const store = new CharacterStore(path.join(directory, "characters.json"));
  const first = await store.create({ id: "char_1", accountId: "member_1", name: "Nova", archetype: "Navigator", requestId: "shared", occurredAt: "2026-07-13T00:00:00Z" });
  const replay = await store.create({ id: "ignored", accountId: "member_1", name: "Nova", archetype: "Navigator", requestId: "shared", occurredAt: "2026-07-13T01:00:00Z" });
  const second = await store.create({ id: "char_2", accountId: "member_2", name: "Echo", archetype: "Builder", requestId: "shared", occurredAt: "2026-07-13T00:00:00Z" });
  assert.equal(replay.id, first.id);
  assert.equal(second.ownerAccountId, "member_2");
  await assert.rejects(
    () => store.update({ characterId: first.id, accountId: "member_1", name: "Changed", archetype: "Navigator", requestId: "update_1", occurredAt: "2026-07-13T02:00:00Z" })
      .then(() => store.update({ characterId: first.id, accountId: "member_1", name: "Different", archetype: "Navigator", requestId: "update_1", occurredAt: "2026-07-13T03:00:00Z" })),
    /reused with different/,
  );
  const independentlyUpdated = await store.update({ characterId: second.id, accountId: "member_2", name: "Echo Prime", archetype: "Builder", requestId: "update_1", occurredAt: "2026-07-13T03:00:00Z" });
  assert.equal(independentlyUpdated.name, "Echo Prime");
});

test("retires and restores without deleting identity or history", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cryptic-character-lifecycle-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const store = new CharacterStore(path.join(directory, "characters.json"));
  const created = await store.create({ id: "char_1", accountId: "member_1", name: "Nova", handle: "nova-one", archetype: "Navigator", presence: "available", discoverable: true, visibility: "public", publicationConsent: true, requestId: "create_1", occurredAt: "2026-07-13T00:00:00Z" });
  const retired = await store.setStatus({ characterId: created.id, accountId: "member_1", status: "retired", requestId: "retire_1", occurredAt: "2026-07-13T01:00:00Z" });
  assert.equal(retired.status, "retired"); assert.equal(retired.presence, "offline"); assert.equal(retired.discoverable, false);
  const restored = await store.setStatus({ characterId: created.id, accountId: "member_1", status: "active", requestId: "restore_1", occurredAt: "2026-07-13T02:00:00Z" });
  assert.equal(restored.id, created.id); assert.equal(restored.status, "active");
  assert.equal((await store.historyFor(created.id, "member_1")).length, 3);
});
