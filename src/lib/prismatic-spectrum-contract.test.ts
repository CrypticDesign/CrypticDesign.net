import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const globals = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const header = readFileSync(new URL("../components/SiteHeader.tsx", import.meta.url), "utf8");
const publicHome = readFileSync(new URL("../components/PublicHome.tsx", import.meta.url), "utf8");
const myHome = readFileSync(new URL("../components/MyHomeDashboard.tsx", import.meta.url), "utf8");
const community = readFileSync(new URL("../app/community/page.tsx", import.meta.url), "utf8");
const entertainment = readFileSync(new URL("../app/entertainment/page.tsx", import.meta.url), "utf8");
const explore = readFileSync(new URL("../app/entertainment/explore/page.tsx", import.meta.url), "utf8");
const professional = readFileSync(new URL("../app/professional/page.tsx", import.meta.url), "utf8");
const professionalNavigation = readFileSync(new URL("../components/ProfessionalNavigation.tsx", import.meta.url), "utf8");
const communityNavigation = readFileSync(new URL("../components/CommunityNavigation.tsx", import.meta.url), "utf8");

const spectrum = [
  ["blue", "#1E90FF"],
  ["cyan", "#00DFFF"],
  ["indigo", "#6F7BFF"],
  ["violet", "#9400D3"],
  ["magenta", "#FF33CC"],
] as const;

function assertAccentOrder(source: string, expected: readonly string[]) {
  let cursor = -1;
  for (const accent of expected) {
    const next = source.indexOf(`data-section-accent="${accent}"`, cursor + 1);
    assert.ok(next > cursor, `expected ${accent} after the previous major section accent`);
    cursor = next;
  }
}

test("the vivid nonsemantic spectrum is centralized and keeps status hues semantic", () => {
  for (const [name, value] of spectrum) {
    assert.match(globals, new RegExp(`--cry-accent-${name}:${value}`));
    assert.match(globals, new RegExp(`data-section-accent="${name}"\\]\\{--section-accent:var\\(--cry-accent-${name}\\)`));
  }
  assert.match(globals, /--cry-accent-default:var\(--cry-accent-blue\)/);
  assert.match(globals, /--target-min:44px/);
  assert.match(globals, /\.button\{min-height:46px\}/);
  assert.match(globals, /--section-accent-strong:var\(--section-accent\)/);
  assert.match(globals, /--section-accent-border:color-mix\(in srgb,var\(--section-accent\) 72%,transparent\)/);
  assert.match(globals, /--section-accent-glow:color-mix\(in srgb,var\(--section-accent\) 28%,transparent\)/);
  assert.match(globals, /--section-accent-surface:color-mix\(in srgb,var\(--section-accent\) 10%,transparent\)/);
  assert.match(globals, /--status-success:#34D399/);
  assert.match(globals, /--status-warning:#F6C453/);
  assert.match(globals, /--status-error:#FF6B7A/);
  assert.match(globals, /--status-open:var\(--status-success\)/);
  assert.match(globals, /--status-closed:var\(--status-error\)/);
  assert.doesNotMatch(globals, /--cry-accent-(?:green|yellow|red):/);
  assert.doesNotMatch(globals, /--cry-spectrum-/);
});

test("major page sections use explicit governed accents", () => {
  assertAccentOrder(publicHome, ["blue", "cyan", "indigo", "violet", "magenta"]);
  assertAccentOrder(myHome, ["indigo", "violet", "magenta", "blue", "cyan", "indigo", "indigo"]);
  assertAccentOrder(entertainment, ["cyan", "indigo", "violet", "magenta"]);
  assertAccentOrder(community, ["indigo", "blue", "cyan", "magenta", "indigo", "blue"]);
  assertAccentOrder(explore, ["cyan", "indigo", "violet", "magenta", "blue"]);
  assertAccentOrder(professional, ["violet", "magenta", "blue", "cyan", "indigo", "violet", "magenta"]);
});

test("top-level destination accents follow the canonical progression", () => {
  for (const entry of [
    '{ href: "/", label: "Home", tone: "blue" }',
    '{ href: "/entertainment", label: "Explore", tone: "cyan" }',
    '{ href: "/community", label: "Community", tone: "indigo" }',
    '{ href: "/professional", label: "Professional", tone: "violet" }',
  ]) assert.match(header, new RegExp(entry.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("destination subnavigation inherits the same canonical accent as its primary menu", () => {
  assert.match(professionalNavigation, /data-section-theme="violet"/);
  assert.match(professionalNavigation, /data-theme="violet"/);
  assert.match(globals, /\.professional-navigation \.entertainment-navigation__item\{--nav-accent:var\(--section-accent\)\}/);
  assert.match(globals, /\.professional-navigation\{--section-accent:var\(--cry-accent-violet\)/);
  assert.match(globals, /\.community-navigation\{--section-accent:var\(--cry-accent-indigo\);border-bottom-color:var\(--section-accent\)/);
  assert.match(communityNavigation, /data-section-theme="indigo"/);
  assert.doesNotMatch(communityNavigation, /magenta|data-social-accent/);
});

test("Community uses Indigo for identity and Magenta only for social emphasis", () => {
  assert.match(community, /community-portal__hero" data-section-accent="indigo"/);
  assert.match(community, /community-explore__activity" data-section-accent="magenta"/);
  assert.match(community, /community-explore-card community-explore-card--social/);
  assert.match(globals, /\.community-portal__hero-content \.display-title em\{color:var\(--cry-accent-magenta\)\}/);
  assert.match(globals, /\.community-primary-cta\{border-color:var\(--cry-accent-blue\);background:var\(--cry-accent-blue\)/);
  assert.match(globals, /\.community-navigation \.entertainment-navigation__item\{--nav-accent:var\(--cry-accent-indigo\)\}/);
});

test("Explore navigation and portal iconography preserve the canonical VDS", () => {
  for (const theme of ["blue", "cyan", "indigo", "violet", "magenta"]) {
    assert.match(globals, new RegExp(`item-drawer\\[data-theme="${theme}"\\][^{]*\\{--nav-accent:var\\(--cry-accent-${theme}\\)`));
  }
  assert.match(globals, /\.portal-feature__icon,\.portal-entry__icon\{[^}]*width:48px[^}]*border:0[^}]*border-radius:0[^}]*background:transparent[^}]*drop-shadow/);
  assert.match(globals, /\.portal-feature__icon svg,\.portal-entry__icon svg,\.portal-utility svg\{width:34px;height:34px;fill:none;stroke:currentColor/);
});

test("refactored major pages no longer hard-code legacy section accents", () => {
  const refactored = [header, publicHome, myHome, community, explore, professional].join("\n");
  assert.doesNotMatch(refactored, /data-section-accent="(?:green|yellow|red)"/);
  assert.doesNotMatch(refactored, /#(?:FFD400|ED00A8|00E5FF|55A7FF|9B5CFF)/i);
  assert.match(globals, /\.service-card__copy\{[^}]*border-top:3px solid var\(--section-accent\)/);
  assert.doesNotMatch(globals, /\.service-card:nth-child/);
});
