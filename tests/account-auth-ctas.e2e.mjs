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

  await page.route("**/api/membership/subscriptions", async (route) => {
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Membership sandbox is disabled" }) });
  });
  await page.goto(`${baseUrl}/library`, { waitUntil: "networkidle" });
  const libraryActions = page.locator(".account-feature-intro__copy .hero-actions");
  await libraryActions.waitFor();
  assert.equal(await libraryActions.getByRole("link", { name: "Explore membership", exact: true }).isVisible(), true, "Library must preserve authenticated actions when subscription services are unavailable");
  assert.equal(await libraryActions.getByRole("link", { name: "Sign in", exact: true }).count(), 0, "Library must not infer sign-out from an unavailable subscription endpoint");

  console.log("Account CTA E2E passed: authenticated feature actions stay signed in when subscription services are unavailable");
} finally {
  await browser.close();
}
