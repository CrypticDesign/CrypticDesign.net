import assert from "node:assert/strict";
import test from "node:test";
import { ARCADE_CATEGORIES, ENTERTAINMENT_NAV_ITEMS, arcadeCategory, entertainmentCategoryHref, isEntertainmentDestinationActive, isEntertainmentNavigationRelevant } from "./entertainment-navigation.ts";

const canonicalDestinations = [
  "/entertainment",
  "/entertainment/explore",
  "/audio",
  "/entertainment/cinema",
];

test("Entertainment navigation exposes only scalable media destinations", () => {
  assert.deepEqual(ENTERTAINMENT_NAV_ITEMS.map((item) => item.href), canonicalDestinations);
  assert.equal(ENTERTAINMENT_NAV_ITEMS.some((item) => item.href.startsWith("/products/")), false);
});

test("Entertainment navigation never targets a retired route", () => {
  const retiredRoots = ["/creative-works", "/worlds", "/labs", "/soundwave", "/cryptic-design-audio"];
  for (const item of ENTERTAINMENT_NAV_ITEMS) {
    assert.equal(retiredRoots.some((route) => item.href === route || item.href.startsWith(`${route}/`)), false);
  }
});

test("active matching includes nested routes without activating the hub", () => {
  assert.equal(isEntertainmentDestinationActive("/entertainment/explore/singularis/game-01", "/entertainment/explore"), true);
  assert.equal(isEntertainmentDestinationActive("/entertainment/cinema", "/entertainment"), false);
  assert.equal(isEntertainmentDestinationActive("/entertainment", "/entertainment"), true);
});

test("Explore drawer exposes scalable categories instead of franchise links", () => {
  assert.deepEqual(ARCADE_CATEGORIES.map((category) => category.label), [
    "Lobby", "Singularis", "Lifa",
  ]);
  assert.equal(arcadeCategory("lifa")?.label, "Lifa");
  assert.equal(arcadeCategory("not-a-category"), undefined);
});

test("Singularis game routes activate Explore while other legacy directors activate Overview", () => {
  assert.equal(isEntertainmentDestinationActive("/products/singularis", "/entertainment/explore"), true);
  assert.equal(isEntertainmentDestinationActive("/products/singularis", "/entertainment"), false);
  assert.equal(isEntertainmentDestinationActive("/products/lifa", "/entertainment/explore"), true);
  assert.equal(isEntertainmentDestinationActive("/products/lifa", "/entertainment"), false);
});

test("Explore franchise navigation resolves to the single product roots", () => {
  assert.equal(entertainmentCategoryHref("arcade", "singularis"), "/products/singularis");
  assert.equal(entertainmentCategoryHref("arcade", "lifa"), "/products/lifa");
});

test("shows the shared bar across connected entertainment content only", () => {
  for (const pathname of ["/entertainment/explore", "/audio", "/products/singularis", "/releases/example"]) {
    assert.equal(isEntertainmentNavigationRelevant(pathname), true, pathname);
  }
  for (const pathname of ["/", "/professional", "/account", "/library"]) {
    assert.equal(isEntertainmentNavigationRelevant(pathname), false, pathname);
  }
});
