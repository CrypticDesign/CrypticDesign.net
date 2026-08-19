import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const componentUrl = new URL("../components/AccountAccessForm.tsx", import.meta.url);

test("account inputs retain a visible, minimum-size control treatment", async () => {
  const source = await readFile(componentUrl, "utf8");
  assert.match(source, /min-h-11/);
  assert.match(source, /border-\[var\(--line\)\]/);
  assert.match(source, /bg-\[var\(--canvas\)\]/);
  assert.equal((source.match(/className=\{inputClassName\}/g) ?? []).length, 3);
});

test("Supabase account forms fail closed until Turnstile supplies a token", async () => {
  const source = await readFile(componentUrl, "utf8");
  assert.match(source, /NEXT_PUBLIC_TURNSTILE_SITE_KEY/);
  assert.match(source, /captchaToken/);
  assert.match(source, /disabled=\{saving \|\| !captchaToken \|\| serviceMode !== "supabase"\}/);
  assert.match(source, /Complete human verification before continuing/);
});

test("sign-in fields remain visible when local account services are disconnected", async () => {
  const source = await readFile(componentUrl, "utf8");
  assert.doesNotMatch(source, /if \(serviceMode === "disabled"\) return/);
  assert.match(source, /Email and password fields are shown for layout review/);
  assert.match(source, /Sign-in is not connected in this local preview/);
});

test("local sandbox offers a credential-free test account", async () => {
  const component = await readFile(componentUrl, "utf8");
  assert.match(component, /Continue with local test account/);
  assert.match(component, /startSandboxSession/);
  assert.match(component, /announceMembershipSession\(true\)/);
  assert.doesNotMatch(component, /if \(serviceMode === "sandbox"\) return/);
});

test("password controls support visibility and route recovery honestly", async () => {
  const source = await readFile(componentUrl, "utf8");
  assert.match(source, /showPassword/);
  assert.match(source, /Show password/);
  assert.match(source, /Hide password/);
  assert.match(source, /href="\/account\/recover"/);
  assert.match(source, /Forgot password\?/);
});
