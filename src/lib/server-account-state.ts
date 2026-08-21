import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { membershipSandboxEnabled, membershipSandboxPreferred } from "./membership-store";
import { SANDBOX_SESSION_COOKIE, verifySandboxSession } from "./sandbox-session";
import { supabaseConfigured } from "./supabase/server";

export interface ServerAccountIdentity {
  authenticated: boolean;
  accountId: string | null;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean | null;
  joinedAt: string | null;
  lastSignInAt: string | null;
  mode: "supabase" | "sandbox" | "disabled";
  status: "active" | "signed-out";
}

const SIGNED_OUT_ACCOUNT: ServerAccountIdentity = {
  authenticated: false,
  accountId: null,
  displayName: null,
  email: null,
  emailVerified: null,
  joinedAt: null,
  lastSignInAt: null,
  mode: "disabled",
  status: "signed-out",
};

export async function getInitialAccountIdentity(): Promise<ServerAccountIdentity> {
  const cookieStore = await cookies();

  if (membershipSandboxPreferred()) {
    const accountId = verifySandboxSession(cookieStore.get(SANDBOX_SESSION_COOKIE)?.value);
    return accountId ? {
      authenticated: true,
      accountId,
      displayName: "Local test account",
      email: null,
      emailVerified: null,
      joinedAt: null,
      lastSignInAt: null,
      mode: "sandbox",
      status: "active",
    } : { ...SIGNED_OUT_ACCOUNT, mode: "sandbox" };
  }

  if (supabaseConfigured()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return SIGNED_OUT_ACCOUNT;

    const client = createServerClient(url, key, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          // Root layouts cannot write refreshed cookies. Auth routes own refreshes.
        },
      },
    });
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return { ...SIGNED_OUT_ACCOUNT, mode: "supabase" };
    const metadata = data.user.user_metadata as Record<string, unknown>;
    const displayName = [metadata.display_name, metadata.full_name, metadata.name]
      .find((value): value is string => typeof value === "string" && value.trim().length > 0)
      ?.trim() ?? null;
    return {
      authenticated: true,
      accountId: data.user.id,
      displayName,
      email: data.user.email ?? null,
      emailVerified: Boolean(data.user.email_confirmed_at),
      joinedAt: data.user.created_at ?? null,
      lastSignInAt: data.user.last_sign_in_at ?? null,
      mode: "supabase",
      status: "active",
    };
  }

  if (membershipSandboxEnabled()) {
    const accountId = verifySandboxSession(cookieStore.get(SANDBOX_SESSION_COOKIE)?.value);
    return accountId ? {
      authenticated: true,
      accountId,
      displayName: "Local test account",
      email: null,
      emailVerified: null,
      joinedAt: null,
      lastSignInAt: null,
      mode: "sandbox",
      status: "active",
    } : { ...SIGNED_OUT_ACCOUNT, mode: "sandbox" };
  }

  return SIGNED_OUT_ACCOUNT;
}

export async function getInitialAccountAuthenticated(): Promise<boolean> {
  return (await getInitialAccountIdentity()).authenticated;
}
