import { NextRequest, NextResponse } from "next/server";
import { membershipSandboxEnabled } from "./membership-store";
import { requireSandboxMember } from "./sandbox-session";
import { createRequestSupabaseClient, supabaseConfigured, type AccountSession } from "./supabase/server";

export async function resolveAccountSession(request: NextRequest): Promise<AccountSession> {
  if (supabaseConfigured()) {
    const session = createRequestSupabaseClient(request);
    const { data, error } = await session.client.auth.getUser();
    return {
      accountId: error ? null : data.user?.id ?? null,
      mode: "supabase",
      client: session.client,
      applyCookies: session.applyCookies,
    };
  }

  if (membershipSandboxEnabled()) {
    return {
      accountId: requireSandboxMember(request),
      mode: "sandbox",
      client: null,
      applyCookies: <T extends NextResponse>(response: T) => response,
    };
  }

  return {
    accountId: null,
    mode: "disabled",
    client: null,
    applyCookies: <T extends NextResponse>(response: T) => response,
  };
}

export function accountServicesConfigured(): boolean {
  return supabaseConfigured() || membershipSandboxEnabled();
}
