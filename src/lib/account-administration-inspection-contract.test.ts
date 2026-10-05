import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync(new URL("../app/api/internal/account-administration/accounts/[accountId]/route.ts", import.meta.url), "utf8");
const adapter = readFileSync(new URL("./account-administration-inspection-supabase.ts", import.meta.url), "utf8");
const auditAdapter = readFileSync(new URL("./account-administration-inspection-audit-supabase.ts", import.meta.url), "utf8");
const service = readFileSync(new URL("./account-administration-inspection.ts", import.meta.url), "utf8");

test("account inspection is a default-disabled, authenticated, no-store GET", () => {
  assert.match(route, /export async function GET/);
  assert.match(route, /if \(!config\).*404/);
  assert.match(route, /authorizeAccountAdministrationInternalRequest/);
  assert.match(route, /cache-control.*no-store/);
});

test("inspection keeps reads isolated from its narrow durable-audit RPC", () => {
  assert.match(adapter, /import "server-only"/);
  assert.match(service, /authorizeAccountInspection/);
  assert.match(adapter, /getUserById/);
  assert.match(adapter, /recordSupabaseAccountAdministrationInspection/);
  assert.doesNotMatch(adapter, /\.insert\(|\.update\(|\.delete\(|\.rpc\(|updateUserById|signOut\(/);
  assert.match(auditAdapter, /import "server-only"/);
  assert.match(auditAdapter, /\.rpc\("record_account_administration_inspection"/);
  assert.doesNotMatch(auditAdapter, /\.from\(|\.insert\(|\.update\(|\.delete\(|updateUserById|signOut\(/);
});

test("inspection selects and returns only the bounded operator projection", () => {
  assert.match(adapter, /select\("id,name,handle,status,presence,discoverable,visibility,publication_consent,created_at,updated_at"\)/);
  assert.match(service, /emailVerified/);
  assert.match(service, /protectedTarget/);
  assert.match(service, /recordInspection/);
  assert.doesNotMatch(adapter, /user_metadata|app_metadata|phone|token/);
  assert.doesNotMatch(service, /user_metadata|app_metadata|phone|token/);
  assert.doesNotMatch(auditAdapter, /email|user_metadata|app_metadata|phone|token|reason/);
});
