import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("first-use account pattern explains subscriber value and feature operation", async () => {
  const component = await source("components/AccountFeatureIntro.tsx");
  assert.match(component, /Subscriber value/);
  assert.match(component, /What membership is designed to unlock/);
  assert.match(component, /How it works/);
  assert.match(component, /primaryAction/);
  assert.match(component, /account-feature-intro__note/);
});

test("empty Character and Library states introduce their features instead of dead-ending", async () => {
  const [character, library] = await Promise.all([
    source("app/account/character/page.tsx"),
    source("app/library/page.tsx"),
  ]);
  assert.match(character, /if \(!character\)/);
  assert.match(character, /Become more than a login/);
  assert.match(character, /One identity across worlds/);
  assert.match(library, /if \(saved\.length === 0\)/);
  assert.match(library, /Keep the signals worth returning to/);
  assert.match(library, /Device saves work without a subscription/);
});

test("Subscription, Settings, and Notifications explain value without claiming active services", async () => {
  const [subscription, settings, notifications] = await Promise.all([
    source("app/account/subscription/page.tsx"),
    source("app/account/settings/page.tsx"),
    source("app/account/notifications/page.tsx"),
  ]);
  assert.match(subscription, /Support the work\. Enter the worlds/);
  assert.match(subscription, /Subscriptions and payments are not open/);
  assert.match(settings, /Your account\. Your boundaries/);
  assert.match(settings, /production identity backend/);
  assert.match(notifications, /Stay close to what matters/);
  assert.match(notifications, /Notifications are not active yet/);
});
