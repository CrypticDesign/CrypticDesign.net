# CRY-334 First Signal Route Closeout — 2026-09-22

## Verdict

PASS. The historical direct-route HTTP 404 is resolved and was not reproduced on the current production or demo runtimes.

## Canonical route

`/account/character/first-signal`

## Production delivery evidence

- Five local client profiles followed the `www` canonicalization redirect and received HTTP 200 from `https://crypticdesign.net/account/character/first-signal`.
- Globalping measurement `2wX5XkpZKUdwbs3rs00021Bb6` returned the expected same-path HTTP 301 from `www` in Northern America, Western Europe, and Australia/New Zealand, with authorized TLS 1.3 in all three regions.
- A signed-out real-browser visit rendered the governed `Authentication required` boundary at the canonical route, not a 404.
- Machine-readable and Markdown evidence are under `artifacts/CRY-334/2026-09-22-external-http-audit.*`.

## Authenticated/demo browser evidence

- The admitted demo session opened the Character page and exposed `Enter First Signal` at the canonical route.
- Contextual navigation reached the First Signal route and rendered the governed `RPG sandbox is disabled` state, not a 404.
- A fresh direct navigation to the same route rendered the same governed state, covering browser-refresh/direct-load behavior.

## Regression coverage

- `tests/first-signal-route.e2e.mjs` asserts HTTP 200 and canonical-path retention for signed-out First Signal direct navigation and browser refresh against a production build/server. Authenticated contextual navigation was verified separately in the admitted demo browser session.
- `scripts/external-http-audit.mjs` now accepts `--routes=...`, allowing a ticket-specific external regression probe without changing its default CRY-432 route set.

## Ticket disposition

CRY-334 is ready for a Jira closeout comment and transition to Done. CRY-318 can be referenced as the completed originating implementation. No product or hosting remediation is required.
