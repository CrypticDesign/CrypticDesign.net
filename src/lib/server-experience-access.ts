import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { resolveAccountSession } from "./account-session";
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

async function hasExactDevelopmentAuthorization(
  client: SupabaseClient,
  accountId: string,
  definition: ExperienceAccessDefinition,
): Promise<boolean> {
  const { data: member, error: memberError } = await client
    .from("member_profiles")
    .select("id")
    .eq("account_id", accountId)
    .maybeSingle();
  if (memberError || !member?.id) return false;

  const { data, error } = await client
    .from("entitlement_grants")
    .select("id, member_id, resource, action, source, source_id, effective_at, expires_at, revoked_at, revocation_reason, created_at")
    .eq("member_id", member.id)
    .eq("resource", definition.resource)
    .eq("action", definition.action)
    .in("source", [...DEVELOPMENT_ENTITLEMENT_SOURCES]);
  if (error) return false;

  const grants = (data ?? [])
    .map((row) => entitlementGrantFromRow(row as EntitlementRow))
    .filter((grant): grant is EntitlementGrant => grant !== null);
  return resolveDevelopmentEntitlement(
    definition,
    String(member.id),
    grants,
    new Date().toISOString(),
  ).allowed;
}

async function resolveForIdentity(
  client: SupabaseClient | null,
  accountId: string | null,
  definition: ExperienceAccessDefinition,
): Promise<ExperienceAccessDecision> {
  if (definition.declaration === "PUBLIC_RELEASE") {
    return resolveExperienceAccess(definition.declaration, false);
  }
  if (!client || !accountId) return resolveExperienceAccess(definition.declaration, false);

  try {
    return resolveExperienceAccess(
      definition.declaration,
      await hasExactDevelopmentAuthorization(client, accountId, definition),
    );
  } catch {
    return resolveExperienceAccess(definition.declaration, false);
  }
}

export async function resolvePageExperienceAccess(
  definition: ExperienceAccessDefinition,
): Promise<ExperienceAccessDecision> {
  if (definition.declaration === "PUBLIC_RELEASE" || !supabaseConfigured()) {
    return resolveExperienceAccess(definition.declaration, false);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return resolveExperienceAccess(definition.declaration, false);

  const cookieStore = await cookies();
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

export interface RequestExperienceAccess {
  access: ExperienceAccessDecision;
  session: AccountSession;
}

export async function resolveRequestExperienceAccess(
  request: NextRequest,
  definition: ExperienceAccessDefinition,
): Promise<RequestExperienceAccess> {
  const session = await resolveAccountSession(request);
  return {
    access: await resolveForIdentity(session.client, session.accountId, definition),
    session,
  };
}
