import "server-only";

import { AccountAdministrationError } from "./account-administration";
import type { AccountInspectionAuditEvent } from "./account-administration-inspection";
import { createServiceRoleSupabaseClient } from "./supabase/service";

export async function recordSupabaseAccountAdministrationInspection(
  event: AccountInspectionAuditEvent,
): Promise<{ inspectionId: string; occurredAt: string }> {
  const client = createServiceRoleSupabaseClient();
  const result = await client.rpc("record_account_administration_inspection", {
    p_inspection_id: event.inspectionId,
    p_operator_account_id: event.operatorAccountId,
    p_target_account_id: event.targetAccountId,
    p_target_character_id: event.targetCharacterId,
  });
  if (result.error || typeof result.data !== "string" || !Number.isFinite(Date.parse(result.data))) {
    throw new AccountAdministrationError(
      "Account inspection was blocked because durable audit recording failed",
      "audit_incomplete",
    );
  }
  return { inspectionId: event.inspectionId, occurredAt: result.data };
}
