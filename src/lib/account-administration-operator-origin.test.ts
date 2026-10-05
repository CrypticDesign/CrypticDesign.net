import assert from "node:assert/strict";
import test from "node:test";
import {
  authorizeLocalOperatorBrowserRequest,
  operatorCsrfCookieSettings,
  operatorContentSecurityPolicy,
  operatorOriginDecision,
  operatorSecurityHeaders,
  operatorSessionCookieSettings,
  OPERATOR_COMMANDS_ENABLED,
  validOperatorCsrfToken,
} from "./account-administration-operator-origin.ts";

test("isolates the fixture to the numeric loopback origin and fails closed in production", () => {
  assert.equal(operatorOriginDecision({ host: "127.0.0.1:3100", forwardedHost: null, pathname: "/internal/account-administration", environment: "development" }), "operator");
  assert.equal(operatorOriginDecision({ host: "localhost:3100", forwardedHost: null, pathname: "/internal/account-administration", environment: "development" }), "deny");
  assert.equal(operatorOriginDecision({ host: "127.0.0.1:3100", forwardedHost: null, pathname: "/", environment: "development" }), "deny");
  assert.equal(operatorOriginDecision({ host: "127.0.0.1:3100", forwardedHost: null, pathname: "/internal/account-administration", environment: "production" }), "deny");
  assert.equal(operatorOriginDecision({ host: "localhost:3100", forwardedHost: null, pathname: "/", environment: "development" }), "public");
  assert.equal(operatorOriginDecision({ host: "127.0.0.1:3100", forwardedHost: null, pathname: "/api/operator/account-administration/inspections", environment: "development" }), "operator");
  assert.equal(operatorOriginDecision({ host: "localhost:3100", forwardedHost: null, pathname: "/api/operator/account-administration/inspections", environment: "development" }), "deny");
});

test("rejects untrusted or conflicting forwarded authority for operator surfaces", () => {
  const request = {
    host: "127.0.0.1:3100",
    forwardedHost: "127.0.0.1:3100",
    pathname: "/internal/account-administration",
    environment: "development" as const,
  };
  assert.equal(operatorOriginDecision(request), "operator");
  assert.equal(operatorOriginDecision({ ...request, host: "localhost:3100" }), "deny");
  assert.equal(operatorOriginDecision({ ...request, forwardedHost: "localhost:3100" }), "deny");
  assert.equal(operatorOriginDecision({ ...request, host: "localhost:3100", pathname: "/" }), "deny");
  assert.equal(operatorOriginDecision({ ...request, forwardedHost: "localhost:3100", pathname: "/" }), "deny");
  assert.equal(operatorOriginDecision({ ...request, host: null }), "deny");
  assert.equal(operatorOriginDecision({ ...request, forwardedHost: "127.0.0.1:3100, localhost:3100" }), "deny");
  assert.equal(operatorOriginDecision({ ...request, forwardedHost: "127.0.0.1:03100" }), "deny");
  assert.equal(operatorOriginDecision({ ...request, host: "127.1:3100", forwardedHost: null }), "deny");
  assert.equal(operatorOriginDecision({ ...request, host: "[::1]:3100", forwardedHost: null }), "deny");
  assert.equal(operatorOriginDecision({ ...request, host: "localhost:3100", forwardedHost: "public.example:443", pathname: "/" }), "public");
  assert.equal(operatorOriginDecision({ ...request, host: "localhost:3100", forwardedHost: "127.0.0.1:3100, attacker.invalid", pathname: "/" }), "deny");
  assert.equal(operatorOriginDecision({ ...request, host: "localhost:3100", forwardedHost: " 127.0.0.1:3100", pathname: "/" }), "deny");
  assert.equal(operatorOriginDecision({ ...request, host: "localhost:3100", forwardedHost: "127.0.0.1:65536", pathname: "/" }), "deny");
  assert.equal(operatorOriginDecision({ ...request, host: "localhost:3100", forwardedHost: "127.0.0.10:3100", pathname: "/" }), "public");
});

test("emits a nonce-based operator CSP and restrictive response headers", () => {
  const csp = operatorContentSecurityPolicy("noncevalue", "production");
  assert.match(csp, /script-src 'nonce-noncevalue' 'strict-dynamic'/);
  assert.match(csp, /style-src 'self' 'nonce-noncevalue'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /base-uri 'none'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /connect-src 'self'/);
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-inline'/);
  const headers = operatorSecurityHeaders("noncevalue", "production");
  assert.equal(headers["Cache-Control"], "private, no-store, max-age=0");
  assert.equal(headers["Referrer-Policy"], "no-referrer");
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["X-Robots-Tag"], "noindex, nofollow, noarchive");
});

test("operator CSP allows only a valid configured Auth origin", () => {
  const original = process.env.NEXT_PUBLIC_SUPABASE_URL;
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co/auth/v1";
    assert.match(operatorContentSecurityPolicy("noncevalue", "development"), /connect-src[^;]*https:\/\/project\.supabase\.co/);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://attacker.invalid";
    assert.doesNotMatch(operatorContentSecurityPolicy("noncevalue", "development"), /attacker\.invalid/);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    assert.match(operatorContentSecurityPolicy("noncevalue", "development"), /http:\/\/127\.0\.0\.1:54321/);
    assert.doesNotMatch(operatorContentSecurityPolicy("noncevalue", "production"), /http:\/\/127\.0\.0\.1:54321/);
  } finally {
    if (original === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = original;
  }
});

test("keeps production and local operator cookies host-only and separate", () => {
  assert.deepEqual(operatorSessionCookieSettings("production"), {
    name: "__Host-cry_operator",
    options: { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 900 },
  });
  assert.deepEqual(operatorSessionCookieSettings("development"), {
    name: "cry_operator_local",
    options: { httpOnly: true, secure: false, sameSite: "strict", path: "/", maxAge: 900 },
  });
  assert.equal("domain" in operatorSessionCookieSettings("production").options, false);
  assert.deepEqual(operatorCsrfCookieSettings("development"), {
    name: "cry_operator_csrf_local",
    options: { httpOnly: true, secure: false, sameSite: "strict", path: "/", maxAge: 900 },
  });
  assert.equal(operatorCsrfCookieSettings("production").name, "__Host-cry_operator_csrf");
  assert.equal("domain" in operatorCsrfCookieSettings("production").options, false);
  assert.equal(validOperatorCsrfToken("a".repeat(32)), true);
  assert.equal(validOperatorCsrfToken("not-a-valid-token"), false);
});

test("future browser APIs require exact origin, custom header, and CSRF for writes", () => {
  const request = {
    host: "127.0.0.1:3100",
    forwardedHost: null,
    pathname: "/api/operator/account-administration/accounts/10000000-0000-4000-8000-000000000001",
    method: "GET",
    origin: "http://127.0.0.1:3100",
    fetchSite: "same-origin",
    fetchMode: "cors",
    operatorRequestHeader: "1",
    csrfHeader: null,
    expectedCsrfToken: null,
    environment: "development" as const,
  };
  assert.equal(authorizeLocalOperatorBrowserRequest(request), true);
  assert.equal(authorizeLocalOperatorBrowserRequest({ ...request, origin: null }), true);
  assert.equal(authorizeLocalOperatorBrowserRequest({ ...request, origin: null, fetchSite: "cross-site" }), false);
  assert.equal(authorizeLocalOperatorBrowserRequest({ ...request, origin: null, fetchMode: "navigate" }), false);
  assert.equal(authorizeLocalOperatorBrowserRequest({ ...request, origin: "http://localhost:3100" }), false);
  assert.equal(authorizeLocalOperatorBrowserRequest({ ...request, forwardedHost: "localhost:3100" }), false);
  assert.equal(authorizeLocalOperatorBrowserRequest({ ...request, operatorRequestHeader: null }), false);
  assert.equal(authorizeLocalOperatorBrowserRequest({ ...request, method: "POST" }), false);
  assert.equal(authorizeLocalOperatorBrowserRequest({ ...request, method: "POST", csrfHeader: "csrf-token-value", expectedCsrfToken: "csrf-token-value" }), true);
  assert.equal(authorizeLocalOperatorBrowserRequest({ ...request, method: "POST", csrfHeader: "wrong-csrf-token", expectedCsrfToken: "csrf-token-value" }), false);
});

test("operator commands remain disabled at Gate 3", () => {
  assert.equal(OPERATOR_COMMANDS_ENABLED, false);
});
