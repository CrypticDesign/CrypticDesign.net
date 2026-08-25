import { chromium } from "playwright";

const baseUrl = process.argv[2] || "http://localhost:3100";
const routes = [
  ["/", "public-home"],
  ["/entertainment", "entertainment"],
  ["/community", "community"],
  ["/professional", "professional"],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const results = [];
for (const [path, expectedScene] of routes) {
  const consoleErrors = [];
  const failedResponses = [];
  const onConsole = (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  };
  const onResponse = (response) => {
    if (response.status() >= 400) failedResponses.push({ status: response.status(), url: response.url() });
  };
  page.on("console", onConsole);
  page.on("response", onResponse);
  const response = await page.goto(baseUrl + path, { waitUntil: "networkidle" });
  await page.waitForFunction(() => {
    const scene = document.querySelector(".page-scene");
    return scene?.dataset.assets === "ready";
  }, null, { timeout: 15000 });
  await page.waitForTimeout(6500);
  const facts = await page.evaluate(() => {
    const scene = document.querySelector(".page-scene");
    return {
      scene: scene?.dataset.scene,
      state: scene?.dataset.state,
      lifecycle: scene?.dataset.lifecycle,
      renderer: scene?.dataset.renderer,
      assets: scene?.dataset.assets,
      quality: scene?.dataset.quality,
      performance: scene?.dataset.performance,
      fps: Number(scene?.dataset.fps),
      adaptive: scene?.dataset.adaptive || null,
      canvas: Boolean(scene?.querySelector("canvas")),
    };
  });
  const unexpectedResponses = failedResponses.filter(({ status, url }) =>
    !(status === 503 && (url.includes("/api/membership/session") || url.includes("/api/membership/tiers"))),
  );
  results.push({ path, status: response?.status(), expectedScene, consoleErrors, failedResponses, unexpectedResponses, ...facts });
  page.off("console", onConsole);
  page.off("response", onResponse);
}
await browser.close();
console.log(JSON.stringify(results, null, 2));

if (results.some((result) => result.status !== 200 || result.scene !== result.expectedScene || result.state !== "ready" || result.lifecycle !== "running" || result.renderer !== "active" || result.assets !== "ready" || !result.canvas || !Number.isFinite(result.fps) || result.fps <= 0 || result.unexpectedResponses.length)) {
  process.exitCode = 1;
}
