import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync(new URL("../app/api/internal/account-administration/inspections/route.ts", import.meta.url), "utf8");
const adapter = readFileSync(new URL("./account-administration-inspection-history-supabase.ts", import.meta.url), "utf8");
const service = readFileSync(new URL("./account-administration-inspection-history.ts", import.meta.url), "utf8");

test("inspection history is a default-disabled authenticated no-store GET", () => {
  assert.match(route, /export async function GET/);
  assert.match(route, /if \(!config\).*404/);
  assert.match(route, /authorizeAccountAdministrationInternalRequest/);
  assert.match(route, /cache-control.*no-store/);
  assert.match(route, /limit.*100/);
  assert.match(route, /targetAccountId/);
  assert.match(route, /cursor/);
});

test("history uses a bounded server-only read adapter scoped to the current operator", () => {
  assert.match(adapter, /import "server-only"/);
  assert.match(adapter, /from\("account_administration_inspection_events"\)/);
  assert.match(adapter, /eq\("operator_account_id", operatorAccountId\)/);
  assert.match(adapter, /eq\("target_account_id", targetAccountId\)/);
  assert.match(adapter, /order\("occurred_at", \{ ascending: false \}\)/);
  assert.match(adapter, /order\("inspection_id", \{ ascending: false \}\)/);
  assert.match(adapter, /occurred_at\.lt\./);
  assert.match(adapter, /inspection_id\.lt\./);
  assert.match(adapter, /limit\(limit\)/);
  assert.doesNotMatch(adapter, /\.insert\(|\.update\(|\.delete\(|\.rpc\(|updateUserById|signOut\(/);
});

test("history exposes no operator identity, account PII, reason, secret, or Auth metadata", () => {
  assert.match(service, /authorizeAccountAdministrationInspectionHistory/);
  assert.match(service, /authorizeAccountInspection/);
  assert.match(service, /parseAccountInspectionHistoryCursor/);
  assert.match(adapter, /select\("inspection_id,operator_account_id,target_account_id,target_character_id,projection,occurred_at"\)/);
  assert.match(service, /events: visibleEvents\.map/);
  assert.doesNotMatch(adapter, /email|user_metadata|app_metadata|phone|reason|secret|token/);
});
