import "server-only";

import { AccountAdministrationError, type OperatorCapability } from "./account-administration";
import {
  listAccountAdministrationInspectionHistory,
  type AccountInspectionHistory,
  type AccountInspectionHistoryDependencies,
  type AccountInspectionHistoryEvent,
} from "./account-administration-inspection-history";
import { createServiceRoleSupabaseClient } from "./supabase/service";

type ServiceClient = ReturnType<typeof createServiceRoleSupabaseClient>;

const CAPABILITIES = new Set<OperatorCapability>([
  "account:inspect", "account:suspend", "account:restore", "account:revoke_sessions",
  "character:suspend", "character:restore", "protected_targets:mutate",
]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function uuid(value: unknown, message: string): string {
  if (typeof value !== "string" || !UUID.test(value)) throw new Error(message);
  return value;
}

function nullableUuid(value: unknown, message: string): string | null {
  return value === null ? null : uuid(value, message);
}

function capabilities(value: unknown): OperatorCapability[] {
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string" && CAPABILITIES.has(entry as OperatorCapability))) {
    throw new AccountAdministrationError("Operator authorization denied", "forbidden");
  }
  return value as OperatorCapability[];
}

function projectEvent(value: unknown): AccountInspectionHistoryEvent {
  const row = record(value);
  if (
    !row ||
    row.projection !== "account_administration_summary_v1" ||
    typeof row.occurred_at !== "string" ||
    !Number.isFinite(Date.parse(row.occurred_at))
  ) throw new Error("Inspection history returned invalid data");
  return {
    inspectionId: uuid(row.inspection_id, "Inspection history returned invalid data"),
    operatorAccountId: uuid(row.operator_account_id, "Inspection history returned invalid data"),
    targetAccountId: uuid(row.target_account_id, "Inspection history returned invalid data"),
    targetCharacterId: nullableUuid(row.target_character_id, "Inspection history returned invalid data"),
    projection: row.projection,
    occurredAt: row.occurred_at,
  };
}

function createDependencies(client: ServiceClient): AccountInspectionHistoryDependencies {
  return {
    loadOperator: async (accountId) => {
      const result = await client
        .from("operator_principals")
        .select("account_id,status,capabilities")
        .eq("account_id", accountId)
        .maybeSingle();
      if (result.error) throw new Error("Operator registry is unavailable");
      const row = record(result.data);
      if (!row) return null;
      if (row.status !== "active" && row.status !== "disabled") throw new Error("Operator registry returned invalid data");
      return {
        accountId: uuid(row.account_id, "Operator registry returned invalid data"),
        status: row.status,
        capabilities: capabilities(row.capabilities),
      };
    },
    loadEvents: async (operatorAccountId, targetAccountId, cursor, limit) => {
      let query = client
        .from("account_administration_inspection_events")
        .select("inspection_id,operator_account_id,target_account_id,target_character_id,projection,occurred_at")
        .eq("operator_account_id", operatorAccountId);
      if (targetAccountId !== null) query = query.eq("target_account_id", targetAccountId);
      if (cursor !== null) {
        query = query.or(
          `occurred_at.lt.${cursor.occurredAt},and(occurred_at.eq.${cursor.occurredAt},inspection_id.lt.${cursor.inspectionId})`,
        );
      }
      const result = await query
        .order("occurred_at", { ascending: false })
        .order("inspection_id", { ascending: false })
        .limit(limit);
      if (result.error || !Array.isArray(result.data)) throw new Error("Inspection history is unavailable");
      return result.data.map(projectEvent);
    },
  };
}

export async function listSupabaseAccountAdministrationInspectionHistory(input: {
  operatorAccountId: string;
  targetAccountId?: string | null;
  cursor?: string | null;
  limit: number;
  now?: string;
}): Promise<AccountInspectionHistory> {
  const now = input.now ?? new Date().toISOString();
  const client = createServiceRoleSupabaseClient();
  return await listAccountAdministrationInspectionHistory(
    {
      operatorAccountId: input.operatorAccountId,
      targetAccountId: input.targetAccountId ?? null,
      cursor: input.cursor ?? null,
      limit: input.limit,
      now,
    },
    createDependencies(client),
  );
}
