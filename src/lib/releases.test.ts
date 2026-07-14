import assert from "node:assert/strict";
import test from "node:test";

import { evaluateReleaseAccess, type Release } from "./releases.ts";

const release: Release = {
  slug: "locked", title: "Locked", tagline: "Test", description: "Protected body",
  kind: "article", lanes: ["read"], releasedAt: "2026-07-13", status: "released", accent: "cyan",
  rights_status: "owned", visibility_status: "entitlement-required", publication_status: "published",
  owner: "Cryptic Design, LLC", approval_notes: "test", last_reviewed: "2026-07-13",
  requiredBenefitId: "benefit_updates",
};

test("requires an account before evaluating entitlements", () => {
  assert.equal(evaluateReleaseAccess(release, { authenticated: false, entitlements: ["benefit_updates"] }), "account-required");
});

test("locks content when the required entitlement is absent", () => {
  assert.equal(evaluateReleaseAccess(release, { authenticated: true, entitlements: [] }), "entitlement-required");
});

test("grants content when the required entitlement is present", () => {
  assert.equal(evaluateReleaseAccess(release, { authenticated: true, entitlements: ["benefit_updates"] }), "granted");
});

test("rights and publication governance override membership", () => {
  assert.equal(evaluateReleaseAccess({ ...release, rights_status: "restricted" }, { authenticated: true, entitlements: ["benefit_updates"] }), "not-renderable");
});
