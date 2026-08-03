import assert from "node:assert/strict";
import test from "node:test";
import { createSingularisDemoState, createSingularisGamespaceState, singularisGamespaceReducer, type SingularisSimpleActionType } from "./singularis-gamespace.ts";

const reduce = (state: ReturnType<typeof createSingularisGamespaceState>, type: SingularisSimpleActionType) =>
  singularisGamespaceReducer(state, { type });

function activeState() {
  let state = createSingularisGamespaceState(1_000);
  for (const action of ["PREPARE", "ENTER_TRAINING", "RUNTIME_READY"] as const) state = reduce(state, action);
  return state;
}

test("moves explicitly from arrival through active training", () => {
  const state = activeState();
  assert.equal(state.phase, "training");
  assert.equal(state.session.runtimeMode, "simulation");
  assert.equal(state.session.inputState, "active");
});

test("interruption retains identity, craft, and checkpoint and resume does not restart", () => {
  let state = reduce(activeState(), "ADVANCE_CHECKPOINT");
  const identity = state.player;
  state = reduce(state, "INTERRUPT");
  assert.equal(state.player, identity);
  assert.equal(state.player.leviathan, "Leviathan 01");
  assert.equal(state.session.checkpoint, 1);
  state = reduce(state, "RESUME");
  assert.equal(state.session.checkpoint, 1);
  assert.equal(state.session.inputState, "active");
});

test("ending training records no result, reward, penalty, or war effort", () => {
  const state = reduce(reduce(activeState(), "INTERRUPT"), "END_SIMULATION");
  assert.equal(state.phase, "preparation");
  assert.equal(state.player.trainingRecordCount, 0);
  assert.equal(state.world.combatReward, 0);
  assert.equal(state.world.warEffortContribution, 0);
  assert.equal(state.world.territoryChanges, 0);
});

test("completion activates the pilot and unlocks Operations exactly once", () => {
  let state = reduce(activeState(), "COMPLETE_TRAINING");
  assert.equal(state.player.pilotStatus, "active");
  assert.equal(state.player.introductoryOperationsUnlocked, true);
  assert.equal(state.player.transitEscortAvailable, true);
  assert.equal(state.player.trainingRecordCount, 1);
  state = reduce(state, "COMPLETE_TRAINING");
  assert.equal(state.player.trainingRecordCount, 1);
  assert.equal(state.world.warEffortContribution, 0);
});

test("world state advances independently without mutating session state", () => {
  const state = activeState();
  const next = reduce(state, "WORLD_TICK");
  assert.equal(next.session, state.session);
  assert.equal(next.world.worldTimestamp, state.world.worldTimestamp + 60_000);
  assert.equal(next.world.trafficCycle, 1);
});

test("hydrates a returning Pilot without skipping the First Contact overview", () => {
  const state = reduce(createSingularisGamespaceState(), "HYDRATE_RETURNING_PILOT");
  assert.equal(state.phase, "arrival");
  assert.equal(state.player.pilotStatus, "active");
  assert.equal(state.player.leviathanBond, "established");
  assert.equal(state.player.transitEscortAvailable, true);
});

test("launches Transit Escort for an active Pilot and returns to preparation", () => {
  let state = reduce(createSingularisGamespaceState(), "HYDRATE_RETURNING_PILOT");
  state = reduce(state, "PREPARE");
  state = reduce(state, "BEGIN_TRANSIT_ESCORT");
  assert.equal(state.phase, "operation");
  assert.equal(state.session.simulationId, "Transit Escort 01");
  assert.equal(state.session.inputState, "active");
  state = reduce(state, "END_OPERATION");
  assert.equal(state.phase, "preparation");
  assert.equal(state.session.runtimeMode, "observational");
});

test("creates every review phase with internally consistent deterministic game state", () => {
  const phases = ["arrival", "preparation", "entering", "training", "interrupted", "complete", "updated", "synchronized", "operation"] as const;
  for (const phase of phases) assert.equal(createSingularisDemoState(phase, 1_000).phase, phase);
  const operation = createSingularisDemoState("operation", 1_000);
  assert.equal(operation.session.simulationId, "Transit Escort 01");
  assert.equal(operation.session.score, 256_480);
  assert.equal(operation.session.wave, 5);
  assert.equal(operation.player.pilotStatus, "active");
});

test("reset clears durable pilot progress and replay creates a fresh training runtime", () => {
  const operation = createSingularisDemoState("operation", 1_000);
  const reset = singularisGamespaceReducer(operation, { type: "RESET_EXPERIENCE" });
  assert.equal(reset.phase, "arrival");
  assert.equal(reset.player.pilotStatus, "candidate");
  const replay = singularisGamespaceReducer(operation, { type: "REPLAY_TRAINING" });
  assert.equal(replay.phase, "entering");
  assert.equal(replay.session.simulationId, "Training Simulation 01");
  assert.equal(replay.session.score, 0);
  assert.equal(replay.session.completionCommitted, false);
});
