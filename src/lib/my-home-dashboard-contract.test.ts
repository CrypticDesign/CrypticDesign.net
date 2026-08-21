import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dashboard = readFileSync(new URL("../components/MyHomeDashboard.tsx", import.meta.url), "utf8");
const mission = readFileSync(new URL("../components/my-home/MissionControlSummary.tsx", import.meta.url), "utf8");
const personalSpace = readFileSync(new URL("../components/my-home/PersonalSpacePanel.tsx", import.meta.url), "utf8");

test("My Home uses governed account, Character, and Library boundaries", () => {
  assert.match(dashboard, /\/api\/membership\/session/);
  assert.match(dashboard, /\/api\/characters/);
  assert.match(dashboard, /getSavedSlugs/);
  assert.match(dashboard, /publicReleases/);
  assert.doesNotMatch(dashboard, />Sign up</);
  assert.match(dashboard, /Sign in to My Home/);
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
