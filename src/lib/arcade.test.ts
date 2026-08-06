import assert from "node:assert/strict";
import test from "node:test";
import { ARCADE_ENTRIES, arcadeEntriesFor } from "./arcade.ts";

test("Arcade MVP exposes the approved Cryptic-specific discovery groups", () => {
  assert.ok(arcadeEntriesFor("lifa").some((entry) => entry.slug === "lifa-genesis"));
});

test("Arcade does not duplicate Featured or Cryptic Originals as catalog buckets", () => {
  assert.equal(ARCADE_ENTRIES.some((entry) => entry.slug === "cryptic-originals-program"), false);
  assert.equal(ARCADE_ENTRIES.some((entry) => entry.categories.some((category) => category === "featured" || category === "cryptic-originals")), false);
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
