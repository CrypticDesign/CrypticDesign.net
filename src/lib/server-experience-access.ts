import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";

import { resolveAccountSession } from "./account-session";
import { memberAuthAvailableForHeaders } from "./member-auth-environment";
import { membershipSandboxEnabled, membershipSandboxPreferred } from "./membership-store";
import { SANDBOX_SESSION_COOKIE, verifySandboxSession } from "./sandbox-session";
import {
  DEVELOPMENT_ENTITLEMENT_SOURCES,
  resolveDevelopmentEntitlement,
  resolveExperienceAccess,
  type ExperienceAccessDecision,
  type ExperienceAccessDefinition,
} from "./experience-access";
import {
  ENTITLEMENT_SOURCES,
  type EntitlementGrant,
  type EntitlementSource,
} from "./entitlements";
import { supabaseConfigured, type AccountSession } from "./supabase/server";

type EntitlementRow = Record<string, unknown>;

function entitlementGrantFromRow(row: EntitlementRow): EntitlementGrant | null {
  const source = String(row.source ?? "");
  if (!ENTITLEMENT_SOURCES.includes(source as EntitlementSource)) return null;

  return {
    id: String(row.id),
    memberId: String(row.member_id),
    resource: String(row.resource),
    action: String(row.action),
    source: source as EntitlementSource,
    sourceId: String(row.source_id),
    effectiveAt: String(row.effective_at),
    expiresAt: row.expires_at === null ? null : String(row.expires_at),
    revokedAt: row.revoked_at === null ? null : String(row.revoked_at),
    revocationReason: row.revocation_reason === null ? null : String(row.revocation_reason),
    createdAt: String(row.created_at),
  };
}

async function resolveMemberId(
  client: SupabaseClient,
  accountId: string,
): Promise<string | null> {
  const { data: member, error: memberError } = await client
    .from("member_profiles")
    .select("id")
    .eq("account_id", accountId)
    .maybeSingle();
  if (memberError || !member?.id) return null;
  return String(member.id);
}

async function hasExactDevelopmentAuthorization(
  client: SupabaseClient,
  memberId: string,
  definition: ExperienceAccessDefinition,
): Promise<boolean> {

  const { data, error } = await client
    .from("entitlement_grants")
    .select("id, member_id, resource, action, source, source_id, effective_at, expires_at, revoked_at, revocation_reason, created_at")
    .eq("member_id", memberId)
    .eq("resource", definition.resource)
    .eq("action", definition.action)
    .in("source", [...DEVELOPMENT_ENTITLEMENT_SOURCES]);
  if (error) return false;

  const grants = (data ?? [])
    .map((row) => entitlementGrantFromRow(row as EntitlementRow))
    .filter((grant): grant is EntitlementGrant => grant !== null);
  return resolveDevelopmentEntitlement(
    definition,
    memberId,
    grants,
    new Date().toISOString(),
  ).allowed;
}

export interface ResolvedExperienceAuthorization {
  access: ExperienceAccessDecision;
  authenticated: boolean;
  memberId: string | null;
}

async function resolveForIdentity(
  client: SupabaseClient | null,
  accountId: string | null,
  definition: ExperienceAccessDefinition,
): Promise<ResolvedExperienceAuthorization> {
  const authenticated = Boolean(accountId);
  if (definition.declaration === "PUBLIC_RELEASE") {
    return { access: resolveExperienceAccess(definition.declaration, false), authenticated, memberId: null };
  }
  if (!client || !accountId) {
    return { access: resolveExperienceAccess(definition.declaration, false), authenticated, memberId: null };
  }

  try {
    const memberId = await resolveMemberId(client, accountId);
    if (!memberId) {
      return { access: resolveExperienceAccess(definition.declaration, false), authenticated, memberId: null };
    }
    return {
      access: resolveExperienceAccess(
        definition.declaration,
        await hasExactDevelopmentAuthorization(client, memberId, definition),
      ),
      authenticated,
      memberId,
    };
  } catch {
    return { access: resolveExperienceAccess(definition.declaration, false), authenticated, memberId: null };
  }
}

export async function resolvePageExperienceAuthorization(
  definition: ExperienceAccessDefinition,
): Promise<ResolvedExperienceAuthorization> {
  if (definition.declaration === "PUBLIC_RELEASE") {
    return { access: resolveExperienceAccess(definition.declaration, false), authenticated: false, memberId: null };
  }

  const requestHeaders = await headers();
  if (!memberAuthAvailableForHeaders(requestHeaders)) {
    return { access: resolveExperienceAccess(definition.declaration, false), authenticated: false, memberId: null };
  }

  const cookieStore = await cookies();
  if (membershipSandboxPreferred()) {
    const accountId = verifySandboxSession(cookieStore.get(SANDBOX_SESSION_COOKIE)?.value);
    return resolveForIdentity(null, accountId, definition);
  }

  if (!supabaseConfigured()) {
    if (membershipSandboxEnabled()) {
      const accountId = verifySandboxSession(cookieStore.get(SANDBOX_SESSION_COOKIE)?.value);
      return resolveForIdentity(null, accountId, definition);
    }
    return { access: resolveExperienceAccess(definition.declaration, false), authenticated: false, memberId: null };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return { access: resolveExperienceAccess(definition.declaration, false), authenticated: false, memberId: null };
  }

  const client = createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {
        // Server components cannot refresh response cookies. Auth routes own refreshes.
      },
    },
  });
  const { data, error } = await client.auth.getUser();
  return resolveForIdentity(client, error ? null : data.user?.id ?? null, definition);
}

export async function resolvePageExperienceAccess(
  definition: ExperienceAccessDefinition,
): Promise<ExperienceAccessDecision> {
  return (await resolvePageExperienceAuthorization(definition)).access;
}

export interface RequestExperienceAccess {
  access: ExperienceAccessDecision;
  session: AccountSession;
  memberId: string | null;
}

export async function resolveRequestExperienceAccess(
  request: NextRequest,
  definition: ExperienceAccessDefinition,
): Promise<RequestExperienceAccess> {
  const session = await resolveAccountSession(request);
  const resolved = await resolveForIdentity(session.client, session.accountId, definition);
  return {
    access: resolved.access,
    session,
    memberId: resolved.memberId,
  };
}
