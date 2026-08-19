import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const recoveryPageUrl = new URL("../app/account/recover/page.tsx", import.meta.url);
const recoveryFormUrl = new URL("../components/PasswordRecoveryForm.tsx", import.meta.url);
const recoveryRouteUrl = new URL("../app/api/membership/recovery/route.ts", import.meta.url);
const callbackRouteUrl = new URL("../app/auth/callback/route.ts", import.meta.url);
const resetPageUrl = new URL("../app/account/reset-password/page.tsx", import.meta.url);
const resetFormUrl = new URL("../components/PasswordResetForm.tsx", import.meta.url);
const passwordRouteUrl = new URL("../app/api/membership/password/route.ts", import.meta.url);

test("password recovery requests a CAPTCHA-protected Supabase email without revealing account existence", async () => {
  const [page, form, route] = await Promise.all([
    readFile(recoveryPageUrl, "utf8"),
    readFile(recoveryFormUrl, "utf8"),
    readFile(recoveryRouteUrl, "utf8"),
  ]);
  assert.match(page, /<PasswordRecoveryForm \/>/);
  assert.match(form, /action="password_recovery"/);
  assert.match(form, /mode !== "supabase"/);
  assert.match(route, /if \(!captchaToken\)/);
  assert.match(route, /auth\.resetPasswordForEmail\(email/);
  assert.match(route, /captchaToken,/);
  assert.match(route, /redirectTo: `\$\{redirectOrigin\}\/auth\/callback`/);
  assert.match(route, /GENERIC_RECOVERY_MESSAGE/);
  assert.doesNotMatch(route, /user not found/i);
});

test("recovery callback exchanges the PKCE code before opening the password form", async () => {
  const [callback, resetPage] = await Promise.all([
    readFile(callbackRouteUrl, "utf8"),
    readFile(resetPageUrl, "utf8"),
  ]);
  assert.match(callback, /auth\.exchangeCodeForSession\(code\)/);
  assert.match(callback, /"\/account\/reset-password"/);
  assert.match(resetPage, /<PasswordResetForm \/>/);
});

test("password changes require an authenticated user and matching passwords", async () => {
  const [form, route] = await Promise.all([
    readFile(resetFormUrl, "utf8"),
    readFile(passwordRouteUrl, "utf8"),
  ]);
  assert.match(form, /password: form\.get\("password"\)/);
  assert.match(form, /confirmation: form\.get\("confirmation"\)/);
  assert.match(route, /password !== body\.confirmation/);
  assert.match(route, /auth\.getUser\(\)/);
  assert.match(route, /auth\.updateUser\(\{ password \}\)/);
  assert.match(route, /This reset link is invalid or has expired/);
});
