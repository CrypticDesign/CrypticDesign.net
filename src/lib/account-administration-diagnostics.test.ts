import assert from "node:assert/strict";
import test from "node:test";
import { AccountAdministrationError } from "./account-administration.ts";
import {
  inspectAccountAdministrationCommandDiagnostics,
  type AccountAdministrationDiagnosticCommand,
  type AccountAdministrationDiagnosticDependencies,
} from "./account-administration-diagnostics.ts";

const OPERATOR_ID = "10000000-0000-4000-8000-000000000001";
const TARGET_ID = "20000000-0000-4000-8000-000000000002";
const REQUEST_ID = "operator-request-0001";

const command: AccountAdministrationDiagnosticCommand = {
  requestId: REQUEST_ID,
  action: "suspend_account",
  operatorAccountId: OPERATOR_ID,
  targetAccountId: TARGET_ID,
  targetCharacterId: null,
  status: "pending",
  resultCode: null,
  requestedAt: "2026-09-29T18:00:00.000Z",
  reconciliationStartedAt: null,
  reconciliationAttemptCount: 0,
  completedAt: null,
};

function dependencies(overrides: Partial<AccountAdministrationDiagnosticDependencies> = {}): AccountAdministrationDiagnosticDependencies {
  return {
    loadOperator: async () => ({ accountId: OPERATOR_ID, status: "active", capabilities: ["account:inspect"] }),
    loadCommand: async () => command,
    loadEvents: async () => [{
      eventType: "claimed",
      resultCode: "OPERATOR_ACTION_CLAIMED",
      attemptNumber: 0,
      occurredAt: command.requestedAt,
    }],
    ...overrides,
  };
}

async function diagnose(now: string, deps = dependencies(), requestId = REQUEST_ID) {
  return await inspectAccountAdministrationCommandDiagnostics(
    { operatorAccountId: OPERATOR_ID, requestId, now },
    deps,
  );
}

test("reports the initial lease and bounded immutable event history", async () => {
  const result = await diagnose("2026-09-29T18:01:00.000Z");
  assert.equal(result.reconciliation.nextStep, "waiting_initial_lease");
  assert.equal(result.reconciliation.leaseExpiresAt, "2026-09-29T18:02:00.000Z");
  assert.equal(result.reconciliation.attemptCount, 0);
  assert.deepEqual(result.events.map((event) => event.eventType), ["claimed"]);
  assert.equal("operatorAccountId" in result.command, false);
});

test("directs stale and leased account commands to the safe next action", async () => {
  const stale = await diagnose("2026-09-29T18:02:00.000Z");
  assert.equal(stale.reconciliation.nextStep, "retry_same_request");

  const leasedCommand = {
    ...command,
    reconciliationStartedAt: "2026-09-29T18:03:00.000Z",
    reconciliationAttemptCount: 2,
  };
  const leased = await diagnose("2026-09-29T18:04:00.000Z", dependencies({ loadCommand: async () => leasedCommand }));
  assert.equal(leased.reconciliation.nextStep, "waiting_reconciliation_lease");
  assert.equal(leased.reconciliation.leaseExpiresAt, "2026-09-29T18:05:00.000Z");
  assert.equal(leased.reconciliation.attemptCount, 2);
});

test("marks completed commands complete and stale non-account commands for manual review", async () => {
  const complete = await diagnose("2026-09-29T18:10:00.000Z", dependencies({
    loadCommand: async () => ({ ...command, status: "succeeded", resultCode: "ACCOUNT_SUSPENDED", completedAt: "2026-09-29T18:01:00.000Z" }),
  }));
  assert.equal(complete.reconciliation.nextStep, "completed");
  assert.equal(complete.reconciliation.leaseExpiresAt, null);

  const character = await diagnose("2026-09-29T18:10:00.000Z", dependencies({
    loadCommand: async () => ({ ...command, action: "suspend_character", targetCharacterId: "30000000-0000-4000-8000-000000000003" }),
  }));
  assert.equal(character.reconciliation.nextStep, "manual_review");
});

test("rejects invalid request IDs and unauthorized operators before command lookup", async () => {
  let commandLoads = 0;
  const tracked = dependencies({ loadCommand: async () => { commandLoads += 1; return command; } });
  await assert.rejects(
    () => diagnose("2026-09-29T18:01:00.000Z", tracked, "short"),
    (error: unknown) => error instanceof AccountAdministrationError && error.code === "invalid",
  );
  await assert.rejects(
    () => diagnose("2026-09-29T18:01:00.000Z", dependencies({
      loadOperator: async () => ({ accountId: OPERATOR_ID, status: "disabled", capabilities: ["account:inspect"] }),
      loadCommand: async () => { commandLoads += 1; return command; },
    })),
    (error: unknown) => error instanceof AccountAdministrationError && error.code === "forbidden",
  );
  assert.equal(commandLoads, 0);
});

test("does not expose another operator's command or load its events", async () => {
  let eventLoads = 0;
  await assert.rejects(
    () => diagnose("2026-09-29T18:01:00.000Z", dependencies({
      loadCommand: async () => ({ ...command, operatorAccountId: "40000000-0000-4000-8000-000000000004" }),
      loadEvents: async () => { eventLoads += 1; return []; },
    })),
    (error: unknown) => error instanceof AccountAdministrationError && error.code === "invalid",
  );
  assert.equal(eventLoads, 0);
});
