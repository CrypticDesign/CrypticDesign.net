import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { entertainmentSelection, releaseAvailability } from "./entertainment-frontdoor.ts";
import { RELEASES } from "./releases.ts";

const page = readFileSync(new URL("../app/entertainment/page.tsx", import.meta.url), "utf8");

test("Entertainment is the canonical six-stage public discovery front door", () => {
  assert.match(page, /canonical: "\/entertainment"/);
  let cursor = -1;
  for (const stage of ["Enter Entertainment", "Featured /", "Choose a mode", "Enter a world", "Featured across Cryptic Design", ">Continue<"]) {
    const next = page.indexOf(stage, cursor + 1);
    assert.ok(next > cursor, stage);
    cursor = next;
  }
  for (const mode of ["Arcade", "Music", "Video"]) assert.ok(page.includes('title="' + mode + '"'));
  assert.match(page, /publicProducts\(\)/);
  assert.match(page, /href="#choose-a-mode"/);
  assert.match(page, /href="\/releases".*Browse Releases/);
  assert.doesNotMatch(page, /Popular now|live mix|Trending|Latest|href="\/library"/i);
});

test("featured and curated selections use governed records and exact availability", () => {
  const selection = entertainmentSelection();
  assert.equal(selection.featured?.title, "Singularis Themes, Vol. 1");
  assert.equal(releaseAvailability(selection.featured!), "Coming soon");
  assert.deepEqual(selection.selected.map((entry) => entry.slug), ["singularis-vertical-slice", "singularis-overture", "visual-study-01"]);
  assert.ok(selection.selected.every((entry) => entry.visibility_status === "public"));
  assert.equal(releaseAvailability({ ...selection.featured!, publication_status: "published", status: "released" }), "Available");
  assert.equal(releaseAvailability({ ...selection.featured!, publication_status: "scheduled", status: "released", releasedAt: "2000-01-01" }), "Coming soon");
});

test("selection fails closed for withheld rights, drafts and nonpublic access", () => {
  const seed = RELEASES.find((entry) => entry.slug === "singularis-themes-vol-1")!;
  for (const record of [
    { ...seed, rights_status: "restricted" as const },
    { ...seed, publication_status: "draft" as const },
    { ...seed, visibility_status: "hidden" as const },
    { ...seed, visibility_status: "account-required" as const },
    { ...seed, visibility_status: "entitlement-required" as const },
  ]) assert.equal(entertainmentSelection([record]).featured, undefined);
  assert.deepEqual(entertainmentSelection([]), { featured: undefined, selected: [] });
  assert.equal(entertainmentSelection(RELEASES.map((entry) => ({ ...entry, rights_status: "blocked-pending-review" }))).selected.length, 0);
});

test("generic discovery points home while contextual Play retains Arcade compatibility", () => {
  const community = readFileSync(new URL("../app/community/page.tsx", import.meta.url), "utf8");
  const header = readFileSync(new URL("../components/SiteHeader.tsx", import.meta.url), "utf8");
  assert.match(community, /href="\/entertainment">Explore Entertainment/);
  assert.doesNotMatch(community, /\/entertainment\/explore/);
  assert.match(header, /href: "\/entertainment", label: "Play"/);
});
