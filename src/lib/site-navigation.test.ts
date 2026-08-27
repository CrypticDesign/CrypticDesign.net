import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getPrimaryNavigationIdentity,
  isPrimaryNavigationActive,
  shouldShowTopBreadcrumb,
} from "./site-navigation.ts";

test("compact header identifies routes independently of content accents", () => {
  for (const [path, label, tone] of [
    ["/", "Home", "blue"],
    ["/entertainment", "Play", "cyan"],
    ["/entertainment/music", "Play", "cyan"],
    ["/audio/rooms", "Play", "cyan"],
    ["/products/singularis", "Play", "cyan"],
    ["/releases/latest", "Play", "cyan"],
    ["/community/events", "Community", "indigo"],
    ["/professional/services", "Professional", "violet"],
    ["/search", "Search", "blue"],
    ["/account/sign-in", "Account", "blue"],
    ["/library", "Account", "blue"],
    ["/community-other", "Menu", "blue"],
  ]) assert.deepEqual(getPrimaryNavigationIdentity(path), { label, tone });
  assert.deepEqual(getPrimaryNavigationIdentity("/", true), { label: "My Home", tone: "indigo" });
  assert.deepEqual(getPrimaryNavigationIdentity("/entertainment", true), { label: "Play", tone: "cyan" });
});

test("compact navigation includes narrow desktops and preserves larger layouts", async () => {
  const header = await readFile(new URL("../components/SiteHeader.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/responsive.css", import.meta.url), "utf8");
  assert.match(header, /aria-expanded=\{mobileMenuOpen\} aria-controls="primary-navigation"/);
  assert.match(header, /id="primary-navigation" aria-label="Primary"/);
  assert.match(header, /event.key === "Escape" && mobileMenuOpen/);
  assert.match(header, /menuToggleRef.current\?\.focus\(\)/);
  assert.match(header, /setMobileMenuOpen\(false\); \}, \[pathname\]/);
  assert.match(header, /event.target.closest\("a"\)/);
  assert.match(header, /compactViewport.removeEventListener\("change", closeOnResize\)/);
  assert.match(header, /document.removeEventListener\("pointerdown", closeOutside\)/);
  assert.match(css, /@media \(max-width: 1100px\) \{\s*:root \{ --site-header-height: 64px;/);
  assert.match(header, /window.matchMedia\("\(max-width: 1100px\)"\)/);
  assert.match(css, /\.primary-nav\[data-mobile-open="false"\] \{ display: none !important;/);
  assert.match(css, /\.primary-nav \.site-primary-link--compact \{ display: none !important;/);
  assert.match(css, /100dvh - var\(--site-header-height\) - 68px/);
});

test("compact toggle reuses VDS navigation and shared icon treatment", async () => {
  const header = await readFile(new URL("../components/SiteHeader.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/responsive.css", import.meta.url), "utf8");
  assert.match(header, /className="site-primary-link site-menu-toggle"/);
  assert.match(header, /<EcosystemPortalIcon name=\{mobileMenuOpen \? "close" : "menu"\}/);
  assert.match(header, /<span>\{activeIdentity.label\}<\/span>\s*<EcosystemPortalIcon/);
  assert.match(css, /border: 0; border-left: 1px solid var\(--line-soft\)/);
  assert.match(css, /\.site-menu-toggle::after \{ background: var\(--primary-accent\)/);
  assert.doesNotMatch(css, /--menu-accent|--menu-text/);
});

test("keeps Entertainment active across its legacy and current destinations", () => {
  for (const pathname of [
    "/entertainment",
    "/entertainment/explore",
    "/products/singularis",
    "/releases/singularis-overture",
    "/audio",
  ]) {
    assert.equal(isPrimaryNavigationActive(pathname, "/entertainment"), true);
  }

  assert.equal(isPrimaryNavigationActive("/professional", "/entertainment"), false);
  assert.equal(isPrimaryNavigationActive("/", "/entertainment"), false);
});

test("treats Community as an independent primary section", () => {
  assert.equal(isPrimaryNavigationActive("/community", "/community"), true);
  assert.equal(isPrimaryNavigationActive("/community/guidelines", "/community"), true);
  assert.equal(isPrimaryNavigationActive("/entertainment", "/community"), false);
});

test("suppresses the redundant top breadcrumb on franchise roots", () => {
  assert.equal(shouldShowTopBreadcrumb("/products/singularis"), false);
  assert.equal(shouldShowTopBreadcrumb("/products/lifa/"), false);
  assert.equal(shouldShowTopBreadcrumb("/entertainment/singularis"), false);
  assert.equal(shouldShowTopBreadcrumb("/entertainment/lifa"), false);
  assert.equal(shouldShowTopBreadcrumb("/products/singularis/archive"), false);
  assert.equal(shouldShowTopBreadcrumb("/entertainment/explore"), false);
  assert.equal(shouldShowTopBreadcrumb("/audio"), false);
  assert.equal(shouldShowTopBreadcrumb("/professional/articles"), true);
});

test("isolates development manifests from production builds", async () => {
  const config = await readFile(new URL("../../next.config.ts", import.meta.url), "utf8");
  assert.match(config, /distDir: process\.env\.NODE_ENV === "development" \? "\.next-dev" : "\.next"/);
});
