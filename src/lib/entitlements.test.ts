import assert from "node:assert/strict";
import test from "node:test";

import { resolveEntitlement, type EntitlementGrant } from "./entitlements.ts";

const NOW = "2026-07-13T18:00:00.000Z";

function grant(overrides: Partial<EntitlementGrant> = {}): EntitlementGrant {
  return {
    id: "grant_1",
    memberId: "member_1",
    resource: "release:alpha",
    action: "view",
    source: "tier",
    sourceId: "tier_builder",
    effectiveAt: "2026-07-01T00:00:00.000Z",
    expiresAt: null,
    revokedAt: null,
    revocationReason: null,
    createdAt: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

test("allows access from an effective matching grant and returns audit evidence", () => {
  const decision = resolveEntitlement(
    { memberId: "member_1", resource: "release:alpha", action: "view", evaluatedAt: NOW },
    [grant()],
  );
  assert.equal(decision.allowed, true);
  assert.equal(decision.reason, "valid_grant");
  assert.deepEqual(decision.grantIds, ["grant_1"]);
  assert.deepEqual(decision.evidence[0], {
    grantId: "grant_1",
    source: "tier",
    sourceId: "tier_builder",
    resource: "release:alpha",
    action: "view",
  });
});

test("fails closed for anonymous, malformed, or unmatched requests", () => {
  assert.equal(resolveEntitlement({ memberId: null, resource: "release:alpha", action: "view", evaluatedAt: NOW }, [grant()]).allowed, false);
  assert.equal(resolveEntitlement({ memberId: "member_1", resource: "", action: "view", evaluatedAt: NOW }, [grant()]).reason, "invalid_request");
  assert.equal(resolveEntitlement({ memberId: "member_1", resource: "release:beta", action: "view", evaluatedAt: NOW }, [grant()]).reason, "no_matching_grant");
});

test("rejects future, expired, and revoked grants", () => {
  const request = { memberId: "member_1", resource: "release:alpha", action: "view", evaluatedAt: NOW };
  assert.equal(resolveEntitlement(request, [grant({ effectiveAt: "2026-07-14T00:00:00.000Z" })]).allowed, false);
  assert.equal(resolveEntitlement(request, [grant({ expiresAt: NOW })]).allowed, false);
  assert.equal(resolveEntitlement(request, [grant({ revokedAt: "2026-07-12T00:00:00.000Z", revocationReason: "manual review" })]).allowed, false);
});

test("supports resource and action wildcards", () => {
  const decision = resolveEntitlement(
    { memberId: "member_1", resource: "release:alpha", action: "download", evaluatedAt: NOW },
    [grant({ resource: "*", action: "*", source: "role", sourceId: "role_admin" })],
  );
  assert.equal(decision.allowed, true);
});

test("an expired event grant cannot remove independent purchased access", () => {
  const request = { memberId: "member_1", resource: "release:alpha", action: "view", evaluatedAt: NOW };
  const decision = resolveEntitlement(request, [
    grant({ id: "grant_event", source: "event", sourceId: "quest_9", expiresAt: "2026-07-10T00:00:00.000Z" }),
    grant({ id: "grant_purchase", source: "purchase", sourceId: "order_7" }),
  ]);
  assert.equal(decision.allowed, true);
  assert.deepEqual(decision.grantIds, ["grant_purchase"]);
  assert.equal(decision.evidence[0]?.source, "purchase");
});

