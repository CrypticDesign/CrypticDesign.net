import assert from "node:assert/strict";
import test from "node:test";

import {
  admissionAcceptanceConfigured,
  admissionDisplayName,
  parseAdmissionAcceptance,
  validAdmissionIdempotencyKey,
} from "./admission-acceptance.ts";

test("acceptance remains disabled until every server boundary is configured", () => {
  const prior = {
    mode: process.env.ACCOUNT_ADMISSION_MODE,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishable: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    service: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  try {
    process.env.ACCOUNT_ADMISSION_MODE = "invitation";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    assert.equal(admissionAcceptanceConfigured(), false);
    process.env.SUPABASE_SERVICE_ROLE_KEY = "server-only";
    assert.equal(admissionAcceptanceConfigured(), true);
    process.env.ACCOUNT_ADMISSION_MODE = "closed";
    assert.equal(admissionAcceptanceConfigured(), false);
  } finally {
    for (const [key, value] of Object.entries({
      ACCOUNT_ADMISSION_MODE: prior.mode,
      NEXT_PUBLIC_SUPABASE_URL: prior.url,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: prior.publishable,
      SUPABASE_SERVICE_ROLE_KEY: prior.service,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("acceptance validates bounded idempotency keys", () => {
  assert.equal(validAdmissionIdempotencyKey("accept:12345678"), true);
  assert.equal(validAdmissionIdempotencyKey(null), false);
  assert.equal(validAdmissionIdempotencyKey("short"), false);
  assert.equal(validAdmissionIdempotencyKey("contains spaces"), false);
  assert.equal(validAdmissionIdempotencyKey("x".repeat(201)), false);
});

test("display names are bounded and never become authority inputs", () => {
  assert.equal(admissionDisplayName({ display_name: "  Invited Person  " }, "person@example.com"), "Invited Person");
  assert.equal(admissionDisplayName({}, "person@example.com"), "person");
  assert.equal(admissionDisplayName({ display_name: "x".repeat(100) }, "person@example.com").length, 80);
});

test("acceptance output requires exactly one valid member and subscription projection", () => {
  const member = "11111111-1111-4111-8111-111111111111";
  const subscription = "22222222-2222-4222-8222-222222222222";
  assert.deepEqual(parseAdmissionAcceptance([{ accepted_member_id: member, subscription_id: subscription }]), {
    memberId: member,
    subscriptionId: subscription,
  });
  assert.equal(parseAdmissionAcceptance([]), null);
  assert.equal(parseAdmissionAcceptance([{ accepted_member_id: "bad", subscription_id: subscription }]), null);
  assert.equal(parseAdmissionAcceptance([{ accepted_member_id: member, subscription_id: subscription }, {}]), null);
});
