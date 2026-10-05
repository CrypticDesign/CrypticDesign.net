import assert from "node:assert/strict";
import test from "node:test";
import {
  authorizeAccountAdministrationInternalRequest,
  parseAccountAdministrationCommand,
  readAccountAdministrationInternalConfig,
} from "./account-administration-internal.ts";

const SECRET = "s".repeat(32);
const OPERATOR_ID = "10000000-0000-4000-8000-000000000001";
const TARGET_ID = "20000000-0000-4000-8000-000000000002";

test("internal account administration stays disabled unless every gate is configured", () => {
  const previous = { ...process.env };
  try {
    delete process.env.ACCOUNT_ADMINISTRATION_MODE;
    assert.equal(readAccountAdministrationInternalConfig(), null);
    process.env.ACCOUNT_ADMINISTRATION_MODE = "internal";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    process.env.ACCOUNT_ADMINISTRATION_OPERATOR_ID = OPERATOR_ID;
    process.env.ACCOUNT_ADMINISTRATION_INTERNAL_SECRET = SECRET;
    assert.deepEqual(readAccountAdministrationInternalConfig(), { operatorAccountId: OPERATOR_ID, secret: SECRET });
  } finally {
    process.env = previous;
  }
});

test("machine endpoint requires its bearer secret and rejects browser origins", () => {
  assert.equal(authorizeAccountAdministrationInternalRequest({ authorization: `Bearer ${SECRET}`, origin: null, secret: SECRET }), true);
  assert.equal(authorizeAccountAdministrationInternalRequest({ authorization: `Bearer ${SECRET}`, origin: "https://crypticdesign.net", secret: SECRET }), false);
  assert.equal(authorizeAccountAdministrationInternalRequest({ authorization: "Bearer wrong", origin: null, secret: SECRET }), false);
});

test("command parser allows only the bounded operator command contract", () => {
  const valid = JSON.stringify({
    requestId: "operator-request-0001",
    action: "suspend_account",
    targetAccountId: TARGET_ID,
    reason: "Confirmed compromised credentials",
    confirmation: `suspend_account:${TARGET_ID}`,
  });
  assert.equal(parseAccountAdministrationCommand(valid).action, "suspend_account");
  assert.throws(() => parseAccountAdministrationCommand(JSON.stringify({ action: "delete_account" })));
  assert.throws(() => parseAccountAdministrationCommand(`{"padding":"${"x".repeat(4096)}"}`));
});
