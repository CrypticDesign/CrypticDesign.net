# CRY-307 Character Forge Phase 0 Architecture Contract

**Status:** Local architecture draft — Phase 0
**Date:** 2026-07-14
**Owner:** Robert K. Croft
**Primary Jira:** CRY-307
**Design authority:** Figma file `CjZrOKGoy7zKKFsO1QyPzx`
**Canonical documentation:** Confluence pages `435126273` and `437125121`
**Repository baseline:** `f6686f3b48a8022c8e6da519af59c2063e621b12`
**Prototype evidence:** PR #22 / commit `29c26f53e9bba1224604d94308156028fc5d66ab`

## 1. Purpose

Define the implementation contracts that must be validated before production Character Forge work begins. This document does not approve production implementation, apply database migrations, enable external services, collect telemetry, or authorize public social behavior.

Phase 0 ends when the contracts below are technically coherent, their feasibility spikes pass, unresolved legal and product dependencies are explicit, and Robert grants the next implementation gate.

## 2. Approved Product Decisions

1. The user experience universally presents progression as **Time, eras, and chapters**. Raw point totals and conventional levels are not user-facing. Existing internal level projections may remain internal compatibility infrastructure until separately retired.
2. **Roboto** is the Cryptic Design platform font. Roboto Bold is used for headings, Roboto Regular for body copy, and Roboto Light or another approved Roboto weight for captions.
3. Archetypes and origin classifications are deferred. Character creation remains classless.
4. Public-profile actions **Follow, Appreciate, Save, and Share** are in product scope. They remain disabled for production until privacy, moderation, abuse-prevention, youth-safety, blocking, reporting, and audit requirements are approved.
5. The provisional universal era sequence is **Origin, Awakening, Emergence, Connection, Convergence, Continuum, Legacy**. Post-Legacy progression uses named chapters rather than ranks or prestige cycles.
6. Minor safety and adult-content access are governed by applicable law, jurisdiction, account age, consent, content classification, and visibility policy. Visual presentation age is never an eligibility mechanism.

## 3. Authority and Non-Goals

### Authority order for this contract

1. Verified repository and deployed/build state
2. Figma visual and interaction authority
3. Character System Framework and Character Forge Confluence specification
4. Jira scope and acceptance criteria
5. PR #22 as secondary architecture evidence

Conflicts that change product intent must be returned to Robert rather than silently resolved.

### Phase 0 non-goals

- Production UI implementation
- Production authentication or database provisioning
- Applying the proposed Supabase migrations
- Final 3D art, rig, wardrobe, animation, lighting, or camera production
- Public deployment or production data collection
- Enabling public-profile actions
- Legal conclusions or regional policy decisions
- Billing, paid cosmetics, marketplaces, wagering, or tradable rewards
- Comments, direct messages, public tagging, open feeds, or unrestricted reactions

## 4. Domain Boundaries

Account authority, character identity, avatar appearance, progression, entitlements, and public interaction are separate domains.

No avatar recipe, wardrobe item, Signal choice, expression, profile action, or renderer state may grant authentication authority, membership, purchases, entitlements, Time, attributes, quests, achievements, or rewards.

### Core aggregates

- `CharacterDraft`: private, recoverable work before identity confirmation.
- `CharacterIdentity`: one durable member character created only at confirmation.
- `AvatarRecipe`: portable, versioned appearance and presentation configuration.
- `CharacterVersion`: immutable snapshot of a confirmed character appearance.
- `CharacterProvenanceEvent`: immutable evidence of creation and material changes.
- `AssetManifest`: owned asset, rig, material, expression, wardrobe, and compatibility metadata.
- `PublicCharacterProjection`: explicitly approved, privacy-filtered public representation.
- `PublicProfileAction`: policy-checked Follow, Appreciate, Save, or Share event.

## 5. Character Draft Contract

### Required behavior

- A signed-in account may have one active Forge draft.
- A draft may contain up to three temporary variants.
- Drafts never consume the permanent one-character allowance.
- A draft may use a temporary working name and has no stable public handle.
- Draft autosave is recoverable and private.
- Discard requires explicit confirmation and creates no permanent character history.
- Confirmation consumes exactly one selected variant and creates one canonical identity.
- Failed confirmation leaves the draft recoverable.

### Proposed draft shape

```ts
interface CharacterDraft {
  id: string;
  ownerAccountId: string;
  schemaVersion: 1;
  status: "active" | "confirming" | "consumed" | "discarded";
  workingName: string | null;
  activeVariantId: string;
  variants: CharacterDraftVariant[];
  currentStage: ForgeStage;
  completedStages: ForgeStage[];
  revision: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

interface CharacterDraftVariant {
  id: string;
  label: string;
  recipe: AvatarRecipeV2;
  createdAt: string;
  updatedAt: string;
}

type ForgeStage =
  | "foundation"
  | "features"
  | "style"
  | "expression"
  | "signal"
  | "review";
```

### Concurrency and recovery

- Updates use optimistic concurrency through `revision`.
- Autosave sends an idempotency key and expected revision.
- A stale revision returns a conflict with the latest safe checkpoint.
- Autosave status is announced accessibly as saving, saved, offline, or failed.
- Local fallback storage may cache an encrypted or non-sensitive draft envelope only after privacy review; server state remains authoritative when production persistence exists.

## 6. Stable Identity Confirmation

Confirmation is the only operation that creates a permanent member character.

### Transaction boundary

1. Authenticate the account.
2. Load and lock the active draft revision.
3. Confirm the account has no permanent member character.
4. Validate the selected recipe and compatibility result.
5. Normalize and validate display name and handle.
6. Reserve the handle case-insensitively.
7. Create the stable character UUID.
8. Create avatar version 1.
9. Write creation provenance and character-history events.
10. Mark the draft consumed.
11. Return the private character projection and reveal state.

All steps succeed or none do. Replayed confirmation requests return the original successful result.

### Handle policy contract

- Canonical handles are lowercase and globally unique among active and reserved identities.
- The database uniqueness constraint is authoritative; application preflight is advisory.
- Normalization uses Unicode-aware policy defined before production, even if the initial public alphabet remains restricted.
- Reserved names, impersonation, trademarks, moderation holds, retirement, reuse, and appeal require policy definitions.
- Handle availability responses must not leak private account or character information.

## 7. Avatar Recipe Contract

The current `AvatarRecipe` proves versioning and validation but is not large enough for the approved Forge.

### Proposed V2 envelope

```ts
interface AvatarRecipeV2 {
  schemaVersion: 2;
  rig: { id: string; version: string };
  foundation: {
    bodyPresetId: string;
    presentationPresetId: string;
    agePresentationPresetId: string;
    faceFamilyId: string;
    refinements: Record<string, number>;
  };
  features: {
    face: Record<string, string | number>;
    hairAssetId: string | null;
    skinMaterialId: string;
    traitAssetIds: string[];
  };
  style: {
    equippedLayers: Record<string, string | null>;
    materialVariants: Record<string, string>;
    authoredPaletteId: string;
    savedOutfitIds: string[];
    canonicalOutfitId: string;
    contextAssignments: Record<string, string>;
  };
  expression: {
    baselineId: string;
    contextualRangeId: string;
    idleBehaviorId: string;
    vocalPresenceFamilyId: string | null;
  };
  signal: {
    markingIds: string[];
    accentPaletteId: string | null;
    reactiveEffectId: string | null;
  };
  accessibility: {
    preferredPreviewMode: "motion" | "reduced-motion" | "static";
  };
}
```

### Recipe rules

- Recipes reference owned manifest IDs; they do not embed arbitrary models, textures, scripts, or remote URLs.
- Every recipe version has a deterministic validator and migration path.
- Unknown required assets fail closed; unavailable optional cosmetics produce an explainable fallback proposal.
- Compatibility is evaluated separately from parsing.
- Signal remains cosmetic.
- Spoken voice and voice synthesis are absent from MVP.

## 8. Version History and Provenance

The current history stores event type and changed field names. Production requirements need immutable snapshots.

```ts
interface CharacterVersion {
  id: string;
  characterId: string;
  sequence: number;
  recipeSchemaVersion: number;
  recipeSnapshot: AvatarRecipeV2;
  parentVersionId: string | null;
  sourceDraftId: string | null;
  changeClass: "creation" | "minor" | "major" | "migration" | "correction";
  compatibilityReportId: string;
  createdByAccountId: string;
  createdAt: string;
}

interface CharacterProvenanceEvent {
  id: string;
  characterId: string;
  versionId: string;
  eventType: "created" | "appearance_changed" | "migrated" | "corrected";
  actorType: "account" | "operator" | "system";
  actorId: string;
  source: string;
  occurredAt: string;
  recordedAt: string;
}
```

Versions are append-only. Corrections add evidence; they never rewrite history. Retiring a character does not delete its history. Retention and legally required deletion behavior remain policy-gated.

## 9. Asset, Wardrobe, and Compatibility Contracts

### Manifest requirements

Every production asset declares:

- Stable asset ID and semantic version
- Cryptic ownership or approved rights/provenance record
- GLB/export version and checksum
- Compatible rig and skeleton versions
- Slot, layer, attachment point, and occlusion metadata
- Material and authored palette options
- Topology, polygon, texture, and memory budgets
- LODs and portrait/full-body suitability
- Required blend shapes and animation dependencies
- Youth/content classification metadata where applicable
- Fallback asset and deprecation status

### Wardrobe model

- Modular authored items, not arbitrary uploads.
- Layer-aware compatibility and adaptive fit.
- Five saved outfit slots.
- One canonical outfit.
- Optional context-specific assignments.
- Preview does not imply Apply.
- Missing ownership, incompatibility, or restricted content produces a clear explanation.

### Compatibility result

```ts
interface CompatibilityReport {
  id: string;
  valid: boolean;
  errors: CompatibilityIssue[];
  warnings: CompatibilityIssue[];
  proposedFallbacks: CompatibilityFallback[];
  manifestVersion: string;
}
```

Compatibility is deterministic for a recipe and manifest version and is testable without WebGL.

## 10. Rendering Boundary

React owns application state and accessible controls. Three.js owns visual presentation only.

```ts
interface AvatarRenderer {
  load(input: RendererInput): Promise<RendererResult>;
  updateRecipe(recipe: AvatarRecipeV2): Promise<RendererResult>;
  setView(view: "portrait" | "full-body" | "detail"): void;
  setMotion(mode: "full" | "reduced" | "static"): void;
  captureStaticView(view: "portrait" | "full-body"): Promise<StaticRender>;
  dispose(): void;
}
```

### Renderer requirements

- Dynamic import prevents Three.js from inflating non-Forge routes unnecessarily.
- Renderer failure cannot block recipe inspection, editing, autosave, or confirmation.
- A structured text summary and static image support every critical inspection task.
- Keyboard controls provide rotation/view alternatives; drag is never the only path.
- Reduced motion disables idle rotation, camera sweeps, and reactive Signal motion.
- Resource disposal, context-loss recovery, loading state, performance degradation, and error reporting are explicit.
- The procedural PR #22 model remains a test fixture until approved owned assets exist.

## 11. Responsive UI Contract

### Desktop

- Character remains center-stage.
- Contextual side controls appear only when needed.
- Active controls use a bottom deck.
- Up to three variants may be compared.
- Confirmation actions remain persistently discoverable.

### Mobile

- Vertical task sequence.
- Compact stage remains visible where practical.
- One active bottom sheet or drawer at a time.
- Minimum 44px touch targets.
- Variant comparison becomes focused/swipeable with non-gesture controls.
- Critical state, autosave status, errors, Back, Continue, and confirmation are never obscured.

### Implementation strategy

- Shared stage and domain components with layout-specific composition.
- Container-query-driven panels where practical, with documented viewport fallbacks.
- No duplicated business logic between desktop and mobile.
- Route/state restoration includes stage, active control group, selected variant, and scroll/focus target.

## 12. Accessibility Contract

Target WCAG 2.2 AA.

- Complete keyboard operation and visible focus.
- Logical focus order across stage, steps, panels, sheets, and dialogs.
- Semantic labels and descriptions for every control.
- Arrow-key and direct-entry alternatives for sliders.
- Nonvisual values for palette, material, anatomy, expression, and Signal controls.
- Screen-reader announcements for autosave, validation, compatibility, variant selection, and confirmation.
- Static and structured-text alternatives for critical 3D inspection.
- Reduced-motion and static reveal paths.
- Non-color-dependent states and verified contrast.
- Accessible errors connected to their fields.
- No hover-, drag-, gesture-, sound-, motion-, or WebGL-only critical action.

Automated checks support but do not replace keyboard, screen-reader, contrast, zoom/reflow, and reduced-motion manual validation.

## 13. Public Profile Actions

Follow, Appreciate, Save, and Share are separate policy-controlled commands, not fields on the character recipe.

### Required safeguards before production enablement

- Authentication and authorization policy per action
- Owner visibility and audience controls
- Blocking, reporting, rate limits, spam and abuse detection
- Idempotency and replay protection
- Teen/minor defaults and prohibited interaction rules
- Audit evidence and operator correction paths
- Privacy-safe counts and notifications
- Share-link revocation and indexing policy
- No public exposure solely because a character exists

Public character rendering still requires explicit consent, discoverability, active status, and the platform publication gate.

## 14. Minor Safety and Content Access Boundary

The system must distinguish:

- Account age and verified/declared age status
- Guardian or parental consent where required
- Jurisdiction and applicable policy version
- Character visual presentation age
- Content classification and adult-content designation
- Public visibility, discovery, indexing, sharing, and interaction eligibility

Visual presentation age cannot unlock content, bypass account restrictions, or alter legal eligibility.

Before production, qualified legal review must map supported jurisdictions to consent, age-assurance, parental-control, privacy, retention, deletion, advertising, interaction, and adult-content access requirements. The application consumes a versioned policy decision; UI and renderer code must not embed legal thresholds directly.

## 15. Time, Eras, and Chapters Presentation

User-facing Character Home receives a presentation projection rather than raw RPG ledgers.

```ts
interface CharacterJourneyPresentation {
  era: "origin" | "awakening" | "emergence" | "connection" | "convergence" | "continuum" | "legacy";
  timeLivedLabel: string;
  activeChapter: { id: string; title: string; summary: string };
  nextEraLabel: string | null;
  progressPercent: number | null;
  milestones: JourneyMilestone[];
  recentChapters: JourneyChapter[];
}
```

Raw Time units, attribute usage, and internal level projections remain owner-private evidence or internal calculation data and are not displayed as universal points or levels.

## 16. Testing and Observability Contract

### Required test layers

- Pure schema, migration, and compatibility tests
- Draft concurrency, autosave, recovery, and discard tests
- Confirmation transaction and handle-race tests
- Version/provenance immutability tests
- Component interaction tests for all six stages
- Keyboard and semantic-state tests
- No-WebGL, context-loss, reduced-motion, and static-alternative tests
- Desktop/mobile browser flows
- Visual regression against approved Figma frames
- Privacy, authorization, publication, and public-action abuse tests

### CI entry gate

Before Phase 1 can merge, CI must run tests, ESLint, TypeScript no-emit, production build, migration validation, and dependency review.

### Observability boundary

- Local development may use structured console diagnostics without personal data.
- Production error reporting and telemetry require separate approval, data minimization, retention rules, consent analysis, and secret provisioning.
- No biometric, freeform appearance, minor-status, or private recipe detail enters analytics payloads.

## 17. Phase 0 Validation Spikes

### Spike A — Draft and confirmation transaction

Produce provider-neutral interfaces and an executable local test proving three variants, revision conflicts, failed-confirmation recovery, idempotent confirmation, one character per account, and concurrent handle uniqueness.

### Spike B — Owned GLB feasibility

Using an approved non-production owned test asset, verify loading, rig binding, camera framing, material variants, one wardrobe attachment, static capture, context-loss recovery, memory disposal, and documented desktop/mobile performance budgets.

### Spike C — Compatibility engine

Prove deterministic compatibility outside Three.js for rig, slot, layer, attachment, material, and fallback rules.

### Spike D — Accessible 3D inspection

Prove keyboard view controls, structured recipe summary, static portrait/full-body alternatives, reduced motion, and no-WebGL confirmation parity.

### Spike E — Journey projection

Map existing trusted Time and progression evidence into the approved era/chapter presentation without changing the RPG ledger or exposing raw levels.

### Spike F — Public-action safety model

Threat-model Follow, Appreciate, Save, and Share; define authorization, visibility, blocking, reporting, rate limiting, youth defaults, idempotency, correction, and audit contracts. Do not enable actions.

## 18. Phase 1 Entry Criteria

Phase 1 may begin only when:

- Robert explicitly grants Approved for Implementation status.
- CRY-312 responsive, accessibility, fallback, and 3D requirements are approved.
- Figma production frames use approved tokens/components and cover loading, empty, error, offline, destructive confirmation, reduced motion, and no-WebGL states.
- The production rig and asset-pipeline specification is implementation-ready.
- Draft, confirmation, version, provenance, and compatibility contracts pass Phase 0 validation.
- Production authentication/database work is either approved or Phase 1 is explicitly constrained to a local adapter.
- Minor-safety and content-access dependencies have an approved policy owner and legal-review plan.
- Public-profile actions have an approved safety model or remain feature-disabled.
- CI exists and enforces the repository validation suite.

## 19. Remaining Approval and External Dependencies

- Exact era thresholds and chapter-generation rules
- Production rig, topology, texture, memory, LOD, animation, and camera budgets
- Final owned asset inventory and provenance process
- Supported jurisdictions and legal-review owner
- Account-age assurance and guardian-consent approach
- Public-action notification, count visibility, blocking, and reporting UX
- Production authentication, database, monitoring, telemetry, and deployment authority
- Final Figma component binding and usability validation

## 20. Recommended Next Execution

Begin Phase 0 with Spike A and Spike C because they validate the core draft-to-identity boundary without requiring final 3D assets or production services. Run Spike B and Spike D after an approved owned test GLB and CRY-312 performance/accessibility requirements are available. Keep public actions disabled while Spike F establishes their safety contract.

## 21. Phase 0 Validation Record — 2026-07-14

### Spike A — Draft and confirmation transaction — Passed locally

The isolated provider-neutral spike proves:

- one active private draft per account
- up to three temporary variants without consuming the character allowance
- optimistic revision conflicts with the latest checkpoint preserved
- explicit confirmation before discard
- failed compatibility leaving the draft recoverable
- atomic in-memory confirmation into one stable character
- idempotent confirmation replay
- one character per account
- serialized concurrent handle uniqueness
- draft consumption only after successful confirmation

### Spike C — Compatibility engine — Passed locally

The renderer-independent engine proves:

- deterministic validation for a recipe selection and manifest version
- unknown-asset rejection
- inactive-asset and rig-mismatch rejection
- same-slot/same-layer collision detection
- explicit pairwise incompatibility detection
- authored fallback proposals without invoking WebGL

### Verification

- 64/64 repository tests passed
- ESLint passed
- TypeScript no-emit passed
- Next.js production build passed
- No UI, API route, database migration, external service, deployment, or public action was changed or enabled

### Resulting boundary

Spikes A and C validate the proposed separation among temporary drafts, stable identity creation, and renderer-independent compatibility. They do not approve the in-memory spike classes as the production persistence implementation. Production adapters, database transactions, policy enforcement, and API surfaces remain gated by the Phase 1 entry criteria.

### Spike E — Time, era, and chapter presentation — Passed locally

The pure presentation projection proves:

- verified Time can become a human-readable days-lived label without exposing raw Time, levels, or points
- the approved era order is enforced
- era thresholds and presentation rules are explicitly versioned
- boundary progress is deterministic
- an active chapter and recent completed chapters can be projected separately
- Legacy has no higher rank or prestige cycle; named chapters continue afterward
- malformed, reordered, negative, or fractional Time inputs fail closed

The initial thresholds in the spike are labeled provisional and remain replaceable configuration until Robert approves final pacing. The projection does not mutate the trusted RPG ledger or change its internal calculations.

Updated verification after Spike E:

- 69/69 repository tests passed
- ESLint passed
- TypeScript no-emit passed
- Next.js production build passed

### Spike F — Public-profile action safety model — Passed locally

The disabled policy model proves:

- Follow, Appreciate, Save, and Share remain behind an explicit feature gate
- authentication, active state, and public-rendering eligibility are mandatory
- blocking is enforced in either direction
- jurisdiction/youth/content eligibility enters through an external versioned policy decision rather than hardcoded age thresholds
- Share has a separate eligibility decision
- Follow and Appreciate reject self-interaction while private Save and approved Share may remain available to the owner
- rate-limit exhaustion fails closed
- accepted action evidence records its policy version and replays idempotently
- denied actions cannot become accepted evidence
- operator corrections are additive, auditable, and replay-safe

Updated verification after Spike F:

- 75/75 repository tests passed
- ESLint passed
- TypeScript no-emit passed
- Next.js production build passed after a clean `.next` rebuild
- One local development server was restored and the Character route returned HTTP 200

No public action route, counter, notification, social graph, database table, production policy service, telemetry, or public UI was enabled.

### Spike D — Accessible inspection contract — Asset-independent portion passed locally

The renderer-independent inspection contract proves:

- every inspection change has a deterministic keyboard-equivalent command
- portrait, full-body, detail, rotation, and reset controls do not depend on pointer dragging
- reduced-motion preference disables animation
- static and structured-text presentations never animate
- the recipe alternative names Body, Hair, Wardrobe, Traits, and Signals, including explicit empty selections
- portrait and full-body static alternatives are required
- WebGL, static, and text presentations have equal confirmation eligibility when the recipe is complete and compatibility passes
- confirmation remains blocked for incomplete or incompatible recipes regardless of presentation mode
- inspection changes produce a concise status announcement contract

Updated verification after the asset-independent Spike D work:

- 80/80 repository tests passed
- ESLint passed
- TypeScript no-emit passed
- Next.js production build passed

This validates the accessibility and business-rule boundary only. It does not validate a browser renderer, camera, capture output, asset loading, visual quality, or device performance.

### Spike B and full Spike D — Blocked by approved asset gate

No `.glb`, `.gltf`, `.vrm`, `.fbx`, or `.blend` source exists in the controlled build directories as of 2026-07-14. Full GLB feasibility and visual fallback validation must not proceed using an unapproved or third-party model. They require an owned, provenance-recorded test GLB plus approved CRY-312 camera, responsive, accessibility, fallback, memory, and performance budgets.

### Spike B — Owned-asset intake and budget gate — Contract passed locally

The renderer-independent intake evaluator now proves that a candidate asset cannot enter GLB feasibility testing unless it has:

- a local `.glb` path under the controlled `/assets/` boundary, with remote URLs and traversal rejected
- a lowercase SHA-256 checksum
- asset, export, rig, and budget identities
- a named owner and immutable provenance record
- explicit approval for testing
- no unresolved third-party restrictions
- non-negative integer measurements for file size, triangles, draw calls, texture memory and dimensions, bones, and morph targets
- measurements within a separately supplied, versioned budget

The numerical values used by the automated test are fixtures, not approved production budgets. CRY-312 remains the authority for final desktop/mobile targets. The evaluator does not load or render a model and does not satisfy the remaining owned-GLB gate.

### Spike B — Renderer evidence gate — Contract passed locally

A separate evaluator now prevents incomplete or mocked renderer results from being presented as feasibility evidence. A passing record must:

- bind to the exact approved asset ID and SHA-256 checksum
- name the budget version, browser, device profile, evidence ID, and capture timestamp
- be captured from a real run rather than synthetic or mocked evidence
- demonstrate rig binding, camera framing, a material variant, a wardrobe attachment, portrait capture, full-body capture, context recovery, and resource disposal
- measure load time, first frame, sustained frame rate, GPU memory, context recovery, residual resources after disposal, and sample duration
- satisfy the supplied versioned limits without malformed or missing measurements

The automated tests validate only the evidence rules using fixtures. No real renderer evidence exists until the approved owned GLB is exercised in supported browser/device profiles.
