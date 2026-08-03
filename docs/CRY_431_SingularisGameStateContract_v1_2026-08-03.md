# CRY-431 Singularis Game-State Contract v1

Status: WORKING — implementation boundary, not locked Singularis canon
Owner: Robert Croft
Date: 2026-08-03

## Purpose

Define the boundary between the embedded Singularis runtime and CrypticDesign.net so the Continuous Gamespace can move from deterministic prototype state to authoritative game state without changing the approved page flow.

The local prototype remains the review harness. It is not evidence that combat, rewards, progression, or shared-world mutations occurred.

## Ownership boundary

### Runtime owns immediate play state

- Operation instance and runtime lifecycle
- Input lock and focus state
- Score, wave, checkpoint, craft integrity, pause, and completion candidate
- Frame-rate-sensitive movement, combat, collision, audio, and presentation
- A signed or otherwise verifiable completion payload presented to the platform

### Platform owns durable state

- CrypticDesign.net member and Singularis Pilot identity
- Leviathan assignment and bond state
- Verified training records and Pilot progression
- Entitlements and available Operations
- Accepted rewards, inventory, and unlocks
- Persistent-world events, territory, and war-effort mutations
- Idempotency, audit history, and reconciliation status

The runtime may propose durable changes. Only the platform service may commit them.

## Versioned envelope

Every runtime message must include:

- `contractVersion`: initially `1`
- `messageId`: globally unique and replay-safe
- `messageType`: lifecycle, telemetry, checkpoint, interruption, or completion
- `memberId`, `pilotId`, `sessionId`, and `operationId`
- `runtimeBuildId` and `contentManifestVersion`
- `occurredAt`: server-comparable UTC timestamp
- `sequence`: monotonically increasing within the session
- `payload`: message-type-specific data
- `integrity`: verification metadata; production mechanism remains an engineering decision

## Minimum runtime snapshot

```ts
interface SingularisRuntimeSnapshotV1 {
  contractVersion: 1;
  sessionId: string;
  operationId: "training-01" | "transit-escort-01" | string;
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
```

Telemetry is display state and recovery context. It does not directly grant durable progression.

## Completion proposal

A completion proposal must contain the final snapshot, objective results, elapsed active time, checkpoint history digest, runtime/content versions, and idempotency key. The platform validates identity, session ownership, allowable transition, sequencing, integrity evidence, and whether the same completion was already accepted.

The platform returns one of:

- `accepted`: durable changes committed once
- `duplicate`: prior accepted result returned without another grant
- `rejected`: no durable changes committed, with a safe reason code
- `pending_review`: no user-facing grant until reconciliation finishes

Training completion must never create combat rewards, territory changes, or war-effort contribution.

## Interruption and recovery

Interruption preserves Pilot identity, craft assignment, current checkpoint, and the last acknowledged runtime sequence. Ending a training simulation records no result, reward, penalty, territory change, or war-effort contribution. Resume starts from the most recent valid checkpoint and must not replay a previously committed grant.

## Prototype adapter

The current local adapter supplies deterministic snapshots for all review states:

1. First Contact
2. Pilot Preparation
3. Entering Training
4. Active Gameplay
5. Interruption
6. Training Complete
7. Pilot Preparation Updated
8. Persistent World Synchronized
9. Transit Escort Operation

Prototype controls may load any state, replay training, or clear local Pilot persistence. These actions are development-only and must not be exposed as production mutation endpoints.

## Integration loop

- Trigger: runtime starts, checkpoints, loses focus, completes, or ends.
- Stop condition: message acknowledged, completion resolved, runtime ends, or reconciliation requires owner/engineering review.
- Source inputs: runtime snapshot, authenticated platform identity, operation manifest, prior acknowledged sequence, and platform durable state.
- Authority class: runtime telemetry is observational; durable platform writes require an approved authenticated service path.
- Verification: schema/version validation, authenticated ownership, monotonic sequence, idempotency, allowable state transition, and integration tests.
- Escalation boundary: contract-version conflict, integrity failure, impossible transition, duplicate payload mismatch, reward/progression dispute, or persistent-world mutation ambiguity.
- Usage guardrail: checkpoint and lifecycle messages only by default; high-frequency telemetry remains inside the runtime unless explicitly required for recovery or diagnostics.

## Acceptance criteria for production integration

- The page can hydrate Pilot preparation from platform durable state.
- Every runtime lifecycle state maps to one Continuous Gamespace state.
- Duplicate completion delivery cannot duplicate progression or rewards.
- Focus loss and resume retain the last valid checkpoint.
- Training completion unlocks the approved introductory Operation and nothing else.
- A rejected or unavailable service fails closed without fabricating progression.
- Contract and runtime build versions appear in diagnostic evidence without exposing credentials or sensitive payloads.

## Open decisions

- Runtime transport and integrity mechanism
- Checkpoint retention duration and server storage
- Offline or degraded-network policy
- Production telemetry retention and privacy limits
- Which service owns persistent-world reconciliation

These decisions remain WORKING and require Robert-approved implementation direction before production integration.
