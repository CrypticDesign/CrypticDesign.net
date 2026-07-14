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

for (const activeSubscription of membership.body.subscriptions.filter((item) => ["active", "trialing"].includes(item.status))) {
  const cancel = await json(`/api/membership/subscriptions/${activeSubscription.id}/transition`, {
    method: "POST",
    headers: {
      cookie,
      "content-type": "application/json",
      "idempotency-key": `e2e_cancel_${activeSubscription.id}_${requestSuffix}`,
    },
    body: JSON.stringify({ status: "canceled", reason: "HTTP end-to-end cancellation verification" }),
  });
  assert.equal(cancel.response.status, 200);
  assert.equal(cancel.body.subscription.status, "canceled");
}

const revokedMembership = await json("/api/membership/subscriptions", { headers: { cookie } });
assert.equal(revokedMembership.response.status, 200);
assert.doesNotMatch(revokedMembership.body.entitlements.join(","), /benefit_updates/);

const relockedRelease = await fetch(`${baseUrl}${lockedPath}`, { headers: { cookie } });
const relockedHtml = await relockedRelease.text();
assert.equal(relockedRelease.status, 200);
assert.match(relockedHtml, /requires an active membership benefit/);
assert.doesNotMatch(relockedHtml, new RegExp(protectedExcerpt));

const expire = await json(`/api/membership/subscriptions/${subscriptionId}/transition`, {
  method: "POST",
  headers: {
    cookie,
    "content-type": "application/json",
    "idempotency-key": `e2e_expire_${requestSuffix}`,
  },
  body: JSON.stringify({ status: "expired", reason: "HTTP end-to-end expiration verification" }),
});
assert.equal(expire.response.status, 200);
assert.equal(expire.body.subscription.status, "expired");

console.log("Membership E2E passed: lock -> sign-in -> activate -> unlock -> cancel -> revoke -> relock -> expire");
