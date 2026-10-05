import assert from "node:assert/strict";
import test from "node:test";
import {
  authorizeOperatorAccessSession,
  issueOperatorAccessSession,
  OperatorSessionError,
  revokeOperatorAccessSession,
  type LiveOperatorPrincipal,
  type OperatorAccessSession,
} from "./account-administration-operator-session.ts";

const ACCOUNT_ID = "10000000-0000-4000-8000-000000000001";
const TOKEN = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const AUTH_SESSION = "verified-auth-session-reference-0001";
const NOW = "2026-09-29T15:00:00.000Z";
const principal: LiveOperatorPrincipal = {
  accountId: ACCOUNT_ID,
  status: "active",
  capabilities: ["account:inspect"],
};

function issuance(overrides: Partial<Parameters<typeof issueOperatorAccessSession>[0]> = {}) {
  return issueOperatorAccessSession({
    identity: {
      accountId: ACCOUNT_ID,
      authSessionReference: AUTH_SESSION,
      reauthenticatedAt: "2026-09-29T14:58:00.000Z",
    },
    requiredCapability: "account:inspect",
    now: NOW,
    durationSeconds: 900,
    ...overrides,
  }, {
    loadOperator: async () => principal,
  });
}

function authorization(
  session: OperatorAccessSession,
  options: {
    token?: string;
    authSessionReference?: string;
    now?: string;
    livePrincipal?: LiveOperatorPrincipal | null;
  } = {},
) {
  return authorizeOperatorAccessSession({
    token: options.token ?? TOKEN,
    identity: {
      accountId: ACCOUNT_ID,
      authSessionReference: options.authSessionReference ?? AUTH_SESSION,
    },
    requiredCapability: "account:inspect",
    now: options.now ?? "2026-09-29T15:05:00.000Z",
  }, {
    loadSessionByTokenDigest: async () => session,
    loadOperator: async () => options.livePrincipal === undefined ? principal : options.livePrincipal,
  });
}

test("issues a fixed, digest-only session after a recent verified step-up", async () => {
  const result = await issuance();
  const second = await issuance();
  assert.match(result.token, /^[A-Za-z0-9_-]{43}$/);
  assert.match(result.session.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.notEqual(result.token, second.token);
  assert.notEqual(result.session.id, second.session.id);
  assert.equal(result.session.operatorAccountId, ACCOUNT_ID);
  assert.equal(result.session.issuedAt, NOW);
  assert.equal(result.session.expiresAt, "2026-09-29T15:15:00.000Z");
  assert.equal(result.session.revokedAt, null);
  assert.match(result.session.tokenDigest, /^[0-9a-f]{64}$/);
  assert.match(result.session.authSessionReferenceDigest, /^[0-9a-f]{64}$/);
  assert.notEqual(result.session.tokenDigest, TOKEN);
  assert.notEqual(result.session.authSessionReferenceDigest, AUTH_SESSION);
  assert.equal("token" in result.session, false);
  assert.equal("authSessionReference" in result.session, false);
});

test("rejects stale step-up and sessions longer than the fifteen-minute ceiling", async () => {
  await assert.rejects(
    issuance({ identity: { accountId: ACCOUNT_ID, authSessionReference: AUTH_SESSION, reauthenticatedAt: "2026-09-29T14:54:59.000Z" } }),
    (error: unknown) => error instanceof OperatorSessionError && error.code === "forbidden",
  );
  await assert.rejects(
    issuance({ durationSeconds: 901 }),
    (error: unknown) => error instanceof OperatorSessionError && error.code === "invalid",
  );
});

test("requires an active operator with the requested capability before issuance", async () => {
  for (const livePrincipal of [
    { ...principal, status: "disabled" as const },
    { ...principal, capabilities: [] },
    null,
  ]) {
    await assert.rejects(
      issueOperatorAccessSession({
        identity: { accountId: ACCOUNT_ID, authSessionReference: AUTH_SESSION, reauthenticatedAt: NOW },
        requiredCapability: "account:inspect",
        now: NOW,
        durationSeconds: 900,
      }, {
        loadOperator: async () => livePrincipal,
      }),
      (error: unknown) => error instanceof OperatorSessionError && error.code === "forbidden",
    );
  }
});

test("authorizes a bound, unexpired session and returns the live principal", async () => {
  const { session, token } = await issuance();
  const result = await authorization(session, { token });
  assert.equal(result.sessionId, session.id);
  assert.equal(result.expiresAt, session.expiresAt);
  assert.deepEqual(result.principal, {
    ...principal,
    authenticatedAt: "2026-09-29T14:58:00.000Z",
  });
});

test("denies replay of a revoked token and denies expired sessions", async () => {
  const { session, token } = await issuance();
  const revoked = revokeOperatorAccessSession(session, "2026-09-29T15:02:00.000Z");
  await assert.rejects(
    authorization(revoked, { token }),
    (error: unknown) => error instanceof OperatorSessionError && error.code === "forbidden",
  );
  await assert.rejects(
    authorization(session, { token, now: session.expiresAt }),
    (error: unknown) => error instanceof OperatorSessionError && error.code === "forbidden",
  );
});

test("denies Auth-session mismatch even when the operator account matches", async () => {
  const { session, token } = await issuance();
  await assert.rejects(
    authorization(session, { token, authSessionReference: "different-auth-session-reference" }),
    (error: unknown) => error instanceof OperatorSessionError && error.code === "forbidden",
  );
});

test("rechecks operator status and capability on every authorization", async () => {
  const { session, token } = await issuance();
  for (const livePrincipal of [
    { ...principal, status: "disabled" as const },
    { ...principal, capabilities: [] },
    null,
  ]) {
    await assert.rejects(
      authorization(session, { token, livePrincipal }),
      (error: unknown) => error instanceof OperatorSessionError && error.code === "forbidden",
    );
  }
});

test("fails closed when persistence returns a different token digest", async () => {
  const { session, token } = await issuance();
  await assert.rejects(
    authorization({ ...session, tokenDigest: "0".repeat(64) }, { token }),
    (error: unknown) => error instanceof OperatorSessionError && error.code === "forbidden",
  );
});

test("fails closed when persistence returns a session issued from stale step-up", async () => {
  const { session, token } = await issuance();
  await assert.rejects(
    authorization({ ...session, reauthenticatedAt: "2026-09-29T14:54:59.000Z" }, { token }),
    (error: unknown) => error instanceof OperatorSessionError && error.code === "forbidden",
  );
});

test("revocation is immutable and idempotent", async () => {
  const { session } = await issuance();
  const revoked = revokeOperatorAccessSession(session, "2026-09-29T15:02:00.000Z");
  assert.equal(revoked.revokedAt, "2026-09-29T15:02:00.000Z");
  assert.equal(revokeOperatorAccessSession(revoked, "2026-09-29T15:03:00.000Z"), revoked);
  assert.throws(
    () => revokeOperatorAccessSession(session, "2026-09-29T14:59:59.000Z"),
    (error: unknown) => error instanceof OperatorSessionError && error.code === "invalid",
  );
});
