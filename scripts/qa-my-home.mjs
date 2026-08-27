import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = (process.argv[2] || "http://127.0.0.1:3100").replace(/\/$/, "");
const outputDirectory = "artifacts/CRY-494/runtime";
const viewports = [
  { name: "desktop-wide-1920", width: 1920, height: 1080 },
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
  page.setDefaultTimeout(90_000);
  page.setDefaultNavigationTimeout(90_000);
  const consoleErrors = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });

  const response = await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await page.getByRole("heading", { name: "Worlds to explore. Stories to experience. Systems that connect them." }).waitFor();
  await page.getByRole("link", { name: "Explore What's Here", exact: true }).waitFor();
  await page.getByRole("link", { name: "Enter Community", exact: true }).waitFor();
  await page.getByRole("heading", { name: "Enter something real.", exact: true }).waitFor();
  await page.getByRole("heading", { name: "Choose a signal.", exact: true }).waitFor();
  await page.getByRole("heading", { name: "This isn't just something to watch.", exact: true }).waitFor();
  await page.getByRole("heading", { name: "Your experience doesn't have to reset every time you leave a page.", exact: true }).waitFor();
  await page.getByRole("heading", { name: "Signal & Systems: Deep Space Transmission", exact: true }).waitFor();
  await page.getByRole("heading", { name: "Independent worlds, experiences, and systems.", exact: true }).waitFor();
  await page.getByRole("heading", { name: "We build for others, too.", exact: true }).waitFor();
  await page.getByRole("heading", { name: "This is just the beginning.", exact: true }).waitFor();
  await page.getByRole("link", { name: "Sign in to My Home" }).first().waitFor();
  assert.equal(await page.locator('.public-home-portal__hero a[href="/professional"]').count(), 0);
  assert.equal(await page.getByText("Sign up", { exact: true }).count(), 0);
  const signedOutLayout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    h1Count: document.querySelectorAll("h1").length,
    clippedControls: [...document.querySelectorAll("a,button")].filter((control) => {
      const rect = control.getBoundingClientRect();
      return rect.right > document.documentElement.clientWidth + 1 || rect.left < -1;
    }).length,
    heroHeight: document.querySelector(".public-home-portal__hero")?.getBoundingClientRect().height ?? 0,
    heroBottom: document.querySelector(".public-home-portal__hero")?.getBoundingClientRect().bottom ?? 0,
    heroContentLeft: document.querySelector(".public-home-portal__hero-content")?.getBoundingClientRect().left ?? 0,
    portalStackLeft: document.querySelector(".public-home-portal__stack")?.getBoundingClientRect().left ?? 0,
    featuredLabelTop: document.querySelector("#featured-experiences-title")?.getBoundingClientRect().top ?? 0,
    semanticSections: document.querySelectorAll(".public-home-v2__stack > section").length,
  }));
  assert.ok(signedOutLayout.documentWidth <= signedOutLayout.viewportWidth + 1, `${viewport.name} signed-out page overflows horizontally`);
  assert.equal(signedOutLayout.h1Count, 1);
  assert.equal(signedOutLayout.semanticSections, 8);
  assert.equal(signedOutLayout.clippedControls, 0, `${viewport.name} signed-out Home has clipped controls`);
  assert.ok(Math.abs(signedOutLayout.heroContentLeft - signedOutLayout.portalStackLeft) <= 1, `${viewport.name} public hero and content stack use different left rails`);
  if (viewport.width > 1100) {
    assert.ok(signedOutLayout.heroHeight <= 680, `${viewport.name} public hero is too tall (${signedOutLayout.heroHeight}px)`);
    assert.ok(signedOutLayout.featuredLabelTop >= signedOutLayout.heroBottom + 20, `${viewport.name} Featured Experiences overlaps the hero boundary`);
  }

  const communityResponse = await page.goto(`${baseUrl}/community`, { waitUntil: "domcontentloaded" });
  assert.equal(communityResponse?.status(), 200);
  await page.getByRole("heading", { name: "Find the signal. Share the journey." }).waitFor();
  await page.getByRole("heading", { name: "Happening now / Featured", exact: true }).waitFor();
  await page.getByRole("heading", { name: "No governed activity stream is connected.", exact: true }).waitFor();
  await page.getByLabel("Current community status").getByText("Community features not available yet", { exact: true }).waitFor();
  for (const label of ["Explore", "Groups", "Events", "Creators"]) {
    assert.ok(await page.locator(".community-navigation a", { hasText: label }).count() >= 1);
  }
  assert.equal(await page.locator(".community-navigation").getByText("Spaces", { exact: true }).count(), 0);
  assert.equal(await page.getByText("Join the community", { exact: true }).count(), 0);
  const communityLayout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    h1Count: document.querySelectorAll("h1").length,
    clippedControls: [...document.querySelectorAll("a,button")].filter((control) => {
      const rect = control.getBoundingClientRect();
      return rect.right > document.documentElement.clientWidth + 1 || rect.left < -1;
    }).length,
  }));
  assert.ok(communityLayout.documentWidth <= communityLayout.viewportWidth + 1, `${viewport.name} Community page overflows horizontally`);
  assert.equal(communityLayout.h1Count, 1);
  assert.equal(communityLayout.clippedControls, 0, `${viewport.name} Community has clipped controls`);

  for (const destination of [
    { path: "/community/groups", heading: "Groups with governed membership.", active: "Groups" },
    { path: "/community/events", heading: "Scheduled participation, clearly governed.", active: "Events" },
    { path: "/community/creators", heading: "Discover people through their work.", active: "Creators" },
  ]) {
    const destinationResponse = await page.goto(`${baseUrl}${destination.path}`, { waitUntil: "domcontentloaded" });
    assert.equal(destinationResponse?.status(), 200);
    await page.getByRole("heading", { name: destination.heading, exact: true }).waitFor();
    const activeCount = await page.locator('.community-navigation a[aria-current="page"]', { hasText: destination.active }).count();
    assert.ok(activeCount >= 1, `${viewport.name} ${destination.active} navigation state is not active`);
  }

  const exploreResponse = await page.goto(`${baseUrl}/entertainment/explore`, { waitUntil: "domcontentloaded" });
  assert.equal(exploreResponse?.status(), 200);
  await page.getByRole("heading", { name: "Explore the Cryptic universe." }).waitFor();
  await page.getByRole("heading", { name: "Featured experiences", exact: true }).waitFor();
  await page.getByRole("heading", { name: "Browse categories", exact: true }).waitFor();
  await page.getByRole("heading", { name: "Playable catalog", exact: true }).waitFor();
  await page.getByText("Public discovery is open.", { exact: true }).waitFor();
  assert.equal(await page.getByText(/Join now|Join the community/i).count(), 0);
  const exploreLayout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    h1Count: document.querySelectorAll("h1").length,
    clippedControls: [...document.querySelectorAll("a,button")].filter((control) => {
      const rect = control.getBoundingClientRect();
      return rect.right > document.documentElement.clientWidth + 1 || rect.left < -1;
    }).length,
  }));
  assert.ok(exploreLayout.documentWidth <= exploreLayout.viewportWidth + 1, `${viewport.name} Explore page overflows horizontally`);
  assert.equal(exploreLayout.h1Count, 1);
  assert.equal(exploreLayout.clippedControls, 0, `${viewport.name} Explore has clipped controls`);

  const signInResponse = await context.request.post(`${baseUrl}/api/membership/session`);
  assert.equal(signInResponse.status(), 200, "Local sandbox sign-in must be available for authenticated QA");
  await page.goto(`${baseUrl}/community`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Continue from your private platform state.", exact: true }).waitFor();
  await page.goto(`${baseUrl}/community/groups`, { waitUntil: "domcontentloaded" });
  const communitySessionResponse = await context.request.get(`${baseUrl}/api/membership/session`);
  assert.equal(communitySessionResponse.status(), 200);
  assert.equal((await communitySessionResponse.json()).authenticated, true, `${viewport.name} Community navigation lost authenticated identity`);
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
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
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
  results.push({ viewport: viewport.name, signedOutLayout, communityLayout, exploreLayout, signedInLayout, focused });
  await context.close();
}

await browser.close();
await writeFile(`${outputDirectory}/results.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
