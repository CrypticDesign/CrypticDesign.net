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
  assert.match(library, /You can save items on this device without subscribing/);
});

test("Subscription, Settings, and Notifications explain value without claiming active services", async () => {
  const [subscription, settings, notifications] = await Promise.all([
    source("app/account/subscription/page.tsx"),
    source("app/account/settings/page.tsx"),
    source("app/account/notifications/page.tsx"),
  ]);
  assert.match(subscription, /Get more from Cryptic Design/);
  assert.match(subscription, /Subscriptions and payments are not open/);
  assert.match(settings, /Make your account work for you/);
  assert.match(settings, /Nothing shown here will publish your information/);
  assert.match(notifications, /Get the updates you actually want/);
  assert.match(notifications, /Notifications are not active yet/);
});
