import assert from "node:assert/strict";
import test from "node:test";
import { ARCADE_CATEGORIES, ENTERTAINMENT_NAV_ITEMS, arcadeCategory, entertainmentCategoryHref, isEntertainmentDestinationActive, isEntertainmentNavigationRelevant } from "./entertainment-navigation.ts";

const canonicalDestinations = [
  "/entertainment",
  "/entertainment/arcade",
  "/audio",
  "/entertainment/cinema",
];

test("Entertainment navigation exposes only scalable media destinations", () => {
  assert.deepEqual(ENTERTAINMENT_NAV_ITEMS.map((item) => item.href), canonicalDestinations);
  assert.equal(ENTERTAINMENT_NAV_ITEMS.some((item) => item.href.startsWith("/products/")), false);
  assert.deepEqual(new Set(ENTERTAINMENT_NAV_ITEMS.map((item) => item.theme)), new Set(["cyan"]));
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

test("overview remains visibly active on contextual public routes", () => {
  for (const pathname of ["/products", "/releases/example"]) {
    assert.equal(isEntertainmentDestinationActive(pathname, "/entertainment"), true, pathname);
  }
  assert.equal(isEntertainmentDestinationActive("/releases/example", "/entertainment/arcade"), false);
});

test("every shared Entertainment route has exactly one visibly active destination", () => {
  const routes = [
    "/entertainment",
    "/entertainment/arcade",
    "/entertainment/cinema",
    "/entertainment/creative-labs",
    "/entertainment/listening-rooms",
    "/entertainment/store",
    "/entertainment/virtual-rooms",
    "/entertainment/visual-studies",
    "/audio",
    "/products",
    "/products/singularis",
    "/products/lifa",
    "/releases/example",
  ];

  for (const pathname of routes) {
    const activeDestinations = ENTERTAINMENT_NAV_ITEMS.filter((item) =>
      isEntertainmentDestinationActive(pathname, item.href),
    );
    assert.equal(activeDestinations.length, 1, pathname);
  }
});

test("Listening Rooms identifies Music while contextual destinations identify Overview", () => {
  assert.equal(isEntertainmentDestinationActive("/entertainment/listening-rooms", "/audio"), true);
  for (const pathname of [
    "/entertainment/creative-labs",
    "/entertainment/store",
    "/entertainment/virtual-rooms",
    "/entertainment/visual-studies",
  ]) {
    assert.equal(isEntertainmentDestinationActive(pathname, "/entertainment"), true, pathname);
  }
});

test("Arcade drawer exposes scalable categories instead of franchise links", () => {
  assert.deepEqual(ARCADE_CATEGORIES.map((category) => category.label), [
    "Lobby", "Singularis", "Lifa",
  ]);
  assert.equal(arcadeCategory("lifa")?.label, "Lifa");
  assert.equal(arcadeCategory("not-a-category"), undefined);
});

test("Singularis game routes activate Arcade while other legacy directors activate Overview", () => {
  assert.equal(isEntertainmentDestinationActive("/products/singularis", "/entertainment/arcade"), true);
  assert.equal(isEntertainmentDestinationActive("/products/singularis", "/entertainment"), false);
  assert.equal(isEntertainmentDestinationActive("/products/lifa", "/entertainment/arcade"), true);
  assert.equal(isEntertainmentDestinationActive("/products/lifa", "/entertainment"), false);
});

test("Arcade franchise navigation resolves to the single product roots", () => {
  assert.equal(entertainmentCategoryHref("arcade", "singularis"), "/products/singularis");
  assert.equal(entertainmentCategoryHref("arcade", "lifa"), "/products/lifa");
});

test("shows the shared bar across connected entertainment content only", () => {
  for (const pathname of ["/entertainment/arcade", "/audio", "/products/singularis", "/releases/example"]) {
    assert.equal(isEntertainmentNavigationRelevant(pathname), true, pathname);
  }
  for (const pathname of ["/", "/professional", "/account", "/library"]) {
    assert.equal(isEntertainmentNavigationRelevant(pathname), false, pathname);
  }
});
