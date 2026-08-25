import axe from "axe-core";
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const baseUrl = process.argv[2] || "http://localhost:3100";
const outDir = process.argv[3] || "qa-screens/a11y";
const routes = ["/", "/entertainment", "/community", "/professional", "/account/create", "/account/sign-in"];
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const route of routes) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const response = await page.goto(baseUrl + route, { waitUntil: "networkidle" });
  await page.addScriptTag({ content: axe.source });
  const axeResult = await page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
  }));

  const keyboard = [];
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab");
    keyboard.push(await page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement)) return null;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName.toLowerCase(),
        name: element.getAttribute("aria-label") || element.textContent?.trim().replace(/\s+/g, " ").slice(0, 70) || null,
        visible: rect.width > 0 && rect.height > 0,
        focusVisible: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2,
      };
    }));
  }

  const touchTargets = await page.evaluate(() => [...document.querySelectorAll("a, button, input, select, textarea, summary")]
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    })
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        element: element.tagName.toLowerCase(),
        name: element.getAttribute("aria-label") || element.textContent?.trim().replace(/\s+/g, " ").slice(0, 60) || null,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    })
    .filter((target) => target.width < 44 || target.height < 44));

  if (["/", "/entertainment", "/community", "/professional"].includes(route)) {
    const fileName = route === "/" ? "home" : route.slice(1);
    await page.screenshot({ path: `${outDir}/${fileName}-1440.png`, fullPage: false });
  }

  await page.setViewportSize({ width: 720, height: 900 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(750);
  const zoomEquivalent = await page.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    mainVisible: Boolean(document.querySelector("main")),
    headingVisible: Boolean(document.querySelector("h1")),
  }));

  results.push({
    route,
    status: response?.status(),
    violations: axeResult.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      nodes: violation.nodes.length,
      targets: violation.nodes.slice(0, 5).map((node) => node.target),
    })),
    keyboard,
    undersizedTouchTargets: touchTargets.slice(0, 25),
    undersizedTouchTargetCount: touchTargets.length,
    zoomEquivalent,
  });
  await context.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));

if (results.some((result) =>
  result.status !== 200 ||
  result.violations.length > 0 ||
  result.keyboard.some((item) => item && (!item.visible || !item.focusVisible)) ||
  result.undersizedTouchTargetCount > 0 ||
  result.zoomEquivalent.horizontalOverflow ||
  !result.zoomEquivalent.mainVisible ||
  !result.zoomEquivalent.headingVisible
)) {
  process.exitCode = 1;
}
