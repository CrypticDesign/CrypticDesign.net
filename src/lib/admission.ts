import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ADMISSION_SESSION_COOKIE = "cryptic_admission";
export const ADMISSION_SESSION_MAX_AGE_SECONDS = 15 * 60;

export type InvitationStatus =
  | "prepared"
  | "sent"
  | "checkout_pending"
  | "paid_eligible"
  | "auth_invited"
  | "accepted"
  | "expired"
  | "revoked"
  | "failed";

const INVITATION_TRANSITIONS: Readonly<Record<InvitationStatus, readonly InvitationStatus[]>> = {
  prepared: ["sent", "expired", "revoked", "failed"],
  sent: ["checkout_pending", "expired", "revoked", "failed"],
  checkout_pending: ["paid_eligible", "expired", "revoked", "failed"],
  paid_eligible: ["auth_invited", "expired", "revoked", "failed"],
  auth_invited: ["accepted", "expired", "revoked", "failed"],
  accepted: [],
  expired: [],
  revoked: [],
  failed: [],
};

function requiredSecret(name: "ADMISSION_TOKEN_HMAC_SECRET" | "ADMISSION_SESSION_SECRET"): string {
  const value = process.env[name]?.trim();
  if (!value || value.length < 32) throw new Error(`${name} must contain at least 32 characters`);
  return value;
}

export function normalizeAdmissionEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function createAdmissionToken(): { token: string; digest: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, digest: digestAdmissionToken(token) };
}

export function digestAdmissionToken(token: string): string {
  return createHmac("sha256", requiredSecret("ADMISSION_TOKEN_HMAC_SECRET"))
    .update(token, "utf8")
    .digest("hex");
}

export function canTransitionInvitation(from: InvitationStatus, to: InvitationStatus): boolean {
  return INVITATION_TRANSITIONS[from].includes(to);
}

type AdmissionSessionPayload = { invitationId: string; expiresAt: number };

export function createAdmissionSession(invitationId: string, now = Date.now()): string {
  const payload: AdmissionSessionPayload = {
    invitationId,
    expiresAt: now + ADMISSION_SESSION_MAX_AGE_SECONDS * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = createHmac("sha256", requiredSecret("ADMISSION_SESSION_SECRET"))
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifyAdmissionSession(value: string | undefined, now = Date.now()): AdmissionSessionPayload | null {
  if (!value) return null;
  const [encoded, signature, extra] = value.split(".");
  if (!encoded || !signature || extra) return null;
  const expected = createHmac("sha256", requiredSecret("ADMISSION_SESSION_SECRET"))
    .update(encoded)
    .digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Partial<AdmissionSessionPayload>;
    if (typeof payload.invitationId !== "string" || !payload.invitationId) return null;
    if (typeof payload.expiresAt !== "number" || !Number.isFinite(payload.expiresAt) || payload.expiresAt <= now) return null;
    return { invitationId: payload.invitationId, expiresAt: payload.expiresAt };
  } catch {
    return null;
  }
}
