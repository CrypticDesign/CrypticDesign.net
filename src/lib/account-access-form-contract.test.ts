import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const componentUrl = new URL("../components/AccountAccessForm.tsx", import.meta.url);
const signInPageUrl = new URL("../app/account/sign-in/page.tsx", import.meta.url);
const createPageUrl = new URL("../app/account/create/page.tsx", import.meta.url);
const ecosystemStatusUrl = new URL("../components/AccountEcosystemStatus.tsx", import.meta.url);
const globalsUrl = new URL("../app/globals.css", import.meta.url);

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
  assert.match(source, /Account services unavailable/);
  assert.match(source, /Sign-in is not connected in this preview/);
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

test("sign-in explains the account and subscription relationship without redundant navigation", async () => {
  const source = await readFile(signInPageUrl, "utf8");
  assert.match(source, /Your account keeps everything connected/);
  assert.match(source, /A subscription is connected to your account/);
  assert.match(source, /signing in does not start, renew, or change a subscription/);
  assert.doesNotMatch(source, /account-link-rail/);
  assert.doesNotMatch(source, /View subscription plans/);
  assert.doesNotMatch(source, /My Library/);
  assert.doesNotMatch(source, /Return to Account/);
});

test("account entry pages share the VDS ecosystem panel and sign-in hero is full bleed", async () => {
  const [signIn, create, ecosystemStatus, globals] = await Promise.all([
    readFile(signInPageUrl, "utf8"),
    readFile(createPageUrl, "utf8"),
    readFile(ecosystemStatusUrl, "utf8"),
    readFile(globalsUrl, "utf8"),
  ]);
  assert.match(signIn, /account-hero--full-bleed account-hero--sign-in/);
  assert.match(signIn, /<AccountEcosystemStatus admissionMode=\{accountAdmissionMode\(\)\} \/>/);
  assert.match(create, /<AccountEcosystemStatus admissionMode=\{accountAdmissionMode\(\)\} showAvailabilityAction=\{false\} \/>/);
  assert.match(ecosystemStatus, /showAvailabilityAction/);
  assert.match(globals, /\.account-hero--full-bleed\{[^}]*width:100vw[^}]*margin-left:calc\(50% - 50vw\)/);
});
