import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const SANDBOX_SESSION_COOKIE = "cryptic_sandbox_member";

function secret(): string {
  const value = process.env.MEMBERSHIP_SANDBOX_SECRET;
  if (!value) throw new Error("Membership sandbox secret is not configured");
  return value;
}

export function createSandboxSession(memberId: string): string {
  const encoded = Buffer.from(memberId, "utf8").toString("base64url");
  const signature = createHmac("sha256", secret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifySandboxSession(value: string | undefined): string | null {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;
  const expected = createHmac("sha256", secret()).update(encoded).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  return Buffer.from(encoded, "base64url").toString("utf8");
}

export function requireSandboxMember(request: NextRequest): string | null {
  return verifySandboxSession(request.cookies.get(SANDBOX_SESSION_COOKIE)?.value);
}
