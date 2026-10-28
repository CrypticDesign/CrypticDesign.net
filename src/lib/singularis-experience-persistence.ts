import type { ExperienceCheckpointDraft } from "./experience-persistence";
import type { GamespacePhase, SingularisGamespaceState } from "./singularis-gamespace";

export const SINGULARIS_EXPERIENCE_ID = "singularis:continuous-gamespace:v1" as const;
export const SINGULARIS_SAVE_SCHEMA_VERSION = "singularis-gamespace:1" as const;

const SAVEABLE_PHASES = new Set<GamespacePhase>([
  "preparation",
  "training",
  "interrupted",
  "complete",
  "updated",
  "synchronized",
  "operation",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<TValue extends string>(value: unknown, choices: readonly TValue[]): value is TValue {
  return typeof value === "string" && choices.includes(value as TValue);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export function isSingularisGamespaceState(value: unknown): value is SingularisGamespaceState {
  if (!isRecord(value) || !isRecord(value.player) || !isRecord(value.session) || !isRecord(value.world)) return false;
  return isOneOf(value.phase, ["arrival", "preparation", "entering", "training", "interrupted", "complete", "updated", "synchronized", "operation"])
    && typeof value.player.memberId === "string" && value.player.memberId.length > 0
    && typeof value.player.pilotCallsign === "string"
    && isOneOf(value.player.pilotStatus, ["candidate", "active"])
    && value.player.leviathan === "Leviathan 01"
    && isOneOf(value.player.leviathanBond, ["pending", "established"])
    && isOneOf(value.player.progression, ["uninitiated", "cadet"])
    && typeof value.player.introductoryOperationsUnlocked === "boolean"
    && typeof value.player.transitEscortAvailable === "boolean"
    && isNonNegativeInteger(value.player.trainingRecordCount)
    && typeof value.session.sessionId === "string" && value.session.sessionId.length > 0
    && isOneOf(value.session.runtimeMode, ["observational", "simulation"])
    && isOneOf(value.session.simulationId, ["Training Simulation 01", "Transit Escort 01"])
    && isNonNegativeInteger(value.session.checkpoint)
    && isOneOf(value.session.inputState, ["locked", "active"])
    && isOneOf(value.session.focusState, ["present", "lost"])
    && isOneOf(value.session.transitionState, ["idle", "expanding", "ready"])
    && isOneOf(value.session.pauseState, ["running", "suspended", "ended"])
    && typeof value.session.completionCommitted === "boolean"
    && isNonNegativeInteger(value.session.score)
    && isNonNegativeInteger(value.session.wave) && value.session.wave >= 1
    && isNonNegativeInteger(value.session.waveCount) && value.session.waveCount >= 1
    && isNonNegativeInteger(value.session.coreIntegrity) && value.session.coreIntegrity <= 100
    && isNonNegativeInteger(value.world.worldTimestamp)
    && isNonNegativeInteger(value.world.activeEventCount)
    && isNonNegativeInteger(value.world.trafficCycle)
    && isNonNegativeInteger(value.world.patrolCycle)
    && isNonNegativeInteger(value.world.distressSignalCount)
    && value.world.warEffortContribution === 0
    && value.world.combatReward === 0
    && value.world.territoryChanges === 0;
}

function lifecycleForState(state: SingularisGamespaceState): ExperienceCheckpointDraft<SingularisGamespaceState>["lifecycle"] {
  if (state.phase === "interrupted") return "interrupted";
  if (["complete", "updated", "synchronized"].includes(state.phase)) return "completed";
  if (state.phase === "preparation" && state.session.pauseState === "ended") return "ended";
  return "checkpoint";
}

export function createSingularisCheckpointDraft(
  state: SingularisGamespaceState,
  subjectId: string,
  sequence: number,
): ExperienceCheckpointDraft<SingularisGamespaceState> {
  const payload: SingularisGamespaceState = {
    ...state,
    player: { ...state.player, memberId: subjectId },
  };
  return {
    experienceId: SINGULARIS_EXPERIENCE_ID,
    subjectId,
    schemaVersion: SINGULARIS_SAVE_SCHEMA_VERSION,
    sequence,
    lifecycle: lifecycleForState(state),
    idempotencyKey: [
      state.session.sessionId,
      state.phase,
      state.session.simulationId,
      state.session.checkpoint,
      state.session.completionCommitted ? "committed" : "open",
    ].join(":"),
    payload,
  };
}

export function shouldPersistSingularisState(
  previous: SingularisGamespaceState | null,
  current: SingularisGamespaceState,
): boolean {
  if (!previous || !SAVEABLE_PHASES.has(current.phase)) return false;
  if (
    current.session.checkpoint !== previous.session.checkpoint
    && (current.phase === "training" || current.phase === "operation")
  ) return true;
  return current.phase !== previous.phase
    && ["preparation", "interrupted", "complete", "updated", "synchronized"].includes(current.phase);
}
