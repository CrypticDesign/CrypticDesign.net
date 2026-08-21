import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = (process.argv[2] || "http://127.0.0.1:3100").replace(/\/$/, "");
const outputDirectory = "qa-screens/my-home";
const viewports = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "laptop-1024", width: 1024, height: 768 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "mobile-390", width: 390, height: 844 },
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch();
const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });

  const response = await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  assert.equal(response?.status(), 200);
  await page.getByRole("link", { name: "Sign in to My Home" }).waitFor();
  assert.equal(await page.getByText("Sign up", { exact: true }).count(), 0);
  const signedOutLayout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    h1Count: document.querySelectorAll("h1").length,
  }));
  assert.ok(signedOutLayout.documentWidth <= signedOutLayout.viewportWidth + 1, `${viewport.name} signed-out page overflows horizontally`);
  assert.equal(signedOutLayout.h1Count, 1);

  const signInResponse = await context.request.post(`${baseUrl}/api/membership/session`);
  assert.equal(signInResponse.status(), 200, "Local sandbox sign-in must be available for authenticated QA");
  await page.route(`${baseUrl}/api/characters`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        character: {
          id: "qa-home-character",
          name: "Home Runtime QA",
          handle: "home-runtime-qa",
          archetype: "Builder",
          bio: "Isolated browser fixture for My Home runtime presentation QA.",
          avatarRecipe: { schemaVersion: 1, rigId: "cryptic-humanoid-v1", skinTone: "copper", outfit: "signal", accent: "cyan", trait: "none" },
          presence: "offline",
          discoverable: false,
          visibility: "private",
          status: "active",
        },
      }),
    });
  });
  await page.route(`${baseUrl}/api/characters/qa-home-character/*`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Mission Control" }).waitFor();
  const runtimeHeading = page.getByRole("heading", { name: /Character view active|Character required/ });
  await runtimeHeading.waitFor();
  if (await runtimeHeading.getByText("Character view active", { exact: true }).count()) {
    await page.locator(".personal-space-panel__runtime .avatar-stage").waitFor();
  }
  await page.getByRole("navigation", { name: "Account utilities" }).waitFor();

  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => {
    const active = document.activeElement;
    const style = active ? getComputedStyle(active) : null;
    return { tag: active?.tagName ?? null, outlineStyle: style?.outlineStyle ?? null, outlineWidth: style?.outlineWidth ?? null };
  });
  assert.notEqual(focused.tag, "BODY", `${viewport.name} keyboard focus did not move`);
  assert.notEqual(focused.outlineStyle, "none", `${viewport.name} focus indicator is not visible`);

  const signedInLayout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    h1Count: document.querySelectorAll("h1").length,
    clippedControls: [...document.querySelectorAll("a,button")].filter((control) => {
      const rect = control.getBoundingClientRect();
      return rect.right > document.documentElement.clientWidth + 1 || rect.left < -1;
    }).length,
    utilityCount: document.querySelectorAll(".my-home-utility-grid a").length,
    runtimeHeading: document.querySelector(".personal-space-panel__status h2")?.textContent ?? null,
    runtimeCanvasCount: document.querySelectorAll(".personal-space-panel__runtime canvas").length,
    runtimeFallbackCount: document.querySelectorAll('.personal-space-panel__runtime .avatar-stage[data-fallback="true"]').length,
  }));
  assert.ok(signedInLayout.documentWidth <= signedInLayout.viewportWidth + 1, `${viewport.name} signed-in page overflows horizontally`);
  assert.equal(signedInLayout.h1Count, 1);
  assert.equal(signedInLayout.clippedControls, 0, `${viewport.name} has clipped controls`);
  assert.equal(signedInLayout.utilityCount, 5);
  if (signedInLayout.runtimeHeading === "Character view active") assert.equal(signedInLayout.runtimeCanvasCount + signedInLayout.runtimeFallbackCount, 1, `${viewport.name} must render the embedded Character canvas or its WebGL fallback`);
  assert.deepEqual(consoleErrors, [], `${viewport.name} emitted console errors`);

  await page.screenshot({ path: `${outputDirectory}/${viewport.name}.png`, fullPage: true });
  results.push({ viewport: viewport.name, signedOutLayout, signedInLayout, focused });
  await context.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
