import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_AVATAR_RECIPE, validateAvatarRecipe } from "./avatar.ts";

test("accepts the portable versioned avatar recipe", () => assert.deepEqual(validateAvatarRecipe(DEFAULT_AVATAR_RECIPE), DEFAULT_AVATAR_RECIPE));
test("rejects unknown avatar assets and recipe versions", () => {
  assert.throws(() => validateAvatarRecipe({ ...DEFAULT_AVATAR_RECIPE, outfit: "remote-upload" }), /Unknown avatar outfit/);
  assert.throws(() => validateAvatarRecipe({ ...DEFAULT_AVATAR_RECIPE, schemaVersion: 2 }), /Unsupported avatar recipe/);
});
