import assert from "node:assert/strict";
import test from "node:test";
import { ARCADE_ENTRIES, arcadeEntriesFor } from "./arcade.ts";

test("Arcade MVP exposes the approved Cryptic-specific discovery groups", () => {
  assert.ok(arcadeEntriesFor("lifa").some((entry) => entry.slug === "lifa-genesis"));
});

/**
 * Retired buckets. These are deliberately typed as plain strings: they are no
 * longer members of ArcadeCategorySlug, so comparing them against the union
 * directly is a compile error even though the runtime guard is still wanted.
 */
const RETIRED_CATEGORY_SLUGS: readonly string[] = ["featured", "cryptic-originals"];

test("Arcade does not duplicate Featured or Cryptic Originals as catalog buckets", () => {
  assert.equal(ARCADE_ENTRIES.some((entry) => entry.slug === "cryptic-originals-program"), false);
  assert.equal(
    ARCADE_ENTRIES.some((entry) =>
      (entry.categories as readonly string[]).some((category) => RETIRED_CATEGORY_SLUGS.includes(category)),
    ),
    false,
  );
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
