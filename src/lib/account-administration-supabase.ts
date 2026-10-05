import "server-only";

import {
  AccountAdministrationEffectError,
  AccountAdministrationError,
  executeAccountAdministrationCommand,
  planAccountAdministrationCommand,
  type AccountAdministrationDependencies,
  type AdministrationTarget,
  type OperatorCapability,
  type OperatorCommand,
  type OperatorCommandClaim,
  type OperatorCommandOutcome,
  type OperatorPrincipal,
} from "./account-administration";
import { createServiceRoleSupabaseClient } from "./supabase/service";

type ServiceClient = ReturnType<typeof createServiceRoleSupabaseClient>;
type DatabaseError = { message?: string } | null;

const CAPABILITIES = new Set<OperatorCapability>([
  "account:inspect", "account:suspend", "account:restore", "account:revoke_sessions",
  "character:suspend", "character:restore", "protected_targets:mutate",
]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function requireNoDatabaseError(error: DatabaseError, message: string) {
  if (error) throw new Error(message);
}

function parseCapabilities(value: unknown): OperatorCapability[] {
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string" && CAPABILITIES.has(entry as OperatorCapability))) {
    throw new AccountAdministrationError("Operator authorization denied", "forbidden");
  }
  return value as OperatorCapability[];
}

function accountIsSuspended(bannedUntil: string | undefined, now: string) {
  const timestamp = bannedUntil ? Date.parse(bannedUntil) : Number.NaN;
  return Number.isFinite(timestamp) && timestamp > Date.parse(now);
}

export async function loadSupabaseAccountAdministrationContext(input: {
  client: ServiceClient;
  operatorAccountId: string;
  command: OperatorCommand;
  now: string;
}): Promise<{ principal: OperatorPrincipal; target: AdministrationTarget }> {
  const operatorResult = await input.client
    .from("operator_principals")
    .select("account_id,status,capabilities")
    .eq("account_id", input.operatorAccountId)
    .maybeSingle();
  requireNoDatabaseError(operatorResult.error, "Operator registry is unavailable");
  const operator = asRecord(operatorResult.data);
  if (!operator || operator.account_id !== input.operatorAccountId || (operator.status !== "active" && operator.status !== "disabled")) {
    throw new AccountAdministrationError("Operator authorization denied", "forbidden");
  }

  const userResult = await input.client.auth.admin.getUserById(input.command.targetAccountId);
  if (userResult.error || !userResult.data.user) throw new AccountAdministrationError("Target account was not found", "invalid");

  const protectedResult = await input.client
    .from("protected_account_targets")
    .select("account_id")
    .eq("account_id", input.command.targetAccountId)
    .maybeSingle();
  requireNoDatabaseError(protectedResult.error, "Protected-target registry is unavailable");

  let character: AdministrationTarget["character"] = null;
  if (input.command.targetCharacterId) {
    const characterResult = await input.client
      .from("characters")
      .select("id,status")
      .eq("id", input.command.targetCharacterId)
      .eq("owner_account_id", input.command.targetAccountId)
      .eq("kind", "member")
      .maybeSingle();
    requireNoDatabaseError(characterResult.error, "Character registry is unavailable");
    const row = asRecord(characterResult.data);
    if (row && typeof row.id === "string" && ["active", "suspended", "retired"].includes(String(row.status))) {
      character = { id: row.id, status: row.status as "active" | "suspended" | "retired" };
    }
  }

  return {
    principal: {
      accountId: input.operatorAccountId,
      status: operator.status,
      capabilities: parseCapabilities(operator.capabilities),
      authenticatedAt: input.now,
    },
    target: {
      accountId: userResult.data.user.id,
      protected: Boolean(protectedResult.data),
      accountStatus: accountIsSuspended(userResult.data.user.banned_until, input.now) ? "suspended" : "active",
      character,
    },
  };
}

function parseClaim(data: unknown, fingerprint: string): OperatorCommandClaim {
  const row = Array.isArray(data) ? asRecord(data[0]) : asRecord(data);
  if (!row || typeof row.claim_kind !== "string") throw new Error("Command claim returned invalid data");
  if (["claimed", "reconcile", "in_progress", "collision", "target_busy"].includes(row.claim_kind)) {
    return { kind: row.claim_kind as "claimed" | "reconcile" | "in_progress" | "collision" | "target_busy" };
  }
  if (row.claim_kind === "denied") throw new AccountAdministrationError("Operator authorization denied", "forbidden");
  if (
    row.claim_kind === "replay" &&
    (row.command_status === "succeeded" || row.command_status === "failed") &&
    typeof row.command_result_code === "string"
  ) {
    return {
      kind: "replay",
      fingerprint,
      outcome: { status: row.command_status, resultCode: row.command_result_code },
    };
  }
  throw new Error("Command claim returned invalid data");
}

export function createSupabaseAccountAdministrationDependencies(client: ServiceClient): AccountAdministrationDependencies {
  return {
    claim: async (plan) => {
      const confirmationTarget = plan.targetCharacterId ?? plan.targetAccountId;
      const result = await client.rpc("claim_account_administration_command", {
        p_request_id: plan.requestId,
        p_request_fingerprint: plan.fingerprint,
        p_action: plan.action,
        p_operator_account_id: plan.operatorAccountId,
        p_target_account_id: plan.targetAccountId,
        p_target_character_id: plan.targetCharacterId,
        p_reason: plan.reason,
        p_confirmation: `${plan.action}:${confirmationTarget}`,
        p_authenticated_at: plan.requestedAt,
      });
      requireNoDatabaseError(result.error, "Command claim failed");
      return parseClaim(result.data, plan.fingerprint);
    },
    apply: async (plan) => {
      if (plan.action === "revoke_sessions") {
        throw new AccountAdministrationEffectError(
          "Supabase requires the target user's access token to revoke their refresh-token sessions",
          "SESSION_REVOCATION_UNAVAILABLE",
        );
      }
      if (plan.action === "suspend_character" || plan.action === "restore_character") {
        const result = await client.rpc("apply_character_administration_command", {
          p_request_id: plan.requestId,
          p_request_fingerprint: plan.fingerprint,
        });
        if (result.error || typeof result.data !== "string") {
          throw new AccountAdministrationEffectError("Character update failed", "CHARACTER_UPDATE_FAILED");
        }
        return { resultCode: result.data };
      }
      const result = await client.auth.admin.updateUserById(plan.targetAccountId, {
        ban_duration: plan.action === "suspend_account" ? "876000h" : "none",
      });
      if (result.error) throw new AccountAdministrationEffectError("Account update failed", "AUTH_ACCOUNT_UPDATE_FAILED", true);
      return { resultCode: plan.action === "suspend_account" ? "ACCOUNT_SUSPENDED" : "ACCOUNT_RESTORED" };
    },
    complete: async (plan, outcome) => {
      const result = await client.rpc("complete_account_administration_command", {
        p_request_id: plan.requestId,
        p_request_fingerprint: plan.fingerprint,
        p_status: outcome.status,
        p_result_code: outcome.resultCode,
      });
      if (result.error || result.data !== true) throw new Error("Command audit finalization failed");
    },
  };
}

export async function executeSupabaseAccountAdministrationCommand(input: {
  operatorAccountId: string;
  command: OperatorCommand;
  now?: string;
}): Promise<OperatorCommandOutcome> {
  const now = input.now ?? new Date().toISOString();
  const client = createServiceRoleSupabaseClient();
  const context = await loadSupabaseAccountAdministrationContext({ client, operatorAccountId: input.operatorAccountId, command: input.command, now });
  let allowIdempotentAccountState = false;
  if (input.command.action === "suspend_account" || input.command.action === "restore_account") {
    const existing = await client
      .from("account_administration_commands")
      .select("request_id")
      .eq("request_id", input.command.requestId)
      .maybeSingle();
    if (existing.error) throw new Error("Command reconciliation lookup failed");
    allowIdempotentAccountState = Boolean(existing.data);
  }
  const plan = planAccountAdministrationCommand({ ...context, command: input.command, now, allowIdempotentAccountState });
  return await executeAccountAdministrationCommand(plan, createSupabaseAccountAdministrationDependencies(client));
}
