import { accountAdmissionMode } from "./account-admission.ts";
import { normalizeAdmissionEmail } from "./admission.ts";

const IDEMPOTENCY_KEY = /^[A-Za-z0-9._:-]{8,200}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function admissionAcceptanceConfigured(): boolean {
  return accountAdmissionMode() === "invitation"
    && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim())
    && Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim())
    && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export function validAdmissionIdempotencyKey(value: string | null): value is string {
  return Boolean(value && IDEMPOTENCY_KEY.test(value));
}

export function admissionDisplayName(metadata: Record<string, unknown>, email: string): string {
  const preferred = [metadata.display_name, metadata.full_name, metadata.name]
    .find((value): value is string => typeof value === "string" && value.trim().length > 0)
    ?.trim();
  return (preferred ?? normalizeAdmissionEmail(email).split("@", 1)[0] ?? "Member").slice(0, 80);
}

export function parseAdmissionAcceptance(value: unknown): { memberId: string; subscriptionId: string } | null {
  if (!Array.isArray(value) || value.length !== 1 || !value[0] || typeof value[0] !== "object") return null;
  const row = value[0] as Record<string, unknown>;
  if (typeof row.accepted_member_id !== "string" || !UUID.test(row.accepted_member_id)) return null;
  if (typeof row.subscription_id !== "string" || !UUID.test(row.subscription_id)) return null;
  return { memberId: row.accepted_member_id, subscriptionId: row.subscription_id };
}
