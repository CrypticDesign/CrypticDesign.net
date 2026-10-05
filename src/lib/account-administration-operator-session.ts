import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import type { OperatorCapability, OperatorPrincipal } from "./account-administration.ts";

export const OPERATOR_SESSION_MAX_AGE_SECONDS = 15 * 60;
export const OPERATOR_STEP_UP_MAX_AGE_SECONDS = 5 * 60;

const CLOCK_SKEW_MILLISECONDS = 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OPAQUE_TOKEN = /^[A-Za-z0-9_-]{43,128}$/;

export type VerifiedOperatorIdentity = {
  accountId: string;
  authSessionReference: string;
  reauthenticatedAt: string;
};

export type LiveOperatorPrincipal = {
  accountId: string;
  status: "active" | "disabled";
  capabilities: readonly OperatorCapability[];
};

export type OperatorAccessSession = {
  id: string;
  tokenDigest: string;
  operatorAccountId: string;
  authSessionReferenceDigest: string;
  reauthenticatedAt: string;
  issuedAt: string;
  expiresAt: string;
  revokedAt: string | null;
};

export type OperatorSessionIssuanceDependencies = {
  loadOperator(accountId: string): Promise<LiveOperatorPrincipal | null>;
};

export type OperatorSessionAuthorizationDependencies = {
  loadSessionByTokenDigest(tokenDigest: string): Promise<OperatorAccessSession | null>;
  loadOperator(accountId: string): Promise<LiveOperatorPrincipal | null>;
};

export class OperatorSessionError extends Error {
  readonly code: "forbidden" | "invalid";

  constructor(message: string, code: "forbidden" | "invalid") {
    super(message);
    this.code = code;
  }
}

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function validTime(value: string, field: string) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new OperatorSessionError(`${field} must be a timestamp`, "invalid");
  return parsed;
}

function requireUuid(value: string, field: string) {
  if (!UUID.test(value)) throw new OperatorSessionError(`${field} must be a UUID`, "invalid");
}

function requireAuthSessionReference(value: string) {
  if (value.length < 16 || value.length > 512) {
    throw new OperatorSessionError("Verified Auth session binding is required", "invalid");
  }
}

function requireLiveCapability(
  principal: LiveOperatorPrincipal | null,
  accountId: string,
  capability: OperatorCapability,
) {
  if (
    !principal ||
    principal.accountId !== accountId ||
    principal.status !== "active" ||
    !principal.capabilities.includes(capability)
  ) {
    throw new OperatorSessionError("Operator authorization denied", "forbidden");
  }
  return principal;
}

function equalDigest(actual: string, expected: string) {
  if (!/^[0-9a-f]{64}$/i.test(actual) || !/^[0-9a-f]{64}$/i.test(expected)) return false;
  return timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

export async function issueOperatorAccessSession(
  input: {
    identity: VerifiedOperatorIdentity;
    requiredCapability: OperatorCapability;
    now: string;
    durationSeconds: number;
  },
  dependencies: OperatorSessionIssuanceDependencies,
): Promise<{ token: string; session: OperatorAccessSession }> {
  requireUuid(input.identity.accountId, "Operator account");
  requireAuthSessionReference(input.identity.authSessionReference);
  if (
    !Number.isInteger(input.durationSeconds) ||
    input.durationSeconds < 1 ||
    input.durationSeconds > OPERATOR_SESSION_MAX_AGE_SECONDS
  ) {
    throw new OperatorSessionError("Operator session duration exceeds the fixed maximum", "invalid");
  }

  const now = validTime(input.now, "Current time");
  const reauthenticatedAt = validTime(input.identity.reauthenticatedAt, "Step-up time");
  if (
    reauthenticatedAt > now + CLOCK_SKEW_MILLISECONDS ||
    now - reauthenticatedAt > OPERATOR_STEP_UP_MAX_AGE_SECONDS * 1000
  ) {
    throw new OperatorSessionError("Recent human reauthentication is required", "forbidden");
  }

  requireLiveCapability(
    await dependencies.loadOperator(input.identity.accountId),
    input.identity.accountId,
    input.requiredCapability,
  );

  const id = randomUUID();
  const token = randomBytes(32).toString("base64url");
  requireUuid(id, "Operator session");
  if (!OPAQUE_TOKEN.test(token)) {
    throw new OperatorSessionError("A 256-bit opaque operator token is required", "invalid");
  }

  return {
    token,
    session: {
      id,
      tokenDigest: digest(token),
      operatorAccountId: input.identity.accountId,
      authSessionReferenceDigest: digest(input.identity.authSessionReference),
      reauthenticatedAt: input.identity.reauthenticatedAt,
      issuedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + input.durationSeconds * 1000).toISOString(),
      revokedAt: null,
    },
  };
}

export async function authorizeOperatorAccessSession(
  input: {
    token: string;
    identity: Pick<VerifiedOperatorIdentity, "accountId" | "authSessionReference">;
    requiredCapability: OperatorCapability;
    now: string;
  },
  dependencies: OperatorSessionAuthorizationDependencies,
): Promise<{ sessionId: string; expiresAt: string; principal: OperatorPrincipal }> {
  requireUuid(input.identity.accountId, "Operator account");
  requireAuthSessionReference(input.identity.authSessionReference);
  if (!OPAQUE_TOKEN.test(input.token)) {
    throw new OperatorSessionError("Operator authorization denied", "forbidden");
  }

  const now = validTime(input.now, "Current time");
  const tokenDigest = digest(input.token);
  const session = await dependencies.loadSessionByTokenDigest(tokenDigest);
  if (!session) throw new OperatorSessionError("Operator authorization denied", "forbidden");

  requireUuid(session.id, "Operator session");
  requireUuid(session.operatorAccountId, "Stored operator account");
  const issuedAt = validTime(session.issuedAt, "Session issue time");
  const expiresAt = validTime(session.expiresAt, "Session expiry time");
  const reauthenticatedAt = validTime(session.reauthenticatedAt, "Step-up time");
  const validFixedWindow =
    expiresAt > issuedAt &&
    expiresAt - issuedAt <= OPERATOR_SESSION_MAX_AGE_SECONDS * 1000;
  const validStepUpWindow =
    reauthenticatedAt <= issuedAt + CLOCK_SKEW_MILLISECONDS &&
    issuedAt - reauthenticatedAt <= OPERATOR_STEP_UP_MAX_AGE_SECONDS * 1000;

  if (
    !equalDigest(session.tokenDigest, tokenDigest) ||
    !equalDigest(session.authSessionReferenceDigest, digest(input.identity.authSessionReference)) ||
    session.operatorAccountId !== input.identity.accountId ||
    session.revokedAt !== null ||
    !validFixedWindow ||
    !validStepUpWindow ||
    now < issuedAt - CLOCK_SKEW_MILLISECONDS ||
    now >= expiresAt
  ) {
    throw new OperatorSessionError("Operator authorization denied", "forbidden");
  }

  const principal = requireLiveCapability(
    await dependencies.loadOperator(session.operatorAccountId),
    session.operatorAccountId,
    input.requiredCapability,
  );
  return {
    sessionId: session.id,
    expiresAt: session.expiresAt,
    principal: {
      accountId: principal.accountId,
      status: principal.status,
      capabilities: principal.capabilities,
      authenticatedAt: session.reauthenticatedAt,
    },
  };
}

export function revokeOperatorAccessSession(
  session: OperatorAccessSession,
  revokedAt: string,
): OperatorAccessSession {
  const issuedAt = validTime(session.issuedAt, "Session issue time");
  const revocationTime = validTime(revokedAt, "Session revocation time");
  if (revocationTime < issuedAt) {
    throw new OperatorSessionError("Session revocation cannot predate issuance", "invalid");
  }
  if (session.revokedAt !== null) return session;
  return { ...session, revokedAt: new Date(revocationTime).toISOString() };
}
