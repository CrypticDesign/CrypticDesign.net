import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const headerUrl = new URL("../components/SiteHeader.tsx", import.meta.url);
const entertainmentNavigationUrl = new URL("../components/EntertainmentNavigation.tsx", import.meta.url);
const accessFormUrl = new URL("../components/AccountAccessForm.tsx", import.meta.url);
const layoutUrl = new URL("../app/layout.tsx", import.meta.url);
const globalsUrl = new URL("../app/globals.css", import.meta.url);
const serverStateUrl = new URL("./server-account-state.ts", import.meta.url);

test("global account navigation starts from server authentication state", async () => {
  const [header, layout, serverState] = await Promise.all([
    readFile(headerUrl, "utf8"),
    readFile(layoutUrl, "utf8"),
    readFile(serverStateUrl, "utf8"),
  ]);
  assert.match(layout, /getInitialAccountAuthenticated/);
  assert.match(layout, /<SiteHeader initialAuthenticated=\{initialAuthenticated\}/);
  assert.match(header, /initialAuthenticated/);
  assert.match(serverState, /client\.auth\.getUser\(\)/);
});

test("global account navigation synchronizes after navigation and auth mutations", async () => {
  const [header, accessForm] = await Promise.all([
    readFile(headerUrl, "utf8"),
    readFile(accessFormUrl, "utf8"),
  ]);
  assert.match(header, /fetch\("\/api\/membership\/session"/);
  assert.match(header, /MEMBERSHIP_SESSION_CHANGED_EVENT/);
  assert.match(header, /\[pathname\]/);
  assert.match(header, /\{authenticated \? \(/);
  assert.match(header, /aria-label="Open site menu"/);
  assert.match(header, />Menu<\/button>/);
  assert.match(header, /href="\/account\/create"/);
  assert.match(header, />Create account<\/span>/);
  assert.match(accessForm, /announceMembershipSession\(nextAuthenticated\)/);
  assert.match(accessForm, /announceMembershipSession\(false\)/);
});

test("authenticated site menu exposes account controls and sign out", async () => {
  const header = await readFile(headerUrl, "utf8");
  assert.match(header, /const ACCOUNT_ITEMS = \[\s*\{ href: "\/library", icon: "▣", label: "My Library" \}/);
  assert.match(header, /aria-haspopup="menu"/);
  assert.match(header, /aria-expanded=\{accountMenuOpen\}/);
  assert.match(header, /role="menu"/);
  assert.match(header, />\{signingOut \? "Signing out…" : "Sign out"\}</);
  assert.match(header, /fetch\("\/api\/membership\/session", \{ method: "DELETE" \}\)/);
  assert.match(header, /announceMembershipSession\(false\)/);
  assert.match(header, /window\.location\.assign\("\/\?signedOut=1"\)/);
  assert.match(header, /event\.key !== "Escape"/);
  assert.match(header, /role="status" aria-live="polite"/);
});

test("site menu consolidates global utilities without franchise links", async () => {
  const header = await readFile(headerUrl, "utf8");
  assert.match(header, /const GLOBAL_MENU_ITEMS = \[/);
  assert.match(header, /href: "\/search"/);
  assert.match(header, /href: "\/entertainment\/store"/);
  assert.doesNotMatch(header, /href: "\/products\/singularis"/);
  assert.doesNotMatch(header, /href: "\/products\/lifa"/);
});

test("Entertainment and Arcade expose independent drawer controls", async () => {
  const [header, entertainmentNavigation, globals] = await Promise.all([
    readFile(headerUrl, "utf8"),
    readFile(entertainmentNavigationUrl, "utf8"),
    readFile(globalsUrl, "utf8"),
  ]);
  assert.match(header, /className="site-primary-drawer"/);
  assert.doesNotMatch(header, /className="site-primary-link__arrow"/);
  assert.match(entertainmentNavigation, /className="entertainment-navigation__item-drawer"/);
  assert.match(header, /aria-controls="entertainment-category-drawer"/);
  assert.match(entertainmentNavigation, /aria-label=\{`\$\{item\.label\} drawer`\}/);
  assert.match(entertainmentNavigation, /aria-controls=\{`\$\{item\.icon\}-destination-drawer-\$\{surface\}`\}/);
  assert.match(entertainmentNavigation, /id=\{`\$\{item\.icon\}-destination-drawer-\$\{surface\}`\}/);
  assert.match(entertainmentNavigation, /useState<ArcadeCategorySlug>\("all"\)/);
  assert.match(entertainmentNavigation, /setSelectedArcadeCategory\(singularisRoute \? "singularis" : lifaRoute \? "lifa" : arcadeCategory\(searchParams\.get\("genre"\) \?\? undefined\)\?\.slug \?\? "all"\)/);
  assert.match(entertainmentNavigation, /aria-current=\{category\.slug === selected \? "page" : undefined\}/);
  assert.doesNotMatch(entertainmentNavigation, /entertainment-navigation__drawer/);
  assert.match(header, /const changingSection = pathname !== item\.href/);
  assert.match(header, /const open = changingSection \|\| !entertainmentMenuOpen/);
  assert.match(header, /if \(changingSection\) router\.push\(item\.href\)/);
  assert.match(header, /if \(event\.key !== "Escape"\) return/);
  assert.doesNotMatch(header, /target\.closest\("\.entertainment-navigation"\)/);
  assert.match(entertainmentNavigation, /const onRoute = pathname === item\.href \|\| pathname\.startsWith\(`\$\{item\.href\}\/`\)/);
  assert.match(entertainmentNavigation, /setArcadeMenuOpen\(true\)/);
  assert.match(entertainmentNavigation, /detail: \{ open: true \}/);
  assert.match(entertainmentNavigation, /if \(!onRoute \|\| searchParams\.has\(query\)\) router\.push\(item\.href\)/);
  assert.doesNotMatch(entertainmentNavigation, /pointerdown/);
  assert.doesNotMatch(entertainmentNavigation, /Escape/);
  assert.match(header, /cryptic:entertainment-drawer/);
  assert.match(entertainmentNavigation, /id="entertainment-category-drawer"/);
  assert.match(globals, /\.site-primary-drawer>nav\{position:absolute/);
  assert.match(globals, /\.site-primary-drawer>nav a\{display:flex/);
  assert.match(globals, /\.entertainment-navigation__item-options\{position:static/);
  assert.match(globals, /\.entertainment-navigation__item-options a\{display:flex/);
  assert.match(globals, /Full-width tier drawers expand in flow and push page content down/);
  assert.match(globals, /\.entertainment-navigation__item-drawer\[data-open="true"\]>summary:not\(\[aria-current="page"\]\)/);
  assert.match(globals, /summary:not\(\[aria-current="page"\]\)::after\{background:transparent;box-shadow:none\}/);
  assert.match(globals, /\.entertainment-navigation__item-drawer>\.entertainment-navigation__item\{--nav-accent:#9b5cff\}/);
  assert.match(globals, /\.entertainment-navigation__item-options\[data-open="false"\]\{max-height:0/);
  assert.match(globals, /\.entertainment-navigation__item-options a\[aria-current="page"\]/);
  assert.match(entertainmentNavigation, /className="arcade-filter-menu"/);
  assert.match(entertainmentNavigation, /data-section-theme=\{activeItem\?\.theme \?\? "cyan"\}/);
  assert.match(globals, /data-section-theme="violet"/);
  assert.match(entertainmentNavigation, /aria-label=\{`Compact \$\{compactItem\.label\} navigation`\}/);
  assert.match(globals, /\.entertainment-navigation__item-options\{display:none!important\}/);
  assert.match(globals, /\.arcade-filter-menu\{display:block/);
  assert.match(globals, /\.entertainment-navigation\{--section-accent:var\(--cyan\);overflow:visible;margin-bottom:0/);
  assert.match(globals, /\.entertainment-navigation__item\[aria-current="page"\]:after\{background:transparent;box-shadow:none\}/);
  assert.match(globals, /\.entertainment-navigation__item-drawer>\.entertainment-navigation__item\[aria-current="page"\]\{background:linear-gradient/);
  assert.match(globals, /@media\(prefers-reduced-motion:reduce\)/);
});
