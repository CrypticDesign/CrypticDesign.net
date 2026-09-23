import assert from "node:assert/strict";
import test from "node:test";

import {
  NON_PRODUCTION_ROBOTS_DIRECTIVE,
  PUBLIC_UTILITY_ROBOTS_DIRECTIVE,
  indexingDirectiveForHost,
  indexingDirectiveForRequest,
  isCanonicalIndexHost,
  isPrivateSystemPath,
  normalizeRequestHost,
} from "./indexing-policy.ts";

test("only approved production hosts remain indexable", () => {
  assert.equal(isCanonicalIndexHost("crypticdesign.net"), true);
  assert.equal(isCanonicalIndexHost("www.crypticdesign.net"), true);
  assert.equal(isCanonicalIndexHost("CRYPTICDESIGN.NET:443"), true);
});

test("demo, Netlify, preview, local, missing, and unknown hosts fail closed", () => {
  for (const hostname of [
    "demo.crypticdesign.net",
    "main--frabjous-frangipane-650548.netlify.app",
    "deploy-preview-84--frabjous-frangipane-650548.netlify.app",
    "localhost:3000",
    "unexpected.example",
    null,
  ]) {
    assert.equal(indexingDirectiveForHost(hostname), NON_PRODUCTION_ROBOTS_DIRECTIVE, String(hostname));
  }
});

test("forwarded host lists use the original public host", () => {
  assert.equal(normalizeRequestHost("demo.crypticdesign.net, internal.netlify"), "demo.crypticdesign.net");
  assert.equal(indexingDirectiveForHost("crypticdesign.net, internal.netlify"), null);
});

test("the approved public Account surfaces remain indexable on production", () => {
  assert.equal(indexingDirectiveForRequest("crypticdesign.net", "/account"), null);
  assert.equal(indexingDirectiveForRequest("crypticdesign.net", "/account/create"), null);
  assert.equal(
    indexingDirectiveForRequest("crypticdesign.net", "/account/sign-in"),
    PUBLIC_UTILITY_ROBOTS_DIRECTIVE,
  );
});

test("private Account, Library, auth, callback, and API paths are non-indexable", () => {
  for (const pathname of [
    "/account/accept-invitation",
    "/account/character/first-signal",
    "/account/create-character",
    "/account/notifications",
    "/account/recover",
    "/account/reset-password",
    "/account/security",
    "/account/settings",
    "/account/subscription",
    "/api/membership/session",
    "/auth/callback",
    "/auth/confirm",
    "/library",
  ]) {
    assert.equal(isPrivateSystemPath(pathname), true, pathname);
    assert.equal(
      indexingDirectiveForRequest("crypticdesign.net", pathname),
      NON_PRODUCTION_ROBOTS_DIRECTIVE,
      pathname,
    );
  }
});

test("non-production hosts stay fail-closed even for public Account routes", () => {
  assert.equal(
    indexingDirectiveForRequest("demo.crypticdesign.net", "/account/create"),
    NON_PRODUCTION_ROBOTS_DIRECTIVE,
  );
});
