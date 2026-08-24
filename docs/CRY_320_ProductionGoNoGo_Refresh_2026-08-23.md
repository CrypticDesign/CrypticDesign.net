# CRY-320 Production Go/No-Go Refresh

**Prepared:** 2026-08-23 (America/Chicago)

**Decision:** **NO-GO for canonical production cutover**

**Current canonical production:** `https://www.crypticdesign.net` on Squarespace

**Verified public demo:** `https://demo.crypticdesign.net` at merge commit `09ff8f3`

**Hardened candidate:** `agent/cry-493-runtime-hardening` — local verification complete; not yet merged or deployed

**Authority:** CRY-320; production promotion requires Robert's separate explicit Go approval

## Executive decision

The live demo is visually coherent and stable enough for continued review, and the hardened candidate resolves the identified automated accessibility findings while adding governed WebGL asset loading and measured runtime quality adaptation. Do not move the apex or `www` production traffic yet.

The current blockers are dependency-security disposition, Netlify production-domain/TLS readiness, DNS preservation and approval, production authentication/email rehearsal, manual assistive-technology and cross-engine completion, deployment of the hardened candidate to the demo domain, and a final post-deploy evidence pass.

## Verified readiness evidence

- Live Home, Entertainment, Community, and Professional return HTTP 200 with active/running WebGL canvases and exact destination colors.
- Hardened candidate adds asset registry/loading state and measured FPS classification with sustained-pressure high→mid adaptation.
- Governed texture assets loaded successfully on all four local candidate scenes.
- Headless constrained runs demonstrated automatic mid-tier downgrade on Entertainment, Community, and Professional; Home remained high at 43 FPS under the downgrade threshold.
- 217/217 automated tests pass.
- ESLint, TypeScript `--noEmit`, and the 75-page production build pass.
- Responsive navigation passes at 390, 768, and 1440 px with keyboard opening, four visible destinations, 54–64 px target heights, and no horizontal overflow.
- Automated WCAG 2.1 A/AA scan reports zero violations across Home, Entertainment, Community, Professional, Account Availability, and Sign In on the hardened candidate.
- All sampled focus indicators are visible, all audited targets meet 44×44 CSS geometry, and 720 px reflow-equivalent checks have no horizontal overflow.
- Sitewide route audit passes all 45 sitemap routes with no route, metadata-presence, link, image, or alt-text findings.
- Professional inventory audit passes: 11 articles, 6 case studies, 69 governed assets, no missing references.
- Strict metadata audit is clean after expanding the Account Availability description; final clean rerun remains required after the last build.

## Current No-Go blockers

### 1. Hardened candidate is not deployed

- [ ] Commit and review the hardening diff.
- [ ] Merge through one approved pull request.
- [ ] Confirm Netlify deploy checks and bind the published deploy to the merge commit.
- [ ] Repeat live WebGL, color, accessibility, metadata, route, and responsive verification.

This document does not authorize the push, merge, or demo deployment.

### 2. Production dependency security disposition

`npm audit --omit=dev` on 2026-08-23 reports four high-severity and zero critical production dependency findings:

- `next`, through affected `postcss` and `sharp` dependencies;
- `postcss` source-map disclosure/path traversal advisories;
- `sharp` inherited libvips advisories;
- `nanoid` non-secure/custom generator loop advisories.

The automated Next remediation proposes `next@16.3.2`, a semver-major upgrade.

- [ ] Determine deployed exposure for each advisory.
- [ ] Select the smallest compatible patch/override strategy.
- [ ] Do not use `npm audit fix --force` as a cutover shortcut.
- [ ] Re-run the full build, route, browser, auth, WebGL, and accessibility matrices after remediation.
- [ ] Record explicit security acceptance for any residual risk.

### 3. Production Netlify aliases and TLS

- [ ] Confirm `crypticdesign.net` and `www.crypticdesign.net` are configured as approved aliases on the correct Netlify site.
- [ ] Confirm the canonical apex/`www` redirect direction.
- [ ] Verify valid TLS for both hostnames before DNS movement.
- [ ] Record the exact provider-generated DNS values without exposing secrets.

### 4. DNS preservation and change authority

- [ ] Export the complete current DNS zone and preserve the Squarespace rollback values.
- [ ] Identify and protect Microsoft 365, Proofpoint/PPE, SPF, DKIM, DMARC, Autodiscover, auth/email, and verification records.
- [ ] Change only the approved web records during a Robert-approved window.
- [ ] Leave `demo.crypticdesign.net` intact throughout cutover and stabilization.

### 5. Production authentication and email rehearsal

- [ ] Verify environment-variable names, scopes, and contexts in provider UI without copying values into reports.
- [ ] Verify Supabase redirects and the governed invitation/subscriber admission condition.
- [ ] Run one Robert-approved invitation/confirmation/sign-in/sign-out rehearsal.
- [ ] Verify Microsoft 365 and auth confirmation mail before and after any DNS cutover.

### 6. Manual accessibility and cross-engine completion

- [ ] Complete NVDA/Chrome or NVDA/Firefox review of the six audited routes.
- [ ] Complete VoiceOver/Safari or an approved equivalent screen-reader pass.
- [ ] Complete a WebKit route/browser pass on the hardened deployed candidate.
- [ ] Verify real iOS and Android touch behavior.

## Production deploy checklist

### Pre-deploy

- [x] Candidate unit/contract tests pass locally.
- [x] Lint, TypeScript, and production build pass locally.
- [x] Rollback triggers and paths are documented.
- [ ] Candidate PR is reviewed, green, merged, and deployed to demo.
- [ ] Dependency advisories are remediated or explicitly accepted.
- [ ] Manual AT/cross-engine checks pass.
- [ ] Netlify aliases/TLS and complete DNS rollback evidence are ready.
- [ ] Production auth/email rehearsal passes.
- [ ] Robert records explicit Go, operator, and approved window in CRY-320.

### Deploy — execute only after explicit Go

- [ ] Reconfirm the approved demo deploy and commit immediately before change.
- [ ] Change only the approved apex and `www` web records.
- [ ] Verify public DNS from two independent resolvers.
- [ ] Verify TLS and canonical redirect behavior.
- [ ] Run route, WebGL, accessibility, account, redirect, sitemap, robots, and mail smoke tests.
- [ ] Monitor errors, latency, and critical flows at cutover, +15 minutes, and +60 minutes.

### Post-deploy

- [ ] Record metrics and public smoke evidence.
- [ ] Update Jira, Confluence, and release notes.
- [ ] Verify at +24 hours and stabilization close.
- [ ] Keep Squarespace available for the recommended 72-hour stabilization window.
- [ ] Do not cancel Squarespace without separate approval.

## Rollback triggers

Rollback immediately for repeated 5xx responses, failed apex/`www` DNS or TLS, redirect loops, broken front-door/account paths, widespread 404s, Microsoft 365 or auth-email disruption, unacceptable dependency exposure, material accessibility/navigation regression, data-isolation failure, or unauthorized/rights-restricted content exposure.

## Rollback paths

1. Restore the last verified Netlify deploy if the failure is application-level.
2. Restore the preserved Squarespace apex A records and `www` CNAME if the failure is cutover-level.
3. Leave Microsoft 365, auth/email, `demo`, and unrelated verification records unchanged.
4. Verify the restored site, TLS, redirects, account boundary, and mail before closing the incident.

## Authority boundary

This packet is draft/readiness evidence only. It authorizes no DNS edit, Netlify domain mutation, production deploy, production account creation, email send, credential inspection, Squarespace cancellation, payment activation, or paid provider change.
