import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const canonicalPath = "/account/character/first-signal";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext();

try {
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(90_000);

  const directResponse = await page.goto(`${baseUrl}${canonicalPath}`, { waitUntil: "networkidle" });
  assert.equal(directResponse?.status(), 200, "First Signal direct navigation must return HTTP 200");
  assert.equal(new URL(page.url()).pathname, canonicalPath, "First Signal direct navigation must retain the canonical path");

  const refreshResponse = await page.reload({ waitUntil: "networkidle" });
  assert.equal(refreshResponse?.status(), 200, "First Signal browser refresh must return HTTP 200");
  assert.equal(new URL(page.url()).pathname, canonicalPath, "First Signal refresh must retain the canonical path");

  console.log("First Signal route E2E passed: signed-out direct navigation and browser refresh both return HTTP 200");
} finally {
  await context.close();
  await browser.close();
}
