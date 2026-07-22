import assert from "node:assert/strict";
import test from "node:test";

// CRY-266 / CRY-269 regression: the legacy /worlds, /labs, and /creative-works
// route components were deleted; visitors reach canonical destinations only
// through next.config.ts redirects. This test pins those redirects so a future
// edit cannot silently drop one and 404 a legacy URL.
import nextConfig from "../../next.config.ts";

async function redirectMap(): Promise<Map<string, string>> {
  assert.ok(typeof nextConfig.redirects === "function", "redirects() must exist");
  const rules = await nextConfig.redirects!();
  const map = new Map<string, string>();
  for (const r of rules) map.set(r.source, r.destination);
  return map;
}

// Every legacy source → its exact canonical destination.
const EXPECTED: Record<string, string> = {
  // CRY-269 — retired Worlds and Labs hierarchies
  "/worlds": "/entertainment",
  "/labs": "/entertainment/visual-studies",
  // CRY-266 — retired Creative Works hierarchy (4 known slugs + parent + catch-all)
  "/creative-works": "/entertainment",
  "/creative-works/visual-studies": "/entertainment/visual-studies",
  "/creative-works/singularis": "/products/singularis",
  "/creative-works/holistic-ux": "/professional/articles",
  "/creative-works/crypticdesign-net": "/professional",
  "/creative-works/:slug*": "/entertainment",
  // Legacy /personal chain must point at final destinations, not deleted routes
  "/personal/creative-labs": "/entertainment/visual-studies",
  "/personal/rooms": "/entertainment",
  "/personal/collections": "/entertainment",
  // CRY-344 — Squarespace legacy set (spot-check of key entries)
  "/soundwave": "/products/cryptic-signal",
  "/store": "/entertainment/store",
  "/portfolio/humankind": "/professional/case-studies",
  "/articles/:slug": "/professional/articles/:slug",
};

test("every legacy route redirects to its canonical destination", async () => {
  const map = await redirectMap();
  for (const [source, destination] of Object.entries(EXPECTED)) {
    assert.equal(
      map.get(source),
      destination,
      `redirect for ${source} should be ${destination}, got ${map.get(source) ?? "(missing)"}`,
    );
  }
});

test("no redirect points at a retired route as its destination", async () => {
  const map = await redirectMap();
  // These paths no longer have page components — nothing may redirect *to* them.
  const retired = ["/worlds", "/labs", "/creative-works"];
  for (const [source, destination] of map.entries()) {
    for (const dead of retired) {
      assert.notEqual(
        destination,
        dead,
        `${source} redirects to retired route ${dead}; point it at the canonical destination instead`,
      );
    }
  }
});
