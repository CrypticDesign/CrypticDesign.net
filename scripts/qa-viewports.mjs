// CRY-320 QA tooling: capture a route at fixed viewports and report layout facts.
// Usage: node scripts/qa-viewports.mjs [path] [baseUrl]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const path = process.argv[2] || "/entertainment";
const base = process.argv[3] || "http://localhost:3000";
const outDir = "qa-screens";
await mkdir(outDir, { recursive: true });

const viewports = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

const browser = await chromium.launch();
const results = [];

for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(base + path, { waitUntil: "networkidle" });

  // Measure CRY-413 navigation: destinations must not depend on horizontal scrolling.
  const trigger = page.locator(".entertainment-navigation__menu > summary");
  const triggerVisible = await trigger.isVisible();
  if (triggerVisible) {
    await trigger.focus();
    await trigger.press("Enter");
  }
  const keyboardOpened = triggerVisible
    ? await page.locator(".entertainment-navigation__menu").evaluate((menu) => menu.open)
    : null;
  const navigationSelector = triggerVisible
    ? ".entertainment-navigation__menu-panel"
    : ".entertainment-navigation__bar";
  await page.locator(navigationSelector).scrollIntoViewIfNeeded();
  const navigation = await page.evaluate(() => {
    const mobileMenu = document.querySelector(".entertainment-navigation__menu");
    const mobileVisible = mobileMenu && getComputedStyle(mobileMenu).display !== "none";
    const el = document.querySelector(
      mobileVisible
        ? ".entertainment-navigation__menu-panel"
        : ".entertainment-navigation__bar",
    );
    if (!el) return null;
    const links = [
      ...el.querySelectorAll(
        ":scope > .entertainment-navigation__item, :scope > details > summary.entertainment-navigation__item",
      ),
    ];
    const tops = new Set(links.map((item) => Math.round(item.getBoundingClientRect().top)));
    return {
      rows: tops.size,
      itemCount: links.length,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      horizontallyScrollable: el.scrollWidth > el.clientWidth + 1,
      minLinkHeight: Math.min(...links.map((a) => Math.round(a.getBoundingClientRect().height))),
      allItemsVisible: links.every((link) => {
        const rect = link.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }),
      currentLabel: el.querySelector('.entertainment-navigation__item[aria-current="page"] strong')?.textContent?.trim() ?? null,
    };
  });

  await page.screenshot({ path: `${outDir}/${vp.name}.png`, fullPage: false });
  results.push({ viewport: vp.name, triggerVisible, keyboardOpened, navigation });
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
