import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const products = readFileSync("src/lib/products.ts", "utf8");
const productPage = readFileSync("src/app/products/[slug]/page.tsx", "utf8");
const serverAccess = readFileSync("src/lib/server-experience-access.ts", "utf8");
const arcade = readFileSync("src/app/entertainment/explore/page.tsx", "utf8");
const firstSignal = readFileSync("src/lib/first-signal.ts", "utf8");
const firstSignalRoute = readFileSync("src/app/api/characters/[id]/first-signal/route.ts", "utf8");
const releases = readFileSync("src/lib/releases.ts", "utf8");

test("unfinished product declarations remain discoverable but execute only after server access", () => {
  assert.match(products, /SINGULARIS_EXPERIENCE[\s\S]*PUBLIC_COMING_SOON/);
  assert.match(products, /LIFA_EXPERIENCE[\s\S]*PUBLIC_COMING_SOON/);
  assert.match(productPage, /resolvePageExperienceAccess/);
  assert.match(productPage, /experienceAccess\?\.executable \? \(/);
  assert.match(productPage, /<ExperienceComingSoon/);
  assert.match(productPage, /dynamic = "force-dynamic"/);
  assert.match(productPage, /revalidate = 0/);
  assert.doesNotMatch(productPage, /generateStaticParams/);
});

test("server authorization maps the authenticated account to its own exact grants", () => {
  assert.match(serverAccess, /client\.auth\.getUser\(\)/);
  assert.match(serverAccess, /\.from\("member_profiles"\)/);
  assert.match(serverAccess, /\.eq\("account_id", accountId\)/);
  assert.match(serverAccess, /\.from\("entitlement_grants"\)/);
  assert.match(serverAccess, /\.eq\("resource", definition\.resource\)/);
  assert.match(serverAccess, /\.eq\("action", definition\.action\)/);
  assert.match(serverAccess, /DEVELOPMENT_ENTITLEMENT_SOURCES/);
});

test("Arcade copy does not advertise unfinished builds as public play", () => {
  assert.doesNotMatch(arcade, /No account or subscription is required to browse the catalog or open a public sample/);
  assert.doesNotMatch(arcade, /Playable sample[\s\S]*data-state="open"/);
  assert.match(arcade, /Signing in does not unlock unfinished experiences/);
  assert.doesNotMatch(releases, /tagline: "A playable first passage/);
});

test("First Signal is explicitly internal-only and disabled outside its local sandbox", () => {
  assert.match(firstSignal, /FIRST_SIGNAL_ACCESS[\s\S]*declaration: "INTERNAL_ONLY"/);
  assert.match(firstSignalRoute, /FIRST_SIGNAL_ACCESS\.declaration !== "INTERNAL_ONLY" \|\| !membershipSandboxEnabled\(\)/);
});
