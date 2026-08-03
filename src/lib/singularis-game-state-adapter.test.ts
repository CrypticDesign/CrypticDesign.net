import assert from "node:assert/strict";
import test from "node:test";
import { createSingularisDemoState } from "./singularis-gamespace.ts";
import { createProductionGameStateAdapter, type SingularisCompletionProposalV1 } from "./singularis-game-state-adapter.ts";

const proposal: SingularisCompletionProposalV1 = {
  contractVersion: 1,
  idempotencyKey: "completion-1",
  memberId: "member-1",
  pilotId: "pilot-1",
  runtimeBuildId: "runtime-1",
  contentManifestVersion: "manifest-1",
  finalSnapshot: {
    contractVersion: 1,
    sessionId: "session-1",
    operationId: "training-01",
    lifecycle: "completed",
    checkpoint: 4,
    score: 256_480,
    wave: 8,
    waveCount: 8,
    coreIntegrity: 62,
    inputState: "locked",
    focusState: "present",
    occurredAt: "2026-08-03T00:00:00.000Z",
    sequence: 12,
  },
  objectiveResults: [{ objectiveId: "flight-controls", completed: true }],
  activeDurationMs: 180_000,
  checkpointHistoryDigest: "sha256:prototype",
};

test("fails closed when production transport is not configured", async () => {
  const adapter = createProductionGameStateAdapter();
  assert.equal((await adapter.hydrate("member-1")).status, "unavailable");
  assert.equal((await adapter.submitCompletion(proposal)).status, "unavailable");
});

test("accepts only authoritative state returned by the platform transport", async () => {
  const state = createSingularisDemoState("updated", 1_000);
  const adapter = createProductionGameStateAdapter({
    hydrate: async () => state,
    submitCompletion: async () => ({ status: "accepted", state }),
  });
  assert.deepEqual(await adapter.hydrate("member-1"), { status: "ready", state });
  assert.deepEqual(await adapter.submitCompletion(proposal), { status: "accepted", state });
});

test("rejects malformed runtime and platform envelopes without granting progress", async () => {
  const adapter = createProductionGameStateAdapter({
    hydrate: async () => ({ phase: "updated" }),
    submitCompletion: async () => ({ status: "accepted" }),
  });
  assert.equal((await adapter.hydrate("member-1")).status, "unavailable");
  assert.equal((await adapter.submitCompletion({ ...proposal, finalSnapshot: { ...proposal.finalSnapshot, coreIntegrity: 101 } })).status, "rejected");
  assert.equal((await adapter.submitCompletion(proposal)).status, "rejected");
});
