import assert from "node:assert/strict";
import test from "node:test";

import { resolveEmailConfirmationPolicy } from "./email-confirmation-policy.ts";

test("Wave 0 rejects confirmation types that could admit a new identity", () => {
  for (const type of ["signup", "invite", "magiclink", "email"]) {
    assert.equal(resolveEmailConfirmationPolicy(type)?.allowed, false, type);
    assert.equal(resolveEmailConfirmationPolicy(type)?.kind, "admission-required", type);
  }
});

test("existing-account recovery and email changes remain available", () => {
  assert.deepEqual(resolveEmailConfirmationPolicy("recovery"), {
    type: "recovery",
    allowed: true,
    destination: "/account/reset-password",
    kind: "account-security",
  });
  assert.equal(resolveEmailConfirmationPolicy("email_change")?.allowed, true);
  assert.equal(resolveEmailConfirmationPolicy("email_change")?.destination, "/account");
});

test("unknown and malformed confirmation types fail closed", () => {
  assert.equal(resolveEmailConfirmationPolicy(""), null);
  assert.equal(resolveEmailConfirmationPolicy("SIGNUP"), null);
  assert.equal(resolveEmailConfirmationPolicy("not-a-provider-type"), null);
});
