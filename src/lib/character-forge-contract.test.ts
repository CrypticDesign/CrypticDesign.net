import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const creator = readFileSync(new URL("../components/CharacterCreator.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
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
  assert.match(creator, /Balanced humanoid/);
  assert.match(creator, /Deferred option/);
  assert.match(creator, /Eight approved hairstyle directions/);
  assert.match(creator, /step === 7/);
});

test("Character Home prioritizes journey and keeps developer ledgers out of the member experience", () => {
  for (const section of ["journey", "discoveries", "achievements", "collections", "history"]) {
    assert.match(characterHome, new RegExp(`id="${section}"`));
  }
  assert.match(characterHome, /Continue journey/);
  assert.match(characterHome, /Identity &amp; settings/);
  assert.match(characterHome, /presented without internal scoring or system ledgers/);
  assert.doesNotMatch(characterHome, /ProgressionSnapshot/);
  assert.doesNotMatch(characterHome, /CORE_ATTRIBUTES/);
  assert.doesNotMatch(characterHome, /recordTestActivity/);
  assert.doesNotMatch(characterHome, /Internal sandbox/);
  assert.doesNotMatch(characterHome, /Owner-private RPG sandbox/);
  assert.doesNotMatch(characterHome, /internal units/);
});

test("Character Home edits the supported appearance recipe without widening its authority", () => {
  assert.match(characterHome, /function patchAvatar/);
  assert.match(characterHome, /AVATAR_SKIN_TONES\.map/);
  assert.match(characterHome, /AVATAR_OUTFITS\.map/);
  assert.match(characterHome, /AVATAR_TRAITS\.map/);
  assert.match(characterHome, /avatarRecipe: character\.avatarRecipe/);
  assert.match(characterHome, /owned production assets pass intake/);
  assert.doesNotMatch(characterHome, /remote-upload/);
});

test("the Forge checks and fails closed around the one-character boundary", () => {
  assert.match(creator, /fetch\("\/api\/characters"\)/);
  assert.match(creator, /Character already established/);
  assert.match(creator, /Creation stays locked until the one-character boundary can be verified/);
  assert.match(creator, /Enter Character Home/);
});

test("discarding an in-tab draft requires explicit confirmation and resets local state", () => {
  assert.match(creator, /<dialog ref=\{discardDialogRef\}/);
  assert.match(creator, /role="alertdialog"/);
  assert.match(creator, /dialog\.showModal\(\)/);
  assert.match(creator, /onCancel=\{\(event\) => \{ event\.preventDefault\(\); keepEditing\(\); \}\}/);
  assert.match(creator, /onKeyDown=\{trapDiscardDialogFocus\}/);
  assert.match(creator, /event\.key !== "Tab"/);
  assert.match(creator, /disabled=\{confirmDiscard \|\| index > highestUnlockedStep\}/);
  assert.match(creator, /ref=\{discardTriggerRef\}/);
  assert.match(creator, /No character or history entry will be created/);
  assert.match(creator, /setAvatar\(DEFAULT_AVATAR_RECIPE\)/);
  assert.match(creator, /setHighestUnlockedStep\(0\)/);
  assert.match(creator, /requestId\.current = null/);
});

test("essential Forge control boundaries meet the non-text contrast threshold", () => {
  const color = (token: string) => {
    const match = styles.match(new RegExp(`--${token}:(#[0-9a-fA-F]{6})`));
    assert.ok(match, `missing --${token}`);
    return match[1];
  };
  const luminance = (hex: string) => {
    const channels = hex.slice(1).match(/../g)?.map((channel) => Number.parseInt(channel, 16) / 255) ?? [];
    const [red, green, blue] = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
  };
  const contrast = (foreground: string, background: string) => {
    const values = [luminance(foreground), luminance(background)].sort((left, right) => right - left);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };
  const controlLine = color("control-line");
  assert.ok(contrast(controlLine, color("canvas")) >= 3);
  assert.ok(contrast(controlLine, color("surface")) >= 3);
  assert.match(styles, /\.character-forge \.forge-fields input[^\n]+border-color:var\(--control-line\)/);
  assert.match(styles, /\.character-forge \.choice-grid button[^\n]+border-color:var\(--control-line\)/);
});

test("an unsaved in-tab draft warns before reload or link navigation", () => {
  assert.match(creator, /window\.addEventListener\("beforeunload", beforeUnload\)/);
  assert.match(creator, /event\.target\.closest<HTMLAnchorElement>\("a\[href\]"\)/);
  assert.match(creator, /window\.confirm\(unsavedDraftMessage\)/);
  assert.match(creator, /if \(!dirty \|\| saving\) return/);
  assert.match(creator, /window\.removeEventListener\("beforeunload", beforeUnload\)/);
});
