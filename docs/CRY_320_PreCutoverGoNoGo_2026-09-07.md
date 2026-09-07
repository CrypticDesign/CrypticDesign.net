# CRY-320 — Wave 0 pre-cutover Go/No-Go

Date: 2026-09-07 (America/Chicago)

Release candidate source: `8e7a6273803b852ff132499be746dd98ceed9ea0`

Release-candidate URL: `https://demo.crypticdesign.net`

Netlify site: `frabjous-frangipane-650548`

Exact provider deploy ID: **operator verification required**

Recommendation: **NO-GO**

## Decision

The code, production dependency, core experience, Request Access admission, integrated journey, and Netlify edge lanes are materially green. CRY-505's product blocker is cleared. Canonical cutover must not begin because the provider/DNS/operator gates remain incomplete.

## Gate matrix

| Gate | State | Evidence / remaining action |
| --- | --- | --- |
| Exact current-main regression | PASS | 288/288 tests, lint, TypeScript, 78-page build, Sharp smoke, PageScene/browser checks |
| Production dependencies / CRY-405 | PASS | `npm audit --omit=dev`: zero vulnerabilities; CRY-405 Done |
| Request Access/admission / CRY-489/504 | PASS | Request presentation works; two live negative probes returned 403 with no cookie or identity state |
| Homepage / CRY-494 | PASS | Six live rendering/fallback combinations and governed route handoffs passed |
| Entertainment / CRY-502 | PASS | Deployed route, IA, truthfulness, accessibility, and shared controls verified; Done |
| Community / CRY-503 | PASS as its own surface | Truthful staged surface and accessibility verified; Done |
| Integrated journey / CRY-505 | PASS | PR #71 merged as `8e7a627`; deployed main passed 24/24 route/browser/viewport checks with zero WCAG, browser, overflow, semantic, canonical, or journey errors |
| Netlify edge / CRY-434 | PASS WITH FOLLOW-UPS | 60 direct checks and eight redirects passed; four defense-in-depth headers absent |
| Apex/`www` hostname and TLS readiness | NOT VERIFIED | Provider-side aliases/certificate readiness unavailable through current read-only evidence |
| DNS preservation/export | PARTIAL | Public web/mail baseline recorded; complete GoDaddy zone export still required |
| Exact deploy/commit binding | NOT VERIFIED | Runtime contains merged behavior, but provider deploy ID and SHA binding require Netlify UI confirmation |
| Operator/window/explicit Robert GO | NOT RECORDED | Mandatory stop gate |

## Public DNS preservation matrix

Observed 2026-09-07:

| Record | Current public state | Cutover rule |
| --- | --- | --- |
| Apex A | `198.185.159.145`, `198.185.159.144`, `198.49.23.144`, `198.49.23.145`; TTL 600 | Preserve as Squarespace rollback; replace only after explicit GO |
| `www` CNAME | `ext-cust.squarespace.com`; TTL 3600 | Preserve as rollback |
| `demo` CNAME | `frabjous-frangipane-650548.netlify.app`; TTL ~3600 | Do not change |
| Apex MX | `mx1-usg2.ppe-hosted.com`, `mx2-usg2.ppe-hosted.com`, `mx3-usg2.ppe-hosted.com`; priority 0, TTL 3600 | Do not change |
| Apex TXT | SPF and Microsoft 365 verification records present | Do not change or expose verification values in ordinary reports |
| `autodiscover` CNAME | `autodiscover.outlook.com`; TTL 3600 | Do not change |
| `_dmarc` TXT | DMARC present; policy `p=none`; TTL 3600 | Do not change |

DKIM, auth-email, provider-verification, and any non-public records must be preserved through a complete GoDaddy export before cutover.

## Proposed web-record changes — plan only

After Netlify aliases are configured and Netlify provides the exact supported values:

1. Replace only the four Squarespace apex A records with the confirmed Netlify apex target (historical plan value: `75.2.60.5`; re-confirm in Netlify before use).
2. Replace only the `www` Squarespace CNAME with the exact Netlify target supplied for this site.
3. Leave `demo`, MX, SPF, DKIM, DMARC, Autodiscover, auth-email, and verification records untouched.

## Rollback packet

Application rollback: pin/restore the last verified Netlify deploy recorded immediately before cutover. Do not use the historical August deploy as the current rollback target without reconfirmation.

DNS rollback: restore the four Squarespace apex A values and `www → ext-cust.squarespace.com`; do not touch mail/auth records. Squarespace remains active through stabilization and requires separate approval to retire.

Rollback immediately for repeated 5xx/front-door failure, DNS/TLS/canonical failure, email disruption, redirect loops/widespread 404s, material accessibility/auth/data-isolation regression, retired/restricted content exposure, or unacceptable security exposure.

## Cutover operator sequence

1. Confirm exact Netlify main-production deploy ID ↔ `8e7a627`.
2. Add/verify apex and `www` aliases, certificate readiness, and canonical direction in Netlify without changing DNS.
3. Export the complete GoDaddy zone and capture provider screenshots in restricted evidence.
4. Record operator, window, communication path, exact before/after web-record values, and rollback authority.
5. Obtain Robert's explicit GO in CRY-320.
6. Change only approved apex/`www` web records.
7. Verify two resolvers, HTTPS/TLS/canonical behavior, route/redirect/media/metadata, Request Access/admission, accessibility, responsive/two-browser behavior, and Microsoft 365/auth mail.
8. Observe the approved stabilization window and roll back on the triggers above.
9. Record RELEASED / CONDITIONAL / ROLLED BACK. Keep Squarespace until separate retirement approval.

## Remaining risks and follow-ups

- CRY-505 is cleared; no active product-journey blocker remains in this packet.
- Provider UI must confirm aliases, certificate readiness, environment scopes, and exact deploy binding.
- Complete DNS export is not yet preserved in this packet.
- CSP, frame protection, Referrer-Policy, and Permissions-Policy are absent on the demo and should be hardened separately.
- CRY-510 tracks three development-only dependency advisories and the Node engine mismatch; production dependencies remain clean.

No deploy, DNS, Netlify-domain, provider, payment, invitation, production identity, email, or Squarespace change was performed.
