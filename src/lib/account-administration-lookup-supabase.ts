import "server-only";

import { AccountAdministrationError } from "./account-administration";
import type { AccountAdministrationInspection } from "./account-administration-inspection";
import { inspectSupabaseAccountAdministrationTarget } from "./account-administration-inspection-supabase";
import type { AccountAdministrationLookup } from "./account-administration-lookup";
import { createServiceRoleSupabaseClient } from "./supabase/service";

export async function lookupAndInspectSupabaseAccountAdministrationTarget(input: {
  operatorAccountId: string;
  lookup: AccountAdministrationLookup;
  now?: string;
}): Promise<AccountAdministrationInspection> {
  let targetAccountId = input.lookup.value;

  if (input.lookup.kind !== "account_id") {
    const client = createServiceRoleSupabaseClient();
    const column = input.lookup.kind === "character_id" ? "id" : "handle";
    const result = await client
      .from("characters")
      .select("owner_account_id")
      .eq(column, input.lookup.value)
      .eq("kind", "member")
      .maybeSingle();

    if (result.error) throw new Error("Account lookup is unavailable");
    const row = result.data as { owner_account_id?: unknown } | null;
    if (!row || typeof row.owner_account_id !== "string") {
      throw new AccountAdministrationError("Account was not found", "invalid");
    }
    targetAccountId = row.owner_account_id;
  }

  return inspectSupabaseAccountAdministrationTarget({
    operatorAccountId: input.operatorAccountId,
    targetAccountId,
    now: input.now,
  });
}
