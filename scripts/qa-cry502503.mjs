import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import axe from "axe-core";

const base = process.argv[2] || "http://127.0.0.1:3502";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "QA is local-only");
const out = "artifacts/CRY-502-503/browser";
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const results = [];
const errors = [];
const routes = ["/entertainment", "/community", "/entertainment/explore"];
const modes = ["default", "reduced-motion", "no-webgl", "no-js"];

try {
  for (const mode of modes) {
    for (const width of (mode === "default" ? [390, 768, 1440] : [390, 1440])) {
      for (const route of routes) {
        if (route.endsWith("/explore") && mode !== "default") continue;
        const context = await browser.newContext({
          viewport: { width, height: 900 }, reducedMotion: mode === "reduced-motion" ? "reduce" : "no-preference",
          javaScriptEnabled: mode !== "no-js",
        });
        if (mode === "no-webgl") await context.addInitScript(() => {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (type, ...args) {
            return ["webgl", "webgl2", "experimental-webgl"].includes(type) ? null : original.call(this, type, ...args);
          };
        });
        const page = await context.newPage();
        const pageErrors = [];
        page.on("pageerror", (error) => pageErrors.push(error.message));
        const response = await page.goto(base + route, { waitUntil: "networkidle" });
        const scene = page.locator(".page-scene");
        if (mode !== "no-js" && await scene.count()) {
          await page.waitForFunction(() => document.querySelector(".page-scene")?.hasAttribute("data-quality"));
        }
        const facts = await page.evaluate(() => {
          const host = document.querySelector(".page-scene");
          const rect = (selector) => {
            const box = document.querySelector(selector)?.getBoundingClientRect();
            return box ? { top: box.top, bottom: box.bottom, left: box.left, right: box.right } : null;
          };
          return {
            headingCount: document.querySelectorAll("h1").length,
            headings: [...document.querySelectorAll("main h1,main h2,main h3")].map((node) => node.textContent.trim().replace(/\s+/g, " ")),
            text: document.querySelector("main").innerText,
            overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            canonical: document.querySelector('link[rel="canonical"]')?.href,
            ogImage: document.querySelector('meta[property="og:image"]')?.content,
            twitterImage: document.querySelector('meta[name="twitter:image"]')?.content,
            scene: host ? { ...host.dataset } : null,
            poster: host ? Boolean(host.querySelector("img")?.complete && host.querySelector("img")?.naturalWidth) : null,
            heroCopy: rect(".community-portal__hero-content"),
            heroStatus: rect(".community-portal__hero-status"),
            links: [...document.querySelectorAll("main a")].map((a) => ({ text: a.textContent.trim(), href: a.getAttribute("href") })),
          };
        });
        let violations = [];
        if (mode !== "no-js") {
          await page.addScriptTag({ content: axe.source });
          const scan = await page.evaluate(() => window.axe.run(document, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
          }));
          violations = scan.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map((node) => node.target) }));
        }
        const check = (condition, description) => { if (!condition) errors.push({ route, mode, width, description }); };
        check(response.status() === 200, "HTTP 200");
        check(facts.headingCount === 1 && !facts.overflow, "One H1, no horizontal overflow");
        check(facts.canonical === "https://crypticdesign.net" + route, "Canonical");
        check(Boolean(facts.ogImage && facts.twitterImage), "Social metadata");
        check(violations.length === 0, "Axe WCAG 2.1 AA");
        check(pageErrors.length === 0, "No browser exceptions");
        if (facts.scene) {
          check(facts.poster, "Loaded static fallback poster");
          if (mode === "default" && width >= 768) check(facts.scene.renderer === "active" && facts.scene.state === "ready", "Active shared PageScene");
          else check(facts.scene.renderer === "inactive", "Static fallback without active renderer");
        }
        if (route === "/community") {
          check(!/Happening now|Explore what is happening|No governed activity stream is connected/i.test(facts.text), "No false activity scent");
          check(facts.links.every((link) => !["/community/spaces", "/library"].includes(link.href)), "Signed-out continuity and withheld Spaces");
          check(/Activity/i.test(facts.text) && /Not connected/i.test(facts.text), "Compact activity status");
          const a = facts.heroCopy, b = facts.heroStatus;
          check(a.bottom <= b.top || a.right <= b.left || b.right <= a.left, "Hero status does not overlap copy");
        }
        if (route === "/entertainment") {
          check(!/Popular now|live mix|Trending|Latest/i.test(facts.text), "No unsupported claims");
          check(facts.text.includes("Singularis Themes, Vol. 1") && /Coming soon/i.test(facts.text), "Governed focal record");
          check(["Arcade", "Music", "Video"].every((title) => facts.headings.includes(title)), "Three media hubs");
        }
        await page.screenshot({ path: out + "/" + route.slice(1).replaceAll("/", "-") + "-" + mode + "-" + width + ".png", fullPage: true });
        if (mode === "default") {
          const anchor = route === "/community" ? "See Participation Paths" : route.endsWith("/explore") ? "Browse playable catalog" : "Explore Entertainment";
          await page.getByRole("link", { name: anchor, exact: true }).first().press("Enter");
          check(new URL(page.url()).hash.length > 1, "Keyboard-operable discovery anchor");
          await page.keyboard.press("Tab");
          const focus = await page.evaluate(() => {
            const style = getComputedStyle(document.activeElement);
            return style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2;
          });
          check(focus, "Visible keyboard focus");
        }
        results.push({ route, mode, width, status: response.status(), facts, violations, pageErrors });
        await context.close();
      }
    }
  }
  const request = await browser.newContext();
  const routeChecks = [];
  for (const route of ["/", ...routes, "/community/creators", "/community/groups", "/community/events", "/audio", "/entertainment/cinema", "/products/singularis", "/products/lifa", "/releases", "/releases/singularis-themes-vol-1", "/account/sign-in", "/account/create"]) {
    const response = await request.request.get(base + route);
    routeChecks.push({ route, status: response.status() });
    if (response.status() !== 200) errors.push({ route, description: "Direct nested route HTTP 200" });
  }
  for (const [route, destination] of [
    ["/entertainment/arcade", "/entertainment/explore"],
    ["/entertainment/arcade?genre=lifa", "/entertainment/explore?genre=lifa"],
    ["/entertainment/explore?genre=singularis", "/products/singularis"],
    ["/entertainment/explore?genre=lifa", "/products/lifa"],
    ["/entertainment/explore?genre=featured", "/entertainment/explore"],
  ]) {
    const response = await request.request.get(base + route, { maxRedirects: 0 });
    const location = response.headers().location;
    routeChecks.push({ route, status: response.status(), location });
    if (![307, 308].includes(response.status()) || !location?.endsWith(destination)) errors.push({ route, description: "Compatibility redirect" });
  }
  const sitemap = await (await request.request.get(base + "/sitemap.xml")).text();
  assert.ok(routes.every((route) => sitemap.includes("https://crypticdesign.net" + route)));
  assert.ok(!sitemap.includes("/community/spaces"));
  await writeFile(out + "/routes.json", JSON.stringify(routeChecks, null, 2));
  await request.close();
} finally {
  await browser.close();
  await writeFile(out + "/results.json", JSON.stringify({ results, errors }, null, 2));
}
console.log(JSON.stringify({ cases: results.length, errors, evidence: out }, null, 2));
assert.equal(errors.length, 0, "Front-door QA failures; inspect evidence");
