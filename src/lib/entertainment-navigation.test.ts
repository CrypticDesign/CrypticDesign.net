import assert from "node:assert/strict";
import test from "node:test";
import { ENTERTAINMENT_NAV_ITEMS, isEntertainmentDestinationActive } from "./entertainment-navigation.ts";

const canonicalDestinations = [
  "/entertainment",
  "/entertainment/arcade",
  "/entertainment/cinema",
  "/entertainment/listening-rooms",
  "/entertainment/virtual-rooms",
  "/entertainment/creative-labs",
  "/library",
  "/releases",
  "/products",
  "/audio",
  "/entertainment/visual-studies",
];

test("Entertainment navigation exposes every canonical v18 destination directly", () => {
  assert.deepEqual(ENTERTAINMENT_NAV_ITEMS.map((item) => item.href), canonicalDestinations);
});

test("Entertainment navigation never targets a retired route", () => {
  const retiredRoots = ["/creative-works", "/worlds", "/labs", "/soundwave", "/cryptic-design-audio"];
  for (const item of ENTERTAINMENT_NAV_ITEMS) {
    assert.equal(retiredRoots.some((route) => item.href === route || item.href.startsWith(`${route}/`)), false);
  }
});

test("active matching includes nested routes without activating the hub", () => {
  assert.equal(isEntertainmentDestinationActive("/products/singularis", "/products"), true);
  assert.equal(isEntertainmentDestinationActive("/entertainment/cinema", "/entertainment"), false);
  assert.equal(isEntertainmentDestinationActive("/entertainment", "/entertainment"), true);
});
