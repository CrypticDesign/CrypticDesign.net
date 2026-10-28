import assert from "node:assert/strict";
import test from "node:test";

import {
  SINGULARIS_EXPERIENCE_ID,
  SINGULARIS_SAVE_SCHEMA_VERSION,
  createSingularisCheckpointDraft,
  isSingularisGamespaceState,
  shouldPersistSingularisState,
} from "./singularis-experience-persistence.ts";
import { createSingularisGamespaceState, singularisGamespaceReducer } from "./singularis-gamespace.ts";

test("uses stable game-edition identity rather than a route URL", () => {
  assert.equal(SINGULARIS_EXPERIENCE_ID, "singularis:continuous-gamespace:v1");
  assert.doesNotMatch(SINGULARIS_EXPERIENCE_ID, /^\//);
});

test("creates a versioned member-bound checkpoint without granting new progress", () => {
  let state = createSingularisGamespaceState(1_000);
  state = singularisGamespaceReducer(state, { type: "PREPARE" });
  state = singularisGamespaceReducer(state, { type: "ENTER_TRAINING" });
  state = singularisGamespaceReducer(state, { type: "RUNTIME_READY" });
  state = singularisGamespaceReducer(state, { type: "ADVANCE_CHECKPOINT" });
  const draft = createSingularisCheckpointDraft(state, "member-authorized", 4);
  assert.equal(draft.experienceId, SINGULARIS_EXPERIENCE_ID);
  assert.equal(draft.schemaVersion, SINGULARIS_SAVE_SCHEMA_VERSION);
  assert.equal(draft.payload.player.memberId, "member-authorized");
  assert.equal(draft.payload.session.checkpoint, 1);
  assert.equal(draft.payload.player.pilotStatus, "candidate");
  assert.equal(draft.lifecycle, "checkpoint");
});

test("persists only bounded checkpoint and lifecycle transitions", () => {
  const arrival = createSingularisGamespaceState(1_000);
  const preparation = singularisGamespaceReducer(arrival, { type: "PREPARE" });
  const entering = singularisGamespaceReducer(preparation, { type: "ENTER_TRAINING" });
  const training = singularisGamespaceReducer(entering, { type: "RUNTIME_READY" });
  const checkpoint = singularisGamespaceReducer(training, { type: "ADVANCE_CHECKPOINT" });
  assert.equal(shouldPersistSingularisState(null, arrival), false);
  assert.equal(shouldPersistSingularisState(arrival, preparation), true);
  assert.equal(shouldPersistSingularisState(preparation, entering), false);
  assert.equal(shouldPersistSingularisState(entering, training), false);
  assert.equal(shouldPersistSingularisState(training, checkpoint), true);
});

test("validates resumable Singularis payload shape", () => {
  assert.equal(isSingularisGamespaceState(createSingularisGamespaceState(1_000)), true);
  assert.equal(isSingularisGamespaceState({ phase: "training", player: {}, session: {}, world: {} }), false);
  assert.equal(isSingularisGamespaceState({
    ...createSingularisGamespaceState(1_000),
    player: { ...createSingularisGamespaceState(1_000).player, pilotStatus: "invented-rank" },
  }), false);
});
