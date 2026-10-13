import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const bff = readFileSync(new URL("./account-administration-operator-bff.ts", import.meta.url), "utf8");
const lookup = readFileSync(new URL("./account-administration-lookup-supabase.ts", import.meta.url), "utf8");
const lookupRoute = readFileSync(new URL("../app/api/operator/account-administration/lookup/route.ts", import.meta.url), "utf8");
const commandRoute = readFileSync(new URL("../app/api/operator/account-administration/commands/route.ts", import.meta.url), "utf8");
const origin = readFileSync(new URL("./account-administration-operator-origin.ts", import.meta.url), "utf8");
const env = readFileSync(new URL("../../.env.example", import.meta.url), "utf8");

test("lookup is exact, bounded, audited, and excludes Auth directory enumeration", () => {
  assert.match(lookupRoute, /authorizeOperatorLookupRequest/);
  assert.match(lookupRoute, /parseAccountAdministrationLookup/);
  assert.match(lookup, /\.eq\("kind", "member"\)/);
  assert.match(lookup, /inspectSupabaseAccountAdministrationTarget/);
  assert.doesNotMatch(lookup, /listUsers|email|ilike|textSearch/);
  assert.doesNotMatch(lookupRoute, /export async function GET/);
});

test("browser commands reuse the governed command domain behind independent gates", () => {
  assert.match(commandRoute, /operatorCommandsConfigured/);
  assert.match(commandRoute, /authorizeOperatorCommandRequest/);
  assert.match(commandRoute, /operatorCapabilityForAction/);
  assert.match(commandRoute, /parseAccountAdministrationCommand/);
  assert.match(commandRoute, /executeSupabaseAccountAdministrationCommand/);
  assert.doesNotMatch(commandRoute, /ACCOUNT_ADMINISTRATION_INTERNAL_SECRET|Bearer /);
  assert.doesNotMatch(commandRoute, /access-control-allow-origin/i);
});

test("lookup and commands require CSRF-protected local POSTs and stay off by default", () => {
  assert.match(bff, /OPERATOR_CSRF_REQUEST_TOKEN_HEADER/);
  assert.match(bff, /operatorLookupConfigured/);
  assert.match(bff, /operatorCommandsConfigured/);
  assert.match(origin, /environment\.NODE_ENV !== "production"/);
  assert.match(env, /ACCOUNT_ADMINISTRATION_OPERATOR_LOOKUP_ENABLED=false/);
  assert.match(env, /ACCOUNT_ADMINISTRATION_OPERATOR_COMMANDS_ENABLED=false/);
  for (const route of [lookupRoute, commandRoute]) {
    assert.match(route, /export async function POST/);
    assert.match(route, /private, no-store, max-age=0/);
    assert.match(route, /\{ error: "Not found" \}, 404/);
  }
});
