// CRY-412 authenticated account-menu interaction and responsive smoke QA.
// Usage: node scripts/qa-account-menu.mjs [baseUrl]
import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.argv[2] || "http://127.0.0.1:3000";
const viewports = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

const browser = await chromium.launch();
const results = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    const signIn = await page.request.post(`${baseUrl}/api/membership/session`);
    assert.equal(signIn.status(), 200, `${viewport.name}: sandbox sign-in failed`);

    await page.goto(`${baseUrl}/account/settings`, { waitUntil: "networkidle" });
    const account = page.getByRole("button", { name: "Account" });
    await account.click();

    const menu = page.getByRole("menu", { name: "Account options" });
    await menu.waitFor();
    const items = menu.getByRole("menuitem");
    assert.equal(await items.first().textContent().then((text) => text?.trim()), "♙View Profile›", `${viewport.name}: View Profile is not first`);
    assert.equal(await items.first().getAttribute("href"), "/account/character", `${viewport.name}: profile target changed`);

    const facts = await page.evaluate(() => {
      const trigger = document.querySelector(".account-menu__trigger");
      const primaryLink = document.querySelector('.primary-nav a[href="/"]');
      const panel = document.querySelector(".account-menu__panel");
      const menuItems = [...document.querySelectorAll(".account-menu__item")];
      if (!trigger || !primaryLink || !panel) throw new Error("Account menu elements missing");
      const triggerType = getComputedStyle(trigger);
      const primaryType = getComputedStyle(primaryLink);
      const panelBox = panel.getBoundingClientRect();
      return {
        typographyMatches: triggerType.fontFamily === primaryType.fontFamily
          && triggerType.fontSize === primaryType.fontSize
          && triggerType.fontWeight === primaryType.fontWeight,
        panelInsideViewport: panelBox.left >= 0 && panelBox.right <= window.innerWidth,
        minimumTargetHeight: Math.min(...menuItems.map((item) => item.getBoundingClientRect().height)),
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });

    assert.equal(facts.typographyMatches, true, `${viewport.name}: Account typography differs from primary navigation`);
    assert.equal(facts.panelInsideViewport, true, `${viewport.name}: menu leaves viewport`);
    assert.ok(facts.minimumTargetHeight >= 44, `${viewport.name}: menu target below 44px`);
    assert.equal(facts.horizontalOverflow, false, `${viewport.name}: page has horizontal overflow`);

    await page.keyboard.press("Escape");
    assert.equal(await account.getAttribute("aria-expanded"), "false", `${viewport.name}: Escape did not close menu`);
    assert.equal(await account.evaluate((element) => element === document.activeElement), true, `${viewport.name}: focus did not return to Account`);

    await account.press("Enter");
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await page.waitForURL(/\/(?:\?signedOut=1)?$/);
    await page.locator('.utility-nav[href="/account/create"]').waitFor();

    results.push({ viewport: viewport.name, ...facts, signOut: "passed" });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
