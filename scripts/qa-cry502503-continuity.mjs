import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.argv[2] || "http://127.0.0.1:3503";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Sandbox verification is local-only");
const browser = await chromium.launch();
const context = await browser.newContext();
const checks = [];
try {
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(90000);
  await page.goto(base + "/", { waitUntil: "networkidle" });
  assert.equal(await page.getByRole("link", { name: "Explore What's Here", exact: true }).getAttribute("href"), "/entertainment");
  assert.equal(await page.getByRole("link", { name: "Enter Community", exact: true }).getAttribute("href"), "/community");
  checks.push("Homepage v2 public handoff destinations");
  await page.goto(base + "/community", { waitUntil: "networkidle" });
  assert.equal(await page.getByRole("link", { name: "Sign in to My Home", exact: true }).isVisible(), true);
  assert.equal(await page.getByRole("navigation", { name: "Authenticated participation shortcuts" }).count(), 0);
  checks.push("Signed-out Community has Sign In and no private shortcuts");
  const session = await context.request.get(base + "/api/membership/session");
  assert.equal((await session.json()).mode, "sandbox", "Never sign into a real provider");
  assert.equal((await context.request.post(base + "/api/membership/session")).status(), 200);
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.getByRole("link", { name: "Return to My Home", exact: true }).getAttribute("href"), "/");
  assert.equal(await page.getByRole("link", { name: "Sign in to My Home", exact: true }).count(), 0);
  const shortcuts = page.getByRole("navigation", { name: "Authenticated participation shortcuts" });
  for (const [name, href] of [["My Home", "/"], ["My Library", "/library"], ["Account", "/account"]]) {
    assert.equal(await shortcuts.getByRole("link", { name }).getAttribute("href"), href);
  }
  checks.push("Server-authenticated Community has real My Home/Library/Account shortcuts");
  assert.equal((await context.request.delete(base + "/api/membership/session")).status(), 200);
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.getByRole("navigation", { name: "Authenticated participation shortcuts" }).count(), 0);
  checks.push("Sign-out removes authenticated continuation");
  console.log(JSON.stringify({ checks, result: "PASS" }, null, 2));
  await writeFile("artifacts/CRY-502-503/continuity.json", JSON.stringify({ checks, result: "PASS" }, null, 2));
} finally {
  await context.close();
  await browser.close();
}
