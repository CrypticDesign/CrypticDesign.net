# CRY-313 Avatar Viewer Accessibility Slice

**Status:** Asset-independent avatar accessibility and Forge state slice implemented, focused-verified, owner-reviewed locally, and approved for commit and PR; no merge, production deploy, Jira change, or production activation
**Started:** 2026-10-03
**Last updated:** 2026-10-05
**Parent:** CRY-307
**Implementation ticket:** CRY-313
**Branch:** `agent/cry-313-avatar-accessibility`
**Local base:** `89ab2f963291737ef4f088403a39930c92531ed2` (`origin/main` at the time of handoff)

## Why This Slice Is Executable

CRY-307 is the highest-priority unblocked non-mutation child of CRY-242. CRY-313 permits a bounded implementation slice when the required product direction is sufficiently defined. The current Character Forge architecture and CRY-312 budget already define keyboard inspection, reduced motion, structured alternatives, WebGL failure behavior, context recovery, and resource disposal. These controls do not depend on the missing owned GLB.

Jira workflow state is stale relative to canonical evidence: CRY-311 remains `To Do` despite later documentation of completed design work and a subsequent approval correction; CRY-312 remains open pending owned-asset and real-device evidence. This slice therefore does not claim CRY-307, CRY-311, CRY-312, or CRY-313 completion.

## Implemented

- Keyboard rotation and bounded zoom.
- Visible 44px minimum touch controls for rotation, zoom, view presets, and reset.
- Deterministic full-body, portrait, and detail view presets.
- Home-key reset and polite assistive announcements.
- Visible focus and documented keyboard shortcuts.
- Renderer-independent Body, Hair, Wardrobe, Traits, and Signals description.
- Reduced-motion behavior without continuous idle animation.
- Animation pause while the document is hidden or the viewer is offscreen.
- WebGL initialization/context-loss fallback and restoration announcement.
- Pointer cancellation and complete observer, listener, animation, material, geometry, renderer, and context cleanup.

### Forge form and state refinement

- Replaced the user-facing archetype/origin-signal selection with the approved classless Story step. The required legacy storage value remains internal until a separately governed schema migration removes it.
- Removed archetype labels from Character Home, My Home, and Account character summaries.
- Locked future steps until reached through the flow while preserving back navigation.
- Added inline identity errors, field associations, invalid-state styling, and deterministic focus movement.
- Added an actual review step covering identity, appearance, biography, and private-default visibility.
- Added an honest in-tab-only unsaved-draft state without storing identity or biography in browser storage.
- Reused one idempotency key across create retries instead of generating a new key for each attempt.
- Added an existing-character preflight so the Forge routes established members to Character Home and fails closed when the one-character boundary cannot be verified.
- Added an explicit, keyboard-focused discard confirmation that clears only the draft held in the current tab and creates no character history.
- Added a dirty-draft warning for browser unloads and ordinary link navigation without persisting draft content in browser storage.
- Refined small-screen step scrolling, review layout, and full-width action targets.

### Character Home and settings refinement

- Converted the Character Home hero to a full-bleed surface while keeping settings and evidence in the centered content column.
- Moved avatar controls into a dedicated dock below the rendering viewport so they do not cover the character.
- Replaced stretched privacy checkboxes with compact, aligned, labeled preference controls.
- Preserved the approved account top navigation and current visual design system.

## Robert Visual Review

Robert reviewed the local preview and approved:

- the corrected Character Settings checkbox sizing, alignment, and explanations;
- the full-bleed Character Home hero and non-obstructive avatar control dock; and
- the existing-character state shown when revisiting `/account/create-character`.

The draft-discard confirmation and navigation warning were implemented after the established sandbox character existed. They are focused-contract and lint verified but were not separately visually reviewed in a cleared sandbox.

## Explicitly Not Claimed

- No owned GLB exists or was substituted with third-party material.
- No production 3D visual fidelity, rig, asset intake, static portrait/full-body capture, or device-performance acceptance is claimed.
- No production implementation approval, public release, deployment, provider change, or backend change is implied.
- No Jira status or acceptance criterion was changed.

## Focused Verification

- Avatar viewer and Forge control/source-contract tests: 17/17 passed across the focused files during implementation.
- Final Character Forge source-contract file after discard isolation and navigation protection: 5/5 passed.
- Targeted ESLint for the changed components and focused contracts: passed.
- Local Character Forge and Character Home routes compiled and returned HTTP 200 during preview review.
- Final TypeScript `--noEmit` passed on 2026-10-05 after the existing-character, discard, and navigation refinements.
- Final `git diff --check` passed on 2026-10-05 with no whitespace errors.
- Full repository tests passed 353/353 on 2026-10-05.
- Full repository ESLint and the Next.js production build passed on 2026-10-05; all 74 static pages generated successfully.
- Repository viewport smoke passed at 390 px, 768 px, and 1440 px with no horizontal navigation overflow.
- A real-browser/device matrix and deployed acceptance remain outside this local evidence boundary.

## Local Diff Boundary

Application changes are limited to:

- `src/components/AvatarStudio.tsx`
- `src/components/CharacterCreator.tsx`
- `src/app/account/character/page.tsx`
- `src/components/AccountOverview.tsx`
- `src/components/MyHomeDashboard.tsx`
- `src/app/globals.css`

Focused controls and evidence are contained in the adjacent `avatar-studio-*` and `character-forge-*` library/test files plus this document. No dependency, lockfile, database migration, API route, provider configuration, secret, billing, or deployment file is changed. A development-server-generated `next-env.d.ts` change was removed before handoff.

## Local Handoff Disposition

The asset-independent CRY-313 slice is locally implemented, owner-reviewed, and technically ready for an owner decision on local commit. The final TypeScript no-emit and clean-diff checks pass. A PR should not be opened merely to obtain a Netlify preview; Robert has already completed the necessary local visual review, and any commit, PR, push, or hosted build remains an explicit authority/cost gate.

Suggested Jira-ready summary, for drafting only:

> CRY-313 asset-independent local slice implemented on `agent/cry-313-avatar-accessibility`: keyboard/touch avatar inspection, structured fallback, reduced-motion/context-loss/resource cleanup, classless gated Forge flow, validation/review/idempotency, existing-character preflight, explicit draft discard, navigation loss warning, full-bleed Character Home, and corrected privacy controls. Robert visually approved the settings, Character Home hero/control dock, and existing-character state. Focused contracts and targeted lint pass. No PR, deploy, provider/backend change, or Jira mutation occurred. Production 3D acceptance remains blocked by the approved owned-GLB, provenance/intake, real-device, performance, accessibility, and final owner gates.

## Remaining Gate

The production 3D portion remains blocked on the exact Cryptic-owned, provenance-recorded GLB; approved intake; real desktop, Android, and Apple evidence; accessibility/visual verification; and Robert's final implementation decision. Local code closure checks are complete, but they do not satisfy the production asset gate.
