# CRY-320 — Stabilization closeout draft

Date: 2026-09-22 (America/Chicago)  
Parent: CRY-242  
Status: technical closeout evidence green; one owner-run operational check remains

## Current disposition

The agreed stabilization window has elapsed. CRY-433 and CRY-436 are Done in Jira. The current production HTTP/TLS audit passes across the approved `www` to apex canonical behavior, representative routes, multiple client types, and three geographic regions.

Do not transition CRY-320 or CRY-319 based on this draft alone. Microsoft 365 send/receive continuity still requires an owner-authorized operational check, and the final Jira/known-limitations record is an external write.

## Canonical production evidence

Target: `https://www.crypticdesign.net/`

- `www` returns the approved permanent redirect to `https://crypticdesign.net/` while preserving the requested path.
- Generic, desktop, mobile, search-crawler, and social-crawler client profiles followed the redirect and received final HTTP 200 HTML for `/` and `/products/singularis`.
- Northern America, Western Europe, and Australia/New Zealand probes resolved production addresses and negotiated authorized TLS 1.3 on the redirecting host.
- Root measurement: `2cINQMUqTwrmSlJi000021Bal`.
- Singularis measurement: `2Is6MftAMfzVtMPBQ00021Bal`.
- Full evidence: `artifacts/CRY-320/2026-09-22-external-http-audit.md` and `.json`.

## Stabilization and dependency evidence

- No Severity 1/2 regression was found in the reviewed Jira, repository, or live-route evidence.
- CRY-433 production crawl/canonical evidence is Done as of 2026-09-22.
- CRY-436 production metadata/social delivery evidence is Done as of 2026-09-22.
- CRY-432 external HTTP accessibility evidence now passes, including repeat confirmation after one non-reproducing third-party probe DNS timeout.
- The rollback path and cutover evidence remain documented in `docs/CRY_320_Wave0_CutoverOperatorRunbook_2026-09-07.md`, `docs/CRY_320_PreCutoverGoNoGo_2026-09-07.md`, and `docs/CRY_320_ProductionCutoverReadinessAndRollback_2026-08-16.md`.
- Public DNS still returns the established Cryptic Design MX set and an autodiscover record. This confirms record presence only; it is not send/receive proof.

## Remaining closeout gate

Owner check required:

1. Send one test message from the Cryptic Design Microsoft 365 mailbox to an external mailbox.
2. Reply from the external mailbox and confirm receipt in Microsoft 365.
3. Confirm no unexpected delivery delay, rejection, spam-routing regression, or authentication warning.
4. Record the timestamp and outcome in CRY-320.

After that check passes, the final Jira update can freeze the known-limitations/accepted-risk record and close CRY-320. CRY-319 can then receive its downstream release-disposition decision.

## Known limitations / accepted risk draft

- Squarespace remains preserved as rollback/migration history until separately retired by explicit approval.
- Netlify production deploys remain metered; one reviewed merge should produce one production deploy.
- `demo.crypticdesign.net` remains a non-production verification surface and is not the canonical public host.
- A single external Western Europe probe experienced a non-reproducing DNS timeout against demo; repeat measurements passed and no deterministic platform boundary was found.
- Figma/FigJam is optional reference tooling and is not a release or completion gate.
- No new paid infrastructure, provider change, DNS change, deploy, or backend expansion is authorized by this closeout draft.

