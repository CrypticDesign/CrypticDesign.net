import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const signedOutHomeActions = page.locator(".visual-hero__content .hero-actions");
  assert.equal(await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Sign In", exact: true }).isVisible(), true, "Signed-out primary navigation must expose Sign In");
  assert.equal(await signedOutHomeActions.getByRole("link", { name: "Sign in to My Home", exact: true }).isVisible(), true, "Signed-out My Home must use the governed sign-in flow");
  assert.equal(await signedOutHomeActions.getByRole("link", { name: "Check account availability", exact: true }).isVisible(), true, "Signed-out My Home must keep admission availability separate from sign-in");
  assert.equal(await signedOutHomeActions.getByRole("link", { name: "Sign up", exact: true }).count(), 0, "Signed-out My Home must not advertise unrestricted registration");

  await page.goto(`${baseUrl}/account`, { waitUntil: "networkidle" });
  assert.equal(await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Sign In", exact: true }).isVisible(), true, "Signed-out Account must keep Sign In in primary navigation");
  assert.equal(await page.getByRole("navigation", { name: "Account", exact: true }).count(), 0, "Signed-out visitors must not see account-level subnavigation");
  assert.equal(await page.getByRole("heading", { name: "Make this place yours.", exact: true }).isVisible(), true, "Signed-out Account must introduce the account benefits");
  assert.equal(await page.getByLabel("Current ecosystem status").getByText("Accounts closed", { exact: true }).isVisible(), true, "Signed-out Account must show the current closed admission state");
  assert.equal(await page.getByRole("link", { name: "Check account availability", exact: true }).isVisible(), true, "Signed-out Account must link to account availability");

  await page.goto(`${baseUrl}/account/sign-in`, { waitUntil: "networkidle" });
  assert.equal(await page.getByRole("textbox", { name: "Email", exact: true }).isVisible(), true, "Signed-out Sign In must show the email input");
  assert.equal(await page.getByLabel("Password", { exact: true }).isVisible(), true, "Signed-out Sign In must show the password input");
  assert.equal(await page.getByRole("button", { name: "Continue with local test account", exact: true }).isVisible(), true, "Local Sign In must expose the isolated sandbox-session action");

  const remainingAccountPaths = [
    "/account/create",
    "/account/character",
    "/account/character/first-signal",
    "/account/create-character",
    "/account/notifications",
    "/account/recover",
    "/account/reset-password",
    "/account/settings",
    "/account/subscription",
    "/library",
  ];
  for (const path of remainingAccountPaths) {
    await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded" });
    assert.equal(await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Sign In", exact: true }).isVisible(), true, `${path} must show Sign In while signed out`);
    assert.equal(await page.getByRole("navigation", { name: "Account", exact: true }).count(), 0, `${path} must hide account-level subnavigation while signed out`);
  }

  const signIn = await context.request.post(`${baseUrl}/api/membership/session`, {
    data: { action: "sign-in" },
  });
  assert.equal(signIn.status(), 200, "Local account sign-in must succeed");

  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  assert.equal(await page.getByRole("heading", { name: "Mission Control", exact: true }).isVisible(), true, "Signed-in My Home must expose the Mission Control integration boundary");
  assert.equal(await page.getByRole("heading", { name: /Character view active|Character required/ }).isVisible(), true, "Signed-in My Home must expose the interim Character runtime or its honest prerequisite state");
  assert.equal(await page.getByRole("navigation", { name: "Account utilities", exact: true }).isVisible(), true, "Signed-in My Home must expose conventional account utilities");

  await page.goto(`${baseUrl}/account`, { waitUntil: "networkidle" });
  assert.equal(await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Account", exact: true }).isVisible(), true, "Signed-in Account must use the authenticated primary label");
  assert.equal(await page.getByRole("navigation", { name: "Account", exact: true }).isVisible(), true, "Signed-in visitors must see account-level subnavigation");
  assert.equal(await page.getByRole("heading", { name: "Account", exact: true }).isVisible(), true, "Signed-in Account must show the account hub");

  await page.goto(`${baseUrl}/account/sign-in`, { waitUntil: "networkidle" });
  assert.equal(await page.getByText("You are signed in.", { exact: true }).isVisible(), true, "Signed-in Sign In must report the active session");
  assert.equal(await page.getByRole("link", { name: "Open Character Forge", exact: true }).isVisible(), true, "Signed-in Sign In must offer an authenticated destination");
  assert.equal(await page.getByRole("button", { name: "Sign out", exact: true }).isVisible(), true, "Signed-in Sign In must offer sign out");
  assert.equal(await page.getByRole("textbox", { name: "Email", exact: true }).count(), 0, "Signed-in Sign In must not show login inputs");

  for (const path of remainingAccountPaths) {
    await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded" });
    assert.equal(await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Account", exact: true }).isVisible(), true, `${path} must show Account while signed in`);
    assert.equal(await page.getByRole("navigation", { name: "Account", exact: true }).isVisible(), true, `${path} must show account-level subnavigation while signed in`);
  }

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

  console.log("Account CTA E2E passed: governed My Home sign-in, authenticated dashboard boundaries, Account actions, and Library preserve the correct session state");
} finally {
  await browser.close();
}
