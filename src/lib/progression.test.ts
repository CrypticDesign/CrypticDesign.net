import assert from "node:assert/strict";
import test from "node:test";
import { resolveEntitlement, type EntitlementGrant } from "./entitlements.ts";
import { progressionBalance, ruleFor, type ProgressionLedgerEntry } from "./progression.ts";

test("uses explicit, versioned internal rules", () => {
  assert.deepEqual(ruleFor("release_discovered"), { id: "sandbox-release-discovery", version: 1, activityType: "release_discovered", internalUnits: 1 });
  assert.throws(() => ruleFor("purchase_completed"), /not approved/);
});

test("calculates balance from an additive ledger without changing entitlements", () => {
  const ledger = [
    { delta: 2 },
    { delta: -2 },
  ] as ProgressionLedgerEntry[];
  assert.equal(progressionBalance(ledger), 0);
  const grant: EntitlementGrant = { id: "grant_1", memberId: "member_1", resource: "release_1", action: "view", source: "purchase", sourceId: "order_1", effectiveAt: "2026-07-13T00:00:00Z", expiresAt: null, revokedAt: null, revocationReason: null, createdAt: "2026-07-13T00:00:00Z" };
  assert.equal(resolveEntitlement({ memberId: "member_1", resource: "release_1", action: "view", evaluatedAt: "2026-07-13T01:00:00Z" }, [grant]).allowed, true);
});
