import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const headerUrl = new URL("../components/SiteHeader.tsx", import.meta.url);
const entertainmentNavigationUrl = new URL("../components/EntertainmentNavigation.tsx", import.meta.url);
const accessFormUrl = new URL("../components/AccountAccessForm.tsx", import.meta.url);
const layoutUrl = new URL("../app/layout.tsx", import.meta.url);
const globalsUrl = new URL("../app/globals.css", import.meta.url);
const serverStateUrl = new URL("./server-account-state.ts", import.meta.url);
const accountNavigationUrl = new URL("../components/AccountNavigation.tsx", import.meta.url);
const accountPageUrl = new URL("../app/account/page.tsx", import.meta.url);
const myHomeDashboardUrl = new URL("../components/MyHomeDashboard.tsx", import.meta.url);

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

test("global account navigation synchronizes authenticated Home and Account labels", async () => {
  const [header, accessForm] = await Promise.all([
    readFile(headerUrl, "utf8"),
    readFile(accessFormUrl, "utf8"),
  ]);
  assert.match(header, /fetch\("\/api\/membership\/session"/);
  assert.match(header, /MEMBERSHIP_SESSION_CHANGED_EVENT/);
  assert.match(header, /\[pathname\]/);
  assert.match(header, /primaryHomeLabel\(authenticated\)/);
  assert.match(header, /authenticated \? "Account" : "Sign In"/);
  assert.match(header, /authenticated \? "\/account" : "\/account\/sign-in"/);
  assert.match(header, /href=\{accountHref\}/);
  assert.match(header, />\{accountLabel\}<\/Link>/);
  assert.match(accessForm, /announceMembershipSession\(nextAuthenticated\)/);
  assert.match(accessForm, /announceMembershipSession\(false\)/);
});

test("primary navigation exposes contextual Sign In or Account directly without a dropdown", async () => {
  const header = await readFile(headerUrl, "utf8");
  assert.match(header, /<Link href=\{accountHref\} data-tone="blue"/);
  assert.match(header, /aria-current=\{accountSectionActive \? "page" : undefined\}/);
  assert.doesNotMatch(header, /aria-label="Open site menu"/);
  assert.doesNotMatch(header, />Menu<\/button>/);
  assert.doesNotMatch(header, /account-menu__panel/);
  assert.doesNotMatch(header, /aria-haspopup="menu"/);
});

test("signed-out Home pairs Sign Up with Account availability", async () => {
  const dashboard = await readFile(myHomeDashboardUrl, "utf8");
  assert.match(dashboard, /href="\/account" className="button">Sign up<\/Link>/);
  assert.match(dashboard, /href="\/account\/create" className="button secondary">Account availability<\/Link>/);
  assert.doesNotMatch(dashboard, /href="\/account\/sign-in" className="button">Sign in<\/Link>/);
});

test("account subnavigation is available only to authenticated visitors", async () => {
  const [layout, navigation] = await Promise.all([
    readFile(layoutUrl, "utf8"),
    readFile(accountNavigationUrl, "utf8"),
  ]);
  assert.match(layout, /<AccountNavigation initialAuthenticated=\{initialAuthenticated\} \/>/);
  assert.match(navigation, /initialAuthenticated/);
  assert.match(navigation, /MEMBERSHIP_SESSION_CHANGED_EVENT/);
  assert.match(navigation, /if \(!relevant \|\| !authenticated\) return null/);
  assert.match(navigation, /label: "Overview"/);
  assert.match(navigation, /label: "Character"/);
  assert.match(navigation, /label: "Subscription"/);
  assert.match(navigation, /label: "Library"/);
  assert.match(navigation, /label: "Notifications"/);
  assert.match(navigation, /label: "Settings"/);
  assert.doesNotMatch(navigation, /label: "Availability"/);
  assert.doesNotMatch(navigation, /label: "Sign In"/);
});

test("signed-out Account is a benefits and live availability overview", async () => {
  const accountPage = await readFile(accountPageUrl, "utf8");
  assert.match(accountPage, /getInitialAccountAuthenticated/);
  assert.match(accountPage, /accountAdmissionMode/);
  assert.match(accountPage, /if \(!authenticated\)/);
  assert.match(accountPage, /What an account gives you/);
  assert.match(accountPage, /New account availability/);
  assert.match(accountPage, /invitationOnly \? "Invitation only" : "Closed"/);
  assert.match(accountPage, /Already have an account\? Sign in/);
  assert.match(accountPage, /Check account availability/);
  assert.match(accountPage, /<dt>Subscriptions<\/dt><dd data-status="closed">Not available<\/dd>/);
  assert.doesNotMatch(accountPage, /<dt>Payments<\/dt>/);
  assert.match(accountPage, /<dd data-status="open">Open<\/dd>/);
  assert.match(accountPage, /<strong data-status="closed">/);
});

test("primary Account link does not duplicate utility or franchise destinations", async () => {
  const header = await readFile(headerUrl, "utf8");
  assert.doesNotMatch(header, /const GLOBAL_MENU_ITEMS = \[/);
  assert.doesNotMatch(header, /href: "\/search"/);
  assert.doesNotMatch(header, /href: "\/entertainment\/store"/);
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
