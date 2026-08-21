import assert from "node:assert/strict";
import test from "node:test";
import {
  ADMISSION_SESSION_MAX_AGE_SECONDS,
  canTransitionInvitation,
  createAdmissionSession,
  createAdmissionToken,
  digestAdmissionToken,
  normalizeAdmissionEmail,
  verifyAdmissionSession,
} from "./admission.ts";

test("creates opaque 256-bit invitation tokens and stable HMAC digests", () => {
  process.env.ADMISSION_TOKEN_HMAC_SECRET = "test-token-secret-with-more-than-32-characters";
  const first = createAdmissionToken();
  const second = createAdmissionToken();
  assert.match(first.token, /^[A-Za-z0-9_-]{43}$/);
  assert.match(first.digest, /^[0-9a-f]{64}$/);
  assert.equal(digestAdmissionToken(first.token), first.digest);
  assert.notEqual(first.token, second.token);
  assert.notEqual(first.digest, second.digest);
});

test("signs a short-lived invitation session without placing email in the cookie", () => {
  process.env.ADMISSION_SESSION_SECRET = "test-session-secret-with-more-than-32-characters";
  const now = Date.parse("2026-08-19T18:00:00Z");
  const session = createAdmissionSession("invite_test", now);
  assert.doesNotMatch(session, /@/);
  assert.deepEqual(verifyAdmissionSession(session, now + 1), {
    invitationId: "invite_test",
    expiresAt: now + ADMISSION_SESSION_MAX_AGE_SECONDS * 1000,
  });
  assert.equal(verifyAdmissionSession(`${session}tampered`, now + 1), null);
  assert.equal(verifyAdmissionSession(session, now + ADMISSION_SESSION_MAX_AGE_SECONDS * 1000), null);
});

test("permits only the approved forward invitation state path and terminal stops", () => {
  assert.equal(canTransitionInvitation("prepared", "sent"), true);
  assert.equal(canTransitionInvitation("sent", "checkout_pending"), true);
  assert.equal(canTransitionInvitation("checkout_pending", "paid_eligible"), true);
  assert.equal(canTransitionInvitation("paid_eligible", "auth_invited"), true);
  assert.equal(canTransitionInvitation("auth_invited", "accepted"), true);
  assert.equal(canTransitionInvitation("sent", "accepted"), false);
  assert.equal(canTransitionInvitation("accepted", "sent"), false);
  assert.equal(canTransitionInvitation("revoked", "accepted"), false);
});

test("normalizes invitation email for exact wave binding", () => {
  assert.equal(normalizeAdmissionEmail("  Person@Example.COM "), "person@example.com");
});
