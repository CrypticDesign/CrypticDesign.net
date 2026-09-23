import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (relativePath: string) => readFile(new URL(relativePath, import.meta.url), "utf8");

test("Account overview and Request Access are explicit public index targets", async () => {
  const [account, requestAccess, sitemap] = await Promise.all([
    source("../app/account/page.tsx"),
    source("../app/account/create/page.tsx"),
    source("../app/sitemap.ts"),
  ]);

  assert.match(account, /canonical: "\/account"/);
  assert.match(account, /robots: \{ index: true, follow: true \}/);
  assert.match(requestAccess, /canonical: "\/account\/create"/);
  assert.match(requestAccess, /robots: \{ index: true, follow: true \}/);
  assert.match(sitemap, /"\/account", "\/account\/create"/);
  assert.doesNotMatch(sitemap, /"\/account\/sign-in"/);
});

test("Sign In is crawlable but explicitly excluded from indexing", async () => {
  const [signIn, robots] = await Promise.all([
    source("../app/account/sign-in/page.tsx"),
    source("../app/robots.ts"),
  ]);

  assert.match(signIn, /canonical: "\/account\/sign-in"/);
  assert.match(signIn, /robots: \{ index: false, follow: true \}/);
  assert.doesNotMatch(robots, /"\/account\/"/);
});

test("private Account and Library HTML surfaces publish non-index metadata", async () => {
  const sources = await Promise.all([
    source("../app/account/accept-invitation/page.tsx"),
    source("../app/account/create-character/page.tsx"),
    source("../app/account/notifications/page.tsx"),
    source("../app/account/recover/page.tsx"),
    source("../app/account/reset-password/page.tsx"),
    source("../app/account/security/page.tsx"),
    source("../app/account/settings/page.tsx"),
    source("../app/account/subscription/page.tsx"),
    source("../app/account/character/layout.tsx"),
    source("../app/library/layout.tsx"),
  ]);

  for (const contents of sources) {
    assert.match(contents, /robots: \{ index: false, follow: false \}/);
  }

  assert.match(sources.at(-1) ?? "", /alternates: \{ canonical: "\/library" \}/);
});
