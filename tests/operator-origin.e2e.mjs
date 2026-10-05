import assert from "node:assert/strict";
import { chromium } from "playwright";

const port = process.env.OPERATOR_FIXTURE_PORT ?? "3100";
const operatorUrl = `http://127.0.0.1:${port}/internal/account-administration`;
const publicOriginUrl = `http://localhost:${port}/internal/account-administration`;

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const operatorResponse = await page.goto(operatorUrl, { waitUntil: "networkidle" });
  assert.equal(operatorResponse?.status(), 200);
  await page.getByRole("heading", { name: "Account administration" }).waitFor();
  await page.getByText("Fixture isolation active").waitFor();
  await page.getByLabel("Cryptic Design operator console").waitFor();
  await page.getByRole("navigation", { name: "Operator navigation" }).waitFor();
  assert.equal(await page.getByRole("link", { name: "Overview", exact: true }).getAttribute("href"), "#operator-overview");
  await page.getByRole("heading", { name: "Reauthentication boundary" }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Begin secure step-up" }).isDisabled(), true);
  assert.equal(await page.getByRole("button", { name: "Verify and start session" }).count(), 0);
  assert.equal(await page.getByRole("heading", { name: "Live read-only BFF probe" }).count(), 0);
  assert.equal(await page.locator(".site-header, .site-footer, .fab-player").count(), 0);
  assert.equal(await page.getByRole("link", { name: "Home", exact: true }).count(), 0);

  const headers = operatorResponse?.headers() ?? {};
  assert.match(headers["cache-control"] ?? "", /no-store/);
  assert.equal(headers["x-frame-options"], "DENY");
  assert.equal(headers["x-robots-tag"], "noindex, nofollow, noarchive");
  assert.match(headers["content-security-policy"] ?? "", /script-src 'nonce-[^']+' 'strict-dynamic'/);
  assert.equal("access-control-allow-origin" in headers, false);
  const csrfCookie = (await page.context().cookies()).find((cookie) => cookie.name === "cry_operator_csrf_local");
  assert.equal(csrfCookie?.httpOnly, true);
  assert.equal(csrfCookie?.sameSite, "Strict");

  const disabledIssuanceStatus = await page.evaluate(async () => {
    const response = await fetch("/api/operator/session", {
      method: "POST",
      headers: { "x-cry-operator-request": "1" },
      credentials: "same-origin",
    });
    return response.status;
  });
  assert.equal(disabledIssuanceStatus, 404);

  const publicOriginResponse = await page.goto(publicOriginUrl, { waitUntil: "domcontentloaded" });
  assert.equal(publicOriginResponse?.status(), 404);

  const forwardedSpoofPage = await browser.newPage({
    extraHTTPHeaders: { "X-Forwarded-Host": `127.0.0.1:${port}` },
  });
  const forwardedSpoofResponse = await forwardedSpoofPage.goto(publicOriginUrl, { waitUntil: "domcontentloaded" });
  assert.equal(forwardedSpoofResponse?.status(), 404);
  await forwardedSpoofPage.close();

  const reverseMismatchPage = await browser.newPage({
    extraHTTPHeaders: { "X-Forwarded-Host": `localhost:${port}` },
  });
  const reverseMismatchResponse = await reverseMismatchPage.goto(operatorUrl, { waitUntil: "domcontentloaded" });
  assert.equal(reverseMismatchResponse?.status(), 404);
  const reverseMismatchPublicResponse = await reverseMismatchPage.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
  assert.equal(reverseMismatchPublicResponse?.status(), 404);
  await reverseMismatchPage.close();

  const matchingForwardedHostPage = await browser.newPage({
    extraHTTPHeaders: { "X-Forwarded-Host": `127.0.0.1:${port}` },
  });
  const matchingForwardedHostResponse = await matchingForwardedHostPage.goto(operatorUrl, { waitUntil: "domcontentloaded" });
  assert.equal(matchingForwardedHostResponse?.status(), 200);
  await matchingForwardedHostPage.close();

  const apiPage = await browser.newPage({
    extraHTTPHeaders: {
      Origin: `http://127.0.0.1:${port}`,
      "X-Cry-Operator-Request": "1",
    },
  });
  const apiResponse = await apiPage.goto(
    `http://127.0.0.1:${port}/api/operator/account-administration/inspections`,
    { waitUntil: "domcontentloaded" },
  );
  assert.equal(apiResponse?.status(), 404);
  const apiHeaders = apiResponse?.headers() ?? {};
  assert.match(apiHeaders["cache-control"] ?? "", /no-store/);
  assert.equal("access-control-allow-origin" in apiHeaders, false);
  await apiPage.close();

  const publicPageOnOperatorHost = await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
  assert.equal(publicPageOnOperatorHost?.status(), 404);
} finally {
  await browser.close();
}
