import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = (process.argv[2] || "http://localhost:3100").replace(/\/$/, "");
const browser = await chromium.launch();

async function openSharedTrack(initScript) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(initScript);
  const page = await context.newPage();
  const mediaRequests = [];
  page.on("request", (request) => {
    if (/\.mp3(?:$|\?)/i.test(request.url())) mediaRequests.push(request.url());
  });
  await page.goto(`${baseUrl}/audio?track=baseline`, { waitUntil: "networkidle" });
  await page.getByRole("region", { name: "Cryptic Signal player" }).waitFor();
  return { context, page, mediaRequests };
}

try {
  const native = await openSharedTrack(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data) => { window.__crypticSharedTrack = data; },
    });
  });

  assert.equal(await native.page.locator(".cs-panel__title").textContent(), "Baseline");
  assert.equal(await native.page.locator("audio").getAttribute("src"), null);
  assert.equal(await native.page.locator("audio").evaluate((audio) => audio.paused), true);
  assert.deepEqual(native.mediaRequests, []);

  const nativeShareButton = native.page.getByRole("button", { name: "Share Baseline" });
  await nativeShareButton.click();
  const nativePayload = await native.page.evaluate(() => window.__crypticSharedTrack);
  assert.equal(nativePayload.title, "Baseline — Cryptic Signal");
  assert.match(nativePayload.text, /Listen to Baseline by Cryptic Signal/);
  assert.equal(new URL(nativePayload.url).pathname, "/audio");
  assert.equal(new URL(nativePayload.url).searchParams.get("track"), "baseline");
  assert.doesNotMatch(nativePayload.url, /\.mp3/i);
  await native.page.getByRole("status").filter({ hasText: "Track shared" }).waitFor();

  const playerBounds = await native.page.locator(".cs-panel").boundingBox();
  const toolsBounds = await native.page.locator(".cs-panel__tools").boundingBox();
  assert.ok(playerBounds && toolsBounds);
  assert.ok(toolsBounds.x >= playerBounds.x - 1);
  assert.ok(toolsBounds.x + toolsBounds.width <= playerBounds.x + playerBounds.width + 1);
  await native.context.close();

  const clipboard = await openSharedTrack(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (value) => { window.__crypticCopiedTrack = value; } },
    });
  });

  await clipboard.page.getByRole("button", { name: "Share Baseline" }).click();
  const copiedUrl = await clipboard.page.evaluate(() => window.__crypticCopiedTrack);
  assert.equal(new URL(copiedUrl).pathname, "/audio");
  assert.equal(new URL(copiedUrl).searchParams.get("track"), "baseline");
  assert.doesNotMatch(copiedUrl, /\.mp3/i);
  await clipboard.page.getByRole("status").filter({ hasText: "Track link copied" }).waitFor();
  assert.deepEqual(clipboard.mediaRequests, []);
  await clipboard.context.close();

  console.log(JSON.stringify({
    track: "Baseline",
    deepLink: "/audio?track=baseline",
    nativeShare: "passed",
    clipboardFallback: "passed",
    idleMediaRequests: 0,
    mobilePlayerToolsContained: true,
  }, null, 2));
} finally {
  await browser.close();
}
