import { writeFile } from "node:fs/promises";
import { chromium, firefox, webkit } from "playwright";

const base = (process.argv[2] || "http://127.0.0.1:3100").replace(/\/$/, "");
const requestedEngine = process.argv[3] || "all";
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((entry) => new URL(entry[1]).pathname);
const errors = [];
const routeResults = [];
const statusChecks = new Map();
const getStatus = (url) => {
  if (!statusChecks.has(url)) {
    statusChecks.set(url, fetch(url, { redirect: "manual" }).then((response) => response.status));
  }
  return statusChecks.get(url);
};

for (const route of routes) {
  const response = await fetch(base + route, { redirect: "manual" });
  const html = await response.text();
  const links = [...html.matchAll(/href=["']([^"'#?]+)["']/g)].map((entry) => entry[1]);
  const localLinks = [...new Set(links.filter((link) => link.startsWith("/") && !link.startsWith("//")))];
  const brokenLinks = [];
  for (const link of localLinks) {
    const status = await getStatus(base + link);
    if (status >= 400) brokenLinks.push({ link, status });
  }
  const images = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/g)].map((entry) => entry[1].replaceAll("&amp;", "&"));
  const brokenImages = [];
  for (const image of [...new Set(images.filter((src) => src.startsWith("/")))]) {
    const parsed = new URL(image, base);
    const source = parsed.pathname === "/_next/image" ? parsed.searchParams.get("url") : image;
    if (!source?.startsWith("/")) continue;
    const status = await getStatus(base + source);
    if (status >= 400) brokenImages.push({ image, status });
  }
  const missingAlt = [...html.matchAll(/<img\b[^>]*>/g)].filter((entry) => !/\balt=["'][^"']*["']/i.test(entry[0])).length;
  const result = {
    route,
    status: response.status,
    title: (html.match(/<title>(.*?)<\/title>/i)?.[1] || "").length,
    description: (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] || "").length,
    canonical: /<link[^>]+rel=["']canonical["']/i.test(html),
    openGraph: /property=["']og:title["']/i.test(html) && /property=["']og:description["']/i.test(html) && /property=["']og:image["']/i.test(html),
    twitter: /name=["']twitter:card["']/i.test(html),
    images: images.length,
    brokenImages,
    missingAlt,
    brokenLinks,
  };
  routeResults.push(result);
  if (result.status !== 200) errors.push(`${route}: HTTP ${result.status}`);
  if (!result.title) errors.push(`${route}: missing title`);
  if (!result.description) errors.push(`${route}: missing meta description`);
  if (!result.canonical) errors.push(`${route}: missing canonical`);
  if (!result.openGraph) errors.push(`${route}: incomplete Open Graph metadata`);
  if (!result.twitter) errors.push(`${route}: missing Twitter card metadata`);
  if (missingAlt) errors.push(`${route}: ${missingAlt} image(s) missing alt`);
  for (const broken of brokenImages) errors.push(`${route}: image ${broken.image} returned ${broken.status}`);
  for (const broken of brokenLinks) errors.push(`${route}: ${broken.link} returned ${broken.status}`);
}

const representative = ["/", "/entertainment", "/entertainment/store", "/products/singularis", "/audio", "/professional", "/professional/case-studies", "/professional/articles", "/professional/inquiry", "/account/create", "/search", "/privacy", "/terms"];
const engines = requestedEngine === "routes" ? {} : Object.fromEntries(
  Object.entries({ chromium, firefox, webkit }).filter(([name]) => requestedEngine === "all" || requestedEngine === name),
);
const viewports = [{ name: "mobile", width: 390, height: 844 }, { name: "tablet", width: 768, height: 1024 }, { name: "desktop", width: 1440, height: 900 }];
const browserResults = [];
for (const [engineName, engine] of Object.entries(engines)) {
  let browser;
  try { browser = await engine.launch({ timeout: 60000 }); } catch (error) {
    errors.push(`${engineName}: browser unavailable (${error.message.split("\n")[0]})`);
    continue;
  }
  const engineViewports = engineName === "chromium" ? viewports : [viewports[2]];
  for (const route of representative) for (const viewport of engineViewports) {
    const page = await browser.newPage({ viewport });
    const failures = [];
    page.on("response", (response) => { if (response.status() >= 400 && !response.url().endsWith("/api/membership/session")) failures.push(`${response.status()} ${response.url()}`); });
    const response = await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 35));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(300);
    const facts = await page.evaluate(() => ({
      h1: document.querySelectorAll("h1").length,
      main: Boolean(document.querySelector("main")),
      skip: Boolean(document.querySelector('a[href="#main-content"], .skip-link')),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    }));
    const result = { engine: engineName, viewport: viewport.name, route, status: response?.status(), ...facts, failures };
    browserResults.push(result);
    if (result.status !== 200 || result.h1 !== 1 || !result.main || !result.skip || result.overflow || failures.length) errors.push(`${engineName}/${viewport.name}${route}: ${JSON.stringify(result)}`);
    await page.close();
  }
  await browser.close();
}

const evidence = { generatedAt: new Date().toISOString(), base, requestedEngine, sitemapRoutes: routes.length, routeResults, browserResults, errors, pass: errors.length === 0 };
await writeFile(`artifacts/CRY-344-sitewide-qa-${requestedEngine}.json`, JSON.stringify(evidence, null, 2));
console.log(`CRY-344 site-wide QA: ${evidence.pass ? "PASS" : "FAIL"}`);
console.log(`Sitemap routes: ${routes.length}; browser checks: ${browserResults.length}; findings: ${errors.length}`);
for (const error of errors) console.log(`- ${error}`);
if (!evidence.pass) process.exitCode = 1;
