import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const creator = readFileSync(new URL("../components/CharacterCreator.tsx", import.meta.url), "utf8");
const characterHome = readFileSync(new URL("../app/account/character/page.tsx", import.meta.url), "utf8");
const accountOverview = readFileSync(new URL("../components/AccountOverview.tsx", import.meta.url), "utf8");
const myHome = readFileSync(new URL("../components/MyHomeDashboard.tsx", import.meta.url), "utf8");

test("the member-facing Forge stays classless while preserving the legacy storage field", () => {
  assert.doesNotMatch(creator, /CHARACTER_ARCHETYPES\.map/);
  assert.doesNotMatch(creator, /Choose an origin signal/);
  assert.match(creator, /Character Forge is classless/);
  assert.match(creator, /archetype: CHARACTER_ARCHETYPES\[0\]/);
  for (const surface of [characterHome, accountOverview, myHome]) assert.doesNotMatch(surface, /\{character\.archetype\}/);
});

test("the Forge gates future steps, explains in-tab draft scope, and includes a real review", () => {
  assert.match(creator, /disabled=\{confirmDiscard \|\| index > highestUnlockedStep\}/);
  assert.match(creator, /held in this tab only/);
  assert.match(creator, /aria-label="Review character draft"/);
  assert.match(creator, /ref=\{headingRef\} tabIndex=\{-1\}/);
  assert.match(creator, /aria-invalid=\{Boolean\(identityErrors\.name\)\}/);
  assert.match(creator, /requestId\.current \?\?= crypto\.randomUUID\(\)/);
});

test("the Forge checks and fails closed around the one-character boundary", () => {
  assert.match(creator, /fetch\("\/api\/characters"\)/);
  assert.match(creator, /Character already established/);
  assert.match(creator, /Creation stays locked until the one-character boundary can be verified/);
  assert.match(creator, /Enter Character Home/);
});

test("discarding an in-tab draft requires explicit confirmation and resets local state", () => {
  assert.match(creator, /role="alertdialog"/);
  assert.match(creator, /disabled=\{confirmDiscard \|\| index > highestUnlockedStep\}/);
  assert.match(creator, /ref=\{discardTriggerRef\}/);
  assert.match(creator, /No character or history entry will be created/);
  assert.match(creator, /setAvatar\(DEFAULT_AVATAR_RECIPE\)/);
  assert.match(creator, /setHighestUnlockedStep\(0\)/);
  assert.match(creator, /requestId\.current = null/);
});

test("an unsaved in-tab draft warns before reload or link navigation", () => {
  assert.match(creator, /window\.addEventListener\("beforeunload", beforeUnload\)/);
  assert.match(creator, /event\.target\.closest<HTMLAnchorElement>\("a\[href\]"\)/);
  assert.match(creator, /window\.confirm\(unsavedDraftMessage\)/);
  assert.match(creator, /if \(!dirty \|\| saving\) return/);
  assert.match(creator, /window\.removeEventListener\("beforeunload", beforeUnload\)/);
});
