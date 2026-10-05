import assert from "node:assert/strict";
import test from "node:test";
import { AccountAdministrationError } from "./account-administration.ts";
import {
  listAccountAdministrationInspectionHistory,
  parseAccountInspectionHistoryCursor,
  type AccountInspectionHistoryDependencies,
} from "./account-administration-inspection-history.ts";

const OPERATOR_ID = "10000000-0000-4000-8000-000000000001";
const TARGET_ID = "20000000-0000-4000-8000-000000000002";
const CHARACTER_ID = "30000000-0000-4000-8000-000000000003";
const INSPECTION_ID = "40000000-0000-4000-8000-000000000004";
const NOW = "2026-09-29T19:00:00.000Z";

function dependencies(overrides: Partial<AccountInspectionHistoryDependencies> = {}): AccountInspectionHistoryDependencies {
  return {
    loadOperator: async () => ({ accountId: OPERATOR_ID, status: "active", capabilities: ["account:inspect"] }),
    loadEvents: async () => [{
      inspectionId: INSPECTION_ID,
      operatorAccountId: OPERATOR_ID,
      targetAccountId: TARGET_ID,
      targetCharacterId: CHARACTER_ID,
      projection: "account_administration_summary_v1",
      occurredAt: "2026-09-29T18:59:00.000Z",
    }],
    ...overrides,
  };
}

async function list(
  limit = 50,
  deps = dependencies(),
  targetAccountId: string | null = null,
  cursor: string | null = null,
) {
  return await listAccountAdministrationInspectionHistory(
    { operatorAccountId: OPERATOR_ID, targetAccountId, cursor, limit, now: NOW },
    deps,
  );
}

test("returns only the bounded audit projection without exposing the operator identifier", async () => {
  let requestedLimit = 0;
  const result = await list(25, dependencies({
    loadEvents: async (_operatorAccountId, _targetAccountId, _cursor, limit) => {
      requestedLimit = limit;
      return await dependencies().loadEvents(OPERATOR_ID, null, null, limit);
    },
  }));
  assert.equal(requestedLimit, 26);
  assert.deepEqual(result, {
    reviewedAt: NOW,
    limit: 25,
    filters: { targetAccountId: null },
    nextCursor: null,
    events: [{
      inspectionId: INSPECTION_ID,
      targetAccountId: TARGET_ID,
      targetCharacterId: CHARACTER_ID,
      projection: "account_administration_summary_v1",
      occurredAt: "2026-09-29T18:59:00.000Z",
    }],
  });
  assert.equal("operatorAccountId" in result.events[0], false);
});

test("validates and applies a target-account filter without widening operator scope", async () => {
  let requestedFilter: string | null = null;
  const result = await list(20, dependencies({
    loadEvents: async (operatorAccountId, targetAccountId, cursor, limit) => {
      assert.equal(operatorAccountId, OPERATOR_ID);
      assert.equal(cursor, null);
      assert.equal(limit, 21);
      requestedFilter = targetAccountId;
      return await dependencies().loadEvents(OPERATOR_ID, targetAccountId, null, limit);
    },
  }), TARGET_ID);
  assert.equal(requestedFilter, TARGET_ID);
  assert.deepEqual(result.filters, { targetAccountId: TARGET_ID });
  assert.equal(result.events[0].targetAccountId, TARGET_ID);
});

test("creates an opaque cursor from the last visible event and preserves timestamp ties", async () => {
  const tiedOlderId = "30000000-0000-4000-8000-000000000003";
  const events = [
    ...(await dependencies().loadEvents(OPERATOR_ID, null, null, 3)),
    {
      ...(await dependencies().loadEvents(OPERATOR_ID, null, null, 3))[0],
      inspectionId: tiedOlderId,
    },
  ];
  const firstPage = await list(1, dependencies({ loadEvents: async () => events }));
  assert.equal(firstPage.events.length, 1);
  assert.ok(firstPage.nextCursor);
  assert.deepEqual(parseAccountInspectionHistoryCursor(firstPage.nextCursor, null), {
    occurredAt: "2026-09-29T18:59:00.000Z",
    inspectionId: INSPECTION_ID,
  });

  let requestedCursor: unknown = null;
  await list(1, dependencies({
    loadEvents: async (_operatorAccountId, _targetAccountId, cursor) => {
      requestedCursor = cursor;
      return [events[1]];
    },
  }), null, firstPage.nextCursor);
  assert.deepEqual(requestedCursor, {
    occurredAt: "2026-09-29T18:59:00.000Z",
    inspectionId: INSPECTION_ID,
  });
});

test("rejects malformed cursors and cursors created for another target filter", async () => {
  let eventLoads = 0;
  const tracked = dependencies({ loadEvents: async () => { eventLoads += 1; return []; } });
  await assert.rejects(
    () => list(50, tracked, null, "not-a-valid-cursor"),
    (error: unknown) => error instanceof AccountAdministrationError && error.code === "invalid",
  );
  const filteredPage = await list(1, dependencies({
    loadEvents: async () => [
      ...(await dependencies().loadEvents(OPERATOR_ID, TARGET_ID, null, 2)),
      ...(await dependencies().loadEvents(OPERATOR_ID, TARGET_ID, null, 2)),
    ],
  }), TARGET_ID);
  assert.ok(filteredPage.nextCursor);
  await assert.rejects(
    () => list(50, tracked, null, filteredPage.nextCursor),
    (error: unknown) => error instanceof AccountAdministrationError && error.code === "invalid",
  );
  assert.equal(eventLoads, 0);
});

test("rejects an invalid target-account filter before querying history", async () => {
  let eventLoads = 0;
  await assert.rejects(
    () => list(50, dependencies({ loadEvents: async () => { eventLoads += 1; return []; } }), "not-a-uuid"),
    (error: unknown) => error instanceof AccountAdministrationError && error.code === "invalid",
  );
  assert.equal(eventLoads, 0);
});

test("denies unauthorized operators before loading inspection events", async () => {
  let eventLoads = 0;
  for (const loadOperator of [
    async () => null,
    async () => ({ accountId: OPERATOR_ID, status: "disabled" as const, capabilities: ["account:inspect" as const] }),
    async () => ({ accountId: OPERATOR_ID, status: "active" as const, capabilities: [] }),
  ]) {
    await assert.rejects(
      () => list(50, dependencies({ loadOperator, loadEvents: async () => { eventLoads += 1; return []; } })),
      (error: unknown) => error instanceof AccountAdministrationError && error.code === "forbidden",
    );
  }
  assert.equal(eventLoads, 0);
});

test("rejects unbounded limits before querying history", async () => {
  let eventLoads = 0;
  for (const limit of [0, 101, 1.5]) {
    await assert.rejects(
      () => list(limit, dependencies({ loadEvents: async () => { eventLoads += 1; return []; } })),
      (error: unknown) => error instanceof AccountAdministrationError && error.code === "invalid",
    );
  }
  assert.equal(eventLoads, 0);
});

test("fails closed if the provider returns another operator's audit event", async () => {
  await assert.rejects(
    () => list(50, dependencies({
      loadEvents: async () => [{
        ...(await dependencies().loadEvents(OPERATOR_ID, null, null, 1))[0],
        operatorAccountId: "50000000-0000-4000-8000-000000000005",
      }],
    })),
    (error: unknown) => error instanceof AccountAdministrationError && error.code === "forbidden",
  );
});

test("fails closed if filtered history returns a different target account", async () => {
  await assert.rejects(
    () => list(50, dependencies(), "50000000-0000-4000-8000-000000000005"),
    (error: unknown) => error instanceof AccountAdministrationError && error.code === "forbidden",
  );
});
