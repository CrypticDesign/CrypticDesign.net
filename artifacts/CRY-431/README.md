# CRY-431 shared runtime evidence

Singularis now consumes the canonical `ExperienceRuntime` while retaining its property-specific controls and presentation.

## Automated evidence

- `runtime-integration.json`: native fullscreen ownership, stable-surface continuity, lifecycle return, and desktop/mobile fullscreen fallback.
- `runtime-accessibility.json`: WCAG 2.1 A/AA axe checks and 44px target-size checks in ready and active embedded states.

## Validation

- `npm test`: 261 passing
- `npm run lint`: passing
- TypeScript (`tsc --noEmit`): passing
- `npm run build`: passing, 75 pages generated
- Browser runtime integration QA: passing
- Accessibility QA: zero violations and zero undersized controls

This rollout does not add fullscreen behavior to ambient Home, Community, or Professional scenes. Those routes remain semantic page experiences under STD-CDN-008; interactive property surfaces adopt the shared runtime when their live experience is ready.
