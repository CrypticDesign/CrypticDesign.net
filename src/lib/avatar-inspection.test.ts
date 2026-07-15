import assert from "node:assert/strict";
import test from "node:test";

import { applyInspectionCommand, buildInspectionAlternative, canConfirmFromInspection, describeInspectionChange, shouldAnimateInspection, type AvatarInspectionState } from "./avatar-inspection.ts";

const base: AvatarInspectionState = { view: "full_body", rotationDegrees: 0, rendererMode: "webgl", motionPreference: "full" };

test("provides deterministic keyboard-equivalent view and rotation commands", () => {
  const rotated = applyInspectionCommand(applyInspectionCommand(base, "rotate_left"), "show_portrait");
  assert.deepEqual(rotated, { ...base, view: "portrait", rotationDegrees: 345 });
  assert.deepEqual(applyInspectionCommand(rotated, "reset"), base);
});

test("disables animation for reduced motion and non-WebGL presentations", () => {
  assert.equal(shouldAnimateInspection(base), true);
  assert.equal(shouldAnimateInspection({ ...base, motionPreference: "reduced" }), false);
  assert.equal(shouldAnimateInspection({ ...base, rendererMode: "static" }), false);
  assert.equal(shouldAnimateInspection({ ...base, rendererMode: "text" }), false);
});

test("builds a structured textual recipe and requires portrait and full-body alternatives", () => {
  const alternative = buildInspectionAlternative({ characterName: "Nova", recipe: { body: "Body A", hair: null, wardrobe: ["Blue jacket"], traits: [], signals: ["First signal"] } });
  assert.equal(alternative.heading, "Nova appearance");
  assert.deepEqual(alternative.staticViews, ["portrait", "full_body"]);
  assert.deepEqual(alternative.sections.map(({ label }) => label), ["Body", "Hair", "Wardrobe", "Traits", "Signals"]);
  assert.deepEqual(alternative.sections[1].values, ["None selected"]);
});

test("preserves confirmation parity without WebGL", () => {
  for (const rendererMode of ["webgl", "static", "text"] as const) {
    assert.equal(canConfirmFromInspection({ compatibilityValid: true, recipeComplete: true, rendererMode }), true);
  }
  assert.equal(canConfirmFromInspection({ compatibilityValid: false, recipeComplete: true, rendererMode: "text" }), false);
  assert.equal(canConfirmFromInspection({ compatibilityValid: true, recipeComplete: false, rendererMode: "static" }), false);
});

test("creates a concise status announcement after inspection changes", () => {
  assert.equal(describeInspectionChange({ ...base, view: "detail", rotationDegrees: 30 }), "detail view, 30 degrees, webgl presentation");
});
