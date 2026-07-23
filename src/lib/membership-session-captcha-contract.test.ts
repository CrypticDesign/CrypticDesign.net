import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeUrl = new URL("../app/api/membership/session/route.ts", import.meta.url);

test("Supabase account creation and sign-in forward Turnstile tokens", async () => {
  const source = await readFile(routeUrl, "utf8");
  assert.match(source, /captchaToken = body\.captchaToken\?\.trim\(\)/);
  assert.match(source, /auth\.signUp\(\{[\s\S]*options: \{ captchaToken,/);
  assert.match(source, /auth\.signInWithPassword\(\{ email, password, options: \{ captchaToken \} \}\)/);
});
