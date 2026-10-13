const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CHARACTER_HANDLE = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;
const MAX_BODY_BYTES = 1024;

export const ACCOUNT_ADMINISTRATION_LOOKUP_KINDS = [
  "account_id",
  "character_id",
  "character_handle",
] as const;

export type AccountAdministrationLookupKind = (typeof ACCOUNT_ADMINISTRATION_LOOKUP_KINDS)[number];

export type AccountAdministrationLookup = {
  kind: AccountAdministrationLookupKind;
  value: string;
};

export class AccountAdministrationLookupError extends Error {}

export function parseAccountAdministrationLookup(body: string): AccountAdministrationLookup {
  if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
    throw new AccountAdministrationLookupError("Lookup body is too large");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new AccountAdministrationLookupError("Lookup body is invalid");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new AccountAdministrationLookupError("Lookup body is invalid");
  }

  const value = parsed as Record<string, unknown>;
  const keys = Object.keys(value).sort();
  if (
    keys.length !== 2 ||
    keys[0] !== "kind" ||
    keys[1] !== "value" ||
    typeof value.kind !== "string" ||
    !ACCOUNT_ADMINISTRATION_LOOKUP_KINDS.includes(value.kind as AccountAdministrationLookupKind) ||
    typeof value.value !== "string"
  ) {
    throw new AccountAdministrationLookupError("Lookup body is invalid");
  }

  const kind = value.kind as AccountAdministrationLookupKind;
  const normalized = kind === "character_handle"
    ? value.value.trim().replace(/^@/, "").toLowerCase()
    : value.value.trim().toLowerCase();

  if (
    ((kind === "account_id" || kind === "character_id") && !UUID.test(normalized)) ||
    (kind === "character_handle" && !CHARACTER_HANDLE.test(normalized))
  ) {
    throw new AccountAdministrationLookupError("Lookup identifier is invalid");
  }

  return { kind, value: normalized };
}
