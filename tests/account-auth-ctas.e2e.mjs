import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext();

try {
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(90_000);

  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const signedOutHomeHero = page.locator(".public-home-hero");
  assert.equal(await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Sign In", exact: true }).isVisible(), true, "Signed-out primary navigation must expose Sign In");
  assert.equal(await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Home", exact: true }).isVisible(), true, "Signed-out primary navigation must identify the public Home");
  assert.equal(await signedOutHomeHero.getByRole("heading", { name: "Worlds to explore. Stories to experience. Systems that connect them.", exact: true }).isVisible(), true, "Signed-out Home must introduce the Cryptic Design ecosystem");
  assert.equal(await signedOutHomeHero.getByRole("link", { name: "Explore entertainment", exact: true }).isVisible(), true, "Public Home must lead into Entertainment");
  assert.equal(await signedOutHomeHero.getByRole("link", { name: "Discover the studio", exact: true }).isVisible(), true, "Public Home must lead into Professional");
  assert.equal(await page.getByRole("heading", { name: "Featured now", exact: true }).isVisible(), true, "Public Home must expose the featured ecosystem destinations");
  assert.equal(await page.getByRole("heading", { name: "One ecosystem. Three ways in.", exact: true }).isVisible(), true, "Public Home must explain the platform entry modes");
  assert.equal(await page.getByRole("link", { name: /Sign in to My Home/ }).isVisible(), true, "Public Home must keep the governed private-dashboard entry available");
  assert.equal(await page.getByRole("link", { name: "Sign up", exact: true }).count(), 0, "Public Home must not advertise unrestricted registration");

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
  await page.getByRole("button", { name: "Continue with local test account", exact: true }).click();
  await page.waitForURL(`${baseUrl}/`);
  const signedInHomeHeading = page.getByRole("heading", { name: /^Welcome back/ });
  await signedInHomeHeading.waitFor({ state: "visible" });
  assert.equal(await signedInHomeHeading.isVisible(), true, "Successful sign-in must continue directly to My Home");
  const signOutAfterRedirectCheck = await context.request.delete(`${baseUrl}/api/membership/session`);
  assert.equal(signOutAfterRedirectCheck.status(), 200, "Redirect verification must restore the signed-out test state");

  const remainingAccountPaths = [
    "/account/create",
    "/account/character",
    "/account/character/first-signal",
    "/account/create-character",
    "/account/notifications",
    "/account/recover",
    "/account/reset-password",
    "/account/security",
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
  assert.equal(await page.getByRole("navigation", { name: "Account sections", exact: true }).isVisible(), true, "Signed-in visitors must see account-level subnavigation");
  assert.equal(await page.getByRole("heading", { name: "Your account, clearly connected.", exact: true }).isVisible(), true, "Signed-in Account must show the operational account overview");
  assert.equal(await page.getByRole("heading", { name: "Account identity", exact: true }).isVisible(), true, "Signed-in Account must show server-resolved identity state");

  await page.goto(`${baseUrl}/account/security`, { waitUntil: "networkidle" });
  assert.equal(await page.getByRole("heading", { name: "Security & Recovery", exact: true }).isVisible(), true, "Security must have its own operational page");
  assert.equal(await page.getByRole("heading", { name: "Account security", exact: true }).isVisible(), true, "Security must expose verified account state");
  assert.equal(await page.getByRole("navigation", { name: "Account sections", exact: true }).getByRole("link", { name: /Security Sign-in & recovery/ }).getAttribute("aria-current"), "page", "Security must own the active Account tab");

  await page.goto(`${baseUrl}/account/sign-in`, { waitUntil: "networkidle" });
  assert.equal(await page.getByText("You are signed in.", { exact: true }).isVisible(), true, "Signed-in Sign In must report the active session");
  assert.equal(await page.getByRole("link", { name: "Open Character Forge", exact: true }).isVisible(), true, "Signed-in Sign In must offer an authenticated destination");
  assert.equal(await page.getByRole("button", { name: "Sign out", exact: true }).isVisible(), true, "Signed-in Sign In must offer sign out");
  assert.equal(await page.getByRole("textbox", { name: "Email", exact: true }).count(), 0, "Signed-in Sign In must not show login inputs");

  for (const path of remainingAccountPaths) {
    await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded" });
    assert.equal(await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Account", exact: true }).isVisible(), true, `${path} must show Account while signed in`);
    assert.equal(await page.getByRole("navigation", { name: "Account sections", exact: true }).isVisible(), true, `${path} must show account-level subnavigation while signed in`);
  }

  const cases = [
    { path: "/account/security", heading: "Security & Recovery" },
    { path: "/account/subscription", heading: "Subscription & Access" },
    { path: "/account/settings", heading: "Settings & Privacy" },
    { path: "/account/notifications", heading: "Notifications" },
  ];

  for (const testCase of cases) {
    await page.goto(`${baseUrl}${testCase.path}`, { waitUntil: "networkidle" });
    assert.equal(await page.getByRole("heading", { name: testCase.heading, exact: true }).isVisible(), true, `${testCase.path} must show its operational utility heading`);
    assert.equal(await page.getByRole("link", { name: "Sign in", exact: true }).count(), 0, `${testCase.path} must not ask an authenticated visitor to sign in`);
    assert.equal(await page.getByRole("link", { name: /Check availability/i }).count(), 0, `${testCase.path} must not show account availability to an authenticated visitor`);
  }

  await page.route("**/api/membership/subscriptions", async (route) => {
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Membership sandbox is disabled" }) });
  });
  await page.goto(`${baseUrl}/library`, { waitUntil: "networkidle" });
  assert.equal(await page.getByRole("link", { name: "Account overview", exact: true }).isVisible(), true, "Library must preserve its authenticated account action when subscription services are unavailable");
  assert.equal(await page.getByRole("link", { name: "Sign in", exact: true }).count(), 0, "Library must not infer sign-out from an unavailable subscription endpoint");

  console.log("Account CTA E2E passed: governed My Home sign-in and redirect, authenticated dashboard and Account utilities, and My Library preserve the correct session state");
} finally {
  await context.close();
  await browser.close();
}
