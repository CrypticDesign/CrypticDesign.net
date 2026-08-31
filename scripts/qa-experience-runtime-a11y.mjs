import axe from "axe-core";
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const baseUrl = process.argv[2] || "http://localhost:3110";
const evidenceDir = path.resolve("artifacts/CRY-507/a11y");
mkdirSync(evidenceDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  Object.defineProperty(Element.prototype, "requestFullscreen", {
    configurable: true,
    value() { return Promise.reject(new DOMException("Blocked by CRY-507 accessibility QA", "NotAllowedError")); },
  });
});
await page.goto(`${baseUrl}/entertainment`, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.querySelector(".experience-runtime")?.getAttribute("data-runtime-state") === "ready");
await page.addScriptTag({ content: axe.source });

async function audit(state) {
  const result = await page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
  }));
  const controls = await page.locator(".experience-runtime button:visible").evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { name: element.textContent?.trim(), width: Math.round(rect.width), height: Math.round(rect.height) };
  }));
  return {
    state,
    violations: result.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length })),
    controls,
    undersizedControls: controls.filter(({ width, height }) => width < 44 || height < 44),
  };
}

const results = [await audit("ready")];
await page.getByRole("button", { name: "Fullscreen" }).focus();
await page.keyboard.press("Enter");
await page.waitForFunction(() => document.querySelector(".experience-runtime")?.getAttribute("data-runtime-state") === "active-embedded");
results.push(await audit("active-embedded"));

await browser.close();
writeFileSync(path.join(evidenceDir, "experience-runtime-a11y.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => result.violations.length || result.undersizedControls.length)) process.exitCode = 1;
