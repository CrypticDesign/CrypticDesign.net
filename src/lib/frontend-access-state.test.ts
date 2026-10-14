import assert from "node:assert/strict";
import test from "node:test";
import {
  FRONTEND_ACCESS_FIXTURES,
  FRONTEND_ACCESS_STATES,
  FRONTEND_AUDIENCES,
  resolveFrontendAccess,
  type FrontendAccessSubject,
  type FrontendCapability,
} from "./frontend-access-state.ts";

const NOW = "2026-10-14T00:00:00.000Z";

const ACCOUNT: FrontendAccessSubject = {
  account: { state: "authenticated", accountId: "account-1" },
  character: { state: "active", characterId: "character-1" },
  membership: { state: "active", memberId: "member-1" },
  subscription: { state: "active", subscriptionId: "subscription-1" },
  progression: { level: 99, achievementIds: ["achievement-1"] },
  roles: [],
  entitlements: [],
};

test("fixtures cover every representative audience and required presentation state", () => {
  assert.deepEqual(
    new Set(FRONTEND_ACCESS_FIXTURES.map(({ audience }) => audience)),
    new Set(FRONTEND_AUDIENCES),
  );
  assert.deepEqual(
    new Set(FRONTEND_ACCESS_FIXTURES.map(({ expectedState }) => expectedState)),
    new Set(FRONTEND_ACCESS_STATES),
  );

  for (const fixture of FRONTEND_ACCESS_FIXTURES) {
    assert.equal(
      resolveFrontendAccess(fixture.subject, fixture.capability, fixture.evaluatedAt).state,
      fixture.expectedState,
      fixture.id,
    );
  }
});
test("Character, progression, membership, and subscription state never grant authority", () => {
  const roleCapability: FrontendCapability = {
    id: "operator:review",
    availability: "active",
    requirement: { kind: "role", role: "operator" },
  };
  const entitlementCapability: FrontendCapability = {
    id: "release:premium",
    availability: "active",
    requirement: { kind: "entitlement", code: "benefit:premium" },
  };

  assert.deepEqual(resolveFrontendAccess(ACCOUNT, roleCapability, NOW), {
    state: "denied",
    productionAuthorized: false,
    reason: "missing_role",
    copy: "This account does not currently have access.",
  });
  assert.equal(resolveFrontendAccess(ACCOUNT, entitlementCapability, NOW).state, "denied");
});

test("fixture grants remain preview-only and cannot become production authority", () => {
  const fixtureSubject: FrontendAccessSubject = {
    ...ACCOUNT,
    roles: [{ role: "operator", authority: "fixture", expiresAt: null }],
    entitlements: [{ code: "benefit:premium", authority: "fixture", expiresAt: null }],
  };

  for (const capability of [
    { id: "operator:review", availability: "active", requirement: { kind: "role", role: "operator" } },
    { id: "release:premium", availability: "active", requirement: { kind: "entitlement", code: "benefit:premium" } },
  ] as const satisfies readonly FrontendCapability[]) {
    const result = resolveFrontendAccess(fixtureSubject, capability, NOW);
    assert.equal(result.state, "preview");
    assert.equal(result.productionAuthorized, false);
    assert.match(result.copy, /local/i);
  }
});

test("only explicit authoritative role or entitlement evidence can allow protected access", () => {
  const subject: FrontendAccessSubject = {
    ...ACCOUNT,
    roles: [{ role: "operator", authority: "authoritative", expiresAt: null }],
    entitlements: [{ code: "benefit:premium", authority: "authoritative", expiresAt: "2026-10-15T00:00:00.000Z" }],
  };

  const operator = resolveFrontendAccess(subject, {
    id: "operator:review",
    availability: "active",
    requirement: { kind: "role", role: "operator" },
  }, NOW);
  const premium = resolveFrontendAccess(subject, {
    id: "release:premium",
    availability: "active",
    requirement: { kind: "entitlement", code: "benefit:premium" },
  }, NOW);

  assert.equal(operator.state, "allowed");
  assert.equal(operator.productionAuthorized, true);
  assert.equal(premium.state, "allowed");
  assert.equal(premium.productionAuthorized, true);
});

test("authoritative evidence wins over fixture duplicates and malformed context fails closed", () => {
  const duplicateRoleSubject: FrontendAccessSubject = {
    ...ACCOUNT,
    roles: [
      { role: "operator", authority: "fixture", expiresAt: null },
      { role: "operator", authority: "authoritative", expiresAt: null },
    ],
  };
  const operatorCapability: FrontendCapability = {
    id: "operator:review",
    availability: "active",
    requirement: { kind: "role", role: "operator" },
  };

  assert.equal(resolveFrontendAccess(duplicateRoleSubject, operatorCapability, NOW).state, "allowed");
  assert.equal(resolveFrontendAccess(duplicateRoleSubject, operatorCapability, "not-a-date").state, "denied");
  assert.equal(resolveFrontendAccess({
    ...ACCOUNT,
    account: { state: "authenticated", accountId: null },
  }, {
    id: "account:home",
    availability: "active",
    requirement: { kind: "account" },
  }, NOW).state, "denied");
});

test("expired, suspended, unavailable, preview, and deferred states fail closed", () => {
  const expiredSubject: FrontendAccessSubject = {
    ...ACCOUNT,
    entitlements: [{ code: "benefit:premium", authority: "authoritative", expiresAt: "2026-10-13T23:59:59.000Z" }],
  };
  assert.equal(resolveFrontendAccess(expiredSubject, {
    id: "release:premium",
    availability: "active",
    requirement: { kind: "entitlement", code: "benefit:premium" },
  }, NOW).state, "expired");

  assert.equal(resolveFrontendAccess({ ...ACCOUNT, account: { ...ACCOUNT.account, state: "suspended" } }, {
    id: "account:home",
    availability: "active",
    requirement: { kind: "account" },
  }, NOW).state, "denied");

  for (const availability of ["unavailable", "preview", "deferred"] as const) {
    const result = resolveFrontendAccess(ACCOUNT, {
      id: `capability:${availability}`,
      availability,
      requirement: { kind: "public" },
    }, NOW);
    assert.equal(result.state, availability);
    assert.equal(result.productionAuthorized, false);
  }
});
