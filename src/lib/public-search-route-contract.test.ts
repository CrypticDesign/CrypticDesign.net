import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../app/search/page.tsx", import.meta.url), "utf8");
const experience = readFileSync(new URL("../components/SearchExperience.tsx", import.meta.url), "utf8");
const index = readFileSync(new URL("./public-search-index.ts", import.meta.url), "utf8");
const header = readFileSync(new URL("../components/SiteHeader.tsx", import.meta.url), "utf8");
const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");

test("search remains a current global utility without joining signed-out primary navigation", () => {
  assert.match(page, /publicSearchIndex/);
  assert.match(sitemap, /"\/search"/);
  assert.match(header, /href="\/search"/);
  assert.doesNotMatch(header.slice(header.indexOf("const NAV"), header.indexOf("] as const")), /\/search/);
});

test("the index admits only governed public records and never calls a remote search service", () => {
  assert.match(index, /publicReleases\(\)/);
  assert.match(index, /publicProducts\(\)/);
  assert.match(index, /allArticles\(\)/);
  assert.match(index, /publicServices\(\)/);
  assert.match(index, /visibility_status === "public"/);
  assert.match(index, /access: "public"/);
  assert.doesNotMatch(index, /fetch\(|supabase|analytics|entitlement-required/i);
  assert.doesNotMatch(experience, /fetch\(|localStorage|sessionStorage/i);
});

test("the route exposes accessible local, preview, empty, unavailable, not-found, and deferred behavior", () => {
  assert.match(experience, /role="search"/);
  assert.match(experience, /type="search"/);
  assert.match(experience, /aria-describedby="search-scope-note"/);
  assert.match(experience, /role="status" aria-live="polite"/);
  assert.match(experience, /Public preview/);
  assert.match(experience, /resolution\.state === "empty"/);
  assert.match(experience, /resolution\.state === "not-found"/);
  assert.match(experience, /resolution\.state === "unavailable"/);
  assert.match(experience, /resolution\.state === "deferred"/);
  assert.match(experience, /router\.replace/);
  assert.match(experience, /searchParams\.get\("q"\)/);
});
