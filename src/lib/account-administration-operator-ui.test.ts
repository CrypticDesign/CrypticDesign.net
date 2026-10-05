import assert from "node:assert/strict";
import test from "node:test";
import {
  accountAdministrationFixtureUiEnabled,
  accountAdministrationLiveReadUiEnabled,
  accountAdministrationSessionIssuanceUiEnabled,
} from "./account-administration-operator-ui.ts";

test("operator fixture UI requires an explicit non-production flag", () => {
  assert.equal(accountAdministrationFixtureUiEnabled({ NODE_ENV: "development", ACCOUNT_ADMINISTRATION_FIXTURE_UI_ENABLED: "true" }), true);
  assert.equal(accountAdministrationFixtureUiEnabled({ NODE_ENV: "development", ACCOUNT_ADMINISTRATION_FIXTURE_UI_ENABLED: "false" }), false);
  assert.equal(accountAdministrationFixtureUiEnabled({ NODE_ENV: "test", ACCOUNT_ADMINISTRATION_FIXTURE_UI_ENABLED: undefined }), false);
  assert.equal(accountAdministrationFixtureUiEnabled({ NODE_ENV: "production", ACCOUNT_ADMINISTRATION_FIXTURE_UI_ENABLED: "true" }), false);
});

test("live read UI requires all three explicit local gates", () => {
  const enabled = {
    NODE_ENV: "development",
    ACCOUNT_ADMINISTRATION_FIXTURE_UI_ENABLED: "true",
    ACCOUNT_ADMINISTRATION_OPERATOR_BFF_ENABLED: "true",
    ACCOUNT_ADMINISTRATION_OPERATOR_LIVE_UI_ENABLED: "true",
  };
  assert.equal(accountAdministrationLiveReadUiEnabled(enabled), true);
  assert.equal(accountAdministrationLiveReadUiEnabled({ ...enabled, ACCOUNT_ADMINISTRATION_OPERATOR_LIVE_UI_ENABLED: "false" }), false);
  assert.equal(accountAdministrationLiveReadUiEnabled({ ...enabled, ACCOUNT_ADMINISTRATION_OPERATOR_BFF_ENABLED: "false" }), false);
  assert.equal(accountAdministrationLiveReadUiEnabled({ ...enabled, NODE_ENV: "production" }), false);
});

test("session issuance UI requires its own gate, the BFF gate, and complete server configuration", () => {
  const enabled = {
    NODE_ENV: "development",
    ACCOUNT_ADMINISTRATION_FIXTURE_UI_ENABLED: "true",
    ACCOUNT_ADMINISTRATION_OPERATOR_BFF_ENABLED: "true",
    ACCOUNT_ADMINISTRATION_OPERATOR_SESSION_ISSUANCE_ENABLED: "true",
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "local-publishable-key",
    SUPABASE_SERVICE_ROLE_KEY: "local-service-role-key",
  };
  assert.equal(accountAdministrationSessionIssuanceUiEnabled(enabled), true);
  assert.equal(accountAdministrationSessionIssuanceUiEnabled({ ...enabled, ACCOUNT_ADMINISTRATION_OPERATOR_SESSION_ISSUANCE_ENABLED: "false" }), false);
  assert.equal(accountAdministrationSessionIssuanceUiEnabled({ ...enabled, ACCOUNT_ADMINISTRATION_OPERATOR_BFF_ENABLED: "false" }), false);
  assert.equal(accountAdministrationSessionIssuanceUiEnabled({ ...enabled, SUPABASE_SERVICE_ROLE_KEY: "" }), false);
  assert.equal(accountAdministrationSessionIssuanceUiEnabled({ ...enabled, NODE_ENV: "production" }), false);
});
