import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.argv[2] || "http://localhost:3107";
const evidenceDir = path.resolve("artifacts/CRY-507");
mkdirSync(evidenceDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

async function waitForRuntime(page, expected = "ready") {
  await page.waitForFunction((state) => document.querySelector(".experience-runtime")?.dataset.runtimeState === state, expected);
}

async function exerciseInteractive(viewport, name, hasTouch = false) {
  const context = await browser.newContext({ viewport, hasTouch, isMobile: hasTouch });
  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, "requestFullscreen", {
      configurable: true,
      value() { return Promise.reject(new DOMException("Blocked by CRY-507 QA", "NotAllowedError")); },
    });
  });
  const response = await page.goto(`${baseUrl}/entertainment`, { waitUntil: "networkidle" });
  await waitForRuntime(page);
  const before = await page.locator(".page-scene").getAttribute("data-renderer-instance");
  const beforeInteraction = await page.locator(".page-scene").getAttribute("data-interaction");
  const launch = page.getByRole("button", { name: "Fullscreen" });
  if (hasTouch) await launch.tap();
  else {
    await launch.focus();
    await launch.press("Enter");
  }
  await waitForRuntime(page, "active-embedded");
  const active = await page.locator(".experience-runtime").evaluate((element) => ({
    focused: document.activeElement === element,
    inputOwner: element.dataset.inputOwner,
    renderer: element.querySelector(".page-scene")?.getAttribute("data-renderer-instance"),
    interaction: element.querySelector(".page-scene")?.getAttribute("data-interaction"),
  }));

  await page.waitForFunction(() => document.querySelector(".experience-runtime")?.dataset.expanded === "true");
  const fallback = await page.locator(".experience-runtime").evaluate((element) => ({
    phase: element.dataset.runtimeState,
    expanded: element.dataset.expanded,
    renderer: element.querySelector(".page-scene")?.getAttribute("data-renderer-instance"),
  }));
  await page.screenshot({ path: path.join(evidenceDir, `${name}-active.png`), fullPage: false });
  await page.getByRole("button", { name: "Exit experience" }).click();
  await waitForRuntime(page, "updated");
  const focusReturned = await launch.evaluate((element) => document.activeElement === element);

  results.push({ name, status: response?.status(), before, beforeInteraction, active, fallback, focusReturned });
  await context.close();
}

await exerciseInteractive({ width: 1440, height: 900 }, "desktop-1440");
await exerciseInteractive({ width: 768, height: 1024 }, "tablet-768", true);

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/entertainment`, { waitUntil: "networkidle" });
  await waitForRuntime(page, "fallback");
  const facts = await page.evaluate(() => ({
    runtime: document.querySelector(".experience-runtime")?.getAttribute("data-runtime-state"),
    renderer: document.querySelector(".page-scene")?.getAttribute("data-renderer"),
    semanticHeading: document.querySelector("#entertainment-title")?.textContent,
    semanticAction: document.querySelector('a[href="#choose-a-mode"]')?.textContent,
  }));
  await page.screenshot({ path: path.join(evidenceDir, "mobile-390-fallback.png"), fullPage: false });
  results.push({ name: "mobile-390-fallback", ...facts });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/entertainment`, { waitUntil: "networkidle" });
  await waitForRuntime(page);
  const before = await page.locator(".page-scene").getAttribute("data-renderer-instance");
  await page.getByRole("button", { name: "Fullscreen" }).click();
  await waitForRuntime(page, "active-fullscreen");
  const fullscreenRenderer = await page.locator(".page-scene").getAttribute("data-renderer-instance");
  await page.evaluate(() => document.exitFullscreen());
  await waitForRuntime(page, "updated");
  const exitedRenderer = await page.locator(".page-scene").getAttribute("data-renderer-instance");
  results.push({ name: "fullscreen-success", before, fullscreenRenderer, exitedRenderer, returnedState: "updated" });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, "requestFullscreen", {
      configurable: true,
      value() { return Promise.reject(new DOMException("Blocked by CRY-507 QA", "NotAllowedError")); },
    });
  });
  await page.goto(`${baseUrl}/entertainment`, { waitUntil: "networkidle" });
  await waitForRuntime(page);
  await page.locator(".cs-orb").click();
  await page.locator(".cs-play").click();
  await page.waitForFunction(() => document.querySelector(".cs-root")?.getAttribute("data-playing") === "true");
  await page.getByRole("button", { name: "Fullscreen" }).click();
  await waitForRuntime(page, "active-embedded");
  await page.getByRole("button", { name: "Enable experience audio" }).click();
  const pausedForExperience = await page.locator(".cs-root").getAttribute("data-playing");
  await page.getByRole("button", { name: "Mute experience audio" }).click();
  await page.waitForFunction(() => document.querySelector(".cs-root")?.getAttribute("data-playing") === "true");
  results.push({ name: "audio-arbitration", pausedForExperience, restoredGlobalPlayer: true });
  await context.close();
}

for (const [name, setup] of [
  ["no-webgl", async (page) => page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === "webgl" || type === "webgl2") return null;
      return original.call(this, type, ...args);
    };
  })],
  ["reduced-motion", async (page) => page.emulateMedia({ reducedMotion: "reduce" })],
]) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await setup(page);
  await page.goto(`${baseUrl}/entertainment`, { waitUntil: "networkidle" });
  await waitForRuntime(page, "fallback");
  const facts = await page.evaluate(() => ({
    runtime: document.querySelector(".experience-runtime")?.getAttribute("data-runtime-state"),
    renderer: document.querySelector(".page-scene")?.getAttribute("data-renderer"),
    semanticHeading: document.querySelector("#entertainment-title")?.textContent,
    semanticAction: document.querySelector('a[href="#choose-a-mode"]')?.textContent,
  }));
  results.push({ name, ...facts });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/entertainment`, { waitUntil: "networkidle" });
  await waitForRuntime(page);
  const scene = page.locator(".page-scene");
  const renderer = await scene.getAttribute("data-renderer-instance");
  await scene.locator("canvas").evaluate((canvas) => canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true })));
  await waitForRuntime(page, "fallback");
  const lost = await scene.evaluate((element) => ({ state: element.dataset.state, lifecycle: element.dataset.lifecycle }));
  await scene.locator("canvas").evaluate((canvas) => canvas.dispatchEvent(new Event("webglcontextrestored")));
  await waitForRuntime(page, "ready");
  const restored = await scene.evaluate((element) => ({
    state: element.dataset.state,
    lifecycle: element.dataset.lifecycle,
    renderer: element.dataset.rendererInstance,
  }));
  results.push({ name: "context-loss-recovery", renderer, lost, restored });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.route(/\/images\/entertainment-hero\.png(?:\?.*)?$/, (route) => route.abort());
  await page.goto(`${baseUrl}/entertainment`, { waitUntil: "networkidle" });
  await waitForRuntime(page);
  await page.waitForFunction(() => document.querySelector(".page-scene")?.getAttribute("data-assets") === "fallback");
  const facts = await page.evaluate(() => ({
    runtime: document.querySelector(".experience-runtime")?.getAttribute("data-runtime-state"),
    renderer: document.querySelector(".page-scene")?.getAttribute("data-renderer"),
    assets: document.querySelector(".page-scene")?.getAttribute("data-assets"),
    semanticHeading: document.querySelector("#entertainment-title")?.textContent,
    semanticAction: document.querySelector('a[href="#choose-a-mode"]')?.textContent,
  }));
  results.push({ name: "asset-load-failure", ...facts });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/entertainment`, { waitUntil: "networkidle" });
  await waitForRuntime(page);
  const scene = page.locator(".page-scene");
  const instance = await scene.getAttribute("data-renderer-instance");
  const oldScene = await scene.elementHandle();
  await page.locator('header a[href="/community"]').click();
  await page.waitForURL(`${baseUrl}/community`);
  await page.waitForLoadState("networkidle");
  const disposed = await oldScene?.evaluate((element) => element.getAttribute("data-lifecycle"));
  results.push({ name: "route-cleanup", entertainmentRenderer: instance, disposed, communityScene: await page.locator(".page-scene").getAttribute("data-scene") });
  await context.close();
}

await browser.close();
writeFileSync(path.join(evidenceDir, "runtime-qa.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));

const failed = results.some((result) => {
  if (["desktop-1440", "tablet-768"].includes(result.name)) {
    return result.status !== 200 || result.beforeInteraction !== "ambient" || result.before !== result.active?.renderer || result.before !== result.fallback?.renderer || result.active?.inputOwner !== "runtime" || result.active?.interaction !== "active" || !result.active?.focused || result.fallback?.phase !== "active-embedded" || !result.focusReturned;
  }
  if (result.name === "audio-arbitration") return result.pausedForExperience !== "false" || !result.restoredGlobalPlayer;
  if (result.name === "fullscreen-success") return result.before !== result.fullscreenRenderer || result.before !== result.exitedRenderer || result.returnedState !== "updated";
  if (result.name === "no-webgl" || result.name === "reduced-motion" || result.name === "mobile-390-fallback") return result.runtime !== "fallback" || result.renderer !== "inactive" || !result.semanticHeading || !result.semanticAction;
  if (result.name === "context-loss-recovery") return result.lost?.state !== "fallback" || result.lost?.lifecycle !== "context-lost" || result.restored?.state !== "ready" || result.restored?.lifecycle !== "running" || result.renderer !== result.restored?.renderer;
  if (result.name === "asset-load-failure") return result.runtime !== "ready" || result.renderer !== "active" || result.assets !== "fallback" || !result.semanticHeading || !result.semanticAction;
  if (result.name === "route-cleanup") return result.disposed !== "disposed" || result.communityScene !== "community";
  return false;
});
if (failed) process.exitCode = 1;
