import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.argv[2] || "http://localhost:3112";
const evidenceDir = path.resolve("artifacts/CRY-431");
mkdirSync(evidenceDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

async function waitForRuntime(page, phase) {
  await page.waitForFunction((expected) => document.querySelector('[data-runtime-id="singularis:continuous-gamespace:v1"]')?.getAttribute("data-runtime-state") === expected, phase);
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const response = await page.goto(`${baseUrl}/products/singularis`, { waitUntil: "networkidle" });
  await waitForRuntime(page, "ready");
  const surface = page.locator(".sin-cgs__runtime");
  const surfaceHandle = await surface.elementHandle();
  const initial = await page.locator(".experience-runtime--custom").evaluate((element) => ({
    runtimeId: element.getAttribute("data-runtime-id"),
    controls: element.querySelectorAll(":scope > .experience-runtime__controls").length,
    fullscreenLabel: element.querySelector(".sin-cgs__fullscreen")?.textContent?.trim(),
    audioLabel: element.querySelector(".sin-cgs__audio")?.textContent?.trim(),
  }));

  await page.getByRole("button", { name: "Enable audio" }).click();
  const audioEnabled = await page.locator(".experience-runtime--custom").getAttribute("data-audio-muted");
  await page.getByRole("button", { name: "Play Training Simulation" }).click();
  await page.waitForSelector(".sin-cgs--training");
  await waitForRuntime(page, "active-embedded");
  await page.getByRole("button", { name: "Open universe view fullscreen" }).click();
  await waitForRuntime(page, "active-fullscreen");
  const fullscreenOwner = await page.evaluate(() => document.fullscreenElement?.getAttribute("data-runtime-id"));
  const sameSurfaceInFullscreen = await surfaceHandle?.evaluate((element) => element.isConnected);
  await page.evaluate(() => document.exitFullscreen());
  await waitForRuntime(page, "active-embedded");
  const sameSurfaceAfterExit = await surfaceHandle?.evaluate((element) => element.isConnected);
  await page.getByRole("button", { name: "Complete training" }).click();
  await page.getByRole("button", { name: "Continue to Pilot Preparation" }).click();
  await waitForRuntime(page, "updated");

  results.push({
    name: "desktop-shared-runtime",
    http: response?.status(),
    initial,
    audioEnabled,
    fullscreenOwner,
    sameSurfaceInFullscreen,
    sameSurfaceAfterExit,
    returnedState: "updated",
  });
  await context.close();
}

for (const [name, viewport, mobile] of [
  ["desktop-fullscreen-fallback", { width: 1280, height: 800 }, false],
  ["mobile-fullscreen-fallback", { width: 390, height: 844 }, true],
]) {
  const context = await browser.newContext({ viewport, hasTouch: mobile, isMobile: mobile });
  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, "requestFullscreen", {
      configurable: true,
      value() { return Promise.reject(new DOMException("Blocked by CRY-431 QA", "NotAllowedError")); },
    });
  });
  await page.goto(`${baseUrl}/products/singularis`, { waitUntil: "networkidle" });
  await waitForRuntime(page, "ready");
  const surface = page.locator(".sin-cgs__runtime");
  const surfaceHandle = await surface.elementHandle();
  await page.getByRole("button", { name: "Play Training Simulation" }).click();
  await page.waitForSelector(".sin-cgs--training");
  await waitForRuntime(page, "active-embedded");
  await page.getByRole("button", { name: "Open universe view fullscreen" }).click();
  await page.waitForFunction(() => document.querySelector('[data-runtime-id="singularis:continuous-gamespace:v1"]')?.getAttribute("data-expanded") === "true");
  const expanded = await page.locator(".experience-runtime--custom").getAttribute("data-expanded");
  const sameSurfaceExpanded = await surfaceHandle?.evaluate((element) => element.isConnected);
  await page.getByRole("button", { name: "Exit fullscreen universe view" }).click();
  await page.waitForFunction(() => document.querySelector('[data-runtime-id="singularis:continuous-gamespace:v1"]')?.getAttribute("data-expanded") === "false");
  results.push({ name, expanded, sameSurfaceExpanded, collapsed: true });
  await context.close();
}

await browser.close();
writeFileSync(path.join(evidenceDir, "runtime-integration.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));

const failed = results.some((result) => {
  if (result.name === "desktop-shared-runtime") {
    return result.http !== 200
      || result.initial?.runtimeId !== "singularis:continuous-gamespace:v1"
      || result.initial?.controls !== 0
      || result.initial?.fullscreenLabel !== "Fullscreen"
      || result.initial?.audioLabel !== "Enable audio"
      || result.audioEnabled !== "false"
      || result.fullscreenOwner !== "singularis:continuous-gamespace:v1"
      || !result.sameSurfaceInFullscreen
      || !result.sameSurfaceAfterExit
      || result.returnedState !== "updated";
  }
  return result.expanded !== "true" || !result.sameSurfaceExpanded || !result.collapsed;
});
if (failed) process.exitCode = 1;
