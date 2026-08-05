import assert from "node:assert/strict";
import test from "node:test";
import { ARCADE_CATEGORIES, ENTERTAINMENT_NAV_ITEMS, arcadeCategory, isEntertainmentDestinationActive, isEntertainmentNavigationRelevant } from "./entertainment-navigation.ts";

const canonicalDestinations = [
  "/entertainment",
  "/entertainment/arcade",
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
  assert.equal(isEntertainmentDestinationActive("/entertainment/arcade/singularis/game-01", "/entertainment/arcade"), true);
  assert.equal(isEntertainmentDestinationActive("/entertainment/cinema", "/entertainment"), false);
  assert.equal(isEntertainmentDestinationActive("/entertainment", "/entertainment"), true);
});

test("Arcade drawer exposes scalable categories instead of franchise links", () => {
  assert.deepEqual(ARCADE_CATEGORIES.map((category) => category.label), [
    "Lobby", "Featured", "Singularis", "Lifa", "Cryptic Originals", "Missions", "Experiments", "Coming Soon",
  ]);
  assert.equal(arcadeCategory("missions")?.label, "Missions");
  assert.equal(arcadeCategory("not-a-category"), undefined);
});

test("Singularis game routes activate Arcade while other legacy directors activate Overview", () => {
  assert.equal(isEntertainmentDestinationActive("/products/singularis", "/entertainment/arcade"), true);
  assert.equal(isEntertainmentDestinationActive("/products/singularis", "/entertainment"), false);
  assert.equal(isEntertainmentDestinationActive("/products/lifa", "/entertainment"), true);
});

test("shows the shared bar across connected entertainment content only", () => {
  for (const pathname of ["/entertainment/arcade", "/audio", "/products/singularis", "/releases/example", "/library"]) {
    assert.equal(isEntertainmentNavigationRelevant(pathname), true, pathname);
  }
  for (const pathname of ["/", "/professional", "/account"]) {
    assert.equal(isEntertainmentNavigationRelevant(pathname), false, pathname);
  }
});
