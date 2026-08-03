import type { SingularisGamespaceState } from "./singularis-gamespace";

export const SINGULARIS_GAME_STATE_CONTRACT_VERSION = 1 as const;

export interface SingularisRuntimeSnapshotV1 {
  contractVersion: typeof SINGULARIS_GAME_STATE_CONTRACT_VERSION;
  sessionId: string;
  operationId: string;
  lifecycle: "entering" | "active" | "interrupted" | "completed" | "ended";
  checkpoint: number;
  score: number;
  wave: number;
  waveCount: number;
  coreIntegrity: number;
  inputState: "locked" | "active";
  focusState: "present" | "lost";
  occurredAt: string;
  sequence: number;
}

export interface SingularisCompletionProposalV1 {
  contractVersion: typeof SINGULARIS_GAME_STATE_CONTRACT_VERSION;
  idempotencyKey: string;
  memberId: string;
  pilotId: string;
  runtimeBuildId: string;
  contentManifestVersion: string;
  finalSnapshot: SingularisRuntimeSnapshotV1;
  objectiveResults: ReadonlyArray<{ objectiveId: string; completed: boolean }>;
  activeDurationMs: number;
  checkpointHistoryDigest: string;
}

export type SingularisCompletionResolution =
  | { status: "accepted" | "duplicate"; state: SingularisGamespaceState }
  | { status: "rejected" | "pending_review" | "unavailable"; reason: string };

export interface SingularisGameStateAdapter {
  hydrate(memberId: string): Promise<{ status: "ready"; state: SingularisGamespaceState } | { status: "unavailable"; reason: string }>;
  submitCompletion(proposal: SingularisCompletionProposalV1): Promise<SingularisCompletionResolution>;
}

export interface SingularisGameStateTransport {
  hydrate(memberId: string, contractVersion: number): Promise<unknown>;
  submitCompletion(proposal: SingularisCompletionProposalV1): Promise<unknown>;
}

function isGamespaceState(value: unknown): value is SingularisGamespaceState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SingularisGamespaceState>;
  return typeof candidate.phase === "string" && !!candidate.player && !!candidate.session && !!candidate.world;
}

export function isRuntimeSnapshotV1(value: unknown): value is SingularisRuntimeSnapshotV1 {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<SingularisRuntimeSnapshotV1>;
  return snapshot.contractVersion === 1
    && typeof snapshot.sessionId === "string"
    && typeof snapshot.operationId === "string"
    && typeof snapshot.sequence === "number"
    && Number.isInteger(snapshot.sequence)
    && snapshot.sequence >= 0
    && typeof snapshot.checkpoint === "number"
    && typeof snapshot.score === "number"
    && typeof snapshot.coreIntegrity === "number"
    && snapshot.coreIntegrity >= 0
    && snapshot.coreIntegrity <= 100;
}

export function createProductionGameStateAdapter(transport?: SingularisGameStateTransport): SingularisGameStateAdapter {
  return {
    async hydrate(memberId) {
      if (!transport) return { status: "unavailable", reason: "Production game-state transport is not configured." };
      try {
        const response = await transport.hydrate(memberId, SINGULARIS_GAME_STATE_CONTRACT_VERSION);
        if (!isGamespaceState(response)) return { status: "unavailable", reason: "Platform returned an invalid game-state envelope." };
        return { status: "ready", state: response };
      } catch {
        return { status: "unavailable", reason: "Platform game state could not be reached." };
      }
    },
    async submitCompletion(proposal) {
      if (!isRuntimeSnapshotV1(proposal.finalSnapshot)) return { status: "rejected", reason: "Completion snapshot failed contract validation." };
      if (!transport) return { status: "unavailable", reason: "Production completion transport is not configured." };
      try {
        const response = await transport.submitCompletion(proposal);
        if (!response || typeof response !== "object" || !("status" in response)) return { status: "rejected", reason: "Platform returned an invalid completion resolution." };
        const resolution = response as SingularisCompletionResolution;
        if (["accepted", "duplicate"].includes(resolution.status) && !("state" in resolution && isGamespaceState(resolution.state))) return { status: "rejected", reason: "Accepted completion omitted authoritative state." };
        if (!["accepted", "duplicate", "rejected", "pending_review", "unavailable"].includes(resolution.status)) return { status: "rejected", reason: "Platform returned an unknown completion status." };
        return resolution;
      } catch {
        return { status: "unavailable", reason: "Completion could not be reconciled with the platform." };
      }
    },
  };
}
