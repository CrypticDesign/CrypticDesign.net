// Read-only page checks and negative admission probes. Never creates an account or sends email.
// Usage: node scripts/qa-request-access-http.mjs http://127.0.0.1:3001 artifacts/CRY-504/local-http.json
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { load } from "cheerio";

const base = process.argv[2] ?? "http://127.0.0.1:3001";
const results = { base, checkedAt: new Date().toISOString(), routes: [], admission: [] };
for (const path of ["/account/create", "/account/sign-in", "/entertainment", "/"]) {
  const response = await fetch(`${base}${path}`);
  assert.equal(response.status, 200, path);
  const $ = load(await response.text());
  if (path === "/account/create") {
    assert.equal($("h1").text(), "Join the next wave.");
    assert.match($("title").text(), /Request Access/);
    assert.equal($("link[rel=canonical]").attr("href")?.endsWith(path), true);
    assert.equal($("input[name=email][type=email][required]").length, 1);
    assert.equal($("input[type=password], input[name=password], input[name=payment]").length, 0);
    assert.equal($("select[name=interest] option").length, 6);
    assert.match($("form").text(), /Review and send the prepared email yourself/);
    assert.equal($("a[href='/account/sign-in']").length > 0, true);
    assert.equal($("a[href='/entertainment']").length > 0, true);
  }
  if (path === "/") {
    assert.equal($(".public-home-v2__join a[href='/account/create']").text(), "Request Access");
    assert.equal($(".public-home-v2__join a[href='/account/sign-in']").text(), "Sign In");
    assert.equal($(".public-home-hero").text().includes("Request Access"), false);
  }
  results.routes.push({ path, status: response.status, pass: true });
}
for (const body of [{ action: "create" }, { action: "create", email: "visitor@example.com", password: "synthetic-not-a-real-password", captchaToken: "synthetic-qa-token" }]) {
  const response = await fetch(`${base}/api/membership/session`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  const payload = await response.json();
  assert.equal(response.status, 403);
  assert.equal(payload.code, "ACCOUNT_ADMISSION_CLOSED");
  assert.equal(payload.accountCreationAvailable, false);
  assert.equal(Boolean(payload.authenticated), false);
  assert.equal(payload.memberId, undefined);
  assert.equal(response.headers.get("set-cookie"), null);
  results.admission.push({ suppliedDetails: Boolean(body.email), status: response.status, payload, setsCookie: false });
}
if (process.argv[3]) await writeFile(process.argv[3], JSON.stringify(results, null, 2) + "\n");
console.log(JSON.stringify(results, null, 2));
