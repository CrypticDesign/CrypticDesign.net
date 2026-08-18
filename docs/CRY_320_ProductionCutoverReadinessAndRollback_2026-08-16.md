# CRY-320 Production Cutover Readiness and Rollback

**Owner:** Robert K. Croft  
**Prepared:** 2026-08-16  
**Status:** No-Go pending the blockers and approval gates below  
**Canonical production:** `https://www.crypticdesign.net` on Squarespace  
**Verified candidate:** `https://demo.crypticdesign.net` on Netlify  
**Release commit:** `c3db461414b1fbc2d221ec090a6342ed4d8a0702`  
**Netlify deploy:** `6a7ce0802ae5450008e1c591` (`ready`, branch `main`)  
**Jira owner:** CRY-320

## Decision

Do not change production DNS yet. The replacement application is deployed and broadly verified, but the production hostnames are not configured as Netlify aliases, two routes still fail the strict metadata audit, the production dependency audit reports four high-severity advisories, and the production authentication/email rehearsal has not been repeated for this cutover packet.

CRY-344 is complete. The static shop preview is intentionally post-MVP and is not a cutover blocker. Squarespace remains the canonical site and rollback baseline until Robert records an explicit Go decision.

## Verified on 2026-08-16

- GitHub `main` is exactly `c3db461414b1fbc2d221ec090a6342ed4d8a0702`.
- Netlify published deploy `6a7ce0802ae5450008e1c591` is `ready`, on `main`, and bound to that exact commit.
- `https://demo.crypticdesign.net`, the Netlify default hostname, and the Squarespace production hostname return HTTP 200.
- The hosted 41-route sitemap audit passed with zero route, internal-link, image, alt-text, metadata-presence, or HTTP findings.
- Five launch-critical legacy redirects return the intended HTTP 308 destinations.
- The hosted Chromium launch matrix passed 45/45 checks across 15 routes and mobile, tablet, and desktop viewports with zero console errors.
- Local browser QA passed 39 Chromium checks and 13 WebKit checks. Firefox timed out before launch and remains explicitly unverified; the two-engine requirement is satisfied by Chromium and WebKit.
- Automated verification passed: 156/156 unit/contract tests, ESLint, TypeScript, 63-page production build, Professional inventory audit, membership E2E, and Character E2E.
- Live anonymous membership session returns HTTP 200 with `authenticated: false`, no user, and no error.
- Live account creation, auth confirmation, and Professional inquiry routes return HTTP 200.
- Local production-mode review server: `http://127.0.0.1:3100`.

## No-Go blockers

### 1. Production Netlify hostnames are not configured

The Netlify site currently reports `demo.crypticdesign.net` as its only custom domain and reports no domain aliases. Before any DNS change:

- [ ] Add `crypticdesign.net` and `www.crypticdesign.net` to the approved Netlify site.
- [ ] Confirm Netlify's exact DNS instructions for both hostnames.
- [ ] Provision and verify valid TLS certificates for both hostnames.
- [ ] Choose and document the canonical apex/`www` redirect direction.
- [ ] Re-run the hostname checks before public traffic is moved.

This is an approval-gated hosting mutation. It is not authorized by this readiness audit.

### 2. Strict metadata audit has four findings

- [ ] Expand `/products/singularis` meta description from 83 characters to the approved 140–160 range.
- [ ] Replace `/products/singularis` generic `share.png` with approved per-route share art.
- [ ] Expand `/audio` meta description from 87 characters to the approved 140–160 range.
- [ ] Replace `/audio` generic `share.png` with approved Cryptic Signal share art.
- [ ] Re-run the 15-route metadata audit and require zero findings.

### 3. Production dependency audit requires triage

`npm audit --omit=dev` reports four high-severity and zero critical production findings:

- `next@15.5.21`, through affected `postcss` and `sharp` dependencies
- `postcss@8.4.31`
- `sharp@0.34.5`
- `nanoid@3.3.15`

The automated remediation currently proposes a semver-major Next.js upgrade. Do not apply `npm audit fix --force` as a cutover shortcut.

- [ ] Determine actual exposure in the deployed Next.js/Netlify configuration.
- [ ] Select the smallest compatible patched dependency strategy.
- [ ] Re-run unit, type, lint, build, route, browser, and auth checks after any dependency change.
- [ ] Record an explicit security disposition before Go, including rationale for any accepted residual risk.

### 4. Production authentication and email rehearsal remains approval-gated

Runtime smoke checks show the configured anonymous path is healthy, but this audit did not create a production account or send confirmation email.

- [ ] Confirm required Netlify environment-variable names, scopes, and deploy contexts in the provider UI without copying values into reports.
- [ ] Confirm Supabase production URL/key wiring, redirect allowlist, and `auth.crypticdesign.net` configuration.
- [ ] Run one Robert-approved create-account → confirmation-email → confirmed sign-in → sign-out rehearsal.
- [ ] Verify Microsoft 365 mail delivery remains intact before and after DNS cutover.
- [ ] Record the test identity disposition and remove any disposable test data according to the approved policy.

## Preserved public DNS baseline

This public snapshot assists verification but does not replace a full GoDaddy zone export.

| Record | Current public state | Cutover rule |
| --- | --- | --- |
| Apex A | Four Squarespace addresses; TTL 600 | Preserve exact values as DNS rollback target before replacement |
| `www` CNAME | `ext-cust.squarespace.com`; TTL 3600 | Preserve as DNS rollback target before replacement |
| `demo` CNAME | `frabjous-frangipane-650548.netlify.app`; TTL 3600 | Keep staging intact during cutover |
| Apex MX | Three `ppe-hosted.com` targets; TTL 3600 | Do not modify |
| Apex TXT | Microsoft 365 verification and SPF records present | Do not modify |
| `autodiscover` CNAME | `autodiscover.outlook.com`; TTL 3600 | Do not modify |
| `_dmarc` TXT | DMARC record present; TTL 3600 | Do not modify |

Before Go:

- [ ] Export the complete GoDaddy DNS zone, including records not publicly enumerated here.
- [ ] Capture record names, types, values, priorities, and TTLs without exposing sensitive verification data in Jira or ordinary reports.
- [ ] Identify Microsoft 365, Proofpoint/PPE, Resend/Supabase Auth, DKIM, SPF, DMARC, Autodiscover, and verification records by owner.
- [ ] Record the exact Netlify apex and `www` values supplied after the aliases are configured.
- [ ] Record the approved operator, cutover window, communication path, and rollback authority.

## Cutover procedure — execute only after Robert's explicit Go

### Pre-change stop check

- [ ] All No-Go blockers above are closed or have a documented Robert-approved risk acceptance.
- [ ] Netlify deploy `6a7ce0802ae5450008e1c591` is still `ready` and still represents the approved commit.
- [ ] No unreviewed commit has reached `main`.
- [ ] Squarespace is healthy and remains paid/available as rollback.
- [ ] Full DNS export and screenshots are stored in the restricted operational evidence location.
- [ ] Netlify apex/`www` aliases and TLS readiness are confirmed.
- [ ] Robert records **Go**, the timestamp, the operator, and the approved change window in CRY-320.

### DNS change

- [ ] Change only the approved apex and `www` web records to the exact Netlify-provided targets.
- [ ] Do not alter MX, SPF, DKIM, DMARC, Autodiscover, `demo`, auth/email, or unrelated verification records.
- [ ] Record before/after values and the provider change timestamp.
- [ ] Observe public resolution from at least two independent resolvers.
- [ ] Verify TLS and the canonical apex/`www` redirect before declaring traffic moved.

### Immediate public smoke test

- [ ] Homepage, Entertainment, Professional, Account/Create Account, Search.
- [ ] Singularis, Lifa, Cryptic Signal/audio, store preview, articles, case studies, inquiry, privacy, terms, 404.
- [ ] `robots.txt`, `sitemap.xml`, icon, Open Graph images, and representative media.
- [ ] Full sitemap route/link/image/metadata audit.
- [ ] Legacy redirects, including `/lifa-demo`, `/store`, `/cart`, stale article, and `/aboutcrypticdesign`.
- [ ] Anonymous session, approved confirmation/sign-in path, sign-out, and safe unavailable states.
- [ ] Mobile, tablet, and desktop Chromium checks plus a WebKit pass.
- [ ] Microsoft 365 inbound/outbound mail and Auth confirmation mail.

## Stabilization and rollback

### Rollback triggers

Rollback immediately when a Severity 1/2 condition is present or when any of these cannot be corrected inside the approved window:

- apex or `www` fails DNS, TLS, or canonical routing
- a front door, auth path, sitemap, robots file, or material route returns repeated 5xx responses
- Microsoft 365 or authentication email delivery is disrupted
- redirect loops or widespread 404s appear
- rights-restricted or retired content becomes publicly exposed
- a material accessibility, navigation, authentication, or data-isolation regression appears
- security triage identifies unacceptable active exposure

### Rollback paths

1. **Netlify deployment rollback:** restore/pin the known-good deploy `6a7ce0802ae5450008e1c591` for commit `c3db461414b1fbc2d221ec090a6342ed4d8a0702`.
2. **DNS rollback:** restore the preserved Squarespace apex A records and `www` CNAME, leaving all Microsoft 365 and auth/email records unchanged.
3. Verify the restored public site, TLS, email, and critical redirects; record incident evidence before another attempt.

### Stabilization exit

- [ ] Complete the Robert-approved stabilization window; 72 hours is recommended for the first canonical cutover.
- [ ] Record public-domain smoke evidence at cutover, +15 minutes, +60 minutes, +24 hours, and stabilization close.
- [ ] Keep Squarespace available throughout stabilization.
- [ ] Do not cancel Squarespace until stable evidence is complete and Robert separately approves cancellation.

## Current authority boundary

This runbook authorizes no DNS edit, Netlify domain mutation, production account creation, email send, credential inspection, deploy, Squarespace cancellation, paid service, or public commerce activation. Each remains subject to the approval gates above.
