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
  ["blue", "#1E90FF"],
  ["cyan", "#00FFFF"],
  ["green", "#00FF7F"],
  ["yellow", "#FFFF33"],
  ["magenta", "#FF33CC"],
  ["violet", "#9400D3"],
] as const;

function assertAccentOrder(source: string, expected: readonly string[]) {
  let cursor = -1;
  for (const accent of expected) {
    const next = source.indexOf(`data-section-accent="${accent}"`, cursor + 1);
    assert.ok(next > cursor, `expected ${accent} after the previous major section accent`);
    cursor = next;
  }
}

test("the canonical prismatic spectrum is centralized and defaults to Neon Blue", () => {
  for (const [name, value] of spectrum) {
    assert.match(globals, new RegExp(`--cry-spectrum-${name}:${value}`));
    assert.match(globals, new RegExp(`data-section-accent="${name}"\\]\\{--section-accent:var\\(--cry-spectrum-${name}\\)`));
  }
  assert.match(globals, /--cry-accent-default:var\(--cry-spectrum-blue\)/);
  assert.match(globals, /--section-accent:var\(--cry-accent-default\)/);
  assert.match(globals, /--status-open:#00f0a8/);
  assert.doesNotMatch(globals, /--status-open:var\(--cry-spectrum-green\)/);
  assert.doesNotMatch(globals, /#FFD700/i);
});

test("major page sections use explicit governed accents", () => {
  assertAccentOrder(publicHome, ["blue", "cyan", "green", "yellow", "magenta"]);
  assertAccentOrder(myHome, ["blue", "cyan", "green", "yellow", "magenta", "violet", "blue"]);
  assertAccentOrder(entertainment, ["cyan", "cyan", "green", "yellow"]);
  assertAccentOrder(community, ["green", "cyan", "green", "yellow", "magenta", "violet"]);
  assertAccentOrder(explore, ["blue", "cyan", "green", "yellow", "magenta"]);
  assertAccentOrder(professional, ["yellow", "cyan", "green", "yellow", "magenta", "violet", "blue"]);
});

test("top-level destination accents follow the canonical progression", () => {
  for (const entry of [
    '{ href: "/", label: "Home", tone: "blue" }',
    '{ href: "/entertainment", label: "Explore", tone: "cyan" }',
    '{ href: "/community", label: "Community", tone: "green" }',
    '{ href: "/professional", label: "Professional", tone: "yellow" }',
  ]) assert.match(header, new RegExp(entry.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("destination subnavigation inherits the same canonical accent as its primary menu", () => {
  assert.match(professionalNavigation, /data-section-theme="yellow"/);
  assert.match(professionalNavigation, /data-theme="yellow"/);
  assert.match(globals, /\.professional-navigation \.entertainment-navigation__item\{--nav-accent:var\(--section-accent\)\}/);
  assert.doesNotMatch(globals, /\.professional-navigation \.entertainment-navigation__item\{--nav-accent:var\(--(?:cry-spectrum-)?magenta\)\}/);
});

test("Explore navigation and portal iconography preserve the canonical VDS", () => {
  for (const [theme, token] of [
    ["blue", "blue"],
    ["cyan", "cyan"],
    ["green", "green"],
    ["yellow", "yellow"],
    ["magenta", "magenta"],
    ["violet", "violet"],
  ]) {
    assert.match(globals, new RegExp(`item-drawer\\[data-theme="${theme}"\\][^{]*\\{--nav-accent:var\\(--cry-spectrum-${token}\\)`));
  }
  assert.match(globals, /\.portal-feature__icon,\.portal-entry__icon\{[^}]*width:48px[^}]*border:0[^}]*border-radius:0[^}]*background:transparent[^}]*drop-shadow/);
  assert.match(globals, /\.portal-feature__icon svg,\.portal-entry__icon svg,\.portal-utility svg\{width:34px;height:34px;fill:none;stroke:currentColor/);
});

test("refactored major pages no longer hard-code legacy section accents", () => {
  const refactored = [header, publicHome, myHome, community, explore, professional].join("\n");
  assert.doesNotMatch(refactored, /#(?:FFD400|ED00A8|00E5FF|55A7FF|9B5CFF)/i);
  assert.match(globals, /\.service-card__copy\{[^}]*border-top:3px solid var\(--section-accent\)/);
  assert.doesNotMatch(globals, /\.service-card:nth-child/);
});
