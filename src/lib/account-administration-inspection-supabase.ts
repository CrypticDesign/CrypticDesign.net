import "server-only";

import { randomUUID } from "node:crypto";
import { AccountAdministrationError, type OperatorCapability } from "./account-administration";
import { recordSupabaseAccountAdministrationInspection } from "./account-administration-inspection-audit-supabase";
import {
  inspectAccountAdministrationTarget,
  type AccountAdministrationInspection,
  type AccountAdministrationInspectionDependencies,
  type AccountInspectionCharacter,
} from "./account-administration-inspection";
import { createServiceRoleSupabaseClient } from "./supabase/service";

type ServiceClient = ReturnType<typeof createServiceRoleSupabaseClient>;

const CAPABILITIES = new Set<OperatorCapability>([
  "account:inspect", "account:suspend", "account:restore", "account:revoke_sessions",
  "character:suspend", "character:restore", "protected_targets:mutate",
]);

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function capabilities(value: unknown): OperatorCapability[] {
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string" && CAPABILITIES.has(entry as OperatorCapability))) {
    throw new AccountAdministrationError("Operator authorization denied", "forbidden");
  }
  return value as OperatorCapability[];
}

function requiredString(value: unknown, message: string): string {
  if (typeof value !== "string" || value.length === 0) throw new Error(message);
  return value;
}

function accountStatus(bannedUntil: string | undefined, now: string): "active" | "suspended" {
  const timestamp = bannedUntil ? Date.parse(bannedUntil) : Number.NaN;
  return Number.isFinite(timestamp) && timestamp > Date.parse(now) ? "suspended" : "active";
}

function projectCharacter(value: unknown): AccountInspectionCharacter | null {
  if (value === null) return null;
  const row = record(value);
  if (
    !row ||
    !["active", "suspended", "retired"].includes(String(row.status)) ||
    !["offline", "available", "away"].includes(String(row.presence)) ||
    !["private", "public"].includes(String(row.visibility)) ||
    typeof row.discoverable !== "boolean" ||
    typeof row.publication_consent !== "boolean"
  ) throw new Error("Character inspection returned invalid data");
  return {
    id: requiredString(row.id, "Character inspection returned invalid data"),
    name: requiredString(row.name, "Character inspection returned invalid data"),
    handle: requiredString(row.handle, "Character inspection returned invalid data"),
    status: row.status as AccountInspectionCharacter["status"],
    presence: row.presence as AccountInspectionCharacter["presence"],
    discoverable: row.discoverable,
    visibility: row.visibility as AccountInspectionCharacter["visibility"],
    publicationConsent: row.publication_consent,
    createdAt: requiredString(row.created_at, "Character inspection returned invalid data"),
    updatedAt: requiredString(row.updated_at, "Character inspection returned invalid data"),
  };
}

function createDependencies(client: ServiceClient): AccountAdministrationInspectionDependencies {
  return {
    loadOperator: async (accountId) => {
      const result = await client
        .from("operator_principals")
        .select("account_id,status,capabilities")
        .eq("account_id", accountId)
        .maybeSingle();
      if (result.error) throw new Error("Operator registry is unavailable");
      const operator = record(result.data);
      if (!operator) return null;
      if (operator.status !== "active" && operator.status !== "disabled") throw new Error("Operator registry returned invalid data");
      return {
        accountId: requiredString(operator.account_id, "Operator registry returned invalid data"),
        status: operator.status,
        capabilities: capabilities(operator.capabilities),
      };
    },
    loadAccount: async (accountId, now) => {
      const result = await client.auth.admin.getUserById(accountId);
      if (result.error || !result.data.user) return null;
      const user = result.data.user;
      return {
        id: user.id,
        email: user.email ?? null,
        emailVerified: Boolean(user.email_confirmed_at),
        status: accountStatus(user.banned_until, now),
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at ?? null,
      };
    },
    isProtectedTarget: async (accountId) => {
      const result = await client
        .from("protected_account_targets")
        .select("account_id")
        .eq("account_id", accountId)
        .maybeSingle();
      if (result.error) throw new Error("Protected-target registry is unavailable");
      return Boolean(result.data);
    },
    loadCharacter: async (accountId) => {
      const result = await client
        .from("characters")
        .select("id,name,handle,status,presence,discoverable,visibility,publication_consent,created_at,updated_at")
        .eq("owner_account_id", accountId)
        .eq("kind", "member")
        .maybeSingle();
      if (result.error) throw new Error("Character registry is unavailable");
      return projectCharacter(result.data);
    },
    recordInspection: recordSupabaseAccountAdministrationInspection,
  };
}

export async function inspectSupabaseAccountAdministrationTarget(input: {
  operatorAccountId: string;
  targetAccountId: string;
  now?: string;
}): Promise<AccountAdministrationInspection> {
  const now = input.now ?? new Date().toISOString();
  const client = createServiceRoleSupabaseClient();
  return await inspectAccountAdministrationTarget(
    {
      inspectionId: randomUUID(),
      operatorAccountId: input.operatorAccountId,
      targetAccountId: input.targetAccountId,
      now,
    },
    createDependencies(client),
  );
}
