# CRY-507 local acceptance evidence

Date: 2026-08-31

Branch: `agent/cry-507-experience-runtime`

Base: `origin/main` at `ed2806e`

## Automated verification

- `npm test`: 260/260 passing.
- `tsc --noEmit`: passing.
- `npm run lint`: passing.
- `npm run build`: passing; 75 static pages generated.
- `scripts/qa-page-scene-runtime.mjs`: all four registered PageScene routes returned 200, rendered, loaded assets, reported positive FPS, and exposed no unexpected failed responses. Headless Chromium used software rendering and triggered the existing adaptive downgrade to `mid`.
- `scripts/qa-viewports.mjs /entertainment`: mobile 390, tablet 768, and desktop 1440 have no horizontal navigation overflow; all destinations remain visible.
- `scripts/qa-experience-runtime.mjs`: passing for Entertainment's single-click Fullscreen launch, stable renderer identity, distinct ambient/active interaction, keyboard/touch activation, focus transfer/return, successful fullscreen enter/exit, fullscreen rejection to the expanded embedded fallback, audio arbitration/restore, reduced motion, no WebGL, narrow-mobile fallback, WebGL context-loss recovery, asset-load failure, route cleanup, and semantic DOM survival.
- `scripts/qa-experience-runtime-a11y.mjs`: zero WCAG 2.1 A/AA axe violations in ready and active-embedded states; all runtime controls meet the 44px target minimum.

## Evidence files

- `runtime-qa.json` — browser facts for lifecycle, fullscreen, audio, fallback, and cleanup.
- `a11y/experience-runtime-a11y.json` — focused runtime accessibility audit.
- `desktop-1440-active.png` — desktop active/expanded fallback state.
- `tablet-768-active.png` — touch/tablet active/expanded fallback state.
- `mobile-390-fallback.png` — governed static mobile fallback with semantic page content.
- `a11y/entertainment-1440.png` — desktop Entertainment accessibility capture.

## Boundaries

- CRY-508 persistence and save resolution are not implemented. The runtime accepts a typed/versioned authoritative context only.
- CRY-431 Singularis gameplay integration is not changed. It can mount as a stable child surface and consume the shared lifecycle, hydration, input, fullscreen, and audio controller in its own story.
- CRY-509 My Home/Mission Control consumers are not implemented.
- The reference Entertainment scene currently proves runtime continuity and audio ownership hooks; it does not yet emit property-specific experience audio or controller gameplay.
- Hardware GPU performance and physical-device controller testing remain release-environment checks; local headless Chromium exercises software rendering and adaptive downgrade behavior.
