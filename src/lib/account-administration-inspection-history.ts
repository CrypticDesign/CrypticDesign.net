import {
  AccountAdministrationError,
  authorizeAccountAdministrationInspectionHistory,
  authorizeAccountInspection,
  type OperatorCapability,
} from "./account-administration.ts";

export type AccountInspectionHistoryOperator = {
  accountId: string;
  status: "active" | "disabled";
  capabilities: readonly OperatorCapability[];
};

export type AccountInspectionHistoryEvent = {
  inspectionId: string;
  operatorAccountId: string;
  targetAccountId: string;
  targetCharacterId: string | null;
  projection: "account_administration_summary_v1";
  occurredAt: string;
};

export type AccountInspectionHistoryCursor = {
  occurredAt: string;
  inspectionId: string;
};

export type AccountInspectionHistory = {
  reviewedAt: string;
  limit: number;
  filters: { targetAccountId: string | null };
  nextCursor: string | null;
  events: Array<Omit<AccountInspectionHistoryEvent, "operatorAccountId">>;
};

export type AccountInspectionHistoryDependencies = {
  loadOperator(accountId: string): Promise<AccountInspectionHistoryOperator | null>;
  loadEvents(
    operatorAccountId: string,
    targetAccountId: string | null,
    cursor: AccountInspectionHistoryCursor | null,
    limit: number,
  ): Promise<AccountInspectionHistoryEvent[]>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CURSOR = /^[A-Za-z0-9_-]{20,512}$/;

function encodeCursor(event: AccountInspectionHistoryEvent, targetAccountId: string | null): string {
  return Buffer.from(JSON.stringify({
    v: 1,
    t: event.occurredAt,
    i: event.inspectionId,
    a: targetAccountId,
  })).toString("base64url");
}

export function parseAccountInspectionHistoryCursor(
  value: string | null,
  targetAccountId: string | null,
): AccountInspectionHistoryCursor | null {
  if (value === null) return null;
  if (!CURSOR.test(value)) throw new AccountAdministrationError("Inspection history cursor is invalid", "invalid");
  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Record<string, unknown>;
    const keys = Object.keys(payload).sort().join(",");
    if (
      keys !== "a,i,t,v" ||
      payload.v !== 1 ||
      typeof payload.t !== "string" ||
      new Date(payload.t).toISOString() !== payload.t ||
      typeof payload.i !== "string" ||
      !UUID.test(payload.i) ||
      (payload.a !== null && (typeof payload.a !== "string" || !UUID.test(payload.a))) ||
      payload.a !== targetAccountId
    ) throw new Error("invalid cursor payload");
    return { occurredAt: payload.t, inspectionId: payload.i };
  } catch {
    throw new AccountAdministrationError("Inspection history cursor is invalid", "invalid");
  }
}

export async function listAccountAdministrationInspectionHistory(
  input: { operatorAccountId: string; targetAccountId: string | null; cursor: string | null; limit: number; now: string },
  dependencies: AccountInspectionHistoryDependencies,
): Promise<AccountInspectionHistory> {
  const operator = await dependencies.loadOperator(input.operatorAccountId);
  if (!operator || operator.accountId !== input.operatorAccountId) {
    throw new AccountAdministrationError("Operator authorization denied", "forbidden");
  }
  const principal = { ...operator, authenticatedAt: input.now };
  authorizeAccountAdministrationInspectionHistory({
    principal,
    now: input.now,
  });
  if (!Number.isInteger(input.limit) || input.limit < 1 || input.limit > 100) {
    throw new AccountAdministrationError("Inspection history limit must be between 1 and 100", "invalid");
  }
  if (input.targetAccountId !== null) {
    authorizeAccountInspection({ principal, targetAccountId: input.targetAccountId, now: input.now });
  }
  const cursor = parseAccountInspectionHistoryCursor(input.cursor, input.targetAccountId);

  const events = await dependencies.loadEvents(input.operatorAccountId, input.targetAccountId, cursor, input.limit + 1);
  if (
    events.length > input.limit + 1 ||
    events.some((event) => event.operatorAccountId !== input.operatorAccountId) ||
    (input.targetAccountId !== null && events.some((event) => event.targetAccountId !== input.targetAccountId))
  ) {
    throw new AccountAdministrationError("Inspection history authorization denied", "forbidden");
  }
  const visibleEvents = events.slice(0, input.limit);
  return {
    reviewedAt: input.now,
    limit: input.limit,
    filters: { targetAccountId: input.targetAccountId },
    nextCursor: events.length > input.limit
      ? encodeCursor(visibleEvents[visibleEvents.length - 1], input.targetAccountId)
      : null,
    events: visibleEvents.map((event) => ({
      inspectionId: event.inspectionId,
      targetAccountId: event.targetAccountId,
      targetCharacterId: event.targetCharacterId,
      projection: event.projection,
      occurredAt: event.occurredAt,
    })),
  };
}
