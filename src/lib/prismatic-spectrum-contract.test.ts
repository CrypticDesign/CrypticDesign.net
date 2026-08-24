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

const spectrum = [
  ["blue", "#4F8FEA"],
  ["cyan", "#4CC9D8"],
  ["periwinkle", "#7C8CE8"],
  ["lavender", "#9A86D8"],
  ["violet", "#B17AC8"],
  ["orchid", "#C978B4"],
] as const;

function assertAccentOrder(source: string, expected: readonly string[]) {
  let cursor = -1;
  for (const accent of expected) {
    const next = source.indexOf(`data-section-accent="${accent}"`, cursor + 1);
    assert.ok(next > cursor, `expected ${accent} after the previous major section accent`);
    cursor = next;
  }
}

test("the calm prismatic spectrum is centralized and keeps status hues semantic", () => {
  for (const [name, value] of spectrum) {
    assert.match(globals, new RegExp(`--cry-spectrum-${name}:${value}`));
    assert.match(globals, new RegExp(`data-section-accent="${name}"\\]\\{--section-accent:var\\(--cry-spectrum-${name}\\)`));
  }
  assert.match(globals, /--cry-accent-default:var\(--cry-spectrum-blue\)/);
  assert.match(globals, /--section-accent:var\(--cry-accent-default\)/);
  assert.match(globals, /--status-success:#34D399/);
  assert.match(globals, /--status-warning:#F6C453/);
  assert.match(globals, /--status-error:#FF6B7A/);
  assert.match(globals, /--status-open:var\(--status-success\)/);
  assert.match(globals, /--status-closed:var\(--status-error\)/);
  assert.doesNotMatch(globals, /--cry-spectrum-(?:green|yellow|red):/);
  assert.doesNotMatch(globals, /#FFD700/i);
});

test("major page sections use explicit governed accents", () => {
  assertAccentOrder(publicHome, ["blue", "cyan", "periwinkle", "lavender", "violet"]);
  assertAccentOrder(myHome, ["blue", "cyan", "periwinkle", "lavender", "violet", "orchid", "blue"]);
  assertAccentOrder(entertainment, ["cyan", "cyan", "periwinkle", "lavender"]);
  assertAccentOrder(community, ["periwinkle", "cyan", "periwinkle", "lavender", "violet", "orchid"]);
  assertAccentOrder(explore, ["blue", "cyan", "periwinkle", "lavender", "violet"]);
  assertAccentOrder(professional, ["lavender", "cyan", "periwinkle", "lavender", "violet", "orchid", "blue"]);
});

test("top-level destination accents follow the canonical progression", () => {
  for (const entry of [
    '{ href: "/", label: "Home", tone: "blue" }',
    '{ href: "/entertainment", label: "Explore", tone: "cyan" }',
    '{ href: "/community", label: "Community", tone: "periwinkle" }',
    '{ href: "/professional", label: "Professional", tone: "lavender" }',
  ]) assert.match(header, new RegExp(entry.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("destination subnavigation inherits the same canonical accent as its primary menu", () => {
  assert.match(professionalNavigation, /data-section-theme="lavender"/);
  assert.match(professionalNavigation, /data-theme="lavender"/);
  assert.match(globals, /\.professional-navigation \.entertainment-navigation__item\{--nav-accent:var\(--section-accent\)\}/);
  assert.doesNotMatch(globals, /\.professional-navigation \.entertainment-navigation__item\{--nav-accent:var\(--(?:cry-spectrum-)?magenta\)\}/);
});

test("Explore navigation and portal iconography preserve the canonical VDS", () => {
  for (const [theme, token] of [
    ["blue", "blue"],
    ["cyan", "cyan"],
    ["periwinkle", "periwinkle"],
    ["lavender", "lavender"],
    ["violet", "violet"],
    ["orchid", "orchid"],
  ]) {
    assert.match(globals, new RegExp(`item-drawer\\[data-theme="${theme}"\\][^{]*\\{--nav-accent:var\\(--cry-spectrum-${token}\\)`));
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
