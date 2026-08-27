import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../app/community/page.tsx", import.meta.url), "utf8");
const groups = readFileSync(new URL("../app/community/groups/page.tsx", import.meta.url), "utf8");
const events = readFileSync(new URL("../app/community/events/page.tsx", import.meta.url), "utf8");
const creators = readFileSync(new URL("../app/community/creators/page.tsx", import.meta.url), "utf8");
const navigation = readFileSync(new URL("../lib/community-navigation.ts", import.meta.url), "utf8");
const navigationComponent = readFileSync(new URL("../components/CommunityNavigation.tsx", import.meta.url), "utf8");
const status = readFileSync(new URL("../components/CommunityAvailabilityPanel.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");

test("Community implements the approved IA while withholding Spaces", () => {
  const orderedKeys = [...navigation.matchAll(/key: "([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(orderedKeys, ["explore", "groups", "spaces", "events", "creators"]);
  assert.match(navigation, /key: "spaces"[\s\S]*?href: "\/community\/spaces"[\s\S]*?visible: false/);
  assert.equal(existsSync(new URL("../app/community/spaces/page.tsx", import.meta.url)), false);
  assert.match(navigationComponent, /visibleCommunityNavigationItems/);
  assert.match(navigationComponent, /ariaLabel="Community sections"/);
  assert.match(navigationComponent, /aria-current=/);
  assert.doesNotMatch(navigation, /What is happening/);
  assert.match(layout, /<CommunityNavigation \/>/);
});

test("Community puts staged participation before explicitly cross-platform exploration", () => {
  for (const heading of ["Participation paths", "Creators / Available", "Groups / Opening in stages", "Events / Opening in stages", "Explore while Community opens", "Continue Participating"]) assert.ok(page.includes(heading));
  assert.ok(page.indexOf("Creators / Available") < page.indexOf("Groups / Opening"));
  assert.ok(page.indexOf("Groups / Opening") < page.indexOf("Events / Opening"));
  assert.ok(page.indexOf("Events / Opening") < page.indexOf("From across the platform"));
  assert.match(page, /href="#participation-paths"/);
  assert.match(page, /showSignInAction=\{false\}/);
  assert.match(page, /authenticated \? "\/" : "\/account\/sign-in"/);
  assert.match(page, /authenticated \? <section/);
  assert.match(page, /getInitialAccountAuthenticated/);
  assert.match(page, /opening in stages/);
  assert.match(page, /No groups are published yet/);
  assert.match(page, /No approved event calendar is connected/);
  assert.doesNotMatch(page, /Happening now|Explore what is happening|No governed activity stream is connected|community-explore__activity|href="\/community\/spaces"/);
  assert.doesNotMatch(page, /Live community activity|RSVP|Join the community/i);
  assert.doesNotMatch(page, /\d+[,.]?\d*[kKmM] (members|followers|attending)/);
});

test("supported destinations are truthful and preserve authority boundaries", () => {
  assert.match(groups, /No discoverable groups are published/);
  for (const concept of ["Connection", "Membership", "Role", "Permission"]) assert.match(groups, new RegExp(concept));
  assert.match(events, /There are no approved upcoming events to display/);
  assert.match(events, /No event records, dates, hosts, attendance counts, or registration actions have been invented/);
  assert.match(creators, /Robert K\. Croft/);
  assert.match(creators, /Discovery is not publishing authority/);
  assert.match(creators, /does not create a second identity or Creator Studio/);
});

test("Community routes are indexed and availability remains semantic", () => {
  for (const route of ["/community", "/community/groups", "/community/events", "/community/creators"]) assert.match(sitemap, new RegExp(route.replaceAll("/", "\\/")));
  assert.doesNotMatch(sitemap, /"\/community\/spaces"/);
  assert.match(status, /aria-label="Current community status"/);
  assert.match(status, /<dt>Public Community<\/dt><dd data-status="open">Open<\/dd>/);
  assert.match(status, /<dt>Activity<\/dt><dd>Not connected<\/dd>/);
  assert.match(status, /No published groups yet/);
  assert.match(status, /No approved calendar yet/);
});
