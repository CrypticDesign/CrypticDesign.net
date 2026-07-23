import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { membershipSandboxEnabled } from "./membership-store";
import { SANDBOX_SESSION_COOKIE, verifySandboxSession } from "./sandbox-session";
import { supabaseConfigured } from "./supabase/server";

export async function getInitialAccountAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();

  if (supabaseConfigured()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return false;

    const client = createServerClient(url, key, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          // Root layouts cannot write refreshed cookies. Auth routes own refreshes.
        },
      },
    });
    const { data, error } = await client.auth.getUser();
    return !error && Boolean(data.user);
  }

  if (membershipSandboxEnabled()) {
    return Boolean(verifySandboxSession(cookieStore.get(SANDBOX_SESSION_COOKIE)?.value));
  }

  return false;
}
