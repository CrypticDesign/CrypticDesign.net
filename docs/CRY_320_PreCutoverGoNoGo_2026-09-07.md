# CRY-320 — Wave 0 pre-cutover Go/No-Go

Date: 2026-09-07 (America/Chicago)

Release candidate source: `878206d62ed84f756c872bd5584b20df038b7b51`

Release-candidate URL: `https://demo.crypticdesign.net`

Netlify site: `frabjous-frangipane-650548`

Exact provider deploy ID: `6a9ec27d15a1fb0008145b06` (`published`, `main`)

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
| Apex/`www` hostname and TLS readiness | FAIL / NOT CONFIGURED | Authenticated Netlify inspection confirms only `demo.crypticdesign.net` is attached and covered by TLS; apex and `www` are absent, so their certificates cannot yet provision |
| DNS preservation/export | PARTIAL | Public web/mail baseline recorded; complete GoDaddy zone export still required |
| Exact deploy/commit binding | PASS | Netlify published deploy `6a9ec27d15a1fb0008145b06` is bound to `main @ 878206d62ed84f756c872bd5584b20df038b7b51` |
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

The standard-network external-DNS targets are confirmed in current Netlify documentation; customized provider instructions still must be rechecked after the aliases are added:

1. Replace the four Squarespace apex A records with one apex A record: `@ → 75.2.60.5` (GoDaddy fallback because the apex cannot use a normal CNAME).
2. Replace the `www` Squarespace CNAME with `www → frabjous-frangipane-650548.netlify.app`.
3. Leave `demo`, MX, SPF, DKIM, DMARC, Autodiscover, auth-email, and verification records untouched.

Do not execute these values until Netlify shows both aliases on this exact site, the Pending DNS verification guidance matches, the full GoDaddy export is preserved, and Robert records an explicit GO.

## Rollback packet

Application rollback: pin/restore the last verified Netlify deploy recorded immediately before cutover. Do not use the historical August deploy as the current rollback target without reconfirmation.

DNS rollback: restore the four Squarespace apex A values and `www → ext-cust.squarespace.com`; do not touch mail/auth records. Squarespace remains active through stabilization and requires separate approval to retire.

Rollback immediately for repeated 5xx/front-door failure, DNS/TLS/canonical failure, email disruption, redirect loops/widespread 404s, material accessibility/auth/data-isolation regression, retired/restricted content exposure, or unacceptable security exposure.

## Cutover operator sequence

1. Reconfirm Netlify main-production deploy `6a9ec27d15a1fb0008145b06` ↔ `878206d62ed84f756c872bd5584b20df038b7b51`.
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
- Provider UI confirms the exact deploy binding and healthy `demo` certificate; apex/`www` aliases and their certificate readiness remain unconfigured.
- Complete DNS export is not yet preserved in this packet.
- CSP, frame protection, Referrer-Policy, and Permissions-Policy are absent on the demo and should be hardened separately.
- CRY-510 tracks three development-only dependency advisories and the Node engine mismatch; production dependencies remain clean.

No deploy, DNS, Netlify-domain, provider, payment, invitation, production identity, email, or Squarespace change was performed.
