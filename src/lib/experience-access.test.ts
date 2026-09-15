import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveDevelopmentEntitlement,
  resolveExperienceAccess,
  type ExperienceAccessDefinition,
} from "./experience-access.ts";
import type { EntitlementGrant } from "./entitlements.ts";

const NOW = "2026-09-15T12:00:00.000Z";
const SINGULARIS = {
  declaration: "PUBLIC_COMING_SOON",
  resource: "experience:singularis",
  action: "execute-development",
} satisfies ExperienceAccessDefinition;

function grant(overrides: Partial<EntitlementGrant> = {}): EntitlementGrant {
  return {
    id: "grant_1",
    memberId: "member_1",
    resource: SINGULARIS.resource,
    action: SINGULARIS.action,
    source: "administration",
    sourceId: "operator-approved-development-access",
    effectiveAt: "2026-09-01T00:00:00.000Z",
    expiresAt: null,
    revokedAt: null,
    revocationReason: null,
    createdAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

test("public releases execute without viewer authorization", () => {
  assert.deepEqual(resolveExperienceAccess("PUBLIC_RELEASE", false), {
    state: "PUBLIC_RELEASE",
    discoverable: true,
    executable: true,
    developmentAuthorized: false,
  });
});

test("coming-soon experiences remain discoverable but not executable", () => {
  assert.deepEqual(resolveExperienceAccess("PUBLIC_COMING_SOON", false), {
    state: "PUBLIC_COMING_SOON",
    discoverable: true,
    executable: false,
    developmentAuthorized: false,
  });
});

test("internal-only experiences fail closed for an unauthorized viewer", () => {
  assert.deepEqual(resolveExperienceAccess("INTERNAL_ONLY", false), {
    state: "INTERNAL_ONLY",
    discoverable: false,
    executable: false,
    developmentAuthorized: false,
  });
});

test("an exact administration grant derives development-unlocked access", () => {
  const entitlement = resolveDevelopmentEntitlement(SINGULARIS, "member_1", [grant()], NOW);
  assert.equal(entitlement.allowed, true);
  assert.equal(resolveExperienceAccess(SINGULARIS.declaration, entitlement.allowed).state, "DEVELOPMENT_UNLOCKED");
});

test("authentication without an exact grant is insufficient", () => {
  assert.equal(resolveDevelopmentEntitlement(SINGULARIS, "member_1", [], NOW).allowed, false);
});

test("purchase, tier, event, and promotion grants cannot unlock development", () => {
  for (const source of ["purchase", "tier", "event", "promotion"] as const) {
    assert.equal(resolveDevelopmentEntitlement(SINGULARIS, "member_1", [grant({ source })], NOW).allowed, false);
  }
});

test("wildcard role grants cannot unlock development execution", () => {
  assert.equal(resolveDevelopmentEntitlement(SINGULARIS, "member_1", [grant({ source: "role", resource: "*" })], NOW).allowed, false);
  assert.equal(resolveDevelopmentEntitlement(SINGULARIS, "member_1", [grant({ source: "role", action: "*" })], NOW).allowed, false);
});

test("expired and revoked development grants fail closed", () => {
  assert.equal(resolveDevelopmentEntitlement(SINGULARIS, "member_1", [grant({ expiresAt: NOW })], NOW).allowed, false);
  assert.equal(resolveDevelopmentEntitlement(SINGULARIS, "member_1", [grant({ revokedAt: "2026-09-14T00:00:00.000Z", revocationReason: "removed" })], NOW).allowed, false);
});
