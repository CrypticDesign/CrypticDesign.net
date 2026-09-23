# CRY-432 External HTTP Accessibility Audit

Generated: 2026-09-23T03:23:50.007Z
Target: https://demo.crypticdesign.net/
Verdict: **PASS**

This report compares a normal automated client with three geographically distributed Globalping probes. Browser rendering is verified separately because Globalping validates HTTP delivery rather than JavaScript execution.

## /

| Client profile | HTTP | Redirected | Final URL | Time | Result |
|---|---:|---|---|---:|---|
| automated | 200 | no | `https://demo.crypticdesign.net/` | 771 ms | PASS |
| desktop-browser | 200 | no | `https://demo.crypticdesign.net/` | 144 ms | PASS |
| mobile-browser | 200 | no | `https://demo.crypticdesign.net/` | 162 ms | PASS |
| search-crawler | 200 | no | `https://demo.crypticdesign.net/` | 159 ms | PASS |
| social-crawler | 200 | no | `https://demo.crypticdesign.net/` | 439 ms | PASS |

Global measurement: [2AUj3VIjxDbYxNc2v00021Bal](https://api.globalping.io/v1/measurements/2AUj3VIjxDbYxNc2v00021Bal) — PASS.

| Probe | Network | HTTP | DNS/IP | TLS | Total | Result |
|---|---|---:|---|---|---:|---|
| Los Angeles, CA, US, Northern America | HostPapa | 200 | 18.208.88.157 | TLSv1.3 authorized | 364 ms | PASS |
| Falkenstein, DE, Western Europe | Hetzner Online | 200 | 63.176.8.218 | TLSv1.3 authorized | 706 ms | PASS |
| Sydney, AU, Australia and New Zealand | Oracle | 200 | 54.253.94.210 | TLSv1.3 authorized | 1152 ms | PASS |

## /products/singularis

| Client profile | HTTP | Redirected | Final URL | Time | Result |
|---|---:|---|---|---:|---|
| automated | 200 | no | `https://demo.crypticdesign.net/products/singularis` | 197 ms | PASS |
| desktop-browser | 200 | no | `https://demo.crypticdesign.net/products/singularis` | 150 ms | PASS |
| mobile-browser | 200 | no | `https://demo.crypticdesign.net/products/singularis` | 167 ms | PASS |
| search-crawler | 200 | no | `https://demo.crypticdesign.net/products/singularis` | 204 ms | PASS |
| social-crawler | 200 | no | `https://demo.crypticdesign.net/products/singularis` | 138 ms | PASS |

Global measurement: [2E2XJykebQXmlvxkC00021Bal](https://api.globalping.io/v1/measurements/2E2XJykebQXmlvxkC00021Bal) — PASS.

| Probe | Network | HTTP | DNS/IP | TLS | Total | Result |
|---|---|---:|---|---|---:|---|
| Los Angeles, CA, US, Northern America | HostPapa | 200 | 52.52.192.191 | TLSv1.3 authorized | 1562 ms | PASS |
| Falkenstein, DE, Western Europe | Hetzner Online | 200 | 35.157.26.135 | TLSv1.3 authorized | 462 ms | PASS |
| Sydney, AU, Australia and New Zealand | Oracle | 200 | 54.253.94.210 | TLSv1.3 authorized | 743 ms | PASS |

## Boundary conclusion

No deterministic DNS, TLS, HTTP, or initial-HTML delivery boundary was identified across the tested routes and regions.

## Ticket disposition

The automated portions of CRY-432 acceptance pass. Add any separately required human-browser or operational verification before closing the ticket.

