import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const context = await browser.newContext();
  const signIn = await context.request.post(`${baseUrl}/api/membership/session`, {
    data: { action: "sign-in" },
  });
  assert.equal(signIn.status(), 200, "Local account sign-in must succeed");

  const page = await context.newPage();
  const cases = [
    {
      path: "/account/subscription",
      expected: ["View plan preview", "Account overview"],
    },
    {
      path: "/account/settings",
      expected: ["Account overview", "View subscription"],
    },
    {
      path: "/account/notifications",
      expected: ["Account overview", "Account settings"],
    },
  ];

  for (const testCase of cases) {
    await page.goto(`${baseUrl}${testCase.path}`, { waitUntil: "networkidle" });
    const actions = page.locator(".account-feature-intro__copy .hero-actions");
    await actions.waitFor();
    for (const label of testCase.expected) {
      assert.equal(await actions.getByRole("link", { name: label, exact: true }).isVisible(), true, `${testCase.path} must show ${label}`);
    }
    assert.equal(await actions.getByRole("link", { name: "Sign in", exact: true }).count(), 0, `${testCase.path} must not ask an authenticated visitor to sign in`);
    assert.equal(await actions.getByRole("link", { name: "Check availability", exact: true }).count(), 0, `${testCase.path} must not show account availability to an authenticated visitor`);
  }

  console.log("Account CTA E2E passed: authenticated subscription, settings, and notifications actions stay signed in");
} finally {
  await browser.close();
}
