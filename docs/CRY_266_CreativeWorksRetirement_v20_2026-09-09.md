# CRY-266 — Creative Works retirement map (Sitemap v20)

Status: implementation record  
Date: 2026-09-09  
Authority: CRY-242; CRY-266; Confluence `Platform Information Architecture` (Sitemap v20, current direction 2026-08-27); repository/runtime evidence

## Decision

`/creative-works` remains permanently retired as a hierarchy. It has no index, detail pages, navigation entry, sitemap entry, or canonical metadata of its own.

Sitemap v20 supersedes the earlier v18 destination assumptions. In particular, v20 does not retain Visual Studies as a canonical navigable destination, so the legacy Visual Studies slug resolves to the Entertainment front door. This retirement decision does not remove or approve the separate runtime route `/entertainment/visual-studies`; its current disposition belongs to Entertainment governance.

## Final redirect/removal map

| Legacy route | Final destination | Disposition |
| --- | --- | --- |
| `/creative-works` | `/entertainment` | Permanent redirect to the current Entertainment front door. |
| `/creative-works/visual-studies` | `/entertainment` | Permanent redirect; historical v18 detail mapping removed because Sitemap v20 does not retain Visual Studies as a canonical destination. |
| `/creative-works/singularis` | `/products/singularis` | Permanent redirect to the implemented Singularis property destination, consistent with Singularis remaining the v20 cross-media franchise/property director. |
| `/creative-works/holistic-ux` | `/professional/articles` | Permanent redirect to the implemented Professional research/article destination. |
| `/creative-works/crypticdesign-net` | `/professional` | Permanent redirect to the current Professional front door. |
| `/creative-works/:slug*` | `/entertainment` | Permanent fallback for any unrecorded historical inbound link; it does not create a new detail destination. |

The deleted legacy data source contained exactly the four explicit slugs above. The catch-all is retained only as an inbound-link safety net.

## Boundaries

- Creative Works is absent from global navigation and the public sitemap.
- The deleted `src/app/creative-works` pages and `src/lib/works.ts` remain deleted.
- Rights/public-visibility behavior is inherited from each current destination. The retirement layer publishes no content and bypasses no `isPubliclyRenderable` check.
- `/creator-tools/request` remains an independent route with its own canonical metadata. CRY-266 neither makes it a Creative Works child nor expands its approval or capability scope.
- Sitemap v18/v19 mappings are historical provenance where they conflict with v20.

## Verification record

Verified locally on 2026-09-09:

- `npm test`: 281/281 passed, including the CRY-266 redirect, permanence, ordering, sitemap, and creator-request contracts.
- `npm run lint`: passed.
- `tsc --noEmit`: passed.
- `npm run build`: passed; 76/76 static pages generated.
- Local production HTTP smoke: every Creative Works source returned `308` with the destination recorded above; the independent `/creator-tools/request` returned `200`; an unrelated unknown route returned `404`.
- Destination implementation review: Entertainment and Singularis use `publicProducts()` / `publicReleases()`, which filter through `isPubliclyRenderable`. The redirect layer renders no content and introduces no visibility bypass.

Record the reviewed commit in CRY-266 before transitioning the issue.
