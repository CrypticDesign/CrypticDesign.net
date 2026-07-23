import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";

import { signOutSupabaseSession } from "./supabase/auth.ts";

test("completes sign-out only when Supabase accepts it", async () => {
  const client = { auth: { signOut: async () => ({ error: null }) } } as unknown as SupabaseClient;
  await assert.doesNotReject(() => signOutSupabaseSession(client));
});

test("preserves authenticated state when Supabase rejects sign-out", async () => {
  const failure = new Error("session revocation failed");
  const client = { auth: { signOut: async () => ({ error: failure }) } } as unknown as SupabaseClient;
  await assert.rejects(() => signOutSupabaseSession(client), failure);
});
