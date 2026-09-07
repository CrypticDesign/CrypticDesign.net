# CRY-320 — Wave 0 production-domain cutover operator runbook

Prepared: 2026-09-07 (America/Chicago)

Owner and final decision authority: Robert K. Croft

Status: **DRAFT / NO-GO — no provider or DNS mutation is authorized by this document**

Proposed staffed change window: **Monday, September 14, 2026, 10:00 AM–12:00 PM America/Chicago**

Proposed stabilization window: cutover completion through **Thursday, September 17, 2026, 12:00 PM America/Chicago** (minimum 72 hours)

## Control loop

- Trigger: Robert records an explicit GO in CRY-320 after every pre-change gate below is checked.
- Stop condition: RELEASED after the stabilization window, or ROLLED BACK after the public Squarespace state is restored and verified.
- Source inputs: Netlify project `frabjous-frangipane-650548`, GoDaddy zone for `crypticdesign.net`, GitHub `main`, CRY-320, the recovery/readiness Confluence page, and the preserved evidence packet.
- Authority class: read-only preparation until Robert's explicit GO; DNS, Netlify alias, deploy, email, identity, Squarespace, and paid-service mutations remain separately gated.
- Verification method: two independent DNS resolvers; HTTPS/TLS/canonical checks; route, redirect, media, metadata, accessibility, responsive, and Chromium/WebKit smoke tests; Microsoft 365 and Auth mail checks.
- Escalation boundary: stop immediately on uncertain record ownership, unexpected provider warnings, unrelated DNS drift, certificate failure, mail impact, authentication/data-isolation regression, or any missing rollback evidence.
- Usage guardrail: one coherent production change window; do not use main-branch deploys as a debugging loop; avoid provider plan upgrades or metered services.

## Approved candidate and current provider state

- Candidate URL: `https://demo.crypticdesign.net`
- GitHub commit: `878206d62ed84f756c872bd5584b20df038b7b51`
- Netlify published deploy: `6a9ec27d15a1fb0008145b06`
- Netlify domain state verified 2026-09-07: `demo.crypticdesign.net` is the only custom/primary domain.
- Netlify TLS state verified 2026-09-07: Let's Encrypt is enabled for `demo.crypticdesign.net`; apex and `www` are not attached and therefore are not certificate-ready.
- Current canonical public site: Squarespace at `www.crypticdesign.net`.
- Current apex TLS presents `*.squarespace.com` and fails hostname validation; this is a current-state cutover blocker, not Netlify-candidate evidence.

## Mandatory pre-change gates

- [x] Full GoDaddy zone export downloaded and stored in the restricted evidence directory; 33 records, 3,096 bytes, SHA-256 `B27C8866AE981CD9FA2791D520BCB2057CB737D6785A0F86AAB9ED9D94174BAC`.
- [ ] Restricted provider screenshots captured without copying credentials or verification-token values into Jira/Confluence.
- [ ] Netlify aliases `crypticdesign.net` and `www.crypticdesign.net` added to this exact project under a separately approved provider mutation.
- [ ] Netlify customized Pending DNS verification instructions match the planned records below.
- [ ] Canonical direction confirmed: **apex primary; `www` redirects to apex**.
- [ ] Netlify certificate issuance path is ready for both aliases; no blocking CAA/AAAA/DNSSEC conflict exists.
- [ ] Candidate deploy ID, commit, branch, published state, and critical environment-variable names/scopes are reconfirmed.
- [ ] Squarespace remains healthy, paid, and available for rollback through stabilization.
- [ ] Microsoft 365, Proofpoint/PPE, Resend/Supabase Auth, DKIM, SPF, DMARC, Autodiscover, and verification records are identified as protected/non-web records.
- [ ] Operator: **Robert K. Croft**, or a substitute explicitly named by Robert in CRY-320.
- [ ] Communication path and rollback authority recorded in CRY-320.
- [ ] Robert records exact GO timestamp and confirms the proposed window (or replaces it with another exact window).

Any unchecked item means **NO-GO**.

## Exact web-record change plan

Current Netlify standard-network guidance for external DNS uses `75.2.60.5` for an apex A-record fallback and the project's `.netlify.app` hostname for `www`. Reconfirm the customized Pending DNS verification panel after the aliases exist; customized values override this draft.

| Host | Before | Planned after | TTL | Action |
| --- | --- | --- | --- | --- |
| `@` | A `198.185.159.144` | A `75.2.60.5` | 600 | Replace |
| `@` | A `198.185.159.145` | — | — | Remove as part of the same approved apex replacement |
| `@` | A `198.49.23.144` | — | — | Remove as part of the same approved apex replacement |
| `@` | A `198.49.23.145` | — | — | Remove as part of the same approved apex replacement |
| `www` | CNAME `ext-cust.squarespace.com` | CNAME `frabjous-frangipane-650548.netlify.app` | 3600 | Replace |

Protected records: do not modify `demo`, MX, SPF, DKIM, DMARC, Autodiscover, auth/email, CAA, or provider-verification records unless a separate reviewed change explicitly requires it.

## Operator checklist

### T-30 minutes

- [ ] Reconfirm all mandatory gates and exact before/after values.
- [ ] Confirm deploy `6a9ec27d15a1fb0008145b06` remains published from commit `878206d62ed84f756c872bd5584b20df038b7b51`.
- [ ] Verify `demo.crypticdesign.net`, Squarespace `www`, critical mail paths, and the rollback zone export.
- [ ] Open Netlify domain management, GoDaddy DNS, CRY-320, and the evidence checklist; make no change yet.

### Change

- [ ] Record the start timestamp in CRY-320.
- [ ] Apply only the two logical web changes in the table: apex replacement and `www` replacement.
- [ ] Record provider acknowledgement and exact completion timestamp.
- [ ] Do not change nameservers or any protected record.

### T+0 to T+15 minutes

- [ ] Check apex A and `www` CNAME from two independent resolvers.
- [ ] Verify valid HTTPS for apex and `www` and the `www → apex` canonical redirect.
- [ ] Verify Home, Entertainment, Community, Professional, Request Access, Sign In, robots, sitemap, 404, representative media, and required legacy redirects.
- [ ] Verify responsive Chromium and WebKit smoke checks with zero material console, overflow, accessibility, or navigation errors.
- [ ] Verify Microsoft 365 inbound/outbound and Auth confirmation delivery without exposing message or identity data in ordinary evidence.
- [ ] If any rollback trigger is present and cannot be corrected inside 15 minutes, execute rollback.

### T+60 minutes and stabilization

- [ ] Repeat DNS, TLS, canonical, front-door, auth/admission, mail, and error-rate checks at +60 minutes, +24 hours, and stabilization close.
- [ ] Keep `demo.crypticdesign.net` and Squarespace available throughout stabilization.
- [ ] Record RELEASED only after the 72-hour evidence set is complete.
- [ ] Do not cancel Squarespace without a separate explicit approval.

## Rollback triggers

Rollback immediately for repeated 5xx/front-door failure; apex/`www` DNS, TLS, or canonical failure; redirect loops or widespread 404s; Microsoft 365 or Auth mail disruption; material accessibility, navigation, authentication, or data-isolation regression; restricted/retired content exposure; or unacceptable active security exposure.

## Exact DNS rollback values

Restore all four Squarespace apex records and the original `www` CNAME:

| Host | Type | Restore value | TTL |
| --- | --- | --- | --- |
| `@` | A | `198.185.159.144` | 600 |
| `@` | A | `198.185.159.145` | 600 |
| `@` | A | `198.49.23.144` | 600 |
| `@` | A | `198.49.23.145` | 600 |
| `www` | CNAME | `ext-cust.squarespace.com` | 3600 |

Rollback sequence:

1. Record ROLLBACK STARTED and the trigger timestamp in CRY-320.
2. Restore the exact five values above; leave protected records untouched.
3. Verify both resolvers, Squarespace `www`, apex behavior, TLS, critical redirects, and mail.
4. If the candidate deployment itself is faulty while DNS is otherwise sound, restore/pin the last separately recorded known-good Netlify deploy; do not guess a historical deploy.
5. Record ROLLED BACK, evidence locations, impact, and next-decision owner before another attempt.

## Audit history

- 2026-09-07: Draft created from the authenticated Netlify domain/TLS inspection, public DNS/TLS baseline, current Netlify external-DNS guidance, and merged Sprint 42 release evidence. No provider or DNS mutation performed.
- 2026-09-07: Authenticated GoDaddy export preserved at `Operations - Documents/CRY-320_DNSPreservation_2026-09-07/crypticdesign.net.godaddy-zone-2026-09-07.txt`; 33 records and protected mail/authentication categories verified without publishing their values. No DNS mutation performed.
