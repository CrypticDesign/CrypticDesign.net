export type GamespacePhase =
  | "arrival"
  | "preparation"
  | "entering"
  | "training"
  | "interrupted"
  | "complete"
  | "updated"
  | "synchronized"
  | "operation";

export interface SingularisPlayerState {
  memberId: string;
  pilotCallsign: string;
  pilotStatus: "candidate" | "active";
  leviathan: "Leviathan 01";
  leviathanBond: "pending" | "established";
  progression: "uninitiated" | "cadet";
  introductoryOperationsUnlocked: boolean;
  transitEscortAvailable: boolean;
  trainingRecordCount: number;
}

export interface SingularisSessionState {
  runtimeMode: "observational" | "simulation";
  simulationId: "Training Simulation 01" | "Transit Escort 01";
  checkpoint: number;
  inputState: "locked" | "active";
  focusState: "present" | "lost";
  transitionState: "idle" | "expanding" | "ready";
  pauseState: "running" | "suspended" | "ended";
  completionCommitted: boolean;
  score: number;
  wave: number;
  waveCount: number;
  coreIntegrity: number;
}

export interface SingularisWorldState {
  worldTimestamp: number;
  activeEventCount: number;
  trafficCycle: number;
  patrolCycle: number;
  distressSignalCount: number;
  warEffortContribution: 0;
  combatReward: 0;
  territoryChanges: 0;
}

export interface SingularisGamespaceState {
  phase: GamespacePhase;
  player: SingularisPlayerState;
  session: SingularisSessionState;
  world: SingularisWorldState;
}

export type SingularisGamespaceAction =
  | { type: "HYDRATE_RETURNING_PILOT" }
  | { type: "PREPARE" }
  | { type: "ENTER_TRAINING" }
  | { type: "RUNTIME_READY" }
  | { type: "ADVANCE_CHECKPOINT" }
  | { type: "INTERRUPT" }
  | { type: "RESUME" }
  | { type: "END_SIMULATION" }
  | { type: "COMPLETE_TRAINING" }
  | { type: "CONTINUE_TO_PREPARATION" }
  | { type: "SYNCHRONIZE_WORLD" }
  | { type: "BEGIN_TRANSIT_ESCORT" }
  | { type: "END_OPERATION" }
  | { type: "RESET_EXPERIENCE" }
  | { type: "REPLAY_TRAINING" }
  | { type: "LOAD_DEMO_PHASE"; phase: GamespacePhase }
  | { type: "WORLD_TICK" };

export type SingularisSimpleActionType = Exclude<SingularisGamespaceAction["type"], "LOAD_DEMO_PHASE">;

export function createSingularisGamespaceState(now = Date.now()): SingularisGamespaceState {
  return {
    phase: "arrival",
    player: {
      memberId: "local-member",
      pilotCallsign: "Pilot Candidate",
      pilotStatus: "candidate",
      leviathan: "Leviathan 01",
      leviathanBond: "pending",
      progression: "uninitiated",
      introductoryOperationsUnlocked: false,
      transitEscortAvailable: false,
      trainingRecordCount: 0,
    },
    session: {
      runtimeMode: "observational",
      simulationId: "Training Simulation 01",
      checkpoint: 0,
      inputState: "locked",
      focusState: "present",
      transitionState: "idle",
      pauseState: "running",
      completionCommitted: false,
      score: 0,
      wave: 1,
      waveCount: 8,
      coreIntegrity: 100,
    },
    world: {
      worldTimestamp: now,
      activeEventCount: 14,
      trafficCycle: 0,
      patrolCycle: 0,
      distressSignalCount: 2,
      warEffortContribution: 0,
      combatReward: 0,
      territoryChanges: 0,
    },
  };
}

function tickWorld(world: SingularisWorldState): SingularisWorldState {
  return {
    ...world,
    worldTimestamp: world.worldTimestamp + 60_000,
    trafficCycle: world.trafficCycle + 1,
    patrolCycle: world.patrolCycle + 1,
    activeEventCount: 14 + ((world.trafficCycle + 1) % 3),
  };
}

export function singularisGamespaceReducer(
  state: SingularisGamespaceState,
  action: SingularisGamespaceAction,
): SingularisGamespaceState {
  switch (action.type) {
    case "HYDRATE_RETURNING_PILOT":
      return {
        ...state,
        player: { ...state.player, pilotStatus: "active", leviathanBond: "established", progression: "cadet", introductoryOperationsUnlocked: true, transitEscortAvailable: true, trainingRecordCount: Math.max(1, state.player.trainingRecordCount) },
      };
    case "PREPARE":
      return state.phase === "arrival" ? { ...state, phase: "preparation" } : state;
    case "ENTER_TRAINING":
      return state.phase === "preparation"
        ? { ...state, phase: "entering", session: { ...state.session, runtimeMode: "simulation", transitionState: "expanding", inputState: "locked" } }
        : state;
    case "RUNTIME_READY":
      return state.phase === "entering"
        ? { ...state, phase: "training", session: { ...state.session, transitionState: "ready", inputState: "active" } }
        : state;
    case "ADVANCE_CHECKPOINT":
      return ["training", "operation"].includes(state.phase)
        ? { ...state, session: { ...state.session, checkpoint: state.session.checkpoint + 1, score: state.session.score + 12_840, wave: Math.min(state.session.waveCount, state.session.wave + 1), coreIntegrity: Math.max(0, state.session.coreIntegrity - 4) } }
        : state;
    case "INTERRUPT":
      return state.phase === "training"
        ? { ...state, phase: "interrupted", session: { ...state.session, inputState: "locked", focusState: "lost", pauseState: "suspended" } }
        : state;
    case "RESUME":
      return state.phase === "interrupted"
        ? { ...state, phase: "training", session: { ...state.session, inputState: "active", focusState: "present", pauseState: "running" } }
        : state;
    case "END_SIMULATION":
      return state.phase === "interrupted"
        ? { ...state, phase: "preparation", session: { ...state.session, runtimeMode: "observational", inputState: "locked", focusState: "present", transitionState: "idle", pauseState: "ended", checkpoint: 0 } }
        : state;
    case "COMPLETE_TRAINING":
      if (state.phase !== "training" || state.session.completionCommitted) return state;
      return {
        ...state,
        phase: "complete",
        player: {
          ...state.player,
          pilotStatus: "active",
          leviathanBond: "established",
          progression: "cadet",
          introductoryOperationsUnlocked: true,
          transitEscortAvailable: true,
          trainingRecordCount: state.player.trainingRecordCount + 1,
        },
        session: { ...state.session, inputState: "locked", pauseState: "ended", completionCommitted: true },
      };
    case "CONTINUE_TO_PREPARATION":
      return state.phase === "complete"
        ? { ...state, phase: "updated", session: { ...state.session, runtimeMode: "observational", transitionState: "idle" }, world: tickWorld(state.world) }
        : state;
    case "SYNCHRONIZE_WORLD":
      return state.phase === "updated" ? { ...state, phase: "synchronized" } : state;
    case "BEGIN_TRANSIT_ESCORT":
      return ["preparation", "synchronized"].includes(state.phase) && state.player.pilotStatus === "active" && state.player.transitEscortAvailable
        ? { ...state, phase: "operation", session: { ...state.session, runtimeMode: "simulation", simulationId: "Transit Escort 01", inputState: "active", focusState: "present", transitionState: "ready", pauseState: "running" } }
        : state;
    case "END_OPERATION":
      return state.phase === "operation"
        ? { ...state, phase: "preparation", session: { ...state.session, runtimeMode: "observational", simulationId: "Training Simulation 01", inputState: "locked", transitionState: "idle", pauseState: "ended" } }
        : state;
    case "RESET_EXPERIENCE":
      return createSingularisGamespaceState(state.world.worldTimestamp);
    case "REPLAY_TRAINING":
      return {
        ...state,
        phase: "entering",
        session: {
          ...state.session,
          runtimeMode: "simulation",
          simulationId: "Training Simulation 01",
          checkpoint: 0,
          inputState: "locked",
          focusState: "present",
          transitionState: "expanding",
          pauseState: "running",
          completionCommitted: false,
          score: 0,
          wave: 1,
          coreIntegrity: 100,
        },
      };
    case "LOAD_DEMO_PHASE":
      return createSingularisDemoState(action.phase, state.world.worldTimestamp);
    case "WORLD_TICK":
      return { ...state, world: tickWorld(state.world) };
    default:
      return state;
  }
}

export function createSingularisDemoState(phase: GamespacePhase, now = Date.now()): SingularisGamespaceState {
  let state = createSingularisGamespaceState(now);
  const reduce = (type: SingularisGamespaceAction["type"]) => {
    state = singularisGamespaceReducer(state, { type } as SingularisGamespaceAction);
  };

  if (phase === "arrival") return state;
  reduce("PREPARE");
  if (phase === "preparation") return state;
  if (["updated", "synchronized", "operation"].includes(phase)) {
    reduce("HYDRATE_RETURNING_PILOT");
    if (phase === "updated") return { ...state, phase: "updated" };
    if (phase === "synchronized") return { ...state, phase: "synchronized" };
    reduce("BEGIN_TRANSIT_ESCORT");
    return { ...state, session: { ...state.session, score: 256_480, wave: 5, coreIntegrity: 62 } };
  }
  reduce("ENTER_TRAINING");
  if (phase === "entering") return state;
  reduce("RUNTIME_READY");
  state = { ...state, session: { ...state.session, score: 256_480, wave: 5, coreIntegrity: 62 } };
  if (phase === "training") return state;
  if (phase === "interrupted") return singularisGamespaceReducer(state, { type: "INTERRUPT" });
  reduce("COMPLETE_TRAINING");
  return state;
}
