import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const bff = readFileSync(new URL("./account-administration-operator-bff.ts", import.meta.url), "utf8");
const session = readFileSync(new URL("./account-administration-operator-session.ts", import.meta.url), "utf8");
const persistence = readFileSync(new URL("./account-administration-operator-session-supabase.ts", import.meta.url), "utf8");
const accountRoute = readFileSync(new URL("../app/api/operator/account-administration/accounts/[accountId]/route.ts", import.meta.url), "utf8");
const diagnosticsRoute = readFileSync(new URL("../app/api/operator/account-administration/commands/[requestId]/route.ts", import.meta.url), "utf8");
const historyRoute = readFileSync(new URL("../app/api/operator/account-administration/inspections/route.ts", import.meta.url), "utf8");
const routes = [accountRoute, diagnosticsRoute, historyRoute];

test("Gate 4 owns cryptographic session generation and persists only its digest", () => {
  assert.match(session, /randomUUID\(\)/);
  assert.match(session, /randomBytes\(32\)\.toString\("base64url"\)/);
  assert.doesNotMatch(session, /generateOpaqueToken|createSessionId/);
  assert.match(persistence, /issueAndPersistSupabaseOperatorAccessSession/);
  assert.match(persistence, /persistSupabaseOperatorAccessSession/);
  assert.doesNotMatch(persistence, /p_token\b|raw_token|access_token/);
});

test("operator BFF derives identity and Auth-session binding server-side", () => {
  assert.match(bff, /import "server-only"/);
  assert.match(bff, /auth\.getUser\(\)/);
  assert.match(bff, /auth\.getClaims\(\)/);
  assert.match(bff, /claims\.sub !== userResult\.data\.user\.id/);
  assert.match(bff, /authSessionReference: claims\.session_id/);
  assert.doesNotMatch(bff, /authSessionReference: .*access_token/);
  assert.match(bff, /authorizeOperatorAccessSession/);
  assert.match(bff, /createSupabaseOperatorSessionAuthorizationDependencies/);
  assert.match(bff, /ACCOUNT_ADMINISTRATION_OPERATOR_BFF_ENABLED/);
  assert.doesNotMatch(bff, /ACCOUNT_ADMINISTRATION_INTERNAL_SECRET|authorization.*Bearer/);
});

test("read-only routes use the operator boundary and existing server-only services", () => {
  for (const route of routes) {
    assert.match(route, /authorizeOperatorReadRequest\(request\)/);
    assert.match(route, /private, no-store, max-age=0/);
    assert.match(route, /export async function GET/);
    assert.doesNotMatch(route, /export async function (?:POST|PUT|PATCH|DELETE)/);
    assert.doesNotMatch(route, /access-control-allow-origin/i);
    assert.doesNotMatch(route, /ACCOUNT_ADMINISTRATION_INTERNAL_SECRET|Bearer /);
  }
  assert.match(accountRoute, /inspectSupabaseAccountAdministrationTarget/);
  assert.match(diagnosticsRoute, /inspectSupabaseAccountAdministrationCommandDiagnostics/);
  assert.match(historyRoute, /listSupabaseAccountAdministrationInspectionHistory/);
  assert.doesNotMatch(routes.join("\n"), /executeSupabaseAccountAdministrationCommand|parseAccountAdministrationCommand/);
});

test("operator routes return generic authorization and target errors", () => {
  for (const route of routes) {
    assert.match(route, /\{ error: "Not found" \}, 404/);
    assert.doesNotMatch(route, /error\.message/);
  }
});
