import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = (process.argv[2] || "http://127.0.0.1:3100").replace(/\/$/, "");
const outputDirectory = process.argv[3] || "artifacts/CRY-494/home-v2";
await mkdir(outputDirectory, { recursive: true });

const stages = [
  "Worlds to explore. Stories to experience. Systems that connect them.",
  "Enter something real.",
  "Choose a signal.",
  "This isn't just something to watch.",
  "Your experience doesn't have to reset every time you leave a page.",
  "Signal & Systems: Deep Space Transmission",
  "Independent worlds, experiences, and systems.",
  "We build for others, too.",
  "This is just the beginning.",
];

const modes = [
  { name: "default", reducedMotion: "no-preference", disableWebGL: false },
  { name: "reduced-motion", reducedMotion: "reduce", disableWebGL: false },
  { name: "no-webgl", reducedMotion: "no-preference", disableWebGL: true },
];

const viewports = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
];

const browser = await chromium.launch();
const results = [];

for (const mode of modes) {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, reducedMotion: mode.reducedMotion });
    if (mode.disableWebGL) {
      await context.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) {
          if (type === "webgl" || type === "webgl2" || type === "experimental-webgl") return null;
          return original.call(this, type, ...args);
        };
      });
    }

    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().includes("503")) consoleErrors.push(message.text());
    });
    const response = await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    assert.equal(response?.status(), 200);
    await page.getByRole("heading", { name: stages[0], exact: true }).waitFor();
    await page.waitForTimeout(mode.name === "default" ? 2500 : 500);

    const facts = await page.evaluate((expectedStages) => {
      const headings = [...document.querySelectorAll("h1, h2")];
      const stagePositions = expectedStages.map((stage) => {
        const heading = headings.find((item) => item.innerText.trim().replace(/\s+/g, " ") === stage);
        return { stage, found: Boolean(heading), top: heading?.getBoundingClientRect().top ?? -1 };
      });
      const scene = document.querySelector(".page-scene");
      const canonical = document.querySelector('link[rel="canonical"]');
      const ogImage = document.querySelector('meta[property="og:image"]');
      return {
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        h1Count: document.querySelectorAll("h1").length,
        stagePositions,
        scene: scene?.getAttribute("data-scene") ?? null,
        quality: scene?.getAttribute("data-quality") ?? null,
        lifecycle: scene?.getAttribute("data-lifecycle") ?? null,
        renderer: scene?.getAttribute("data-renderer") ?? null,
        state: scene?.getAttribute("data-state") ?? null,
        fallbackPoster: Boolean(scene?.querySelector("img")),
        canvasCount: scene?.querySelectorAll("canvas").length ?? 0,
        canonical: canonical?.getAttribute("href") ?? null,
        ogImage: ogImage?.getAttribute("content") ?? null,
        professionalHeroLinks: document.querySelectorAll('.public-home-portal__hero a[href="/professional"]').length,
      };
    }, stages);

    assert.equal(facts.h1Count, 1);
    assert.ok(facts.stagePositions.every((stage) => stage.found), JSON.stringify(facts.stagePositions));
    assert.deepEqual(
      [...facts.stagePositions].sort((a, b) => a.top - b.top).map((stage) => stage.stage),
      stages,
    );
    assert.ok(facts.documentWidth <= facts.viewportWidth + 1);
    assert.equal(facts.scene, "public-home");
    assert.equal(facts.fallbackPoster, true);
    assert.equal(facts.canvasCount, 1);
    assert.equal(facts.professionalHeroLinks, 0);
    assert.match(facts.canonical ?? "", /^https:\/\/crypticdesign\.net\/?$/);
    assert.match(facts.ogImage ?? "", /\/share\/home\.png$/);

    if (mode.name === "default" && viewport.name === "desktop-1440") {
      assert.equal(facts.state, "ready");
      assert.equal(facts.lifecycle, "running");
      assert.equal(facts.renderer, "active");
    } else {
      assert.equal(facts.quality, "low");
      assert.equal(facts.lifecycle, "static");
      assert.equal(facts.renderer, "inactive");
    }

    await page.keyboard.press("Tab");
    const focus = await page.evaluate(() => {
      const element = document.activeElement;
      const style = element ? getComputedStyle(element) : null;
      return {
        tag: element?.tagName ?? null,
        outlineStyle: style?.outlineStyle ?? null,
        outlineWidth: style?.outlineWidth ?? null,
      };
    });
    assert.notEqual(focus.tag, "BODY");
    assert.notEqual(focus.outlineStyle, "none");
    assert.ok(parseFloat(focus.outlineWidth ?? "0") >= 2);
    assert.deepEqual(consoleErrors, []);

    const routes = [
      "/entertainment",
      "/community",
      "/products/singularis",
      "/products/lifa",
      "/releases/singularis-themes-vol-1",
      "/releases/visual-study-01",
      "/community/creators",
      "/community/groups",
      "/community/events",
      "/account/create",
      "/account/sign-in",
      "/professional",
    ];
    const routeStatuses = mode.name === "default" && viewport.name === "desktop-1440"
      ? Object.fromEntries(await Promise.all(routes.map(async (route) => [route, (await context.request.get(`${baseUrl}${route}`)).status()])))
      : {};
    assert.ok(Object.values(routeStatuses).every((status) => status === 200));

    const screenshot = `${outputDirectory}/${mode.name}-${viewport.name}.png`;
    await page.screenshot({ path: screenshot, fullPage: true });
    results.push({ mode: mode.name, viewport: viewport.name, facts, focus, consoleErrors, routeStatuses, screenshot });
    await context.close();
  }
}

await browser.close();
const evidencePath = `${outputDirectory}/results.json`;
await writeFile(evidencePath, JSON.stringify(results, null, 2));
console.log(JSON.stringify({ evidencePath, results }, null, 2));
