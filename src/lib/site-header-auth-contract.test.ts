import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const headerUrl = new URL("../components/SiteHeader.tsx", import.meta.url);
const accessFormUrl = new URL("../components/AccountAccessForm.tsx", import.meta.url);
const layoutUrl = new URL("../app/layout.tsx", import.meta.url);
const serverStateUrl = new URL("./server-account-state.ts", import.meta.url);

test("global account navigation starts from server authentication state", async () => {
  const [header, layout, serverState] = await Promise.all([
    readFile(headerUrl, "utf8"),
    readFile(layoutUrl, "utf8"),
    readFile(serverStateUrl, "utf8"),
  ]);
  assert.match(layout, /getInitialAccountAuthenticated/);
  assert.match(layout, /<SiteHeader initialAuthenticated=\{initialAuthenticated\}/);
  assert.match(header, /initialAuthenticated/);
  assert.match(serverState, /client\.auth\.getUser\(\)/);
});

test("global account navigation synchronizes after navigation and auth mutations", async () => {
  const [header, accessForm] = await Promise.all([
    readFile(headerUrl, "utf8"),
    readFile(accessFormUrl, "utf8"),
  ]);
  assert.match(header, /fetch\("\/api\/membership\/session"/);
  assert.match(header, /MEMBERSHIP_SESSION_CHANGED_EVENT/);
  assert.match(header, /\[pathname\]/);
  assert.match(header, /\{authenticated \? \(/);
  assert.match(header, />◇ Account<\/button>/);
  assert.match(header, /href="\/account\/create"/);
  assert.match(header, />◇ Create account<\/Link>/);
  assert.match(accessForm, /announceMembershipSession\(nextAuthenticated\)/);
  assert.match(accessForm, /announceMembershipSession\(false\)/);
});

test("authenticated account navigation exposes an accessible sign-out menu", async () => {
  const header = await readFile(headerUrl, "utf8");
  assert.match(header, /const ACCOUNT_ITEMS = \[\s*\{ href: "\/account\/character", icon: "♙", label: "View Profile" \}/);
  assert.match(header, /aria-haspopup="menu"/);
  assert.match(header, /aria-expanded=\{accountMenuOpen\}/);
  assert.match(header, /role="menu"/);
  assert.match(header, />\{signingOut \? "Signing out…" : "Sign out"\}</);
  assert.match(header, /fetch\("\/api\/membership\/session", \{ method: "DELETE" \}\)/);
  assert.match(header, /announceMembershipSession\(false\)/);
  assert.match(header, /window\.location\.assign\("\/\?signedOut=1"\)/);
  assert.match(header, /event\.key !== "Escape"/);
  assert.match(header, /role="status" aria-live="polite"/);
});
