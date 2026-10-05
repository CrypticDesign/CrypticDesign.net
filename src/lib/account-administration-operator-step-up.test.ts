import assert from "node:assert/strict";
import test from "node:test";
import {
  deriveVerifiedOperatorIdentityFromSupabaseMfa,
  OperatorStepUpError,
} from "./account-administration-operator-step-up.ts";
import { issueOperatorAccessSession } from "./account-administration-operator-session.ts";

const ACCOUNT_ID = "10000000-0000-4000-8000-000000000001";
const SESSION_ID = "20000000-0000-4000-8000-000000000002";
const NOW = "2026-10-01T15:00:00.000Z";
const FRESH_TOTP_SECONDS = Date.parse("2026-10-01T14:58:00.000Z") / 1000;

function claims(overrides: Record<string, unknown> = {}) {
  return {
    sub: ACCOUNT_ID,
    session_id: SESSION_ID,
    aal: "aal2",
    amr: [
      { method: "password", timestamp: Date.parse("2026-10-01T12:00:00.000Z") / 1000 },
      { method: "totp", timestamp: FRESH_TOTP_SECONDS },
    ],
    ...overrides,
  };
}

test("derives operator identity only from fresh verified Supabase TOTP claims", () => {
  assert.deepEqual(deriveVerifiedOperatorIdentityFromSupabaseMfa({
    verifiedAccountId: ACCOUNT_ID,
    claims: claims(),
    now: NOW,
  }), {
    accountId: ACCOUNT_ID,
    authSessionReference: SESSION_ID,
    reauthenticatedAt: "2026-10-01T14:58:00.000Z",
  });
});

test("mock issuance persists only digests after the TOTP boundary succeeds", async () => {
  const identity = deriveVerifiedOperatorIdentityFromSupabaseMfa({
    verifiedAccountId: ACCOUNT_ID,
    claims: claims(),
    now: NOW,
  });
  const issued = await issueOperatorAccessSession({
    identity,
    requiredCapability: "account:inspect",
    durationSeconds: 15 * 60,
    now: NOW,
  }, {
    loadOperator: async () => ({
      accountId: ACCOUNT_ID,
      status: "active",
      capabilities: ["account:inspect"],
    }),
  });

  const persisted = structuredClone(issued.session);
  assert.match(issued.token, /^[A-Za-z0-9_-]{43}$/);
  assert.match(persisted.tokenDigest, /^[0-9a-f]{64}$/);
  assert.match(persisted.authSessionReferenceDigest, /^[0-9a-f]{64}$/);
  assert.equal(JSON.stringify(persisted).includes(issued.token), false);
  assert.equal(JSON.stringify(persisted).includes(SESSION_ID), false);
});

test("rejects aal1, stale TOTP, string-only AMR, and account or session substitution", () => {
  const rejected = [
    claims({ aal: "aal1" }),
    claims({ amr: [{ method: "totp", timestamp: Date.parse("2026-10-01T14:54:59.000Z") / 1000 }] }),
    claims({ amr: ["password", "totp"] }),
    claims({ sub: "30000000-0000-4000-8000-000000000003" }),
    claims({ session_id: "not-a-session-id" }),
    claims({ amr: [{ method: "token_refresh", timestamp: FRESH_TOTP_SECONDS }] }),
  ];
  for (const candidate of rejected) {
    assert.throws(() => deriveVerifiedOperatorIdentityFromSupabaseMfa({
      verifiedAccountId: ACCOUNT_ID,
      claims: candidate,
      now: NOW,
    }), OperatorStepUpError);
  }
});
