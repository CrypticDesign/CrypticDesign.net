import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path: string) => readFile(new URL(path, root), "utf8");

test("authenticated Account is an operational identity surface rather than a My Home or marketing duplicate", async () => {
  const [overview, security] = await Promise.all([
    source("components/AccountOverview.tsx"),
    source("app/account/security/page.tsx"),
  ]);
  assert.match(overview, /Profile &amp; Identity/);
  assert.doesNotMatch(overview, /id="security"|Account security/);
  assert.match(security, /Account security/);
  assert.match(security, /Security & Recovery/);
  assert.match(overview, /Subscription &amp; access/);
  assert.match(overview, /Privacy state/);
  assert.match(overview, /Activity and personal recommendations remain in My Home/);
  assert.doesNotMatch(overview, /New accounts are not open yet, but you can explore what is planned/);
  assert.doesNotMatch(overview, /Mission Control|active missions|achievement feed|continue playing/i);
});

test("account identity is resolved server-side without exposing age or operator metadata", async () => {
  const serverState = await source("lib/server-account-state.ts");
  assert.match(serverState, /client\.auth\.getUser\(\)/);
  assert.match(serverState, /email_confirmed_at/);
  assert.match(serverState, /created_at/);
  assert.match(serverState, /last_sign_in_at/);
  assert.doesNotMatch(serverState, /dateOfBirth|date_of_birth|service_role|operator/);
});

test("Character remains owner-scoped, separately summarized, and private by default", async () => {
  const [overview, charactersApi, characterModel] = await Promise.all([
    source("components/AccountOverview.tsx"),
    source("app/api/characters/route.ts"),
    source("lib/characters.ts"),
  ]);
  assert.match(overview, /private account identity and persistent character are separate trust domains/i);
  assert.match(overview, /A character starts private/);
  assert.match(charactersApi, /resolveAccountSession\(request\)/);
  assert.match(charactersApi, /findByOwner\(session\.accountId\)/);
  assert.match(characterModel, /const visibility = input\.visibility \?\? "private"/);
});

test("unsupported account capabilities are visibly gated instead of simulated", async () => {
  const [overview, security, settings, subscription] = await Promise.all([
    source("components/AccountOverview.tsx"),
    source("app/account/security/page.tsx"),
    source("app/account/settings/page.tsx"),
    source("app/account/subscription/page.tsx"),
  ]);
  assert.match(overview, /Direct messaging remains disabled/);
  assert.match(security, /Change email/);
  assert.match(security, /Not available yet/);
  assert.match(settings, /Export account data/);
  assert.match(settings, /Delete account/);
  assert.match(subscription, /Paid subscription/);
  assert.match(subscription, /No payment is collected/);
  assert.doesNotMatch(subscription, /SANDBOX_TIERS|price_|checkout/i);
});

test("account navigation follows the five-destination icon-led VDS section pattern", async () => {
  const [navigation, overview, styles] = await Promise.all([
    source("components/AccountNavigation.tsx"),
    source("components/AccountOverview.tsx"),
    source("app/globals.css"),
  ]);
  for (const label of ["Overview", "Security", "My Library", "Access", "Settings"]) {
    assert.match(navigation, new RegExp(`label: "${label}"`));
  }
  assert.match(navigation, /entertainment-navigation account-section-navigation/);
  assert.match(navigation, /entertainment-navigation__icon/);
  assert.match(navigation, /entertainment-navigation__copy/);
  assert.match(navigation, /href: "\/account\/security"/);
  assert.doesNotMatch(navigation, /href: "\/account#security"/);
  assert.match(styles, /\.account-section-navigation__bar\{grid-template-columns:repeat\(5,minmax\(0,1fr\)\)\}/);
  assert.match(overview, /visual-hero account-overview-hero/);
  assert.match(overview, /src="\/images\/my-home-hero\.png"/);
  assert.match(overview, /sizes="100vw"/);
});

test("each Account tab uses the shared full-width VDS image hero", async () => {
  const [hero, security, library, access, settings, styles] = await Promise.all([
    source("components/AccountSectionHero.tsx"),
    source("app/account/security/page.tsx"),
    source("app/library/page.tsx"),
    source("app/account/subscription/page.tsx"),
    source("app/account/settings/page.tsx"),
    source("app/globals.css"),
  ]);
  assert.match(hero, /visual-hero account-section-hero/);
  assert.match(hero, /visual-hero__image/);
  assert.match(hero, /visual-hero__wash/);
  assert.match(hero, /sizes="100vw"/);
  assert.match(security, /<AccountSectionHero[\s\S]*?image="\/images\/current-focus\.png"/);
  assert.match(library, /<AccountSectionHero[\s\S]*?image="\/images\/entertainment-hero\.png"/);
  assert.match(access, /<AccountSectionHero[\s\S]*?image="\/images\/signal-systems\.png"/);
  assert.match(settings, /<AccountSectionHero[\s\S]*?image="\/images\/human-machine\.png"/);
  for (const page of [security, library, access, settings]) {
    assert.match(page, /account-section-page/);
    assert.match(page, /shell page-stack account-section-page__body/);
  }
  assert.match(styles, /\.account-section-hero\{min-height:520px\}/);
  assert.match(styles, /\.account-section-hero__content\{display:grid/);
});

test("My Library supports authenticated empty, filter, sort, and remove states", async () => {
  const library = await source("app/library/page.tsx");
  assert.match(library, /Sign in to open My Library/);
  assert.match(library, /No saved items match this filter/);
  assert.match(library, /Recently saved/);
  assert.match(library, /Media type/);
  assert.match(library, /toggleSaved\(slug\)/);
  assert.match(library, /Remove saved release/);
});
