# CRY-502/503 Shared Controls Accessibility Fix

Date: 2026-09-02  
Branch: `agent/cry-502-shared-controls-a11y`  
Base: `origin/main` at `162af02473cbd10121ce60c66765f2146e07012d`

## Finding

The CRY-502/503 front-door suite reported `aria-prohibited-attr` on `.experience-runtime__controls` in five Entertainment fallback/mobile cases. The control container used `aria-label` on a generic `div`, which cannot be named under the applicable accessibility semantics. The current demo served the same markup.

## Correction

The shared controls container now declares `role="group"`, preserving the existing accessible name while giving the control collection valid group semantics. A component contract test protects that relationship.

## Verification

- CRY-502/503 front-door browser suite: PASS, 21/21 cases, zero errors
- Reduced-motion and no-WebGL cases: PASS
- Shared PageScene runtime: PASS across Home, Entertainment, Community, and Professional
- Unit and contract tests: PASS, 288/288
- ESLint: PASS
- TypeScript: PASS
- Production build: PASS, 78 static pages generated
- Membership sandbox E2E: PASS
- Character sandbox E2E: PASS
- Signed-out/authenticated continuity: PASS

## Release boundary

The deployed demo will retain the original finding until this branch is reviewed, merged, and successfully deployed. CRY-502, CRY-503, and CRY-505 should remain open until preview/deployment evidence confirms the corrected markup.
