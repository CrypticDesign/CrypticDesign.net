import axe from "axe-core";
import { chromium } from "playwright";

const baseUrl = (process.argv[2] || "http://127.0.0.1:3015").replace(/\/$/, "");

async function enterForge(page) {
  const response = await page.goto(`${baseUrl}/account/create-character`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => Boolean(
    document.querySelector(".character-forge")
    || [...document.querySelectorAll("button")].some((button) => button.textContent?.includes("Start local preview"))
    || document.body.textContent?.includes("Sign in to enter the Character Forge")
  ));
  const preview = page.getByRole("button", { name: "Start local preview" });
  if (await preview.isVisible().catch(() => false)) {
    await preview.click();
    await page.locator(".character-forge").waitFor();
  }
  return response?.status() ?? null;
}

async function runAxe(page) {
  await page.addScriptTag({ content: axe.source });
  const result = await page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
  }));
  return result.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => node.target),
  }));
}

async function inspectLayout(page) {
  return page.evaluate(() => {
    const undersized = [...document.querySelectorAll("a, button, input, select, textarea, summary")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          name: element.getAttribute("aria-label") || element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      })
      .filter(({ width, height }) => width < 44 || height < 44);
    return {
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      mainCount: document.querySelectorAll("main").length,
      headingCount: document.querySelectorAll("h1").length,
      undersized,
    };
  });
}

async function inspectDiscardDialog(page) {
  const activeElement = () => page.evaluate(() => {
    const element = document.activeElement;
    return {
      tag: element?.tagName.toLowerCase() ?? null,
      name: element?.getAttribute("aria-label") || element?.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) || null,
      insideDialog: Boolean(element?.closest("dialog")),
    };
  });
  await page.getByLabel("Display name").fill("Audit Persona");
  await page.getByLabel(/Handle/).fill("audit-persona");
  await page.getByRole("button", { name: "Discard draft" }).click();
  const dialog = page.getByRole("alertdialog");
  const visibleBeforeEscape = await dialog.isVisible();
  const initialFocus = await activeElement();
  await page.keyboard.press("Tab");
  const secondFocus = await activeElement();
  await page.keyboard.press("Tab");
  const thirdFocus = await activeElement();
  await page.keyboard.press("Escape");
  return {
    visibleBeforeEscape,
    initialFocus,
    secondFocus,
    thirdFocus,
    remainsAfterEscape: await dialog.isVisible(),
    restoredFocus: await activeElement(),
  };
}

const browser = await chromium.launch();
const responsive = [];
for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "zoom-200-equivalent", width: 720, height: 900 },
]) {
  const context = await browser.newContext({ viewport, reducedMotion: viewport.name === "mobile" ? "reduce" : "no-preference" });
  const page = await context.newPage();
  const status = await enterForge(page);
  responsive.push({
    viewport: viewport.name,
    status,
    layout: await inspectLayout(page),
    axeViolations: await runAxe(page),
    discardDialog: viewport.name === "desktop" ? await inspectDiscardDialog(page) : null,
  });
  await context.close();
}
await browser.close();

const noWebglBrowser = await chromium.launch({ args: ["--disable-webgl", "--disable-software-rasterizer"] });
const noWebglContext = await noWebglBrowser.newContext({ viewport: { width: 1440, height: 900 } });
const noWebglPage = await noWebglContext.newPage();
await enterForge(noWebglPage);
const noWebgl = await noWebglPage.evaluate(() => {
  const stage = document.querySelector(".avatar-stage");
  const viewport = document.querySelector(".avatar-stage__viewport");
  const live = stage?.querySelector('[aria-live="polite"]');
  const fallback = stage?.querySelector(".avatar-fallback");
  const controls = stage?.querySelector(".avatar-stage__toolbar");
  return {
    fallbackFlag: viewport?.getAttribute("data-fallback") ?? null,
    fallbackVisible: fallback ? getComputedStyle(fallback).display !== "none" : false,
    interactiveControlsVisible: controls ? getComputedStyle(controls).display !== "none" : false,
    liveAnnouncement: live?.textContent ?? null,
    stageLabel: stage?.getAttribute("aria-label") ?? null,
  };
});
await noWebglContext.close();
await noWebglBrowser.close();

console.log(JSON.stringify({ baseUrl, responsive, noWebgl }, null, 2));
