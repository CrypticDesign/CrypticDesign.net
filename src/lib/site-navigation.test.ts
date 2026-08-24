import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  isPrimaryNavigationActive,
  shouldShowTopBreadcrumb,
} from "./site-navigation.ts";

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
