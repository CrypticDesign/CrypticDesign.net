import assert from "node:assert/strict";
import test from "node:test";
import {
  AccountAdministrationError,
  AccountAdministrationEffectError,
  authorizeAccountAdministrationInspectionHistory,
  authorizeAccountInspection,
  executeAccountAdministrationCommand,
  planAccountAdministrationCommand,
  type AccountAdministrationDependencies,
  type AdministrationTarget,
  type OperatorCommand,
  type OperatorPrincipal,
} from "./account-administration.ts";

const OPERATOR_ID = "10000000-0000-4000-8000-000000000001";
const TARGET_ID = "20000000-0000-4000-8000-000000000002";
const CHARACTER_ID = "30000000-0000-4000-8000-000000000003";
const NOW = "2026-09-27T16:00:00.000Z";

const principal: OperatorPrincipal = {
  accountId: OPERATOR_ID,
  status: "active",
  authenticatedAt: "2026-09-27T15:55:00.000Z",
  capabilities: ["account:inspect", "account:suspend", "account:restore", "account:revoke_sessions", "character:suspend", "character:restore"],
};
const target: AdministrationTarget = { accountId: TARGET_ID, protected: false, accountStatus: "active", character: { id: CHARACTER_ID, status: "active" } };
const command: OperatorCommand = {
  requestId: "operator-request-0001",
  action: "suspend_account",
  targetAccountId: TARGET_ID,
  reason: "Confirmed compromised credentials",
  confirmation: `suspend_account:${TARGET_ID}`,
};

function expectCode(fn: () => unknown, code: AccountAdministrationError["code"]) {
  assert.throws(fn, (error: unknown) => error instanceof AccountAdministrationError && error.code === code);
}

test("account inspection is default-deny and requires an active, recently authenticated operator", () => {
  assert.deepEqual(authorizeAccountInspection({ principal, targetAccountId: TARGET_ID, now: NOW }), { operatorAccountId: OPERATOR_ID, targetAccountId: TARGET_ID });
  expectCode(() => authorizeAccountInspection({ principal: { ...principal, capabilities: [] }, targetAccountId: TARGET_ID, now: NOW }), "forbidden");
  expectCode(() => authorizeAccountInspection({ principal: { ...principal, capabilities: [] }, targetAccountId: "invalid", now: NOW }), "forbidden");
  expectCode(() => authorizeAccountInspection({ principal: { ...principal, authenticatedAt: "2026-09-27T15:00:00.000Z" }, targetAccountId: TARGET_ID, now: NOW }), "forbidden");
});

test("inspection history requires the same active and recent inspection authority", () => {
  assert.deepEqual(authorizeAccountAdministrationInspectionHistory({ principal, now: NOW }), { operatorAccountId: OPERATOR_ID });
  expectCode(() => authorizeAccountAdministrationInspectionHistory({ principal: { ...principal, capabilities: [] }, now: NOW }), "forbidden");
  expectCode(() => authorizeAccountAdministrationInspectionHistory({ principal: { ...principal, status: "disabled" }, now: NOW }), "forbidden");
});

test("plans an exact, reasoned, recently authenticated account action", () => {
  const plan = planAccountAdministrationCommand({ principal, command, target, now: NOW });
  assert.equal(plan.action, "suspend_account");
  assert.equal(plan.operatorAccountId, OPERATOR_ID);
  assert.equal(plan.targetAccountId, TARGET_ID);
  assert.equal(plan.targetCharacterId, null);
  assert.match(plan.fingerprint, /^[a-f0-9]{64}$/);
  const retry = planAccountAdministrationCommand({ principal, command, target, now: "2026-09-27T16:05:00.000Z" });
  assert.equal(retry.fingerprint, plan.fingerprint);
  assert.notEqual(retry.requestedAt, plan.requestedAt);
});

test("rejects ordinary accounts, self-targeting, target substitution, and protected identities", () => {
  expectCode(() => planAccountAdministrationCommand({ principal: { ...principal, capabilities: [] }, command, target, now: NOW }), "forbidden");
  expectCode(() => planAccountAdministrationCommand({ principal, command: { ...command, targetAccountId: OPERATOR_ID, confirmation: `suspend_account:${OPERATOR_ID}` }, target: { ...target, accountId: OPERATOR_ID }, now: NOW }), "forbidden");
  expectCode(() => planAccountAdministrationCommand({ principal, command, target: { ...target, accountId: "40000000-0000-4000-8000-000000000004" }, now: NOW }), "forbidden");
  expectCode(() => planAccountAdministrationCommand({ principal, command, target: { ...target, protected: true }, now: NOW }), "forbidden");
});

test("requires exact confirmation, a bounded reason, and a valid state transition", () => {
  expectCode(() => planAccountAdministrationCommand({ principal, command: { ...command, confirmation: "yes" }, target, now: NOW }), "invalid");
  expectCode(() => planAccountAdministrationCommand({ principal, command: { ...command, reason: "because" }, target, now: NOW }), "invalid");
  expectCode(() => planAccountAdministrationCommand({ principal, command, target: { ...target, accountStatus: "suspended" }, now: NOW }), "conflict");
});

test("allows only an explicitly identified account retry to plan against an already-converged state", () => {
  const suspended = { ...target, accountStatus: "suspended" as const };
  expectCode(() => planAccountAdministrationCommand({ principal, command, target: suspended, now: NOW }), "conflict");
  const retry = planAccountAdministrationCommand({
    principal,
    command,
    target: suspended,
    now: NOW,
    allowIdempotentAccountState: true,
  });
  assert.equal(retry.action, "suspend_account");
  assert.equal(retry.fingerprint, planAccountAdministrationCommand({ principal, command, target, now: NOW }).fingerprint);
});

test("keeps Character authority account-scoped and separate from account state", () => {
  const characterCommand: OperatorCommand = { ...command, action: "suspend_character", targetCharacterId: CHARACTER_ID, confirmation: `suspend_character:${CHARACTER_ID}` };
  const plan = planAccountAdministrationCommand({ principal, command: characterCommand, target, now: NOW });
  assert.equal(plan.targetCharacterId, CHARACTER_ID);
  assert.equal(plan.action, "suspend_character");
  expectCode(() => planAccountAdministrationCommand({ principal, command: { ...characterCommand, targetCharacterId: "40000000-0000-4000-8000-000000000004", confirmation: "suspend_character:40000000-0000-4000-8000-000000000004" }, target, now: NOW }), "forbidden");
});

test("executes a claimed command once and durably finalizes its audit result", async () => {
  const plan = planAccountAdministrationCommand({ principal, command, target, now: NOW });
  const calls: string[] = [];
  const dependencies: AccountAdministrationDependencies = {
    claim: async () => { calls.push("claim"); return { kind: "claimed" }; },
    apply: async () => { calls.push("apply"); return { resultCode: "ACCOUNT_SUSPENDED" }; },
    complete: async (_plan, outcome) => { calls.push(`complete:${outcome.status}`); },
  };
  assert.deepEqual(await executeAccountAdministrationCommand(plan, dependencies), { status: "succeeded", resultCode: "ACCOUNT_SUSPENDED" });
  assert.deepEqual(calls, ["claim", "apply", "complete:succeeded"]);
});

test("does not repeat in-progress or completed commands and rejects idempotency collisions", async () => {
  const plan = planAccountAdministrationCommand({ principal, command, target, now: NOW });
  let applied = 0;
  const base = { apply: async () => { applied += 1; return { resultCode: "UNEXPECTED" }; }, complete: async () => undefined };
  const inProgress = await executeAccountAdministrationCommand(plan, { ...base, claim: async () => ({ kind: "in_progress" }) });
  const replay = await executeAccountAdministrationCommand(plan, { ...base, claim: async () => ({ kind: "replay", fingerprint: plan.fingerprint, outcome: { status: "succeeded", resultCode: "ACCOUNT_SUSPENDED" } }) });
  assert.deepEqual(inProgress, { status: "pending", resultCode: "OPERATOR_ACTION_IN_PROGRESS" });
  assert.deepEqual(replay, { status: "succeeded", resultCode: "ACCOUNT_SUSPENDED" });
  assert.equal(applied, 0);
  await assert.rejects(() => executeAccountAdministrationCommand(plan, { ...base, claim: async () => ({ kind: "collision" }) }), (error: unknown) => error instanceof AccountAdministrationError && error.code === "conflict");
  await assert.rejects(() => executeAccountAdministrationCommand(plan, { ...base, claim: async () => ({ kind: "target_busy" }) }), (error: unknown) => error instanceof AccountAdministrationError && error.code === "conflict");
});

test("reconciles stale idempotent account effects and leaves provider ambiguity pending", async () => {
  const plan = planAccountAdministrationCommand({ principal, command, target, now: NOW });
  const completed: string[] = [];
  const reconciled = await executeAccountAdministrationCommand(plan, {
    claim: async () => ({ kind: "reconcile" }),
    apply: async () => ({ resultCode: "ACCOUNT_SUSPENDED" }),
    complete: async (_plan, outcome) => { completed.push(outcome.status); },
  });
  assert.deepEqual(reconciled, { status: "succeeded", resultCode: "ACCOUNT_SUSPENDED" });
  assert.deepEqual(completed, ["succeeded"]);

  const retry = await executeAccountAdministrationCommand(plan, {
    claim: async () => ({ kind: "reconcile" }),
    apply: async () => { throw new AccountAdministrationEffectError("provider unavailable", "AUTH_ACCOUNT_UPDATE_FAILED", true); },
    complete: async () => { completed.push("unexpected"); },
  });
  assert.deepEqual(retry, { status: "pending", resultCode: "OPERATOR_ACTION_RECONCILIATION_RETRY_REQUIRED" });
  assert.deepEqual(completed, ["succeeded"]);
});

test("keeps an ambiguous initial account effect pending for reconciliation", async () => {
  const plan = planAccountAdministrationCommand({ principal, command, target, now: NOW });
  let completed = false;
  const result = await executeAccountAdministrationCommand(plan, {
    claim: async () => ({ kind: "claimed" }),
    apply: async () => { throw new AccountAdministrationEffectError("provider timeout", "AUTH_ACCOUNT_UPDATE_FAILED", true); },
    complete: async () => { completed = true; },
  });
  assert.deepEqual(result, { status: "pending", resultCode: "OPERATOR_ACTION_RECONCILIATION_REQUIRED" });
  assert.equal(completed, false);
});

test("records failed effects and fails closed when audit finalization is unavailable", async () => {
  const plan = planAccountAdministrationCommand({ principal, command, target, now: NOW });
  let completedStatus = "";
  const failed = await executeAccountAdministrationCommand(plan, {
    claim: async () => ({ kind: "claimed" }),
    apply: async () => { throw new Error("provider failure"); },
    complete: async (_plan, outcome) => { completedStatus = outcome.status; },
  });
  assert.deepEqual(failed, { status: "failed", resultCode: "OPERATOR_ACTION_FAILED" });
  assert.equal(completedStatus, "failed");
  const unavailable = await executeAccountAdministrationCommand(plan, {
    claim: async () => ({ kind: "claimed" }),
    apply: async () => { throw new AccountAdministrationEffectError("unsupported", "SESSION_REVOCATION_UNAVAILABLE"); },
    complete: async () => undefined,
  });
  assert.deepEqual(unavailable, { status: "failed", resultCode: "SESSION_REVOCATION_UNAVAILABLE" });
  await assert.rejects(() => executeAccountAdministrationCommand(plan, {
    claim: async () => ({ kind: "claimed" }),
    apply: async () => ({ resultCode: "ACCOUNT_SUSPENDED" }),
    complete: async () => { throw new Error("audit unavailable"); },
  }), (error: unknown) => error instanceof AccountAdministrationError && error.code === "audit_incomplete");
});
