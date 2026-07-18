import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

type PendingCookie = { name: string; value: string; options: CookieOptions };

export function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export function createRequestSupabaseClient(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase authentication is not configured");

  const pendingCookies: PendingCookie[] = [];
  const client = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => { pendingCookies.push(...cookies); },
    },
  });

  return {
    client,
    applyCookies<T extends NextResponse>(response: T): T {
      for (const cookie of pendingCookies) response.cookies.set(cookie.name, cookie.value, cookie.options);
      return response;
    },
  };
}

export interface AccountSession {
  accountId: string | null;
  mode: "supabase" | "sandbox" | "disabled";
  client: SupabaseClient | null;
  applyCookies<T extends NextResponse>(response: T): T;
}
