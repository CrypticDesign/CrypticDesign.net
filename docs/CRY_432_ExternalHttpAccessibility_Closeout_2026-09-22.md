# CRY-432 — External HTTP accessibility closeout

Date: 2026-09-22 (America/Chicago)  
Parent: CRY-242  
Status: implementation and verification complete; Jira transition/comment remains approval-gated

## Outcome

`https://demo.crypticdesign.net/` and `https://demo.crypticdesign.net/products/singularis` are externally reachable from the tested human-browser, automated-client, crawler-style, and geographic probe paths. No deterministic platform-side DNS, TLS, HTTP, redirect, or initial-HTML delivery boundary was identified.

The reusable audit command is:

```powershell
node scripts/external-http-audit.mjs --base=https://demo.crypticdesign.net --out-dir=artifacts/CRY-432 --ticket=CRY-432
```

## Client coverage

Both required routes returned HTTP 200 with HTML to each local client profile:

- generic automated client
- desktop-browser user agent
- mobile-browser user agent
- search-crawler user agent
- social-crawler user agent

A normal browser rendered both routes successfully. The root rendered the authenticated My Home state in the available browser session, including semantic navigation and content. `/products/singularis` rendered the public `Singularis | Cryptic Design` page, semantic primary/Entertainment navigation, governed Coming Soon state, public releases, and footer content.

## Geographic evidence

The final confirmation measurement passed from Northern America, Western Europe, and Australia/New Zealand:

| Route | Globalping measurement | Result |
|---|---|---|
| `/` | `2AUj3VIjxDbYxNc2v00021Bal` | 3/3 HTTP 200; DNS resolved; TLS 1.3 authorized; HTML delivered |
| `/products/singularis` | `2E2XJykebQXmlvxkC00021Bal` | 3/3 HTTP 200; DNS resolved; TLS 1.3 authorized; HTML delivered |

The earlier all-pass run is preserved by measurement IDs `2u8HvjIXo79tpUPBL00021Bag` and `2YmSd3vVKPaJYD7Dk00021Bag`.

## Intermittency classification

One intermediate root measurement (`2FpMYbRtxfl7wxnmb00021Bah`) timed out during DNS resolution on a single Western Europe probe. The same run's Western Europe probe reached `/products/singularis`, and the immediately following confirmation run reached both routes from Western Europe. Local, Northern America, and Australia/New Zealand checks also remained green.

Disposition: intermittent probe/resolver-path timeout, not a reproduced deterministic CrypticDesign.net boundary. No remediation ticket is warranted from this single non-reproducing observation. Reopen the infrastructure boundary if repeated measurements show a regional pattern.

## Acceptance mapping

- [x] Root and key routes tested from at least three regions.
- [x] Human-browser and automated-client results compared.
- [x] HTTP, TLS, DNS, redirect, timing, header, and rendering evidence recorded in `artifacts/CRY-432/`.
- [x] The only failure was narrowed to a non-reproducing external probe/resolver path; no deterministic platform blocking layer was found.
- [x] No actionable remediation ticket was generated because no reproducible platform defect was found.

