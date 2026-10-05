import assert from "node:assert/strict";
import test from "node:test";
import {
  AVATAR_CAMERA_DEFAULT_DISTANCE,
  AVATAR_CAMERA_MAX_DISTANCE,
  AVATAR_CAMERA_MIN_DISTANCE,
  AVATAR_VIEW_PRESETS,
  avatarViewCommandForKey,
  clampAvatarCameraDistance,
  describeAvatarRecipe,
} from "./avatar-studio-controls.ts";
import { DEFAULT_AVATAR_RECIPE } from "./avatar.ts";

test("maps keyboard controls to rotate, zoom, and reset commands", () => {
  assert.deepEqual(avatarViewCommandForKey("ArrowLeft"), { type: "rotate", radians: -0.18 });
  assert.deepEqual(avatarViewCommandForKey("ArrowRight"), { type: "rotate", radians: 0.18 });
  assert.deepEqual(avatarViewCommandForKey("ArrowUp"), { type: "zoom", amount: -0.35 });
  assert.deepEqual(avatarViewCommandForKey("-"), { type: "zoom", amount: 0.35 });
  assert.deepEqual(avatarViewCommandForKey("1"), { type: "view", mode: "full-body" });
  assert.deepEqual(avatarViewCommandForKey("2"), { type: "view", mode: "portrait" });
  assert.deepEqual(avatarViewCommandForKey("3"), { type: "view", mode: "detail" });
  assert.deepEqual(avatarViewCommandForKey("Home"), { type: "reset" });
  assert.equal(avatarViewCommandForKey("Enter"), null);
});

test("camera distance stays within the approved viewer range", () => {
  assert.equal(clampAvatarCameraDistance(0), AVATAR_CAMERA_MIN_DISTANCE);
  assert.equal(clampAvatarCameraDistance(20), AVATAR_CAMERA_MAX_DISTANCE);
  assert.equal(clampAvatarCameraDistance(AVATAR_CAMERA_DEFAULT_DISTANCE), AVATAR_CAMERA_DEFAULT_DISTANCE);
  assert.equal(AVATAR_VIEW_PRESETS.portrait.distance, AVATAR_CAMERA_MIN_DISTANCE);
  assert.equal(AVATAR_VIEW_PRESETS["full-body"].distance, AVATAR_CAMERA_DEFAULT_DISTANCE);
});

test("describes every recipe category without relying on the renderer", () => {
  assert.equal(
    describeAvatarRecipe(DEFAULT_AVATAR_RECIPE),
    "Body: cryptic-humanoid-v1, copper skin material. Hair: no selection in this recipe version. Wardrobe: signal. Traits: none selected. Signals: cyan.",
  );
});
