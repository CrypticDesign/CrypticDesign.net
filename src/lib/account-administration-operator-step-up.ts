import type { VerifiedOperatorIdentity } from "./account-administration-operator-session.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CLOCK_SKEW_MILLISECONDS = 60 * 1000;
const STEP_UP_MAX_AGE_MILLISECONDS = 5 * 60 * 1000;

type SupabaseAuthenticationMethod = {
  method?: unknown;
  timestamp?: unknown;
};

export type VerifiedSupabaseMfaClaims = {
  sub?: unknown;
  session_id?: unknown;
  aal?: unknown;
  amr?: unknown;
};

export class OperatorStepUpError extends Error {
  constructor() {
    super("Fresh TOTP verification is required");
  }
}

function recentTotpTimestamp(amr: unknown, now: number): number | null {
  if (!Array.isArray(amr)) return null;
  const timestamps = amr.flatMap((entry: SupabaseAuthenticationMethod) => {
    if (
      !entry ||
      typeof entry !== "object" ||
      entry.method !== "totp" ||
      typeof entry.timestamp !== "number" ||
      !Number.isInteger(entry.timestamp)
    ) return [];
    return [entry.timestamp * 1000];
  });
  if (timestamps.length === 0) return null;
  const latest = Math.max(...timestamps);
  if (
    latest > now + CLOCK_SKEW_MILLISECONDS ||
    now - latest > STEP_UP_MAX_AGE_MILLISECONDS
  ) return null;
  return latest;
}

export function deriveVerifiedOperatorIdentityFromSupabaseMfa(input: {
  verifiedAccountId: string;
  claims: VerifiedSupabaseMfaClaims;
  now: string;
}): VerifiedOperatorIdentity {
  const now = Date.parse(input.now);
  const accountId = input.claims.sub;
  const sessionId = input.claims.session_id;
  if (
    !Number.isFinite(now) ||
    !UUID.test(input.verifiedAccountId) ||
    typeof accountId !== "string" ||
    accountId !== input.verifiedAccountId ||
    typeof sessionId !== "string" ||
    !UUID.test(sessionId) ||
    input.claims.aal !== "aal2"
  ) throw new OperatorStepUpError();

  const verifiedAt = recentTotpTimestamp(input.claims.amr, now);
  if (verifiedAt === null) throw new OperatorStepUpError();

  return {
    accountId,
    authSessionReference: sessionId,
    reauthenticatedAt: new Date(verifiedAt).toISOString(),
  };
}
