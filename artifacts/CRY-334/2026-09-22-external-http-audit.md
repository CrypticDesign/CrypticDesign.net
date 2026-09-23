# CRY-334 External HTTP Accessibility Audit

Generated: 2026-09-23T03:44:18.304Z
Target: https://www.crypticdesign.net/
Verdict: **PASS**

This report compares a normal automated client with three geographically distributed Globalping probes. Browser rendering is verified separately because Globalping validates HTTP delivery rather than JavaScript execution.

## /account/character/first-signal

| Client profile | HTTP | Redirected | Final URL | Time | Result |
|---|---:|---|---|---:|---|
| automated | 200 | yes | `https://crypticdesign.net/account/character/first-signal` | 1071 ms | PASS |
| desktop-browser | 200 | yes | `https://crypticdesign.net/account/character/first-signal` | 293 ms | PASS |
| mobile-browser | 200 | yes | `https://crypticdesign.net/account/character/first-signal` | 213 ms | PASS |
| search-crawler | 200 | yes | `https://crypticdesign.net/account/character/first-signal` | 196 ms | PASS |
| social-crawler | 200 | yes | `https://crypticdesign.net/account/character/first-signal` | 198 ms | PASS |

Global measurement: [2wX5XkpZKUdwbs3rs00021Bb6](https://api.globalping.io/v1/measurements/2wX5XkpZKUdwbs3rs00021Bb6) — PASS.

| Probe | Network | HTTP | DNS/IP | TLS | Total | Result |
|---|---|---:|---|---|---:|---|
| Los Angeles, CA, US, Northern America | HostPapa | 301 | 18.208.88.157 | TLSv1.3 authorized | 65 ms | PASS |
| Falkenstein, DE, Western Europe | Hetzner Online | 301 | 63.176.8.218 | TLSv1.3 authorized | 485 ms | PASS |
| Sydney, AU, Australia and New Zealand | Oracle | 301 | 54.253.94.210 | TLSv1.3 authorized | 396 ms | PASS |

## Boundary conclusion

No deterministic DNS, TLS, HTTP, or initial-HTML delivery boundary was identified across the tested routes and regions.

## Ticket disposition

The automated portions of CRY-334 acceptance pass. Add any separately required human-browser or operational verification before closing the ticket.
