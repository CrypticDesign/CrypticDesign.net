import assert from "node:assert/strict";
import test from "node:test";
import { ARCADE_ENTRIES, arcadeEntriesFor } from "./arcade.ts";

test("Arcade MVP exposes the approved Cryptic-specific discovery groups", () => {
  assert.ok(arcadeEntriesFor("featured").some((entry) => entry.slug === "singularis-browser-prototype"));
  assert.ok(arcadeEntriesFor("lifa").some((entry) => entry.slug === "lifa-genesis"));
  assert.ok(arcadeEntriesFor("missions").some((entry) => entry.slug === "cross-media-missions"));
  assert.ok(arcadeEntriesFor("experiments").some((entry) => entry.slug === "interactive-experiments"));
});

test("construction entries expose the required planning fields", () => {
  for (const entry of ARCADE_ENTRIES.filter((item) => !item.href)) {
    assert.ok(entry.title);
    assert.ok(entry.franchise);
    assert.ok(entry.premise);
    assert.ok(entry.status);
    assert.ok(entry.platform);
    assert.ok(entry.access);
  }
});

test("genres remain secondary metadata rather than primary navigation", () => {
  assert.deepEqual(ARCADE_ENTRIES.find((entry) => entry.slug === "singularis-browser-prototype")?.genres, ["Action", "Rhythm", "Shooter"]);
});
