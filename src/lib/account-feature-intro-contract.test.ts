import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("first-use account pattern explains subscriber value and feature operation", async () => {
  const component = await source("components/AccountFeatureIntro.tsx");
  assert.match(component, /Why subscribe/);
  assert.match(component, /What you get with a subscription/);
  assert.match(component, /How it works/);
  assert.match(component, /primaryAction/);
  assert.match(component, /account-feature-intro__note/);
});

test("account pages begin directly below account navigation at every breakpoint", async () => {
  const styles = await source("app/globals.css");
  assert.match(styles, /\.account-page\{[^}]*padding-block:0 72px/);
  assert.match(styles, /@media\(max-width:900px\)\{\.account-page\{[^}]*padding-block:0 56px/);
  assert.match(styles, /@media\(max-width:640px\)\{\.account-page\{[^}]*padding-block:0 42px/);
});

test("empty Character and Library states introduce their features instead of dead-ending", async () => {
  const [character, library] = await Promise.all([
    source("app/account/character/page.tsx"),
    source("app/library/page.tsx"),
  ]);
  assert.match(character, /if \(!character\)/);
  assert.match(character, /Make it yours/);
  assert.match(character, /Your character, everywhere/);
  assert.match(library, /if \(saved\.length === 0\)/);
  assert.match(library, /Save what you want to come back to/);
  assert.match(library, /Saved items currently stay on this device/);
  assert.match(library, /Remove saved release/);
  assert.match(library, /Recently saved/);
  assert.match(library, /fetch\("\/api\/membership\/session"/);
  assert.match(library, /authenticated: Boolean\(session\?\.authenticated\)/);
});

test("Subscription, Settings, and Notifications expose only working or honestly gated account states", async () => {
  const [subscription, settings, notifications] = await Promise.all([
    source("app/account/subscription/page.tsx"),
    source("app/account/settings/page.tsx"),
    source("app/account/notifications/page.tsx"),
  ]);
  assert.match(subscription, /getInitialAccountIdentity/);
  assert.match(subscription, /Site account/);
  assert.match(subscription, /Paid subscription/);
  assert.match(subscription, /No tier, price, trial, payment method, invoice, or billing workflow is active/);
  assert.doesNotMatch(subscription, /MembershipSandbox/);
  assert.match(settings, /getInitialAccountIdentity/);
  assert.match(settings, /Uses your browser and operating-system settings/);
  assert.match(settings, /Export account data/);
  assert.match(settings, /Not available yet/);
  assert.match(notifications, /getInitialAccountIdentity/);
  assert.match(notifications, /No notifications/);
  assert.match(notifications, /Notification controls/);
  assert.match(notifications, /invitations/i);
});
