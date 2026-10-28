# CRY-508 / CRY-431 Experience Resume Architecture

Status: WORKING — accepted boundary for local implementation; not a production storage decision or locked Singularis canon
Owner: Robert Croft
Date: 2026-10-24

## Decision

CrypticDesign.net uses a provider-neutral, versioned checkpoint contract to resolve the latest valid save for an experience. Experience identity is stable and independent of the current route. The shared `ExperienceRuntime` receives the resulting resume state, while each experience validates and hydrates its own payload.

For this tranche, authenticated Singularis development access may persist bounded checkpoints in the current browser only. Public/accountless sessions remain non-persistent. Production database persistence, transport, authorization policy, retention, and reconciliation remain unapproved and inactive.

## Context

CRY-508 requires one shared latest-valid-save resolver and hydration contract. CRY-431 requires Singularis to enter through the canonical runtime, preserve fullscreen and audio ownership, resume the most recent valid state, avoid continuous writes, and prevent duplicate durable grants.

The current implementation already has exact server-side development authorization and a shared `ExperienceRuntime`. It does not yet have an approved production game-state service. Treating browser storage as production state would blur that authority boundary and could fabricate account progression.

## Architecture

### Shared checkpoint envelope

- Stable `experienceId`, explicit `subjectId`, save-contract version, experience schema version, revision, sequence, lifecycle, timestamp, and idempotency key.
- Resolution selects the newest valid compatible checkpoint.
- Malformed, wrong-subject, wrong-experience, unsupported-contract, and unsupported-schema records are rejected without deleting the prior data.
- If no compatible checkpoint exists, the runtime exposes a recoverable **Start new** state rather than inventing progress.

### Authorization and persistence

- Persistence is allowed only when the server-authoritative runtime context is `authorized` and includes an exact member subject ID.
- The development store is scoped by stable experience ID plus member ID.
- Public, denied, missing-subject, and storage-failure paths run without persistence and state that limitation truthfully.
- Browser storage is labeled `development-preview`; it is not account synchronization.

### Write cadence and integrity

- Writes occur only at meaningful checkpoints and lifecycle transitions, not on world ticks, animation frames, or high-frequency telemetry.
- Idempotency keys prevent the same lifecycle result from being appended twice.
- A failed write preserves the prior checkpoint.
- Singularis completion state remains a proposal boundary; this browser-local adapter grants no production rewards, entitlements, territory changes, or shared-world mutations.

### Runtime ownership

- `ExperienceRuntime` owns presentation, activation, focus, fullscreen, audio priority, interruption, and the authoritative resume context.
- Singularis owns validation and hydration of its experience-specific payload.
- The stable Singularis identity is `singularis:continuous-gamespace:v1`, not a route URL.

## Alternatives considered

1. **Write directly to Supabase now.** Rejected for this tranche because schema, row-level security, atomic write behavior, retention, and production authority are not approved.
2. **Keep the previous single browser boolean.** Rejected because it cannot restore the latest valid state, version payloads, isolate members, or preserve recoverable evidence.
3. **Persist every state change.** Rejected because it creates needless writes, cost, race conditions, and noisy history.
4. **Put Singularis payload rules inside the shared runtime.** Rejected because the shared layer should resolve envelopes while each experience owns its schema.

## Consequences

- CRY-508 gains a reusable resolver and runtime hydration seam that a future production adapter can implement without changing experience identity.
- CRY-431 gains truthful, bounded local resume behavior for authorized development review.
- This tranche does not satisfy production persistence by itself. Jira completion must remain contingent on the approved server-side adapter, authorization, atomic/idempotent writes, and deployed verification required by the source tickets.

## Verification

- Unit tests cover latest-valid selection, incompatible recovery, subject isolation, idempotent writes, write-failure preservation, bounded Singularis save triggers, and runtime launcher state.
- Contract tests verify Singularis consumes the shared runtime and stable identity.
- Type checking, linting, production build, and a local authorized-flow review are required before PR creation.

## Future production gate

Robert approval is required before choosing or activating a provider, creating production persistence resources, changing row-level access policy, publishing a migration, or enabling account-synchronized saves. The production implementation must preserve the contract above and add authenticated ownership, atomic compare-and-write semantics, server-side idempotency, retention policy, observability, and rollback evidence.
