import assert from "node:assert/strict";
import test from "node:test";
import { MUSIC_CATEGORIES, VIDEO_CATEGORIES } from "./entertainment-navigation.ts";
import { MUSIC_ENTRIES, VIDEO_ENTRIES } from "./media-catalog.ts";

test("Music and Video expose the approved Cryptic Design filters", () => {
  assert.deepEqual(MUSIC_CATEGORIES.map((item) => item.label), ["All Music","Singularis","Cryptic Signal","Songs","Scores","Soundscapes","Collections"]);
  assert.deepEqual(VIDEO_CATEGORIES.map((item) => item.label), ["All Video","Singularis","Episodes","Shorts","Transmissions","Trailers","Behind the Work","Visualizers"]);
});

test("every Music and Video stub carries shared construction-page fields", () => {
  for (const entry of [...MUSIC_ENTRIES, ...VIDEO_ENTRIES]) {
    for (const field of ["title","bucket","franchise","premise","status","releaseType","access","relatedMedia"] as const) assert.ok(entry[field], `${entry.slug} is missing ${field}`);
    assert.ok(entry.categories.includes("all"));
    assert.ok(entry.href || entry.status === "In development", `${entry.slug} needs a destination or clear in-development language`);
  }
});

test("Signal & Systems routes to its Cryptic Signal catalog instead of an unrelated Singularis release", () => {
  const signalAndSystems = MUSIC_ENTRIES.find((entry) => entry.slug === "signal-and-systems");
  assert.equal(signalAndSystems?.href, "/audio?filter=cryptic-signal");
});

test("every Video entry declares a truthful delivery and fallback state", () => {
  for (const entry of VIDEO_ENTRIES) {
    assert.match(entry.thumbnail, /^\/images\//, `${entry.slug} needs a local preview thumbnail`);
    assert.ok(entry.thumbnailAlt, `${entry.slug} needs descriptive thumbnail text`);
    assert.equal(entry.delivery.playback, "Coming soon", entry.slug);
    assert.equal(entry.delivery.ageGuidance, "Rating pending", entry.slug);
    assert.equal(entry.delivery.captions, "Available with playback", entry.slug);
    assert.equal(entry.delivery.transcript, "Available with playback", entry.slug);
    assert.ok(entry.delivery.rights, `${entry.slug} needs a rights state`);
    assert.ok(entry.delivery.contextHref, `${entry.slug} needs a current product, release, or franchise context`);
    assert.match(entry.delivery.fallback, /Preview artwork and related links/);
  }
});

test("only the approved Overture record links to a public release detail", () => {
  const linked = VIDEO_ENTRIES.filter((entry) => entry.href);
  assert.deepEqual(linked.map((entry) => [entry.slug, entry.href]), [["singularis-overture", "/releases/singularis-overture"]]);
  assert.equal(linked[0]?.delivery.rights, "Cryptic Design owned");
});
