# CRY-502 / CRY-503 — coordinated implementation evidence

Date: 2026-08-27. Execution authority: [Confluence handoff 465960961](https://crypticdesign.atlassian.net/wiki/spaces/TEAM/pages/465960961).

## Provenance and authority

- Repository: CrypticDesign/CrypticDesign.net.
- Start and latest verified origin/main: `712617fbf0320c701abcdf9def0d39d122a522c9`.
- Branch: `agent/cry-502-503-wave0-frontdoors`; isolated worktree `crypticdesign-net-cry502-503`. Existing dirty checkouts were not modified.
- Commit/PR/delivery details: recorded in the local delivery record and coordinated GitHub PR.
- CRY-504 was In Progress in Jira; no matching PR or newer main was found at the final pre-PR fetch. Rebase/reconcile if its approved merge lands before integrated acceptance.
- No merge, deployment, provider activation, account/Join changes, Jira/Confluence/Figma writes, or CRY-505 closure performed.
- No changes to Homepage, SiteHeader, auth/API/account implementation, shared PageScene renderer, globals.css, package.json, or package-lock.json.

## Separate dispositions

| Ticket | Disposition | Evidence and condition |
| --- | --- | --- |
| CRY-502 | CONDITIONAL PASS | Canonical front door, six-stage hierarchy, public hero CTAs, Arcade/Music/Video, separate worlds, governed selections, compatibility redirects and focused QA pass. Full account E2E remains red on unchanged pre-Homepage-v2 expectations; integrated CRY-505 and owner visual acceptance are not claimed. |
| CRY-503 | CONDITIONAL PASS | Staged participation, explicit Creators/Groups/Events status, withheld Spaces, compact activity status, no manufactured activity, signed-in/out continuity, responsive/a11y/fallback QA pass. Same inherited account-E2E and integrated acceptance conditions apply. |

## Route compatibility decision

- `/entertainment`: canonical general Entertainment discovery, global Play destination unchanged.
- `/entertainment/explore`: canonical URL of the **Arcade playable catalog**, not a second general Entertainment homepage.
- `/entertainment/arcade`: existing 308 permanent redirect retained, including query-string preservation.
- Existing genre routing: Singularis and Lifa → their `/products` destinations; legacy featured filter → catalog root.
- Music `/audio`, Video `/entertainment/cinema`, and world URLs unchanged.
- Community's generic discovery link now uses `/entertainment`. Homepage's contextual Play link intentionally retains the Arcade catalog path; the generic Homepage CTA already points to `/entertainment`.
- Sitemap URL inventory unchanged; canonical, Open Graph, Twitter, direct routes and compatibility redirects verified. Local architecture note records the approved navigation drift; external Figma synchronization is not a launch blocker under the handoff.

## Exact content represented

The old display-catalog title **Signal & Systems: Deep Space Transmission** links to a different, scheduled release and does not provide governed support for the former fourteen-track/current-release claim. That root-page presentation was removed; the media catalog itself is outside this refinement.

Featured object from `publicReleases()`:

- `singularis-themes-vol-1` — **Singularis Themes, Vol. 1**, audio, owned/public/scheduled, status coming-soon, displayed **Coming soon**.
- Destination `/releases/singularis-themes-vol-1`; description and image are taken through existing release helpers.
- The historical seed date is not treated as proof of release and is not promoted as a new promise.

Selected releases: **Singularis: Vertical Slice**, **Singularis: Overture**, **Visual Study 01**; each owned/public/scheduled and displayed **Coming soon**. The vertical-slice destination keeps the established Singularis product redirect. The separate Arcade catalog still identifies its real browser prototype as a **Public sample**.

World cards use `publicProducts()`: Singularis and Lifa, both **in development**, with existing descriptions/destinations. Rights/publication filtering remains mandatory; new release-selection tests explicitly reject restricted, draft, hidden, account-required and entitlement-required records.

Community:

- Public Community: Open for browsing.
- Creators: existing approved Robert K. Croft public profile available; no invented creator volume.
- Groups: no published groups; planned membership only.
- Events: no approved calendar; no registration offered.
- Spaces: no functional public destination; remains hidden.
- Activity: Not connected, shown only as a compact status row.
- Cross-platform links explicitly labeled **From across the platform / Explore while Community opens**.
- Signed-in state uses the existing server account resolver; My Home, My Library and Account shortcuts disappear on sign-out.

## Verification actually run

| Command/check | Result |
| --- | --- |
| `npm test` | PASS: 240/240, zero failures/skips |
| `node node_modules/typescript/bin/tsc --noEmit` | PASS, exit 0 |
| `npm run lint` | PASS, exit 0 |
| `npm run build` | PASS; 75 static pages generated |
| `node scripts/qa-cry502503.mjs http://127.0.0.1:3502` | PASS: 21 cases, no errors |
| `node scripts/qa-live-a11y.mjs http://127.0.0.1:3502 artifacts/CRY-502-503/a11y` | PASS: six routes, no axe violations, no undersized targets, visible keyboard focus, 720px reflow check |
| `node scripts/qa-page-scene-runtime.mjs http://127.0.0.1:3502` | PASS: four expected shared scenes, active renderer, running lifecycle, ready assets, no unexpected failed responses |
| `node scripts/qa-viewports.mjs /entertainment http://127.0.0.1:3502` | PASS: 390/768/1440, keyboard-opened compact menus, no horizontal navigation scrolling, minimum item heights 60/60/76px |
| `npm run test:e2e` with local BASE_URL 3503 | CONDITIONAL: membership PASS; character PASS; account FAIL at unchanged stale Homepage expectation. See e2e-exception.md. |
| `node scripts/qa-cry502503-continuity.mjs http://127.0.0.1:3503` | PASS: current Homepage handoffs and Community signed-out/authenticated/sign-out transitions |
| `git diff --check` | PASS |

Focused browser matrix: Entertainment, Community and Arcade at 390/768/1440 default; Entertainment/Community at 390/1440 with reduced motion, disabled WebGL and disabled JavaScript. Automated WCAG 2.1 AA checks ran in every JS-enabled case. Each case checks one H1, headings, overflow, social metadata, content availability, and loaded fallback imagery. Community hero/status overlap is explicitly measured. Discovery anchors and visible keyboard focus are checked in default cases.

Browser artifacts: `browser/results.json`, `browser/routes.json`, and 21 full-page screenshots. Route results include 15 direct HTTP 200 destinations and five compatibility redirects. Existing a11y and PageScene logs are retained. Manual in-app browser inspection confirmed mobile Community copy/status and discovery-link navigation; desktop and mobile screenshots were visually inspected.

## Limitations and exceptions

- This is local production-build evidence, not a production deployment or a complete launch approval. Deploy preview availability is recorded at delivery; no deploy was manually triggered.
- Existing local membership endpoints return expected 503 responses when production credentials are absent. No credentials were copied from other checkouts; production authentication was not tested.
- PageScene performance on this workstation was constrained (final samples: Entertainment 44 FPS, Community 35 FPS, adaptive mid quality). Runtime/fallback contracts passed; this is not a device-performance certification.
- The existing account E2E failure is documented, not silently waived or “fixed” by overwriting CRY-504/Homepage work.
- No NVDA/VoiceOver session, real assistive-device test, or browser-engine matrix was performed. Axe/semantic/keyboard/contrast/reflow evidence is not full WCAG certification.
- Node 22.12.0 reports an existing dependency engine warning for eslint-visitor-keys; locked dependencies were not changed and build/type/lint/tests passed.
- Initial focused assertions were corrected to handle CSS-uppercase status text; final rerun has no errors.

## CRY-505 integration handoff

After owner-approved merges of CRY-504, CRY-502 and CRY-503, verify `/ → /entertainment → /community → /account/create`, the final Request Access mechanism, accountless browsing, direct account-creation denial, current account E2E expectations and owner visual acceptance. Rebase on approved current main first if needed. This PR does not close CRY-505.

Implementation files: Entertainment and Arcade pages; Community page and scoped frontdoor.css; CommunityAvailabilityPanel; Entertainment/Community navigation data; entertainment-frontdoor selection helper; focused tests; QA scripts; local architecture drift note. No backend or paid dependency scope added.
