# CRY-307 Character Foundation closure audit

Date: October 24, 2026
Parent: CRY-242
Closure tranche: CRY-307 with CRY-310, CRY-311, and CRY-312
Branch: `codex/cry-312-character-requirements`

## Outcome

The Character Foundation now presents one coherent member journey from character creation to Character Home. The implementation reconciles the approved eight-stage Forge information architecture, preserves the existing one-character and private-by-default boundaries, exposes only appearance controls supported by owned assets, and replaces internal RPG ledgers with persona-first journey language.

This tranche is intentionally being held locally for one combined review and one eventual pull request so it does not create avoidable Netlify Deploy Preview usage.

## Reconciled source decisions

- Forge desktop and mobile designs: Figma nodes `127:2` and `127:106`.
- Character Home desktop and mobile designs: Figma nodes `127:138` and `128:2`.
- Operational and fallback states: Figma node `128:32`.
- Current Confluence specification: version 25 of the Character Foundation page.
- Current runtime contract: `AvatarRecipe` persists skin material, wardrobe, optional trait, and signal color.
- Body, face, and hair expansion choices remain visibly deferred until owned production assets complete controlled intake. The UI does not invent unavailable character parts.

## Delivered behavior

### CRY-310 — Character Home

- Persona-first hero with the persistent 3D character, durable name, handle, status, current era, time lived, and recent discoveries.
- Sticky navigation for Journey, Discoveries, Achievements, Collections, and History.
- Journey and quest presentation in user-facing language with internal scores, resource ledgers, raw attributes, and sandbox controls removed.
- Collapsed Identity & Settings area remains available without dominating the member experience.
- Supported appearance fields can be edited after creation and saved through the existing validated character update route.

### CRY-311 — Character Forge design and interaction

- Eight approved stages: Identity, Body, Face, Hair, Wardrobe, Traits & Signals, Review, Confirm.
- Persistent interactive 3D preview with full-body, portrait, detail, rotate, zoom, and reset controls.
- Optional biography captured with the durable identity.
- Explicit current-foundation and deferred-option messaging where production assets do not yet exist.
- Review and confirmation stages explain the one-character, private-by-default, non-entitlement boundary before creation.
- Desktop stage navigation fits all eight stages without horizontal overflow; mobile retains intentional horizontal scrolling.

### CRY-312 — requirements and accessibility reconciliation

- Explicit Avatar Studio loading, interactive, and static-fallback states.
- Truthful no-WebGL status, live announcement, and hidden interactive controls in fallback mode.
- Native discard-confirmation dialog with focus containment, Escape handling, and focus restoration.
- Correct group semantics for the preview toolbar and a visible Full body label.
- Essential control boundaries use the audited 3:1 non-text contrast token.
- Automated accessibility audit covers 390, 720, 768, and 1440 pixel viewports.

## Local end-to-end evidence

- Created a local-only persona through all eight Forge stages.
- Confirmed the durable identity and entered Character Home.
- Opened Identity & Settings, changed the signal color from cyan to violet, saved the profile, and observed the 3D persona update.
- Confirmed the no-character state still routes members to character creation.
- Confirmed all eight desktop stages remain visible after the final overflow correction.

## Automated verification

- Full test suite: 509/509 passed with the temporary directory redirected inside the workspace to avoid the Windows sandbox rename restriction.
- Focused Forge, Avatar Studio, and Character Home contract tests: 17/17 passed after the final editing work.
- TypeScript: passed with `tsc --noEmit`.
- ESLint: passed.
- Production build: passed; 76/76 routes generated.
- Accessibility audit: zero violations at the tested viewports.
- `git diff --check`: clean.

## Current boundary

- No commit, push, pull request, Netlify Deploy Preview, production deployment, Jira mutation, or Confluence mutation has been performed for this combined tranche.
- Local review is available at `http://localhost:3017/account/character` while the owned preview runtime remains active.
- The next external step requires Robert's explicit approval.
