import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../app/auth/confirm/page.tsx", import.meta.url);
const completionRouteUrl = new URL("../app/auth/confirm/complete/route.ts", import.meta.url);
const membershipRouteUrl = new URL("../app/api/membership/session/route.ts", import.meta.url);

test("email confirmation requires an intentional POST before consuming the OTP", async () => {
  const [page, completionRoute] = await Promise.all([
    readFile(pageUrl, "utf8"),
    readFile(completionRouteUrl, "utf8"),
  ]);

  assert.match(page, /action="\/auth\/confirm\/complete" method="post"/);
  assert.doesNotMatch(page, /verifyOtp/);
  assert.match(completionRoute, /export async function POST/);
  assert.match(completionRoute, /request\.formData\(\)/);
  assert.match(completionRoute, /auth\.verifyOtp\(\{ token_hash: tokenHash, type \}\)/);
  assert.match(completionRoute, /type === "recovery" \? "\/account\/reset-password"/);
});

test("public account creation cannot issue confirmation emails", async () => {
  const membershipRoute = await readFile(membershipRouteUrl, "utf8");
  assert.doesNotMatch(membershipRoute, /auth\.signUp/);
  assert.doesNotMatch(membershipRoute, /emailRedirectTo/);
  assert.match(membershipRoute, /ACCOUNT_ADMISSION_CLOSED/);
});
