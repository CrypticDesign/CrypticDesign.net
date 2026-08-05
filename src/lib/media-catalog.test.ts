import assert from "node:assert/strict";
import test from "node:test";
import { MUSIC_CATEGORIES, VIDEO_CATEGORIES } from "./entertainment-navigation.ts";
import { MUSIC_ENTRIES, VIDEO_ENTRIES } from "./media-catalog.ts";

test("Music and Video expose the approved Cryptic Design filters", () => {
  assert.deepEqual(MUSIC_CATEGORIES.map((item) => item.label), ["All Music","Featured","Singularis","Cryptic Signal","Songs","Scores","Soundscapes","Collections","Coming Soon"]);
  assert.deepEqual(VIDEO_CATEGORIES.map((item) => item.label), ["All Video","Featured","Singularis","Episodes","Shorts","Transmissions","Trailers","Behind the Work","Visualizers","Coming Soon"]);
});

test("every Music and Video stub carries shared construction-page fields", () => {
  for (const entry of [...MUSIC_ENTRIES, ...VIDEO_ENTRIES]) {
    for (const field of ["title","bucket","franchise","premise","status","releaseType","access","relatedMedia"] as const) assert.ok(entry[field], `${entry.slug} is missing ${field}`);
    assert.ok(entry.categories.includes("all"));
    assert.ok(entry.href || entry.status === "In development", `${entry.slug} needs a destination or clear in-development language`);
  }
});
