import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { MembershipStore } from "./membership-store.ts";

test("persists subscriptions and idempotent transitions", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cryptic-membership-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const filePath = path.join(directory, "membership.json");
  const store = new MembershipStore(filePath);
  const created = await store.createSubscription({ id: "sub_1", memberId: "member_1", tierId: "tier_observer", priceId: "price_observer_month", requestId: "create_1", occurredAt: "2026-07-13T00:00:00.000Z" });
  assert.equal(created.status, "incomplete");
  const activated = await store.transition({ subscriptionId: "sub_1", status: "active", requestId: "transition_1", reason: "sandbox activation", occurredAt: "2026-07-13T01:00:00.000Z" });
  assert.equal(activated.subscription.status, "active");
  assert.equal(activated.event?.toStatus, "active");
  const repeated = await store.transition({ subscriptionId: "sub_1", status: "active", requestId: "transition_1", reason: "duplicate request", occurredAt: "2026-07-13T02:00:00.000Z" });
  assert.equal(repeated.event, null);
  const persisted = JSON.parse(await readFile(filePath, "utf8"));
  assert.equal(persisted.subscriptions[0].status, "active");
  assert.equal(persisted.events.length, 1);
});

test("rejects mismatched tier and price", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cryptic-membership-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const store = new MembershipStore(path.join(directory, "membership.json"));
  await assert.rejects(() => store.createSubscription({ id: "sub_bad", memberId: "member_1", tierId: "tier_observer", priceId: "price_builder_month", requestId: "create_bad", occurredAt: "2026-07-13T00:00:00.000Z" }), /Price does not belong/);
});
