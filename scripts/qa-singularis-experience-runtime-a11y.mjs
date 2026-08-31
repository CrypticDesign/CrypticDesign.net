import axe from "axe-core";
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const baseUrl = process.argv[2] || "http://localhost:3112";
const evidenceDir = path.resolve("artifacts/CRY-431");
mkdirSync(evidenceDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${baseUrl}/products/singularis`, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.querySelector(".experience-runtime")?.getAttribute("data-runtime-state") === "ready");
await page.addScriptTag({ content: axe.source });

async function audit(state) {
  const result = await page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
  }));
  const controls = await page.locator(".sin-cgs button:visible").evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { name: element.textContent?.trim(), width: Math.round(rect.width), height: Math.round(rect.height) };
  }));
  return {
    state,
    violations: result.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length })),
    undersizedControls: controls.filter(({ width, height }) => width < 44 || height < 44),
  };
}

const results = [await audit("ready")];
await page.getByRole("button", { name: "Play Training Simulation" }).click();
await page.waitForFunction(() => document.querySelector(".experience-runtime")?.getAttribute("data-runtime-state") === "active-embedded");
results.push(await audit("active-embedded"));

await browser.close();
writeFileSync(path.join(evidenceDir, "runtime-accessibility.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => result.violations.length || result.undersizedControls.length)) process.exitCode = 1;
