import type { SupabaseClient } from "@supabase/supabase-js";

export async function signOutSupabaseSession(client: SupabaseClient): Promise<void> {
  const { error } = await client.auth.signOut();
  if (error) throw error;
}
