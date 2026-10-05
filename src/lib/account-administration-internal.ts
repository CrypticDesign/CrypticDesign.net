import { timingSafeEqual } from "node:crypto";
import { OPERATOR_ACTIONS, type OperatorCommand } from "./account-administration.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BODY_BYTES = 4096;

export type AccountAdministrationInternalConfig = {
  operatorAccountId: string;
  secret: string;
};

export function readAccountAdministrationInternalConfig(): AccountAdministrationInternalConfig | null {
  const operatorAccountId = process.env.ACCOUNT_ADMINISTRATION_OPERATOR_ID?.trim() ?? "";
  const secret = process.env.ACCOUNT_ADMINISTRATION_INTERNAL_SECRET?.trim() ?? "";
  if (
    process.env.ACCOUNT_ADMINISTRATION_MODE?.trim() !== "internal" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    !UUID.test(operatorAccountId) ||
    secret.length < 32
  ) return null;
  return { operatorAccountId, secret };
}

export function authorizeAccountAdministrationInternalRequest(input: {
  authorization: string | null;
  origin: string | null;
  secret: string;
}): boolean {
  // This is a machine-only endpoint. Rejecting every browser Origin keeps it out
  // of cookie/CSRF flows; the bearer secret remains the primary authorization.
  if (input.origin || !input.authorization?.startsWith("Bearer ")) return false;
  const supplied = Buffer.from(input.authorization.slice("Bearer ".length), "utf8");
  const expected = Buffer.from(input.secret, "utf8");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export function parseAccountAdministrationCommand(body: string): OperatorCommand {
  if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) throw new Error("Request body is too large");
  const value: unknown = JSON.parse(body);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Command must be an object");
  const command = value as Record<string, unknown>;
  if (
    typeof command.requestId !== "string" ||
    typeof command.action !== "string" ||
    !OPERATOR_ACTIONS.includes(command.action as (typeof OPERATOR_ACTIONS)[number]) ||
    typeof command.targetAccountId !== "string" ||
    (command.targetCharacterId !== undefined && typeof command.targetCharacterId !== "string") ||
    typeof command.reason !== "string" ||
    typeof command.confirmation !== "string"
  ) throw new Error("Command shape is invalid");
  return {
    requestId: command.requestId,
    action: command.action as OperatorCommand["action"],
    targetAccountId: command.targetAccountId,
    ...(command.targetCharacterId ? { targetCharacterId: command.targetCharacterId } : {}),
    reason: command.reason,
    confirmation: command.confirmation,
  };
}
