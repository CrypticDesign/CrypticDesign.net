import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync(new URL("../app/api/internal/account-administration/commands/[requestId]/route.ts", import.meta.url), "utf8");
const adapter = readFileSync(new URL("./account-administration-diagnostics-supabase.ts", import.meta.url), "utf8");

test("command diagnostics is a default-disabled authenticated no-store GET", () => {
  assert.match(route, /export async function GET/);
  assert.match(route, /if \(!config\).*404/);
  assert.match(route, /authorizeAccountAdministrationInternalRequest/);
  assert.match(route, /cache-control.*no-store/);
});

test("diagnostics uses a dedicated server-only read adapter with no mutation primitive", () => {
  assert.match(adapter, /import "server-only"/);
  assert.match(adapter, /from\("account_administration_commands"\)/);
  assert.match(adapter, /from\("account_administration_events"\)/);
  assert.match(adapter, /order\("occurred_at", \{ ascending: true \}\)/);
  assert.doesNotMatch(adapter, /\.insert\(|\.update\(|\.delete\(|\.rpc\(|updateUserById|signOut\(/);
});

test("diagnostics selects no reason, fingerprint, secret, or Auth metadata", () => {
  assert.match(adapter, /select\("request_id,action,operator_account_id,target_account_id,target_character_id,status,result_code,requested_at,reconciliation_started_at,reconciliation_attempt_count,completed_at"\)/);
  assert.doesNotMatch(adapter, /request_fingerprint|reason|user_metadata|app_metadata|secret|token/);
});
