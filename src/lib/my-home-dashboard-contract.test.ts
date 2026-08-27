import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dashboard = readFileSync(new URL("../components/MyHomeDashboard.tsx", import.meta.url), "utf8");
const publicHome = readFileSync(new URL("../components/PublicHome.tsx", import.meta.url), "utf8");
const homePage = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const mission = readFileSync(new URL("../components/my-home/MissionControlSummary.tsx", import.meta.url), "utf8");
const personalSpace = readFileSync(new URL("../components/my-home/PersonalSpacePanel.tsx", import.meta.url), "utf8");

test("My Home uses governed account, Character, and Library boundaries", () => {
  assert.match(dashboard, /\/api\/membership\/session/);
  assert.match(dashboard, /\/api\/characters/);
  assert.match(dashboard, /getSavedSlugs/);
  assert.match(dashboard, /publicReleases/);
  assert.doesNotMatch(dashboard, />Sign up</);
  assert.match(dashboard, /initialAuthenticated/);
});

test("public Home and authenticated My Home are separate server-selected surfaces", () => {
  assert.match(homePage, /getInitialAccountAuthenticated/);
  assert.match(homePage, /authenticated[\s\S]*<MyHomeDashboard initialAuthenticated \/>[\s\S]*<PublicHome accountAdmissionMode=/);
  assert.match(publicHome, /An independent entertainment universe/);
  assert.match(publicHome, /Explore What&apos;s Here/);
  assert.match(publicHome, /Enter Community/);
  assert.match(publicHome, /Enter something real\./);
  assert.match(publicHome, /Choose a signal\./);
  assert.match(publicHome, /Sign in to My Home/);
  assert.match(publicHome, /Your place in the platform/);
  assert.doesNotMatch(publicHome, /className="button home-secondary-cta">Discover the studio/);
});

test("My Home exposes typed future integration boundaries without fake persistence", () => {
  assert.match(mission, /export interface MissionControlPresentation/);
  assert.match(mission, /No active mission data is connected/);
  assert.match(mission, /does not create missions, scores, rewards, or persistent state/);
  assert.match(personalSpace, /export type PersonalSpaceRuntimeStatus/);
  assert.match(personalSpace, /import\("@\/components\/AvatarStudio"\)/);
  assert.match(personalSpace, /Character view active/);
  assert.match(personalSpace, /purpose-built personal Home environment remains future work/);
  assert.match(dashboard, /character\.avatarRecipe/);
  assert.doesNotMatch(dashboard, /my-home-hero\.png/);
});

test("My Home keeps canonical account utilities available", () => {
  for (const href of ["/account", "/library", "/account/notifications", "/account/subscription", "/account/settings"]) {
    assert.match(dashboard, new RegExp(`href=\\"${href.replaceAll("/", "\\/")}\\"`));
  }
});
