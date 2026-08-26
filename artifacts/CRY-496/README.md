# CRY-496 — Professional refinement acceptance

Date: 2026-08-26 (America/Chicago). Scope: CRY-497 / CRY-498 implementation and CRY-499 verification.

## Candidate and authority

- Branch: `agent/cry-496-professional-refinement`
- Base: `b5a240e` (clean `main`, fast-forwarded from `4b8721a` after fetch; 125 commits behind before synchronization).
- Shared VDS: PR #57 merged at `719ae4d5051e8b8a3cef65f26f6112ff27691f0a`; current main also includes responsive PR #58. Jira CRY-495 still showed In Progress, but its implementation was already merged. Repository evidence governs this implementation dependency.
- Review/merge remain Robert-owned. No main push, production deployment, DNS change, paid dependency, or Jira/Confluence mutation is part of this change.
- [Page-by-page specification](https://crypticdesign.atlassian.net/wiki/spaces/TEAM/pages/465076225)
- [Professional experience specification](https://crypticdesign.atlassian.net/wiki/spaces/TEAM/pages/464912385)
- [Implementation handoff](https://crypticdesign.atlassian.net/wiki/spaces/TEAM/pages/464977925)
- [Platform Architecture](https://crypticdesign.atlassian.net/wiki/spaces/TEAM/pages/440041473)
- [Wave 0 Launch Plan](https://crypticdesign.atlassian.net/wiki/spaces/TEAM/pages/464584705)
- [CRY-496](https://crypticdesign.atlassian.net/browse/CRY-496), [CRY-497](https://crypticdesign.atlassian.net/browse/CRY-497), [CRY-498](https://crypticdesign.atlassian.net/browse/CRY-498), [CRY-499](https://crypticdesign.atlassian.net/browse/CRY-499).

## Implementation

The overview formerly placed ethos and generalized experience before one generic proof module. It now follows **Hero → Capabilities → Ways to Engage → Selected Proof → Experience Context → Working Method → Principles → Founder / Senior Practice → Start a Project**, using approved Confluence copy.

The four services and their existing routes remain intact. Shared service data supplies approved descriptions, capability groups, representative sub-capabilities, and engagement patterns. Existing process/deliverable/proof sections remain available. Game UX, audits/research, fractional leadership, prototyping, design systems, creative technology, AI-assisted production workflows, and selective implementation support are explicit.

The overview selects Humankind, WIN Reality, and WellSky from a shared case-study module. The existing data was extracted verbatim; no provenance, case body, outcome, FAQ, image, alt text, or caption was rewritten. Approved overview summaries are presentation copy, not a second study inventory.

**Route clarification:** the verified repository implements the six studies as anchored sections on `/professional/case-studies`, not six separate page routes. Existing `#humankind-console`, `#win-reality`, `#digimancy-wire`, `#wellsky`, `#onward-vr`, and `#rise-to-power` destinations remain the study URLs. CRY-496 preserves this IA. The index now exposes actual engagement context and problem statements, and every study ends with All Case Studies / Start a Project paths.

The article index features the four newest pieces and preserves seven earlier pieces in an explicitly dated archive. Human-readable card excerpts remove visible hashtag/SEO-heavy presentation. Imported metadata, bodies, tags, inline imagery, canonical routes, and redirects are unchanged. Article footers add service discovery and inquiry paths. Date/tag text uses the shared muted token after the expanded accessibility audit found insufficient contrast in the previous template.

Inquiry remains a mail-client handoff. Name, email, organization/project, and problem/opportunity are required. Stage, support type, timing, budget/context, and supporting link are optional. Every value is encoded into the draft. No request is sent to a submission API, no data is persisted, and no success/submitted/sent state is fabricated. A visible email fallback leaves values available for copying.

Professional layout and components consume the existing `data-section-accent="violet"` / `--cry-accent-violet` and accessible-text tokens. No palette or color literal was introduced. Existing secondary study accents and global FAB media behavior are preserved. The old Professional full-spectrum cadence test was updated to reflect the newer CRY-496 authority; other shared VDS tests remain intact.

## Preservation

`preservation.json` compares the extracted case-study data and protected files with base `b5a240e`, and Git blob hashes for each of the 69 baseline-ledger assets.

- 6 case studies; 55 distinct proof images; 11 articles; 11 article hero images; 69 governed Professional assets.
- Exact case-study data preservation: PASS.
- All 69 baseline asset blobs unchanged: PASS.
- Missing referenced assets: 0. Orphaned article/case-study assets: 0.
- Article source, article-image mapping, ArticleBody, gallery/lightbox component, redirects, robots, package manifest, and lockfile unchanged.
- Historical CRY-454 completion, inventory, and browser evidence are not rewritten.

## Verification record

Local production build served at http://127.0.0.1:3100 on 2026-08-26. See local-acceptance.json for the combined acceptance decision.

| Check | Executed result |
| --- | --- |
| npm test | 231 passed, 0 failed, 0 skipped |
| Focused Professional / VDS tests | 15 passed |
| npm run lint; tsc --noEmit | PASS |
| npm run build | PASS; 75/75 generated pages |
| Asset inventory and preservation | PASS; 6 studies / 55 proof images / 11 articles / 69 assets |
| Chromium 149.0.7827.55 | 63 route/viewport UI checks PASS |
| Firefox 151.0 | 63 route/viewport UI checks PASS |
| WebKit 26.5 | 63 route/viewport UI checks PASS |
| axe-core WCAG 2/2.1 A/AA, Chromium | 63 scans, 0 violations |
| Lightbox keyboard, all three engines | Enter opens, ArrowRight advances, Escape closes, focus restored |
| Final route/metadata/links/anchors/sitemap/robots | 20 canonical routes PASS |
| Legacy article redirects | All 11 PASS |
| Inquiry, Chromium at 390px | Native validation, nine encoded fields, actual mailto navigation, visible fallback, retained values, no false success; PASS |
| Inquiry keyboard | All 11 controls/links visibly focused, minimum target height 44px |
| Professional subnavigation | 390/768/1440px, five visible destinations, keyboard disclosure, no horizontal scroll; PASS |

The 189 browser checks cover 21 destinations (20 canonical pages plus the contact redirect) at **390×844, 768×1024, 1440×900**. HTTP status, main/H1, visible image decoding, navigation, shared violet identity, and overflow were checked. Ten full-page Chromium screenshots capture the five primary pages at 390 and 1440px. They are implementation evidence, not Robert's visual approval.

**Resolved findings:** the expanded audit found inherited low-contrast article date/tag text; the existing muted token fixes it, and all final Chromium axe scans pass. All three combined browser reports subsequently failed **only** because the four existing service pages were absent from the sitemap. Those original reports remain intact. The sitemap now derives those entries from publicServices(), retaining all existing entries. A new production build and routes-final.json recheck pass. No UI code changed between the completed browser matrix and this sitemap-only correction.

Commands: npm test; node --experimental-strip-types --test src/lib/professional-content.test.ts src/lib/prismatic-spectrum-contract.test.ts; npm run lint; node node_modules/typescript/bin/tsc --noEmit; npm run build; node scripts/audit-professional.mjs; node scripts/qa-professional.mjs http://127.0.0.1:3100 <chromium|firefox|webkit|routes> artifacts/CRY-496; node scripts/qa-viewports.mjs /professional http://127.0.0.1:3100; node tests/professional-inquiry.e2e.mjs http://127.0.0.1:3100 artifacts/CRY-496.

## PR and preview

Pending PR creation and deployed verification. No merge performed. This section will be completed with observed GitHub/Netlify evidence.

## Known boundaries

- Browser emulation is not physical-device testing. No manual screen-reader certification is claimed.
- Local production runtime has no hosted Supabase configuration; the existing `/api/membership/session` 503 is excluded by the inherited Professional audit. No auth/backend activation was attempted.
- Existing membership/character E2E scripts require the retired preview-session contract or configured admission backend and are outside this Professional change; the complete `npm test` suite and focused Professional inquiry/browser checks are the executed coverage.
- Figma screenshots were not required or captured. No Figma-only waiver blocks review.
- No email was sent by the inquiry tests; mail-client navigation and encoded content were observed.
- The first browser attempts timed out waiting on the local optimized WebP response for the preserved 2023 gaming-article hero. Only completed final reruns can count as acceptance.
