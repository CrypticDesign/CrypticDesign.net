import "server-only";

import { AccountAdministrationError, OPERATOR_ACTIONS, type OperatorCapability } from "./account-administration";
import {
  inspectAccountAdministrationCommandDiagnostics,
  type AccountAdministrationCommandDiagnostics,
  type AccountAdministrationDiagnosticDependencies,
  type AccountAdministrationDiagnosticEvent,
} from "./account-administration-diagnostics";
import { createServiceRoleSupabaseClient } from "./supabase/service";

type ServiceClient = ReturnType<typeof createServiceRoleSupabaseClient>;

const CAPABILITIES = new Set<OperatorCapability>([
  "account:inspect", "account:suspend", "account:restore", "account:revoke_sessions",
  "character:suspend", "character:restore", "protected_targets:mutate",
]);
const STATUSES = new Set(["pending", "succeeded", "failed"]);
const EVENT_TYPES = new Set(["claimed", "reconciliation_started", "succeeded", "failed"]);

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function requiredString(value: unknown, message: string): string {
  if (typeof value !== "string" || value.length === 0) throw new Error(message);
  return value;
}

function optionalString(value: unknown, message: string): string | null {
  if (value === null) return null;
  return requiredString(value, message);
}

function capabilities(value: unknown): OperatorCapability[] {
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string" && CAPABILITIES.has(entry as OperatorCapability))) {
    throw new AccountAdministrationError("Operator authorization denied", "forbidden");
  }
  return value as OperatorCapability[];
}

function projectEvent(value: unknown): AccountAdministrationDiagnosticEvent {
  const row = record(value);
  if (!row || !EVENT_TYPES.has(String(row.event_type)) || !Number.isInteger(row.attempt_number) || Number(row.attempt_number) < 0) {
    throw new Error("Command events returned invalid data");
  }
  return {
    eventType: row.event_type as AccountAdministrationDiagnosticEvent["eventType"],
    resultCode: requiredString(row.result_code, "Command events returned invalid data"),
    attemptNumber: Number(row.attempt_number),
    occurredAt: requiredString(row.occurred_at, "Command events returned invalid data"),
  };
}

function createDependencies(client: ServiceClient): AccountAdministrationDiagnosticDependencies {
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
        accountId: requiredString(row.account_id, "Operator registry returned invalid data"),
        status: row.status,
        capabilities: capabilities(row.capabilities),
      };
    },
    loadCommand: async (requestId) => {
      const result = await client
        .from("account_administration_commands")
        .select("request_id,action,operator_account_id,target_account_id,target_character_id,status,result_code,requested_at,reconciliation_started_at,reconciliation_attempt_count,completed_at")
        .eq("request_id", requestId)
        .maybeSingle();
      if (result.error) throw new Error("Command registry is unavailable");
      const row = record(result.data);
      if (!row) return null;
      if (!OPERATOR_ACTIONS.includes(row.action as (typeof OPERATOR_ACTIONS)[number]) || !STATUSES.has(String(row.status)) || !Number.isInteger(row.reconciliation_attempt_count)) {
        throw new Error("Command registry returned invalid data");
      }
      return {
        requestId: requiredString(row.request_id, "Command registry returned invalid data"),
        action: row.action as (typeof OPERATOR_ACTIONS)[number],
        operatorAccountId: requiredString(row.operator_account_id, "Command registry returned invalid data"),
        targetAccountId: requiredString(row.target_account_id, "Command registry returned invalid data"),
        targetCharacterId: optionalString(row.target_character_id, "Command registry returned invalid data"),
        status: row.status as "pending" | "succeeded" | "failed",
        resultCode: optionalString(row.result_code, "Command registry returned invalid data"),
        requestedAt: requiredString(row.requested_at, "Command registry returned invalid data"),
        reconciliationStartedAt: optionalString(row.reconciliation_started_at, "Command registry returned invalid data"),
        reconciliationAttemptCount: Number(row.reconciliation_attempt_count),
        completedAt: optionalString(row.completed_at, "Command registry returned invalid data"),
      };
    },
    loadEvents: async (requestId) => {
      const result = await client
        .from("account_administration_events")
        .select("event_type,result_code,attempt_number,occurred_at")
        .eq("command_request_id", requestId)
        .order("occurred_at", { ascending: true });
      if (result.error || !Array.isArray(result.data)) throw new Error("Command events are unavailable");
      return result.data.map(projectEvent);
    },
  };
}

export async function inspectSupabaseAccountAdministrationCommandDiagnostics(input: {
  operatorAccountId: string;
  requestId: string;
  now?: string;
}): Promise<AccountAdministrationCommandDiagnostics> {
  const now = input.now ?? new Date().toISOString();
  const client = createServiceRoleSupabaseClient();
  return await inspectAccountAdministrationCommandDiagnostics(
    { operatorAccountId: input.operatorAccountId, requestId: input.requestId, now },
    createDependencies(client),
  );
}
