import assert from "node:assert/strict";
import test from "node:test";
import { AccountAdministrationError } from "./account-administration.ts";
import {
  inspectAccountAdministrationTarget,
  type AccountAdministrationInspectionDependencies,
} from "./account-administration-inspection.ts";

const OPERATOR_ID = "10000000-0000-4000-8000-000000000001";
const TARGET_ID = "20000000-0000-4000-8000-000000000002";
const CHARACTER_ID = "30000000-0000-4000-8000-000000000003";
const INSPECTION_ID = "40000000-0000-4000-8000-000000000004";
const NOW = "2026-09-28T18:00:00.000Z";

function dependencies(overrides: Partial<AccountAdministrationInspectionDependencies> = {}): AccountAdministrationInspectionDependencies {
  return {
    loadOperator: async () => ({ accountId: OPERATOR_ID, status: "active", capabilities: ["account:inspect"] }),
    loadAccount: async () => ({
      id: TARGET_ID,
      email: "member@example.com",
      emailVerified: true,
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
      lastSignInAt: "2026-09-28T17:00:00.000Z",
    }),
    isProtectedTarget: async () => true,
    loadCharacter: async () => ({
      id: CHARACTER_ID,
      name: "Nova",
      handle: "nova",
      status: "active",
      presence: "away",
      discoverable: false,
      visibility: "private",
      publicationConsent: false,
      createdAt: "2026-01-02T00:00:00.000Z",
      updatedAt: "2026-09-01T00:00:00.000Z",
    }),
    recordInspection: async (event) => ({ inspectionId: event.inspectionId, occurredAt: NOW }),
    ...overrides,
  };
}

async function inspect(deps = dependencies()) {
  return await inspectAccountAdministrationTarget(
    { inspectionId: INSPECTION_ID, operatorAccountId: OPERATOR_ID, targetAccountId: TARGET_ID, now: NOW },
    deps,
  );
}

test("returns the bounded account and Character inspection projection", async () => {
  assert.deepEqual(await inspect(), {
    inspectionId: INSPECTION_ID,
    inspectedAt: NOW,
    protectedTarget: true,
    account: {
      id: TARGET_ID,
      email: "member@example.com",
      emailVerified: true,
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
      lastSignInAt: "2026-09-28T17:00:00.000Z",
    },
    character: {
      id: CHARACTER_ID,
      name: "Nova",
      handle: "nova",
      status: "active",
      presence: "away",
      discoverable: false,
      visibility: "private",
      publicationConsent: false,
      createdAt: "2026-01-02T00:00:00.000Z",
      updatedAt: "2026-09-01T00:00:00.000Z",
    },
  });
});

test("supports an account with no Character without inventing one", async () => {
  const result = await inspect(dependencies({ loadCharacter: async () => null, isProtectedTarget: async () => false }));
  assert.equal(result.character, null);
  assert.equal(result.protectedTarget, false);
});

test("durably audits the successful bounded inspection before returning it", async () => {
  const events: unknown[] = [];
  const result = await inspect(dependencies({
    recordInspection: async (event) => {
      events.push(event);
      return { inspectionId: event.inspectionId, occurredAt: "2026-09-28T18:00:01.000Z" };
    },
  }));
  assert.deepEqual(events, [{
    inspectionId: INSPECTION_ID,
    operatorAccountId: OPERATOR_ID,
    targetAccountId: TARGET_ID,
    targetCharacterId: CHARACTER_ID,
  }]);
  assert.equal(result.inspectedAt, "2026-09-28T18:00:01.000Z");
});

test("fails closed without returning sensitive data when durable audit recording fails", async () => {
  await assert.rejects(
    () => inspect(dependencies({ recordInspection: async () => { throw new Error("unavailable"); } })),
    (error: unknown) => error instanceof AccountAdministrationError && error.code === "audit_incomplete",
  );
  await assert.rejects(
    () => inspect(dependencies({ recordInspection: async () => ({ inspectionId: "wrong", occurredAt: NOW }) })),
    (error: unknown) => error instanceof AccountAdministrationError && error.code === "audit_incomplete",
  );
});

test("denies missing, disabled, and capability-free operators before loading the account", async () => {
  for (const loadOperator of [
    async () => null,
    async () => ({ accountId: OPERATOR_ID, status: "disabled" as const, capabilities: ["account:inspect" as const] }),
    async () => ({ accountId: OPERATOR_ID, status: "active" as const, capabilities: [] }),
  ]) {
    let accountLoads = 0;
    await assert.rejects(
      () => inspect(dependencies({ loadOperator, loadAccount: async () => { accountLoads += 1; return null; } })),
      (error: unknown) => error instanceof AccountAdministrationError && error.code === "forbidden",
    );
    assert.equal(accountLoads, 0);
  }
});

test("returns a controlled missing-target error and does not query Character data", async () => {
  let characterLoads = 0;
  let auditWrites = 0;
  await assert.rejects(
    () => inspect(dependencies({
      loadAccount: async () => null,
      loadCharacter: async () => { characterLoads += 1; return null; },
      recordInspection: async () => { auditWrites += 1; throw new Error("must not run"); },
    })),
    (error: unknown) => error instanceof AccountAdministrationError && error.code === "invalid",
  );
  assert.equal(characterLoads, 0);
  assert.equal(auditWrites, 0);
});

test("rejects target substitution from a data provider", async () => {
  await assert.rejects(
    () => inspect(dependencies({ loadAccount: async () => ({
      id: "40000000-0000-4000-8000-000000000004",
      email: null,
      emailVerified: false,
      status: "active",
      createdAt: NOW,
      lastSignInAt: null,
    }) })),
    (error: unknown) => error instanceof AccountAdministrationError && error.code === "invalid",
  );
});
