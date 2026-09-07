import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, webkit } from "playwright";
import axe from "axe-core";

const base = (process.argv[2] || "https://demo.crypticdesign.net").replace(/\/$/, "");
const output = process.argv[3] || "artifacts/CRY-505/integrated-live";
await mkdir(output, { recursive: true });

const routes = ["/", "/entertainment", "/entertainment/explore", "/community", "/account/create", "/account/sign-in"];
const engines = { chromium, webkit };
const results = [];
const errors = [];

for (const [engineName, engine] of Object.entries(engines)) {
  const browser = await engine.launch();
  const viewports = engineName === "chromium"
    ? [{ name: "mobile-390", width: 390, height: 844 }, { name: "tablet-768", width: 768, height: 1024 }, { name: "desktop-1440", width: 1440, height: 900 }]
    : [{ name: "desktop-1440", width: 1440, height: 900 }];

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    for (const route of routes) {
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", error => pageErrors.push(error.message));
      const response = await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 90000 });
      await page.waitForTimeout(750);
      const facts = await page.evaluate(() => ({
        title: document.title,
        h1Count: document.querySelectorAll("h1").length,
        hasMain: Boolean(document.querySelector("main")),
        canonical: document.querySelector('link[rel="canonical"]')?.href || null,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        mainText: document.querySelector("main")?.innerText || "",
        links: [...document.querySelectorAll("main a")].map(a => ({ text: a.textContent.trim().replace(/\s+/g, " "), href: a.getAttribute("href") })),
      }));
      await page.addScriptTag({ content: axe.source });
      const violations = await page.evaluate(async () => (await window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
      })).violations.map(v => ({ id: v.id, impact: v.impact, targets: v.nodes.map(n => n.target) })));

      const check = (condition, message) => { if (!condition) errors.push(`${engineName}/${viewport.name}${route}: ${message}`); };
      check(response?.status() === 200, `HTTP ${response?.status()}`);
      check(facts.h1Count === 1 && facts.hasMain, "semantic main/H1 contract");
      const canonicalPath = facts.canonical ? new URL(facts.canonical).pathname : null;
      check(canonicalPath === route, `canonical ${facts.canonical}`);
      check(!facts.overflow, "horizontal overflow");
      check(pageErrors.length === 0, `page errors ${JSON.stringify(pageErrors)}`);
      check(violations.length === 0, `WCAG violations ${JSON.stringify(violations)}`);

      if (route === "/") {
        check(facts.links.some(l => l.text === "Explore What's Here" && l.href === "/entertainment"), "Entertainment handoff");
        check(facts.links.some(l => l.text === "Enter Community" && l.href === "/community"), "Community handoff");
        check(facts.links.some(l => l.text === "Request Access" && l.href === "/account/create"), "Request Access handoff");
        check(facts.links.some(l => l.text === "Sign In" && l.href === "/account/sign-in"), "Sign In handoff");
      }
      if (route === "/entertainment") {
        for (const label of ["Arcade", "Music", "Video"]) check(facts.mainText.includes(label), `${label} hierarchy`);
        check(!/Popular now|live mix|trending/i.test(facts.mainText), "unsupported popularity/live claim");
      }
      if (route === "/community") {
        check(/opening in stages/i.test(facts.mainText), "staged availability disclosure");
        check(!/happening now/i.test(facts.mainText), "unsupported live-activity claim");
        if (engineName === "chromium" && viewport.name === "desktop-1440") {
          check(facts.links.some(l => l.href === "/account/create"), "missing required journey handoff to Request Access");
        }
      }
      if (route === "/account/create") {
        check(await page.locator("input[name=email][type=email][required]").count() === 1, "required email field");
        check(await page.locator("input[type=password],input[name=payment]").count() === 0, "no password/payment fields");
        if (engineName === "chromium" && viewport.name === "desktop-1440") {
          await page.locator("input[name=email]").fill("qa-sprint42@example.com");
          await page.locator("input[name=name]").fill("Sprint 42 QA");
          await page.locator("select[name=interest]").selectOption({ index: 1 });
          await page.getByRole("button", { name: "Prepare Access Request" }).click();
          const prepared = await page.getByRole("link", { name: "Reopen prepared email" }).getAttribute("href");
          check(prepared?.startsWith("mailto:") && prepared.includes("qa-sprint42%40example.com"), "prepared mail-client handoff");
        }
      }

      let screenshot = null;
      if (engineName === "chromium" && ["mobile-390", "desktop-1440"].includes(viewport.name) && ["/", "/entertainment", "/community", "/account/create"].includes(route)) {
        const slug = route === "/" ? "home" : route.slice(1).replaceAll("/", "-");
        screenshot = `${output}/${slug}-${viewport.name}.png`;
        await page.screenshot({ path: screenshot, fullPage: true });
      }
      results.push({ engine: engineName, viewport: viewport.name, route, status: response?.status(), facts: { ...facts, mainText: undefined }, violations, pageErrors, screenshot });
      await page.close();
    }
    await context.close();
  }
  await browser.close();
}

const evidence = { generatedAt: new Date().toISOString(), base, engines: Object.keys(engines), routes, checks: results.length, errors, pass: errors.length === 0, results };
await writeFile(`${output}/results.json`, JSON.stringify(evidence, null, 2) + "\n");
console.log(JSON.stringify({ pass: evidence.pass, checks: evidence.checks, errors, evidence: `${output}/results.json` }, null, 2));
if (!evidence.pass) process.exitCode = 1;
