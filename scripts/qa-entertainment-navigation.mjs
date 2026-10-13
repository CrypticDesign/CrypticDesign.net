import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.argv[2] || "http://127.0.0.1:3503";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "QA is local-only");

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();

async function assertPlacement({ route, destination, category }) {
  const response = await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  assert.equal(response?.status(), 200, `${route} should load`);
  assert.equal(
    (await page.locator('.entertainment-navigation__item[aria-current="page"] strong').first().innerText()).toLowerCase(),
    destination.toLowerCase(),
    `${route} should identify ${destination}`,
  );
  const drawer = page.locator(`nav[aria-label="${destination} drawer"]`).first();
  await assert.doesNotReject(drawer.waitFor({ state: "attached" }));
  assert.equal(await drawer.getAttribute("data-open"), "true", `${destination} drawer should be open on ${route}`);
  assert.equal(
    (await drawer.locator('a[aria-current="page"]').innerText()).toLowerCase(),
    category.toLowerCase(),
    `${route} should identify ${category}`,
  );
}

try {
  await assertPlacement({ route: "/releases/singularis-themes-vol-1", destination: "Music", category: "Singularis" });
  await assertPlacement({ route: "/releases/singularis-overture", destination: "Video", category: "Singularis" });
  await assertPlacement({ route: "/entertainment/listening-rooms", destination: "Music", category: "Collections" });

  await page.goto(`${base}/releases/singularis-themes-vol-1`, { waitUntil: "networkidle" });
  await page.locator('a[href="/entertainment#public-releases"]', { hasText: "Public Releases" }).first().waitFor();

  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  assert.equal(
    await page.getByRole("link", { name: /Watch & listen/ }).getAttribute("href"),
    "/entertainment#choose-a-mode",
  );
  assert.equal(
    await page.getByRole("link", { name: "Open the release" }).getAttribute("href"),
    "/audio?filter=cryptic-signal",
  );
} finally {
  await context.close();
  await browser.close();
}

console.log("Entertainment navigation placement QA passed.");
