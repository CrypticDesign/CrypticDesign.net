import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../app/auth/confirm/page.tsx", import.meta.url);
const completionRouteUrl = new URL("../app/auth/confirm/complete/route.ts", import.meta.url);
const membershipRouteUrl = new URL("../app/api/membership/session/route.ts", import.meta.url);
const policyUrl = new URL("./email-confirmation-policy.ts", import.meta.url);

test("email confirmation requires an intentional POST before consuming the OTP", async () => {
  const [page, completionRoute, policy] = await Promise.all([
    readFile(pageUrl, "utf8"),
    readFile(completionRouteUrl, "utf8"),
    readFile(policyUrl, "utf8"),
  ]);

  assert.match(page, /action="\/auth\/confirm\/complete" method="post"/);
  assert.doesNotMatch(page, /verifyOtp/);
  assert.match(completionRoute, /export async function POST/);
  assert.match(completionRoute, /request\.formData\(\)/);
  assert.match(page, /resolveEmailConfirmationPolicy/);
  assert.match(completionRoute, /if \(!policy\.allowed\)/);
  assert.match(completionRoute, /auth\.verifyOtp\(\{ token_hash: tokenHash, type \}\)/);
  assert.match(completionRoute, /new URL\(policy\.destination, request\.url\)/);
  assert.match(policy, /signup: \{ type: "signup", allowed: false/);
  assert.match(policy, /invite: \{ type: "invite", allowed: true/);
  assert.match(completionRoute, /!admissionAcceptanceConfigured\(\)/);
  assert.match(completionRoute, /\.rpc\("admission_invite_ready"/);
  assert.match(completionRoute, /signOutSupabaseSession\(session\.client\)/);
  assert.match(policy, /recovery: \{ type: "recovery", allowed: true/);
});

test("public account creation cannot issue confirmation emails", async () => {
  const membershipRoute = await readFile(membershipRouteUrl, "utf8");
  assert.doesNotMatch(membershipRoute, /auth\.signUp/);
  assert.doesNotMatch(membershipRoute, /emailRedirectTo/);
  assert.match(membershipRoute, /ACCOUNT_ADMISSION_CLOSED/);
});
