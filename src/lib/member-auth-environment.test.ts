import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  isMemberAuthApiPath,
  isMemberAuthPagePath,
  memberAuthAvailableForHeaders,
  memberAuthAvailableForHost,
  normalizeRequestHost,
} from "./member-auth-environment.ts";

const middlewareUrl = new URL("../middleware.ts", import.meta.url);
const serverAccountStateUrl = new URL("./server-account-state.ts", import.meta.url);
const layoutUrl = new URL("../app/layout.tsx", import.meta.url);
const headerUrl = new URL("../components/SiteHeader.tsx", import.meta.url);
const accountSessionUrl = new URL("./account-session.ts", import.meta.url);
const experienceAccessUrl = new URL("./server-experience-access.ts", import.meta.url);

test("member Auth is available only on explicit public and development hosts", () => {
  assert.equal(memberAuthAvailableForHost("demo.crypticdesign.net"), true);
  assert.equal(memberAuthAvailableForHost("localhost:3000"), true);
  assert.equal(memberAuthAvailableForHost("127.0.0.1:3000"), true);
  assert.equal(memberAuthAvailableForHost("branch--frabjous-frangipane-650548.netlify.app"), true);
  assert.equal(memberAuthAvailableForHost("frabjous-frangipane-650548.netlify.app"), true);
  assert.equal(memberAuthAvailableForHost("unrelated-site.netlify.app"), false);
  assert.equal(memberAuthAvailableForHost("crypticdesign.net"), true);
  assert.equal(memberAuthAvailableForHost("www.crypticdesign.net"), true);
  assert.equal(memberAuthAvailableForHost("unknown.example"), false);
  assert.equal(memberAuthAvailableForHost(null), false);
});

test("the route boundary covers every member-only surface while preserving public account entry", () => {
  for (const pathname of [
    "/account/sign-in",
    "/account/character",
    "/account/character/first-signal",
    "/account/create-character",
    "/account/notifications",
    "/account/security",
    "/account/settings",
    "/account/subscription",
    "/library",
    "/auth/callback",
  ]) assert.equal(isMemberAuthPagePath(pathname), true, pathname);

  assert.equal(isMemberAuthPagePath("/account"), false);
  assert.equal(isMemberAuthPagePath("/account/create"), false);

  for (const pathname of [
    "/api/admission/accept",
    "/api/internal/admission/outbox",
    "/api/membership/session",
    "/api/characters",
    "/api/characters/character-id/history",
  ]) assert.equal(isMemberAuthApiPath(pathname), true, pathname);

  assert.equal(isMemberAuthApiPath("/api/operator/session"), false);
  assert.equal(isMemberAuthApiPath("/api/internal/account-administration/inspections"), false);
});

test("host normalization honors the first forwarded host and strips ports", () => {
  assert.equal(normalizeRequestHost(" Demo.CrypticDesign.net:443, proxy.internal "), "demo.crypticdesign.net");
  assert.equal(normalizeRequestHost("[::1]:3000"), "::1");
  assert.equal(memberAuthAvailableForHeaders(new Headers({ host: "localhost:3000" })), true);
  assert.equal(memberAuthAvailableForHeaders(new Headers({ host: "demo.crypticdesign.net", "x-forwarded-host": "demo.crypticdesign.net" })), true);
  assert.equal(memberAuthAvailableForHeaders(new Headers({ host: "crypticdesign.net", "x-forwarded-host": "www.crypticdesign.net" })), true);
  assert.equal(memberAuthAvailableForHeaders(new Headers({ host: "crypticdesign.net", "x-forwarded-host": "untrusted.example" })), false);
  assert.equal(memberAuthAvailableForHeaders(new Headers()), false);
});

test("the host boundary blocks Auth pages, APIs, and server session resolution on unknown hosts", async () => {
  const [middleware, serverAccountState, layout, header, accountSession, experienceAccess] = await Promise.all([
    readFile(middlewareUrl, "utf8"),
    readFile(serverAccountStateUrl, "utf8"),
    readFile(layoutUrl, "utf8"),
    readFile(headerUrl, "utf8"),
    readFile(accountSessionUrl, "utf8"),
    readFile(experienceAccessUrl, "utf8"),
  ]);

  assert.match(middleware, /!memberAuthAvailableForHeaders\(request\.headers\)/);
  assert.match(middleware, /isMemberAuthPagePath\(pathname\)/);
  assert.match(middleware, /isMemberAuthApiPath\(pathname\)/);
  assert.match(middleware, /status: 503/);
  assert.match(serverAccountState, /!memberAuthAvailableForHeaders\(requestHeaders\)/);
  assert.match(accountSession, /!memberAuthAvailableForHeaders\(request\.headers\)/);
  assert.match(experienceAccess, /!memberAuthAvailableForHeaders\(requestHeaders\)/);
  assert.match(layout, /memberAuthAvailable=\{memberAuthAvailable\}/);
  assert.match(header, /authenticated \|\| !memberAuthAvailable \? "Account" : "Sign In"/);
  assert.match(header, /if \(!memberAuthAvailable\)/);
});
