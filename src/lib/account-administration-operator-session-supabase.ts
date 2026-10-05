import "server-only";

import {
  issueOperatorAccessSession,
  OperatorSessionError,
  revokeOperatorAccessSession,
  type LiveOperatorPrincipal,
  type OperatorAccessSession,
  type OperatorSessionAuthorizationDependencies,
  type VerifiedOperatorIdentity,
} from "./account-administration-operator-session";
import type { OperatorCapability } from "./account-administration";
import { createServiceRoleSupabaseClient } from "./supabase/service";

type ServiceClient = ReturnType<typeof createServiceRoleSupabaseClient>;

const DIGEST = /^[0-9a-f]{64}$/;
const CAPABILITIES = new Set<OperatorCapability>([
  "account:inspect", "account:suspend", "account:restore", "account:revoke_sessions",
  "character:suspend", "character:restore", "protected_targets:mutate",
]);

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function requiredString(value: unknown, message: string) {
  if (typeof value !== "string" || value.length === 0) throw new Error(message);
  return value;
}

function requiredDigest(value: unknown, message: string) {
  const result = requiredString(value, message);
  if (!DIGEST.test(result)) throw new Error(message);
  return result;
}

function nullableString(value: unknown, message: string): string | null {
  if (value === null) return null;
  return requiredString(value, message);
}

function projectSession(value: unknown): OperatorAccessSession | null {
  if (value === null) return null;
  const row = record(value);
  if (!row) throw new Error("Operator session registry returned invalid data");
  return {
    id: requiredString(row.id, "Operator session registry returned invalid data"),
    tokenDigest: requiredDigest(row.token_digest, "Operator session registry returned invalid data"),
    operatorAccountId: requiredString(row.operator_account_id, "Operator session registry returned invalid data"),
    authSessionReferenceDigest: requiredDigest(row.auth_session_reference_digest, "Operator session registry returned invalid data"),
    reauthenticatedAt: requiredString(row.reauthenticated_at, "Operator session registry returned invalid data"),
    issuedAt: requiredString(row.issued_at, "Operator session registry returned invalid data"),
    expiresAt: requiredString(row.expires_at, "Operator session registry returned invalid data"),
    revokedAt: nullableString(row.revoked_at, "Operator session registry returned invalid data"),
  };
}

function projectCapabilities(value: unknown): OperatorCapability[] {
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string" && CAPABILITIES.has(entry as OperatorCapability))) {
    throw new Error("Operator registry returned invalid data");
  }
  return value as OperatorCapability[];
}

function projectOperator(value: unknown): LiveOperatorPrincipal | null {
  if (value === null) return null;
  const row = record(value);
  if (!row || (row.status !== "active" && row.status !== "disabled")) {
    throw new Error("Operator registry returned invalid data");
  }
  return {
    accountId: requiredString(row.account_id, "Operator registry returned invalid data"),
    status: row.status,
    capabilities: projectCapabilities(row.capabilities),
  };
}

export function createSupabaseOperatorSessionAuthorizationDependencies(
  client: ServiceClient = createServiceRoleSupabaseClient(),
): OperatorSessionAuthorizationDependencies {
  return {
    loadSessionByTokenDigest: async (tokenDigest) => {
      if (!DIGEST.test(tokenDigest)) return null;
      const result = await client
        .from("operator_access_sessions")
        .select("id,token_digest,operator_account_id,auth_session_reference_digest,reauthenticated_at,issued_at,expires_at,revoked_at")
        .eq("token_digest", tokenDigest)
        .maybeSingle();
      if (result.error) throw new Error("Operator session registry is unavailable");
      return projectSession(result.data);
    },
    loadOperator: async (accountId) => {
      const result = await client
        .from("operator_principals")
        .select("account_id,status,capabilities")
        .eq("account_id", accountId)
        .maybeSingle();
      if (result.error) throw new Error("Operator registry is unavailable");
      return projectOperator(result.data);
    },
  };
}

export async function persistSupabaseOperatorAccessSession(input: {
  session: OperatorAccessSession;
  requiredCapability: OperatorCapability;
  client?: ServiceClient;
}): Promise<{ sessionId: string; occurredAt: string }> {
  const client = input.client ?? createServiceRoleSupabaseClient();
  const result = await client.rpc("create_operator_access_session", {
    p_session_id: input.session.id,
    p_token_digest: input.session.tokenDigest,
    p_operator_account_id: input.session.operatorAccountId,
    p_auth_session_reference_digest: input.session.authSessionReferenceDigest,
    p_reauthenticated_at: input.session.reauthenticatedAt,
    p_issued_at: input.session.issuedAt,
    p_expires_at: input.session.expiresAt,
    p_required_capability: input.requiredCapability,
  });
  if (result.error || typeof result.data !== "string" || !Number.isFinite(Date.parse(result.data))) {
    throw new OperatorSessionError("Operator session persistence failed", "forbidden");
  }
  return { sessionId: input.session.id, occurredAt: result.data };
}

export async function issueAndPersistSupabaseOperatorAccessSession(input: {
  identity: VerifiedOperatorIdentity;
  requiredCapability: OperatorCapability;
  durationSeconds: number;
  now?: string;
  client?: ServiceClient;
}): Promise<{ token: string; session: OperatorAccessSession }> {
  const client = input.client ?? createServiceRoleSupabaseClient();
  const dependencies = createSupabaseOperatorSessionAuthorizationDependencies(client);
  const issued = await issueOperatorAccessSession(
    {
      identity: input.identity,
      requiredCapability: input.requiredCapability,
      now: input.now ?? new Date().toISOString(),
      durationSeconds: input.durationSeconds,
    },
    { loadOperator: dependencies.loadOperator },
  );
  await persistSupabaseOperatorAccessSession({
    session: issued.session,
    requiredCapability: input.requiredCapability,
    client,
  });
  return issued;
}

export async function revokeSupabaseOperatorAccessSession(input: {
  session: OperatorAccessSession;
  revokedAt: string;
  client?: ServiceClient;
}): Promise<OperatorAccessSession> {
  const planned = revokeOperatorAccessSession(input.session, input.revokedAt);
  const client = input.client ?? createServiceRoleSupabaseClient();
  const result = await client.rpc("revoke_operator_access_session", {
    p_session_id: planned.id,
    p_operator_account_id: planned.operatorAccountId,
    p_revoked_at: planned.revokedAt,
  });
  if (result.error || typeof result.data !== "string" || !Number.isFinite(Date.parse(result.data))) {
    throw new OperatorSessionError("Operator session revocation failed", "forbidden");
  }
  return { ...planned, revokedAt: result.data };
}
