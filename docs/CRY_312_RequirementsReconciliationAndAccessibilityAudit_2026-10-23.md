# CRY-312 Requirements Reconciliation and Accessibility Audit

**Status:** Local draft; no Jira, Confluence, GitHub, deployment, or production state changed
**Audit date:** 2026-10-23
**Branch:** `codex/cry-312-character-requirements`
**Baseline:** `origin/main` at `6cbf4244cf79dbf4df81a595d3c3894e37da6464`
**Ticket:** CRY-312 — responsive, accessibility, fallback, and 3D production requirements
**Parent:** CRY-307

## Executive disposition

CRY-312's requirements are already substantially defined and owner-approved. The July 15 Confluence record, the committed performance budget, the owned-asset handoff, and the renderer evidence templates together cover the ticket's specification acceptance criteria.

CRY-312 is **not completion-ready**. The controlled repository still has no approved owned GLB, the renderer evidence packet is not populated with real-device runs, and representative screen-reader and full manual accessibility evidence remain absent. The five implementation findings discovered by this audit were remediated locally on the CRY-312 branch and now pass automated, keyboard-runtime, type, lint, and production-build verification.

The ticket should therefore remain open until an owned asset passes intake, real-device and representative assistive-technology evidence is captured, and Robert gives the final completion/implementation decision. The implementation findings below are resolved locally and no longer block the patch itself.

## Source reconciliation

| Source | Current evidence | Disposition |
| --- | --- | --- |
| Jira CRY-312 | To Do; High priority; acceptance criteria call for responsive, accessibility, fallback, production 3D, reviewable-state, and owner-approval requirements | Workflow state is stale relative to the approved requirements package |
| Confluence page 437125121, version 25 | Records the CRY-312 performance and handoff package as approved on 2026-07-15; explicitly keeps CRY-312 open for asset and evidence gates | Authoritative requirements record; completion gates remain valid |
| `CRY_312_CharacterForge_3DPerformanceBudget_v1_2026-07-15.md` | Defines desktop, Android, and Apple profiles; responsive, motion, fallback, asset, and runtime budgets | Defined and owner-approved |
| `CRY_312_FirstOwnedGLB_ProductionAndProvenanceBrief_v1_2026-07-15.md` | Defines ownership, provenance, topology, rig, materials, modularity, export, and validation requirements | Defined and owner-approved; asset not delivered |
| `CRY_312_RendererEvidencePacketTemplate_v1.md` | Defines three-run browser/device evidence and acceptance recording | Template exists; real evidence not captured |
| Current Character Forge implementation | Implements responsive layout, keyboard viewer controls, reduced-motion behavior, structured fallback, context recovery, and resource disposal | Local remediation and automated/browser verification complete; external evidence gates remain |

## Acceptance matrix

| Requirement | Defined | Implemented | Verified | Current gate |
| --- | --- | --- | --- | --- |
| Desktop, tablet, and mobile behavior | Yes | Yes | Automated viewport audit passed at 390, 768, and 1440 CSS px | Physical-device checks remain |
| 200% zoom/reflow | Yes | Yes | 720 CSS px equivalent audit had no horizontal overflow | Manual browser zoom remains |
| Keyboard operation and visible focus | Yes | Yes for the audited flow | Viewer command tests pass; modal focus containment, Escape, and focus restoration pass in Chromium | Complete representative screen-reader and full manual traversal |
| Reduced motion | Yes | Yes | Source-contract tests pass; reduced-motion viewport had no automated violations | Manual motion observation remains |
| Contrast and non-text contrast | Yes | Yes for the audited controls | Text tokens pass; the new `--control-line` token passes 3:1 against both Forge surfaces | Complete physical-device visual verification |
| No-WebGL/static/structured fallback | Yes | Yes for the audited flow | Static fallback appears, interactive controls are removed, and truthful label/status text is exposed | Complete representative screen-reader verification |
| Loading, error, offline/local, incomplete, privacy, and deferred states | Yes | Partially | State contracts and UI branches exist | Complete state-by-state manual evidence |
| Asset ownership, provenance, format, and rig | Yes | Intake contract only | Contract tests pass | No approved owned GLB is present |
| Renderer performance and recovery | Yes | Evidence evaluator exists | Evaluator contract tests pass | No real desktop/Android/Apple packet exists |
| Robert approval | Requirements package approved | Not applicable | Recorded 2026-07-15 | Final completion/implementation approval remains |

## Runtime audit results

The local audit used the repository's sandbox membership mode and a Playwright/axe harness against `http://localhost:3015/account/create-character`. `localhost` is the supported public/member development host; `127.0.0.1` is intentionally isolated for the private operator surface.

### Automated viewport and WCAG checks

| Viewport | HTTP | Horizontal overflow | Main / H1 | Interactive targets below 44 px | axe WCAG 2.1 A/AA violations |
| --- | ---: | --- | --- | ---: | ---: |
| Mobile — 390 × 844, reduced motion | 200 | None | 1 / 1 | 0 | 0 |
| Tablet — 768 × 1024 | 200 | None | 1 / 1 | 0 | 0 |
| Desktop — 1440 × 900 | 200 | None | 1 / 1 | 0 | 0 |
| 200% zoom equivalent — 720 × 900 | 200 | None | 1 / 1 | 0 | 0 |

Passing axe results do not supersede the manual and semantic findings below.

### Repository verification

- Full repository tests: **507/507 passed**; the focused CRY-312 subset is **28/28 passed**.
- Targeted ESLint and the production build's lint/type validation: passed.
- TypeScript `--noEmit`: passed.
- Next.js production build: passed with **76/76 generated pages**.
- No controlled `.glb` file was found in the repository outside dependencies.

## Findings

### A11Y-01 — Discard confirmation does not behave as an alert dialog

**Severity:** Major
**Relevant WCAG:** 2.1.1 Keyboard; 2.4.3 Focus Order; 4.1.2 Name, Role, Value
**Local remediation:** Implemented and browser-verified

The discard confirmation declares `role="alertdialog"` and moves initial focus to **Keep editing**, but it neither contains focus nor closes on Escape. Runtime evidence showed this sequence:

1. Initial focus: Keep editing.
2. First Tab: Discard draft.
3. Second Tab: My Home, outside the dialog.
4. Escape: dialog remained open.

**Resolution:** The confirmation now uses a native modal dialog with explicit focus cycling, Escape handling, and focus restoration to the triggering button. Chromium verification confirmed Keep editing → Discard draft → Keep editing, Escape closure, and restored trigger focus.

### A11Y-02 — Initial no-WebGL fallback is not announced and remains mislabeled as interactive

**Severity:** Major
**Relevant WCAG:** 1.3.1 Info and Relationships; 4.1.2 Name, Role, Value; 4.1.3 Status Messages
**Local remediation:** Implemented and browser-verified

With WebGL disabled, the static fallback became visible and `data-fallback="true"` was set. However:

- the live region remained empty;
- the viewer's accessible label remained “an interactive three-dimensional Cryptic persona”; and
- the initial renderer-construction failure returned before installing the operational-state behavior used by the later context-loss path.

**Resolution:** The viewer now models loading, interactive, and fallback presentation states explicitly. Initial failure and context loss expose truthful labels and live-region messages, while interactive controls are omitted when no renderer is available.

### A11Y-03 — Essential control boundaries do not meet non-text contrast

**Severity:** Major
**Relevant WCAG:** 1.4.11 Non-text Contrast
**Local remediation:** Implemented and regression-tested

Controls such as Forge inputs and unselected choice buttons rely on `--line` (`#173049`) or `--line-soft` (`#102331`) against `--canvas` (`#03080f`) / `--surface` (`#07111b`). Calculated contrast is approximately **1.25:1 to 1.49:1**, below the 3:1 requirement where the boundary is needed to identify the component.

The principal text colors are not implicated: `--muted` against the dark canvases is above 8:1, and primary text/accent tokens used here pass normal-text contrast.

**Resolution:** A scoped `--control-line: #526779` token now identifies Forge fields, unselected choices, and secondary controls. Computed regression tests verify at least 3:1 against both `--canvas` and `--surface` without changing the broader decorative-line system.

### A11Y-04 — Toolbar semantics do not implement the expected keyboard model

**Severity:** Moderate
**Relevant WCAG:** 2.1.1 Keyboard; 4.1.2 Name, Role, Value
**Local remediation:** Implemented and regression-tested

The preview actions are declared as a `role="toolbar"`, but every control remains in the normal Tab sequence and no Left/Right arrow or roving-tabindex behavior is provided. This conflicts with the established toolbar interaction model.

**Resolution:** The controls are now a labeled group of ordinary buttons, matching their existing Tab behavior without promising composite-toolbar arrow navigation.

### A11Y-05 — “Full” is unnecessarily ambiguous

**Severity:** Minor
**Relevant WCAG:** 2.4.6 Headings and Labels
**Local remediation:** Implemented and regression-tested

The visible and accessible button name is “Full,” while the underlying action is the full-body view.

**Resolution:** The control is now labeled “Full body.”

## Evidence still required for closure

1. Produce and separately approve the exact Cryptic-owned, provenance-recorded GLB.
2. Complete checksum-bound automated intake against `CRY-312-3D-BUDGET-v1`.
3. Populate the renderer evidence packet with three consecutive real runs for release-blocking desktop and physical Android profiles plus Apple compatibility.
4. Complete actual 200% browser zoom, representative screen-reader, contrast, touch, reduced-motion, static/structured fallback, and full operational-state verification on representative devices.
5. Reconcile Jira and Confluence only after the evidence is complete, then obtain Robert's explicit final CRY-312 completion/implementation decision.

## Recommended sequencing

1. Review the local implementation and browser evidence, then authorize a GitHub review path if accepted.
2. Proceed with the named artist/exporter handoff and owned-GLB intake.
3. Capture real-device renderer and assistive-technology evidence.
4. Present the complete packet for Robert's approval before changing CRY-312's external workflow state.
