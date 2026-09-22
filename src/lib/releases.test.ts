import assert from "node:assert/strict";
import test from "node:test";

import { evaluateReleaseAccess, releaseDestination, releaseShareImage, type Release } from "./releases.ts";

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

test("routes the Singularis vertical slice into the continuous gamespace", () => {
  assert.equal(
    releaseDestination({ ...release, slug: "singularis-vertical-slice", kind: "game" }),
    "/products/singularis",
  );
});

test("keeps ordinary releases on their release detail pages", () => {
  assert.equal(releaseDestination(release), "/releases/locked");
});

test("uses 1200 by 630 share-card assets instead of editorial release images", () => {
  assert.equal(releaseShareImage({ ...release, productSlug: "singularis" }), "/share/singularis.png");
  assert.equal(releaseShareImage({ ...release, kind: "audio" }), "/share/audio.png");
  assert.equal(releaseShareImage(release), "/share/articles.png");
  assert.equal(releaseShareImage({ ...release, kind: "lab" }), "/share/visual-studies.png");
  assert.equal(releaseShareImage({ ...release, kind: "video" }), "/share/entertainment.png");
});
