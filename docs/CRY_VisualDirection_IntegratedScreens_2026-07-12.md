# CrypticDesign.net Visual Direction — Integrated Screens

Owner: Robert Croft  
Submitted: 2026-07-12  
Status: Implementation in progress on `codex/figma-visual-system`  
Applies to: CrypticDesign.net desktop and mobile frontend

## Source reference

![Integrated desktop and mobile screen direction](./assets/crypticdesign-visual-direction-integrated-screens-2026-07-12.png)

## Direction captured

- Dark, cinematic interface with deep navy-black surfaces and restrained borders.
- Cyan, electric blue, magenta, and gold accents distinguish platform lanes and states.
- Large atmospheric artwork anchors each front door without replacing clear information hierarchy.
- Desktop layouts use dense but disciplined editorial grids, feature panels, metrics, and media controls.
- Mobile layouts preserve the same hierarchy through stacked cards and compact navigation.
- My Home emphasizes the member's character, progression, interests, library, and activity.
- Entertainment is the audience-facing hub for releases, franchises, categories, playback, and interactive content.
- Professional is the Cryptic Design LLC front door for services, collaborations, capabilities, and inquiry.

## Next-session implementation intent

Translate this reference into the existing v15 information architecture and responsive Next.js frontend. Preserve current route behavior, governance checks, contextual product flow, and preview-only backend boundaries while replacing the placeholder visual language with this integrated system.

## Implementation checkpoint — 2026-07-12

- Imported approved Figma artwork for the three primary front doors.
- Rebuilt My Home, Entertainment, and Professional around the integrated desktop and mobile compositions.
- Added the shared cinematic hero, editorial media cards, metrics, capability cards, method steps, player dock, and structured footer system.
- Preserved v15 navigation, breadcrumbs, contextual release/product flow, and frontend-only backend boundaries.
- Verified desktop and 390px mobile rendering locally with no horizontal overflow.

## Guardrails

- Visual direction does not authorize production publishing, backend implementation, payments, or external asset use without rights review.
- Use owned or placeholder-safe imagery until final assets pass `isPubliclyRenderable` governance.
- Maintain mobile and desktop parity and WCAG-conscious contrast and interaction states.
