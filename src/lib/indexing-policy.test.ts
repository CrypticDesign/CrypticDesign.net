import assert from "node:assert/strict";
import test from "node:test";

import {
  NON_PRODUCTION_ROBOTS_DIRECTIVE,
  indexingDirectiveForHost,
  isCanonicalIndexHost,
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
