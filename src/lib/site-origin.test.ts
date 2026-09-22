import assert from "node:assert/strict";
import test from "node:test";

import { CANONICAL_SITE_ORIGIN, canonicalSiteUrl } from "./site-origin.ts";

test("canonical site URLs preserve paths and queries on the approved origin", () => {
  assert.equal(CANONICAL_SITE_ORIGIN, "https://crypticdesign.net");
  assert.equal(
    canonicalSiteUrl("/account/sign-in?error=confirmation").toString(),
    "https://crypticdesign.net/account/sign-in?error=confirmation",
  );
});

test("canonical site URLs cannot preserve an internal runtime hostname", () => {
  assert.equal(
    canonicalSiteUrl("https://main--frabjous-frangipane-650548.netlify.app/account/reset-password?from=callback").toString(),
    "https://crypticdesign.net/account/reset-password?from=callback",
  );
});
