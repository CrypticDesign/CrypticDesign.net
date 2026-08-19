import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeUrl = new URL("../app/api/membership/session/route.ts", import.meta.url);

test("Supabase sign-in forwards Turnstile tokens", async () => {
  const source = await readFile(routeUrl, "utf8");
  assert.match(source, /captchaToken = body\.captchaToken\?\.trim\(\)/);
  assert.match(source, /auth\.signInWithPassword\(\{ email, password, options: \{ captchaToken \} \}\)/);
});

test("public account creation has no Supabase signup path", async () => {
  const source = await readFile(routeUrl, "utf8");

  assert.match(source, /if \(body\.action === "create"\)/);
  assert.match(source, /ACCOUNT_ADMISSION_CLOSED/);
  assert.doesNotMatch(source, /auth\.signUp/);
  assert.match(source, /status: 403/);
});
