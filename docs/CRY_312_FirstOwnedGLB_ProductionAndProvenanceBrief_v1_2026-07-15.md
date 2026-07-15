# CRY-312 First Owned GLB Production and Provenance Brief v1

Status: **Approved by Robert Keith Croft for artist/exporter handoff; asset itself not yet approved**

Date: 2026-07-15

Tracking: CRY-312

Performance authority: `CRY-312-3D-BUDGET-v1`

Concept authority: `CRY_CF_FirstTestCharacter_ModelSheet_v1.png`, SHA-256 `52b6d27a289f6ea436adfab77c6ee6e448c61633c1b879777f3943f4b9f1339f`

## Approval record

Robert explicitly approved this brief in Codex on 2026-07-15 by selecting approval option 1. The brief may now be issued to an artist or exporter as the controlled production handoff for the first owned test GLB.

This approval applies only to the instructions and delivery contract. It does not approve any future GLB, contributor, source asset, license, deviation, provenance record, intake result, production deployment, public release, or complete character library. Those gates remain separate and fail closed.

## Assignment

Produce one owned, non-production test character as a standards-compliant binary glTF 2.0 (`.glb`) for Character Forge feasibility testing. The asset must demonstrate the pipeline without becoming a promise of the complete launch character library.

The approved model sheet controls silhouette, proportions, major surface breaks, and Cryptic visual language. It is a production-planning reference, not permission to reintroduce Singularis branding, insignia, property-specific equipment, astronaut-costume details, or other source-property identifiers.

## Required delivery package

Deliver one immutable versioned package containing:

1. `CRY_CF_FirstOwnedTestCharacter_v1.glb`
2. `CRY_CF_FirstOwnedTestCharacter_v1.manifest.json`, completed from the adjacent template
3. Source file in its native DCC format, with application and version identified
4. Export preset or exact reproducible export settings
5. Texture sources and final exported textures
6. Rig map naming every bone and attachment point
7. Material/slot map identifying body, wardrobe, signals, and permitted variants
8. A rights and provenance declaration signed or explicitly approved by the contributor
9. Front, side, back, portrait, and three-quarter validation renders
10. A change log listing any deviation from the approved model sheet

All package filenames must be stable and versioned. A changed binary receives a new export version and checksum; do not overwrite an accepted binary in place.

## Ownership and prohibited inputs

- The owner of the delivered asset must be `Cryptic Design`, or the delivery must include a separately approved written rights instrument sufficient for Cryptic Design's intended commercial use.
- Identify every human contributor, tool, generator, base mesh, brush, texture, font, kit, library, motion, and other source used.
- Do not use marketplace, stock, ripped, fan-made, client-owned, property-specific, editorial-only, non-commercial, attribution-incompatible, or unclear-license content.
- Do not use a third-party base mesh, texture, rig, animation, or material unless Robert approves the exact source and license before it enters the asset.
- Do not include personal likeness, biometric scan, trademark, protected insignia, or hidden authoring metadata that is not approved for retention.
- AI-assisted production must identify the tool, date, inputs, reference sources, human modifications, and applicable terms. AI use does not replace ownership review.
- Any unresolved restriction fails the intake gate. Record it; do not summarize it away.

## Character and modularity requirements

The first asset must prove a small but complete modular path:

- one neutral base body and head;
- one hair or head-feature option;
- one removable wardrobe attachment using a named attachment point;
- one visible signal/accent material variant;
- one optional trait that can be enabled or disabled without changing identity semantics;
- portrait and full-body camera suitability;
- explicit empty selections for optional hair, wardrobe, trait, and signal layers; and
- no appearance choice that grants permissions, membership, purchases, progression, or public visibility.

Selected traits must remain representable in WebGL, static portrait/full-body captures, and structured text. A fallback must not silently omit a selected identity element.

## Rig and geometry contract

- Use a stable humanoid rig ID proposed as `cry-humanoid-v1`; record the final approved ID in the manifest.
- Maintain consistent bone names, hierarchy, bind pose, scale, forward axis, and unit system across future compatible exports.
- Root transform must be clean and documented. Apply unintended object transforms before export.
- Skin weights must be normalized with no unweighted vertices or unintended influences.
- Provide named attachment points for at least head, chest/torso, back, left hand, and right hand where the concept supports them.
- Separate modular pieces by semantic slot. Document layer order, occlusion behavior, incompatible combinations, and whether hidden body geometry is removed or masked.
- Avoid unnecessary internal geometry, duplicate surfaces, non-manifold defects, degenerate triangles, and invisible high-cost detail.
- Use authored topology suitable for the demonstrated deformation and camera distances; do not rely on runtime subdivision.
- Shape keys/morph targets must have stable semantic names and known neutral values.

## Materials and textures

- Use glTF-compatible PBR materials. Any custom shader requirement must be separately declared and cannot be required for semantic fallback.
- Consolidate equivalent materials and atlases where this does not damage needed modularity.
- Embed or package all required textures locally. No remote texture, data, tracking pixel, or runtime license lookup is permitted.
- Use color-space assignments correctly: color/emissive maps in sRGB; data maps in linear space.
- Avoid baked property-specific text, logos, insignia, or lore identifiers.
- Supply portrait/full-body static captures with color and identity choices visibly consistent with the GLB.

## Approved asset envelope

The delivered test asset must pass the relevant limits from `CRY-312-3D-BUDGET-v1`.

| Measurement | Desktop maximum | Mobile maximum |
| --- | ---: | ---: |
| GLB transfer size | 8 MiB | 6 MiB |
| Rendered triangles | 120,000 | 70,000 |
| Draw calls | 75 | 50 |
| Character texture memory | 64 MiB | 40 MiB |
| Maximum texture dimension | 2048 px | 2048 px |
| Skeleton bones | 100 | 100 |
| Active morph targets | 64 | 32 |
| Simultaneous material slots | 12 | 8 |

Preferred delivery is one asset that passes the mobile envelope. If separate desktop and mobile exports are proposed, they must preserve the same asset identity, rig compatibility, selections, silhouette, and fallback meaning while using distinct export IDs and checksums.

## Export requirements

- Binary glTF 2.0 only; `.glb` extension.
- Local controlled path must resolve under `/assets/` in the application.
- No absolute filesystem references, remote URLs, traversal segments, missing external dependencies, or development-only paths.
- Freeze the exporter name, version, compression settings, coordinate system, units, animation settings, texture handling, and extension list in the delivery record.
- Declare every glTF extension used. Required extensions need explicit runtime-support confirmation.
- Validate the final binary with a current Khronos glTF validator and include the complete report.
- Calculate lowercase SHA-256 from the exact delivered GLB after all export and compression operations.
- Measure the final binary, not the DCC scene or an earlier export.

## Required measured intake values

The manifest must contain non-negative integer measurements for:

- file bytes;
- rendered triangles at the maximum tested configuration;
- draw calls at steady state;
- character texture bytes including mip-chain cost;
- maximum texture dimension;
- skeleton bones; and
- active morph targets.

Also report material slots, vertex count, animation clips, joint influences per vertex, glTF extensions, and validator warnings in the delivery notes even though the current automated intake evaluator does not yet gate those fields.

## Acceptance procedure

The asset enters renderer testing only after all of the following pass:

1. Robert approves the exact asset for feasibility testing.
2. Ownership and provenance are complete, immutable, and free of unresolved third-party restrictions.
3. The GLB is stored locally under the controlled `/assets/` boundary.
4. Manifest asset ID, export version, rig ID, path, and checksum match the delivered binary.
5. Khronos validation has no unresolved errors.
6. Measured values pass `CRY-312-3D-BUDGET-v1` for the intended profile.
7. Automated asset-intake evaluation reports `accepted: true`.
8. Visual comparison confirms the approved model-sheet intent and records all deviations.

Passing intake authorizes only Spike B/full Spike D renderer feasibility testing. It does not approve production deployment, the complete character library, public release, or a change to canon.

## Renderer evidence that follows intake

After intake, the exact approved checksum must demonstrate real-browser rig binding, camera framing, a material variant, wardrobe attachment, portrait capture, full-body capture, keyboard inspection, reduced motion, context recovery, resource disposal, and desktop/mobile performance. Synthetic or fixture evidence cannot satisfy this gate.

## Stop and escalation conditions

Stop production and escalate to Robert when:

- ownership, license, contributor, or source provenance is incomplete;
- the asset requires a restricted or unclear third-party dependency;
- meeting the budget would materially change the approved silhouette or identity language;
- the proposed rig or modular strategy conflicts with future compatibility;
- a required renderer feature has no accessible static/structured equivalent;
- the final GLB exceeds a budget limit; or
- the model sheet is insufficient to make a property, canon, or visual decision.

Do not solve an escalation by silently changing the model, dropping a selected feature, raising a budget, or substituting another asset.
