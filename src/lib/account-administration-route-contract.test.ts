import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync(new URL("../app/api/internal/account-administration/commands/route.ts", import.meta.url), "utf8");
const adapter = readFileSync(new URL("./account-administration-supabase.ts", import.meta.url), "utf8");

test("internal command endpoint is default-disabled, no-store, and server-only", () => {
  assert.match(route, /if \(!config\).*404/);
  assert.match(route, /cache-control.*no-store/);
  assert.match(adapter, /import "server-only"/);
  assert.match(adapter, /createServiceRoleSupabaseClient/);
});

test("unsupported arbitrary session revocation fails closed", () => {
  assert.match(adapter, /SESSION_REVOCATION_UNAVAILABLE/);
  assert.doesNotMatch(adapter, /auth\.signOut\(/);
});

test("ambiguous Auth account writes remain retryable and existing requests can reconcile converged state", () => {
  assert.match(adapter, /AUTH_ACCOUNT_UPDATE_FAILED", true/);
  assert.match(adapter, /from\("account_administration_commands"\)/);
  assert.match(adapter, /allowIdempotentAccountState = Boolean\(existing\.data\)/);
  assert.match(adapter, /"reconcile"/);
  assert.match(adapter, /"target_busy"/);
});
