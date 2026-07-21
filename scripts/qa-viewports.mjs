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

  // Measure the channel rail: is it one row, and is it scrollable?
  const rail = await page.evaluate(() => {
    const el = document.querySelector(".channel-rail");
    if (!el) return null;
    const links = [...el.querySelectorAll("a")];
    const tops = new Set(links.map((a) => Math.round(a.getBoundingClientRect().top)));
    return {
      rows: tops.size,
      itemCount: links.length,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollable: el.scrollWidth > el.clientWidth + 1,
      minLinkHeight: Math.min(...links.map((a) => Math.round(a.getBoundingClientRect().height))),
      lastItemVisible:
        links.length > 0 &&
        links[links.length - 1].getBoundingClientRect().right <= el.getBoundingClientRect().right + 1,
    };
  });

  await page.screenshot({ path: `${outDir}/${vp.name}.png`, fullPage: false });
  results.push({ viewport: vp.name, rail });
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
