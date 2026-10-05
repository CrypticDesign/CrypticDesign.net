import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const issuance = readFileSync(new URL("./account-administration-operator-issuance.ts", import.meta.url), "utf8");
const route = readFileSync(new URL("../app/api/operator/session/route.ts", import.meta.url), "utf8");
const panel = readFileSync(new URL("../app/internal/account-administration/OperatorStepUpPanel.tsx", import.meta.url), "utf8");
const middleware = readFileSync(new URL("../middleware.ts", import.meta.url), "utf8");
const env = readFileSync(new URL("../../.env.example", import.meta.url), "utf8");

test("local session issuance is separately gated and unavailable in production", () => {
  assert.match(issuance, /ACCOUNT_ADMINISTRATION_OPERATOR_SESSION_ISSUANCE_ENABLED/);
  assert.match(issuance, /process\.env\.NODE_ENV !== "production"/);
  assert.match(issuance, /operatorBffConfigured\(\)/);
  assert.match(env, /ACCOUNT_ADMINISTRATION_OPERATOR_SESSION_ISSUANCE_ENABLED=false/);
});

test("the browser verifies TOTP directly and posts no credential or identity payload", () => {
  assert.match(panel, /auth\.mfa\.listFactors\(\)/);
  assert.match(panel, /auth\.mfa\.challengeAndVerify\(\{ factorId, code \}\)/);
  assert.match(panel, /fetch\("\/api\/operator\/session"/);
  assert.match(panel, /method: "POST"/);
  assert.match(panel, /"x-cry-operator-request": "1"/);
  assert.match(panel, /"x-cry-operator-csrf": csrfToken/);
  assert.doesNotMatch(panel, /body\s*:/);
  assert.doesNotMatch(panel, /password|service.role|access_token|refresh_token/i);
});

test("the server independently verifies the user, signed claims, fresh TOTP, and live capability", () => {
  assert.match(issuance, /auth\.client\.auth\.getUser\(\)/);
  assert.match(issuance, /auth\.client\.auth\.getClaims\(\)/);
  assert.match(issuance, /deriveVerifiedOperatorIdentityFromSupabaseMfa/);
  assert.match(issuance, /issueAndPersistSupabaseOperatorAccessSession/);
  assert.match(issuance, /requiredCapability: "account:inspect"/);
  assert.doesNotMatch(issuance, /request\.json\(|request\.formData\(/);
});

test("the issuance POST requires an empty body, exact local origin controls, and an HttpOnly cookie", () => {
  assert.match(route, /export async function POST/);
  assert.match(route, /request\.headers\.has\("transfer-encoding"\)/);
  assert.match(route, /contentLength !== null && contentLength !== "0"/);
  assert.match(route, /const body = await request\.text\(\)/);
  assert.match(route, /body\.length !== 0/);
  assert.match(route, /private, no-store, max-age=0/);
  assert.doesNotMatch(route, /access-control-allow-origin/i);
  assert.match(issuance, /authorizeLocalOperatorBrowserRequest/);
  assert.match(issuance, /operatorCsrfCookieSettings/);
  assert.match(issuance, /operatorSessionCookieSettings/);
  assert.match(issuance, /withAuthCookies\.cookies\.set\(sessionCookie\.name, issued\.token, sessionCookie\.options\)/);
  assert.doesNotMatch(route, /issued\.token|token:/);
  assert.match(middleware, /OPERATOR_CSRF_REQUEST_TOKEN_HEADER/);
  assert.match(middleware, /response\.cookies\.set\(csrfCookie\.name, csrfToken, csrfCookie\.options\)/);
});
