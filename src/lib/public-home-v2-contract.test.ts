import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const home = readFileSync(new URL("../components/PublicHome.tsx", import.meta.url), "utf8");
const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

function assertOrder(source: string, values: readonly string[]) {
  let cursor = -1;
  for (const value of values) {
    const next = source.indexOf(value, cursor + 1);
    assert.ok(next > cursor, `expected "${value}" after the previous Homepage stage`);
    cursor = next;
  }
}

test("signed-out Home preserves the required nine-stage semantic journey", () => {
  assertOrder(home, [
    "An independent entertainment universe",
    "Featured experiences",
    "Choose a signal.",
    "This isn&apos;t just something to watch.",
    "Your place in the platform",
    "Current signal",
    "Built by Cryptic Design",
    "We build for others, too.",
    "Join the next wave",
  ]);
});

test("Home keeps the authenticated route boundary and one shared PageScene", () => {
  assert.match(page, /authenticated[\s\S]*<MyHomeDashboard initialAuthenticated \/>[\s\S]*<PublicHome/);
  assert.equal(home.match(/<PageScene /g)?.length, 1);
  assert.match(home, /sceneId="public-home"/);
  assert.match(home, /fallbackPoster="\/images\/entertainment-hero\.png"/);
});

test("hero and discovery routes prioritize Entertainment and Community", () => {
  assert.match(home, /href="\/entertainment" className="button home-primary-cta">Explore What&apos;s Here/);
  assert.match(home, /href="\/community" className="button home-secondary-cta">Enter Community/);
  assert.doesNotMatch(home, /href="\/professional" className="button home-secondary-cta"/);
  for (const href of [
    "/entertainment/explore",
    "/entertainment/listening-rooms",
    "/products",
    "/community",
    "/community/creators",
    "/community/groups",
    "/community/events",
  ]) assert.match(home, new RegExp(`href: "${href.replaceAll("/", "\\/")}"|href="${href.replaceAll("/", "\\/")}"`));
});

test("Featured Experiences and CURRENT SIGNAL derive from governed shared data", () => {
  assert.match(home, /getProduct\("singularis"\)/);
  assert.match(home, /getProduct\("lifa"\)/);
  assert.match(home, /getRelease\("visual-study-01"\)/);
  assert.match(home, /MUSIC_ENTRIES\.find\(\(entry\) => entry\.slug === "signal-and-systems" && entry\.status === "Released" && entry\.href\)/);
  assert.match(home, /In development · Scheduled/);
  assert.match(home, /Coming soon · Scheduled/);
  assert.doesNotMatch(home, />Latest</);
});

test("Community and admission claims remain fail-closed and non-fabricated", () => {
  assert.match(home, /current published schedule or empty state/);
  assert.match(home, /Requesting access does not create an account or guarantee access/);
  assert.match(home, /public-home-v2__join[\s\S]*href="\/account\/create"[^>]*>Request Access/);
  assert.equal(home.match(/>Request Access</g)?.length, 1);
  assert.doesNotMatch(home.slice(0, home.indexOf('className="public-home-v2__join"')), />Request Access</);
  assert.doesNotMatch(home, /Create Account|Sign Up Free|Join Waitlist|Account requests are not open yet/);
  assert.doesNotMatch(home, /member count|online now|attendees|reactions|messages|posts/i);
});
