import assert from "node:assert/strict";
import test from "node:test";
import {
  CHARACTER_FORGE_STEPS,
  canOpenCharacterForgeStep,
  validateCharacterForgeIdentity,
} from "./character-forge-controls.ts";

test("the Forge uses the approved classless step model", () => {
  assert.deepEqual(CHARACTER_FORGE_STEPS, ["Identity", "Form", "Style", "Story", "Review"]);
  assert.ok(!CHARACTER_FORGE_STEPS.includes("Signal" as never));
});

test("identity validation explains missing and malformed values", () => {
  assert.deepEqual(validateCharacterForgeIdentity("", ""), {
    name: "Enter a display name.",
    handle: "Enter a handle.",
  });
  assert.deepEqual(validateCharacterForgeIdentity("Nova", "Not Valid"), {
    handle: "Use 3–32 lowercase letters, numbers, or hyphens.",
  });
  assert.deepEqual(validateCharacterForgeIdentity("Nova", "nova-one"), {});
});

test("future steps stay locked until the preceding flow unlocks them", () => {
  assert.equal(canOpenCharacterForgeStep(0, 0), true);
  assert.equal(canOpenCharacterForgeStep(1, 0), false);
  assert.equal(canOpenCharacterForgeStep(3, 3), true);
  assert.equal(canOpenCharacterForgeStep(5, 5), false);
});
