# CRY-312 Character Forge 3D Performance Budget v1

Status: **Approved by Robert Keith Croft**

Budget ID: `CRY-312-3D-BUDGET-v1`

Date: 2026-07-15

Scope: First owned Character Forge test character and the initial single-character viewer

Authority: Approved by Robert in Codex on 2026-07-15 for production-candidate measurement and acceptance testing. This approval does not authorize deployment, publication, third-party asset acquisition, or acceptance of an asset that fails provenance review.

## Approval record

Robert selected approval option 1 after reviewing the completed budget proposal on 2026-07-15. The limits below are therefore the approved first production-candidate budget for CRY-312. Measurement may proceed against this version only when the separate owned-asset gate is satisfied.

## Design intent

The first Character Forge experience must remain usable on a representative mobile device without WebGL being required for identity creation or confirmation. Desktop may render a richer presentation, but it must use the same owned asset, recipe, business rules, and confirmation eligibility as mobile, static, and structured-text modes.

These limits target one visible character, one controlled environment, and no simultaneous background 3D scenes. Multi-character scenes, cloth simulation, physics, cinematic effects, and user-uploaded models are outside this budget.

## Approved-test device profiles

The budget is evaluated at native browser viewport size with browser zoom at 100%, no developer-tools throttling, a warm browser process, and an otherwise idle device. Record the exact OS, browser version, CPU, GPU, RAM, viewport, device-pixel ratio, power state, and asset checksum.

| Profile | Required baseline | Viewport and render cap | Required browser |
| --- | --- | --- | --- |
| Desktop baseline | Windows 11; 4-core/8-thread CPU from 2020 or newer; integrated GPU equivalent to Intel Iris Xe; 8 GB RAM | 1280 x 720 viewport; device pixel ratio capped at 2 | Current stable Chrome or Edge |
| Mobile baseline | Physical Android device; mid-range 2021-or-newer SoC; 6 GB RAM | 390 x 844 CSS px or nearest device viewport; device pixel ratio capped at 2 | Current stable Chrome |
| Apple compatibility | Physical iPhone capable of the current supported iOS release | Native portrait viewport; device pixel ratio capped at 2 | Current stable Safari |

Desktop and mobile baseline results are release-blocking. Apple compatibility is release-blocking for functional correctness, fallback behavior, resource disposal, and catastrophic performance failure; its numerical thresholds match the mobile budget unless Robert approves a documented exception.

## Asset envelope

All values are measured from the exact approved, provenance-recorded GLB after production export and compression.

| Measurement | Desktop maximum | Mobile maximum | Gate behavior |
| --- | ---: | ---: | --- |
| GLB transfer size | 8 MiB | 6 MiB | Mobile must receive a compliant asset variant or use static mode |
| Rendered triangles | 120,000 | 70,000 | Count the maximum visible configured character |
| Draw calls per rendered frame | 75 | 50 | Measure after the character reaches steady state |
| GPU texture memory attributable to character | 64 MiB | 40 MiB | Include mip chains and all loaded character textures |
| Maximum texture dimension | 2048 px | 2048 px | Prefer 1024 px for mobile except face/detail maps |
| Skeleton bones | 100 | 100 | Same rig identity across variants |
| Active morph targets | 64 | 32 | Count targets resident for the configured character |
| Simultaneous material slots | 12 | 8 | Consolidate equivalent materials before raising the budget |

The intake gate fails closed if any measurement is absent, malformed, tied to a different checksum, or over its target profile's maximum.

## Runtime envelope

Test with an uncached asset for load and first-frame measurements. Frame-rate and memory measurements begin only after the character is fully loaded and the camera is stable.

| Measurement | Desktop requirement | Mobile requirement |
| --- | ---: | ---: |
| Asset load completion, uncached | max 3.0 s | max 5.0 s |
| First meaningful 3D frame, uncached | max 2.0 s | max 3.5 s |
| Sustained frame rate, 30-second sample | median min 50 FPS; 1% low min 30 FPS | median min 30 FPS; 1% low min 20 FPS |
| Total renderer GPU memory after steady state | max 160 MiB | max 128 MiB |
| WebGL context recovery | max 3.0 s | max 5.0 s |
| Residual renderer-owned resources after disposal | 0 live renderer, animation loop, observer, listener, geometry, material, or texture references | Same |
| Main-thread long tasks during steady-state sample | no task > 100 ms; no more than 3 tasks > 50 ms | no task > 150 ms; no more than 5 tasks > 50 ms |

Load timing starts immediately before the GLB request and ends when the owned asset, rig, required materials, and first configured pose are ready. First meaningful frame ends when that configured character is visibly rendered, not when an empty canvas or loading shell appears.

## Interaction and motion budget

- Pointer and keyboard inspection must remain responsive while the renderer is active.
- Keyboard rotation, portrait, full-body, detail, and reset commands must be deterministic and must not depend on pointer dragging.
- With `prefers-reduced-motion: reduce`, idle rotation and animated camera interpolation are disabled. Direct user commands may update immediately without decorative animation.
- Camera motion should complete within 300 ms under the default motion setting and must not block form interaction.
- The render loop must pause when the document is hidden and when the viewer is outside the active experience, except for a single requested render needed to reflect a state change.

## Fallback and degradation rules

Static and structured-text modes are first-class presentations, not error pages. They must expose the same recipe meaning and confirmation eligibility as WebGL.

Switch to the approved static presentation when:

- WebGL initialization fails or the context cannot recover within the applicable limit;
- the asset cannot load, decode, or validate;
- mobile has no asset variant within the mobile asset envelope;
- the browser or device lacks a required renderer capability; or
- the user selects a static/reduced-data presentation.

Do not silently lower identity fidelity by dropping selected traits, wardrobe, or signal elements. If a selection cannot be represented, show the structured alternative and an actionable compatibility message.

A numerical runtime miss does not automatically switch a user mid-session unless usability is impaired. It blocks production acceptance, creates a measured exception record, and requires optimization, an approved budget revision, or an explicitly approved device-specific fallback rule.

## Required evidence packet

Each result must include:

1. Evidence ID, capture timestamp, tester, commit SHA, budget ID, asset ID, and asset SHA-256.
2. Exact physical device and browser profile; simulated mobile evidence cannot replace the physical mobile run.
3. Raw measurements for asset size, triangles, draw calls, textures, bones, morph targets, load, first frame, FPS distribution, GPU memory, context recovery, long tasks, and disposal.
4. Screen recording or timestamped capture showing load, portrait, full-body, detail, rotation, material variant, wardrobe attachment, context loss/recovery, and static fallback.
5. Automated evaluator output plus a concise human-readable pass/fail table.
6. Confirmation that reduced motion, keyboard-only inspection, static presentation, structured text, and identity confirmation were exercised.
7. Any exception, uncertainty, instrumentation limitation, or discrepancy. Missing evidence fails closed.

Three consecutive passing runs are required per release-blocking profile. Report the median run for timing and FPS, but retain all raw runs. Any catastrophic failure--crash, unrecovered context loss, incorrect character identity, blocked confirmation, or leaked active render loop--fails the profile regardless of averages.

## Approval and change control

This approved budget is identified as `CRY-312-3D-BUDGET-v1`. Any numerical change after approval requires a new version, rationale, affected-device analysis, and Robert approval. Asset-specific waivers must name the asset checksum and must not silently alter the general budget.

## Remaining completion gates

Even after this budget is approved, CRY-312 remains incomplete until:

- an owned, provenance-recorded GLB is approved for testing;
- the approved asset passes intake against this budget;
- real desktop, Android, and Apple compatibility evidence is captured;
- accessibility verification includes keyboard-only use, reduced motion, static and structured alternatives, 200% zoom, and representative screen-reader checks; and
- Robert approves the reconciled CRY-312 requirements and evidence packet.
