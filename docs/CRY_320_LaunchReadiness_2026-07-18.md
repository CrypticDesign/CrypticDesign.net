# CRY-320 Launch Readiness

Owner: Robert K. Croft  
Prepared: 2026-07-18  
Authority: Local preparation only; production cutover remains owner-gated

## Verified baseline

- Repository: `CrypticDesign/CrypticDesign.net`
- Baseline: `main` at `2916ffd`
- Working branch: `codex/cry-320-launch-readiness`
- Package manager: npm with `package-lock.json`
- Runtime tested: Node 22.12.0 and npm 10.9.0; use Node 20.19+ or 22.13+ to satisfy current dependency engine floors
- Framework: Next.js 15 App Router, React 19, TypeScript
- Checks: `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`
- Output: `.next`; standalone Node package via `npm run package:deployment`
- Environment names: `.env.example`; values must never enter Git or packages
- Package safety: the packager removes ignored `.data` sandbox fixtures/logs and fails if `.env*` or `.data` content reaches the staging directory

## Hosting compatibility

The build contains server-rendered routes and API handlers. It is not a static HTML bundle. A GoDaddy product is compatible only if it provides a supported persistent Node runtime, process startup, HTTPS proxying, and the ability to run `node server.js`. Conventional shared file hosting without Node application support is not compatible with the complete build.

Account inspection must verify the plan name, supported Node versions, application root, startup command, upload method, root and `www` controls, SSL controls, backup/restore facilities, storage limits, and secret configuration. None of these account facts is claimed verified yet.

## Reproducible package

Run `npm ci`, lint, `npx tsc --noEmit`, tests, build, then `npm run package:deployment`. The archive and SHA-256 file are written to ignored `artifacts/`. On a compatible host, extract it, enter approved environment values through the host, set `PORT` if required, and start `node server.js`.

Validated artifact: `artifacts/cry-320-standalone.zip` (25,125,939 bytes). SHA-256: `71969698427692225c216fe0e894944a7fdaa90766885b4dff1e56598cd94194`. Archive inspection found no `.env*` or `.data` entries.

## Backup and rollback

Before upload or routing changes, record the approved release SHA, rollback SHA or deployment target, current DNS values, certificate state, and a recoverable backup of the existing root. Preserve Squarespace unchanged. Roll back for TLS failure, unavailable front doors, redirect loops, widespread 404s, rights failures, or Severity 1/2 regressions by restoring the recorded prior routing/target and verifying the legacy site.

## Dependency decision

CRY-344 must complete content migration, QA, and redirect handoff before CRY-320 final production cutover. Jira was rechecked on 2026-07-18 and now correctly represents CRY-320 as **is blocked by** CRY-344. No dependency-link correction remains outstanding.

Safe staging, build, package, redirect preparation, preservation planning, and smoke testing may continue before CRY-344 completes. Production cutover, canonical-domain replacement, and Squarespace cancellation may not.

## Validation evidence — 2026-07-18

| Check | Result | Evidence |
|---|---|---|
| Clean lockfile install | Pass with warning | `npm ci`; 336 packages installed. Node 22.12.0 is below the supported 22.13+ dependency floor. |
| Lint | Pass | `npm run lint` after generated `artifacts/**` exclusion. |
| TypeScript | Pass | `npx tsc --noEmit`. |
| Unit tests | Pass | 91/91 tests. |
| Development e2e | Pass | Membership and character flows passed with local sandbox fixtures enabled. |
| Production build | Pass | Next.js 15.5.20; 53 static/SSG pages plus expected SSR/API routes. |
| Standalone package | Pass | Archive created; `.env*` and `.data` content excluded. |
| Production-package smoke | Pass | Front doors, releases, products, Cryptic Signal, inquiry, robots, sitemap, icon, and Open Graph image returned 200. |
| Redirects and 404 | Pass | `/personal/creative-labs` → `/entertainment/visual-studies`; `/worlds` → `/entertainment`; unknown route returned 404. |
| Backend-preview boundary | Pass | Production `POST /api/membership/session` returned 503; sandbox APIs remain disabled in production. |
| Dependency audit | Conditional | Two moderate PostCSS advisories are reported through Next.js. npm offers only a breaking forced change; do not apply it. No user-supplied CSS serialization exists in the launch path. |

## Revalidation evidence — 2026-07-18

- `npm run lint` through `npm.cmd`: pass.
- `tsc --noEmit`: pass.
- `npm test`: pass, 91/91 tests.
- `npm run build` through `npm.cmd`: pass, 53 static/SSG pages plus expected SSR/API routes.
- `npm run package:deployment`: pass; archive and checksum above regenerated from the current branch.
- Packaged-server smoke: pass for all front doors, releases, products, Cryptic Signal, inquiry, robots, sitemap, icon, Open Graph image, legacy redirects, 404 handling, and the production backend boundary.
- `https://demo.crypticdesign.net` automated smoke: pass for the same route set, including expected 404 and 503 responses. This does not replace the outstanding physical desktop/tablet/mobile two-browser visual and keyboard matrix.
- Real-browser staging check at 1440 × 900: all five canonical primary-navigation destinations are visible, with no horizontal overflow, missing image alt attributes, empty links, or captured console warnings/errors on My Home.
- Real-browser staging check at 390 × 844: My Home, Entertainment, and Professional are visible, but Account and Search are hidden. The current branch contains the responsive rule intended to expose all five items; the deployed staging build has not received or validated that correction. Classify staging as Severity 2 until the branch is deployed and rechecked.
- Browser-engine coverage: one Chromium-family engine was exercised. Chrome and Edge are installed locally but both use Chromium; no second engine is available on this workstation.

## Authorities reviewed

- Jira: CRY-320, CRY-319, CRY-344, CRY-242, CRY-286, CRY-255, and CRY-360, including current issue links and comments.
- Confluence: Creator-Owned Entertainment Operating System, Platform Delivery Roadmap, Visual Direction and Responsive Screen Lock, Dev Agent Starting Prompt and Setup Tasks, Membership and Subscription Architecture, Master Control, and Live Site Content Migration Control.
- Figma/FigJam: Sitemap v18 section `82:3118` and integrated screen set `q6yiO93wY6ehMlqRR399Kj`, node `3105:242`.
- Current public Squarespace surface: confirmed top-level routes are seeded in the preservation checklist and redirect map.

Historical Confluence rows still naming Cryptic Design Audio conflict with the newer v18 handoff and CRY-320 naming correction. The winning rule is Cryptic Signal publicly; CDA identifiers may remain internal only. The public Squarespace `/products` page still presents Soundwave as active, so that page is archive/rewrite evidence under CRY-344 and must not be copied as current canon.

## Current defect classification

- Severity 1: none known locally.
- Severity 2: the deployed staging build hides Account and Search at 390 px. The current branch contains the responsive-navigation correction, but staging must be updated and visually revalidated before this defect can close.
- Severity 3: two moderate transitive PostCSS audit findings without a safe npm-proposed remediation; monitor upstream Next.js.
- Severity 3: the legacy public Squarespace products page still positions Soundwave as active; this is contained to the preserved legacy site but must be corrected by CRY-344 before canonical cutover.
- Severity 4: Node 22.12.0 engine warning in the local workstation; use Node 20.19+ or 22.13+ for deployment and future clean installs.

## CRY-320 acceptance matrix

| Acceptance item | State | Evidence / blocker |
|---|---|---|
| Clean production build | Verified | Build and local checks pass. |
| Canonical HTTPS domain on existing GoDaddy hosting | Blocked | Requires GoDaddy account inspection, compatible Node runtime, production upload, and Robert approval. |
| Sitemap v18 demo journey | Locally and staging verified | Packaged-server and deployed staging smoke routes pass; physical two-browser matrix remains. |
| Global navigation exactly My Home, Entertainment, Professional, Account, Search | Branch prepared; staging blocked | Header labels and responsive correction are present in the branch, but current staging hides Account and Search at 390 px. |
| Soundwave/CDA absent; Cryptic Signal correct | Verified locally | Public-source search found no retired terms; `/audio` and product copy use Cryptic Signal. |
| Preview not represented as live backend | Verified | Copy discloses local/browser-only behavior; production sandbox API returns 503. |
| Desktop/tablet/mobile, keyboard, two-browser smoke | Partial | Responsive/focus implementation audited; physical two-engine browser matrix still required. |
| No known Severity 1/2 launch-path defect | Blocked on staging | No Severity 1 is known; the deployed mobile-navigation mismatch remains Severity 2 until redeployed and revalidated. |
| Metadata, redirects, robots, sitemap, favicon, OG, alt text, 404/fallback | Automated staging verified | Build routes, production-package smoke, and deployed-host smoke pass; visual/browser review remains. |
| Reproducible deploy and rollback | Prepared | Standalone archive, checksum, smoke script, backup/rollback procedure documented. |
| Squarespace archive complete | Blocked | Evidence checklist exists; CRY-344 inventory/capture must complete. |
| No paid infrastructure or unapproved backend | Verified | No paid service added; production sandbox disabled. |
| Squarespace cancellation after approval | Gated | No cancellation or account change performed. |

Current recommendation: **no-go for canonical production cutover** until the CRY-320 branch is deployed to staging and the mobile navigation is revalidated, CRY-344 completes, GoDaddy Node-hosting facts are verified, Squarespace evidence is captured, the two-browser responsive matrix passes, and Robert explicitly approves cutover.

## Approval gates

Robert must explicitly approve production upload, DNS/root/`www` changes, public-site replacement, analytics changes, Squarespace cancellation, hosted-file deletion, Jira/Confluence mutation, and closure of CRY-319 or CRY-320.
