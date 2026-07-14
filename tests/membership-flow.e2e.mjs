import assert from "node:assert/strict";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const lockedPath = "/releases/platform-devlog-01";
const protectedExcerpt = "The first development log for CrypticDesign.net";

async function json(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const body = await response.json();
  return { response, body };
}

const anonymousRelease = await fetch(`${baseUrl}${lockedPath}`);
const anonymousHtml = await anonymousRelease.text();
assert.equal(anonymousRelease.status, 200);
assert.match(anonymousHtml, /Start a local preview session to check member access/);
assert.doesNotMatch(anonymousHtml, new RegExp(protectedExcerpt));

const signIn = await fetch(`${baseUrl}/api/membership/session`, { method: "POST" });
assert.equal(signIn.status, 200);
const cookie = signIn.headers.get("set-cookie")?.split(";", 1)[0];
assert.ok(cookie, "Preview sign-in must set a session cookie");
assert.match(signIn.headers.get("set-cookie") ?? "", /HttpOnly/i);

const requestSuffix = `${Date.now()}_${crypto.randomUUID()}`;
const create = await json("/api/membership/subscriptions", {
  method: "POST",
  headers: {
    cookie,
    "content-type": "application/json",
    "idempotency-key": `e2e_create_${requestSuffix}`,
  },
  body: JSON.stringify({
    id: `sub_e2e_${requestSuffix}`,
    tierId: "tier_observer",
    priceId: "price_observer_month",
  }),
});
assert.equal(create.response.status, 201);
assert.equal(create.body.subscription.status, "incomplete");

const subscriptionId = create.body.subscription.id;
const activate = await json(`/api/membership/subscriptions/${subscriptionId}/transition`, {
  method: "POST",
  headers: {
    cookie,
    "content-type": "application/json",
    "idempotency-key": `e2e_activate_${requestSuffix}`,
  },
  body: JSON.stringify({ status: "active", reason: "HTTP end-to-end verification" }),
});
assert.equal(activate.response.status, 200);
assert.equal(activate.body.subscription.status, "active");
assert.equal(activate.body.event.toStatus, "active");

const membership = await json("/api/membership/subscriptions", { headers: { cookie } });
assert.equal(membership.response.status, 200);
assert.ok(membership.body.subscriptions.some((item) => item.id === subscriptionId && item.status === "active"));
assert.ok(membership.body.entitlements.includes("benefit_updates"));

const unlockedRelease = await fetch(`${baseUrl}${lockedPath}`, { headers: { cookie } });
const unlockedHtml = await unlockedRelease.text();
assert.equal(unlockedRelease.status, 200);
assert.match(unlockedHtml, new RegExp(protectedExcerpt));
assert.doesNotMatch(unlockedHtml, /requires an active membership benefit/);

console.log("Membership E2E passed: lock -> sign-in -> subscribe -> activate -> entitlement -> unlock");
