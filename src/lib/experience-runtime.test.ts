import assert from "node:assert/strict";
import test from "node:test";

import {
  EXPERIENCE_RUNTIME_CONTEXT_VERSION,
  createExperienceRuntimeState,
  experienceRuntimeReducer,
  runtimeLauncherLabel,
  type ExperienceRuntimeAction,
  type ExperienceRuntimeAuthoritativeContextV1,
} from "./experience-runtime.ts";

const context: ExperienceRuntimeAuthoritativeContextV1 = {
  contractVersion: EXPERIENCE_RUNTIME_CONTEXT_VERSION,
  experienceId: "cryptic-design:entertainment:v1",
  access: { status: "public" },
  resume: { status: "none" },
};

function apply(actions: ExperienceRuntimeAction[]) {
  return actions.reduce(experienceRuntimeReducer, createExperienceRuntimeState(context));
}

test("models the canonical embedded activation, fullscreen, interruption, and update path", () => {
  const active = apply([
    { type: "PRESENT" }, { type: "READY" }, { type: "ACTIVATE" }, { type: "ACTIVATED" }, { type: "ENTER_FULLSCREEN" },
  ]);
  assert.equal(active.phase, "active-fullscreen");
  assert.equal(active.inputOwner, "runtime");

  const updateActions: ExperienceRuntimeAction[] = [
    { type: "EXIT_FULLSCREEN" }, { type: "INTERRUPT" }, { type: "RESOLVE" }, { type: "UPDATE" },
  ];
  const updated = updateActions.reduce(experienceRuntimeReducer, active);
  assert.equal(updated.phase, "updated");
  assert.equal(updated.inputOwner, "page");
});

test("fullscreen failure keeps the same embedded session active", () => {
  const active = apply([{ type: "PRESENT" }, { type: "READY" }, { type: "ACTIVATE" }, { type: "ACTIVATED" }]);
  const failed = experienceRuntimeReducer(active, { type: "FULLSCREEN_FAILED", reason: "permission-denied" });
  assert.equal(failed.phase, "active-embedded");
  assert.equal(failed.inputOwner, "runtime");
  assert.equal(failed.fullscreenFailure, "permission-denied");
  assert.equal(failed.context, context);
});

test("invalid transitions are ignored and fallback remains semantic-page owned", () => {
  const initial = createExperienceRuntimeState(context);
  assert.equal(experienceRuntimeReducer(initial, { type: "ACTIVATE" }), initial);
  const fallback = experienceRuntimeReducer(initial, { type: "FALLBACK", reason: "webgl-unavailable" });
  assert.equal(fallback.phase, "fallback");
  assert.equal(fallback.inputOwner, "page");
  const recovered = experienceRuntimeReducer(fallback, { type: "PRESENT" });
  assert.equal(recovered.phase, "presentation");
  assert.equal(recovered.fallbackReason, undefined);
});

test("accepts versioned authoritative resume context without inventing persistence", () => {
  const resumable: ExperienceRuntimeAuthoritativeContextV1 = {
    ...context,
    access: { status: "authorized", subjectId: "member-from-platform" },
    resume: { status: "available", checkpointId: "checkpoint-from-resolver", schemaVersion: "3" },
  };
  assert.equal(runtimeLauncherLabel(resumable), "Continue");
  assert.equal(runtimeLauncherLabel({ ...resumable, resume: { status: "incompatible" } }), "Unavailable");
  assert.equal(runtimeLauncherLabel(undefined), "Play");
});

test("audio consent and volume are explicit and bounded", () => {
  const state = experienceRuntimeReducer(createExperienceRuntimeState(context), {
    type: "SET_AUDIO", consent: "granted", muted: false, volume: 4,
  });
  assert.deepEqual(state.audio, { consent: "granted", muted: false, volume: 1 });
});
