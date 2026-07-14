import assert from "node:assert/strict";
import test from "node:test";

import { createSandboxSession, verifySandboxSession } from "./sandbox-session.ts";

test("signs and verifies a sandbox member identity", () => {
  process.env.MEMBERSHIP_SANDBOX_SECRET = "test-only-secret";
  const session = createSandboxSession("member_test");
  assert.equal(verifySandboxSession(session), "member_test");
});

test("rejects a tampered sandbox session", () => {
  process.env.MEMBERSHIP_SANDBOX_SECRET = "test-only-secret";
  const session = createSandboxSession("member_test");
  assert.equal(verifySandboxSession(`${session}tampered`), null);
});
