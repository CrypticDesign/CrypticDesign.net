import type { SupabaseClient } from "@supabase/supabase-js";

export async function findAdmittedMember(
  client: SupabaseClient,
  accountId: string,
): Promise<{ memberId: string | null; error: boolean }> {
  const result = await client
    .from("member_profiles")
    .select("id")
    .eq("account_id", accountId)
    .maybeSingle();
  return { memberId: result.data?.id ?? null, error: Boolean(result.error) };
}
