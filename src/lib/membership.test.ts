import assert from "node:assert/strict";
import test from "node:test";

import {
  SANDBOX_PRICES,
  SANDBOX_TIERS,
  canTransitionSubscription,
  resolveEntitlements,
  transitionSubscription,
  type Subscription,
} from "./membership.ts";

const subscription: Subscription = {
  id: "sub_test",
  memberId: "member_test",
  tierId: "tier_observer",
  priceId: "price_observer_month",
  status: "incomplete",
  provider: null,
  providerSubscriptionId: null,
  currentPeriodStartsAt: null,
  currentPeriodEndsAt: null,
  cancelAtPeriodEnd: false,
  createdAt: "2026-07-13T00:00:00.000Z",
  updatedAt: "2026-07-13T00:00:00.000Z",
};

test("allows activation and records an immutable transition event", () => {
  const result = transitionSubscription(subscription, "active", {
    eventId: "event_1",
    reason: "sandbox checkout completed",
    occurredAt: "2026-07-13T01:00:00.000Z",
  });

  assert.equal(result.subscription.status, "active");
  assert.equal(result.subscription.updatedAt, "2026-07-13T01:00:00.000Z");
  assert.deepEqual(result.event, {
    id: "event_1",
    subscriptionId: "sub_test",
    fromStatus: "incomplete",
    toStatus: "active",
    reason: "sandbox checkout completed",
    occurredAt: "2026-07-13T01:00:00.000Z",
  });
  assert.equal(subscription.status, "incomplete");
});

test("treats repeated provider events as a no-op", () => {
  const active = { ...subscription, status: "active" as const };
  const result = transitionSubscription(active, "active", {
    eventId: "event_duplicate",
    reason: "duplicate webhook",
    occurredAt: "2026-07-13T02:00:00.000Z",
  });

  assert.equal(result.subscription, active);
  assert.equal(result.event, null);
});

test("rejects impossible transitions", () => {
  assert.equal(canTransitionSubscription("expired", "active"), false);
  assert.throws(
    () => transitionSubscription({ ...subscription, status: "expired" }, "active", {
      eventId: "event_invalid",
      reason: "invalid restore",
      occurredAt: "2026-07-13T03:00:00.000Z",
    }),
    /Invalid subscription transition: expired -> active/,
  );
});

test("sandbox fixtures preserve the audited historical tier names and prices", () => {
  assert.deepEqual(SANDBOX_TIERS.map(({ name }) => name), ["Observer", "Builder", "Architect"]);
  assert.deepEqual(SANDBOX_PRICES.map(({ amountMinor }) => amountMinor), [800, 2000, 5000]);
  assert.ok(SANDBOX_PRICES.every(({ currency }) => currency === "USD"));
});

test("resolves unique benefits only from trialing or active subscriptions", () => {
  const subscriptions = [
    { ...subscription, id: "sub_active", tierId: "tier_builder", status: "active" as const },
    { ...subscription, id: "sub_trial", tierId: "tier_observer", status: "trialing" as const },
    { ...subscription, id: "sub_paused", tierId: "tier_architect", status: "paused" as const },
  ];
  assert.deepEqual(resolveEntitlements(subscriptions, SANDBOX_TIERS), ["benefit_early_access", "benefit_updates"]);
});

test("revokes tier benefits when a subscription is canceled or expired", () => {
  for (const status of ["canceled", "expired"] as const) {
    assert.deepEqual(resolveEntitlements([{ ...subscription, tierId: "tier_architect", status }], SANDBOX_TIERS), []);
  }
});

test("covers canonical recovery, refund, dispute, and termination transitions", () => {
  const allowed: Array<[typeof subscription.status, typeof subscription.status]> = [
    ["pending", "trialing"],
    ["active", "past_due"],
    ["past_due", "grace"],
    ["grace", "active"],
    ["active", "refunded"],
    ["refunded", "terminated"],
    ["active", "disputed"],
    ["disputed", "active"],
    ["active", "terminated"],
  ];
  for (const [from, to] of allowed) assert.equal(canTransitionSubscription(from, to), true, `${from} -> ${to}`);
  assert.equal(canTransitionSubscription("terminated", "active"), false);
  assert.equal(canTransitionSubscription("expired", "active"), false);
});
