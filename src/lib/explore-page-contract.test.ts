import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const pagePath = new URL("../app/entertainment/explore/page.tsx", import.meta.url);
const navigationPath = new URL("./entertainment-navigation.ts", import.meta.url);
const redirectsPath = new URL("../../next.config.ts", import.meta.url);

test("Explore is the canonical broad entertainment discovery route", async () => {
  const [page, navigation, redirects] = await Promise.all([
    readFile(pagePath, "utf8"),
    readFile(navigationPath, "utf8"),
    readFile(redirectsPath, "utf8"),
  ]);
  assert.match(page, /alternates: \{ canonical: "\/entertainment\/explore" \}/);
  assert.match(navigation, /href: "\/entertainment\/explore", label: "Explore"/);
  assert.match(redirects, /source: "\/entertainment\/arcade", destination: "\/entertainment\/explore", permanent: true/);
});

test("Explore uses real ecosystem routes and honest access language", async () => {
  const page = await readFile(pagePath, "utf8");
  for (const href of ["/products/singularis", "/entertainment/listening-rooms", "/entertainment/cinema", "/entertainment/creative-labs", "/professional/creators"]) {
    assert.match(page, new RegExp(`href: "${href.replaceAll("/", "\\/")}"|href="${href.replaceAll("/", "\\/")}"`));
  }
  assert.match(page, /Public discovery is open/);
  assert.match(page, /No account or subscription is required/);
  assert.doesNotMatch(page, /Join now|Join the community|earned rewards|member count|Trending now/i);
});

test("Explore preserves transparent playable availability states", async () => {
  const page = await readFile(pagePath, "utf8");
  assert.match(page, /arcadeEntriesFor/);
  assert.match(page, /entry\.status/);
  assert.match(page, /Status details — no access yet/);
  assert.match(page, /data-state="open"/);
});
