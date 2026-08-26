import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("route sections share one mobile disclosure, with links instead of nested summaries", async () => {
  for (const name of ["Entertainment", "Community", "Professional", "Account"]) {
    assert.match(await source(`../components/${name}Navigation.tsx`), /<ResponsiveSectionNavigation/);
  }
  const shared = await source("../components/ResponsiveSectionNavigation.tsx");
  assert.match(shared, /<details className="entertainment-navigation__menu"/);
  assert.match(shared, /key=\{`\$\{pathname\}:\$\{current\}`\}/);
  assert.match(shared, /removeAttribute\("open"\)/);
  assert.match(await source("../components/EntertainmentNavigation.tsx"), /surface === "desktop" &&/);
});

test("responsive contracts are loaded after legacy page CSS", async () => {
  const layout = await source("../app/layout.tsx");
  assert.ok(layout.indexOf('import "./responsive.css"') > layout.indexOf('import "./singularis.css"'));
  const css = await source("../app/responsive.css");
  assert.match(css, /--site-header-height: 64px/);
  assert.match(css, /height: 48px; min-height: 48px !important/);
  assert.match(css, /\.section-heading \{ display: grid/);
  assert.match(css, /\.entertainment-navigation__menu:not\(\[open\]\) > nav/);
});

test("mobile player reserves space and immersive game view hides its dock", async () => {
  const css = await source("../app/responsive.css");
  assert.match(css, /body:has\(\.cs-root\) \{ padding-bottom: calc\(68px/);
  assert.match(css, /body:has\(\.sin-cgs__runtime--expanded\) \.cs-root \{ display: none; \}/);
  assert.match(css, /flex: 0 0 48px; width: 48px; height: 48px/);
});

test("fullscreen game grows between its toolbar and status without overlay controls", async () => {
  const css = await source("../app/responsive.css");
  assert.match(css, /grid-template-rows: auto minmax\(0, 1fr\) auto/);
  assert.match(css, /height: 100dvh; min-height: 0 !important/);
  const game = await source("../components/SingularisGamespace.tsx");
  assert.match(game, /sin-cgs__runtime-head[^\n]+\{fullscreenButton\}<\/div>/);
  const runtime = await source("../../public/games/singularis/v05/index.html");
  assert.match(runtime, /justify-content:safe center;overflow-y:auto/);
  assert.match(runtime, /\.screen>\*\{flex-shrink:0/);
  assert.match(runtime, /'s-title'\)\.addEventListener\('click'/);
  assert.match(runtime, /'s-brief'\)\.addEventListener\('click'/);
});
