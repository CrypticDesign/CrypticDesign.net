# CRY-320 External HTTP Accessibility Audit

Generated: 2026-09-23T03:23:24.262Z
Target: https://www.crypticdesign.net/
Verdict: **PASS**

This report compares a normal automated client with three geographically distributed Globalping probes. Browser rendering is verified separately because Globalping validates HTTP delivery rather than JavaScript execution.

## /

| Client profile | HTTP | Redirected | Final URL | Time | Result |
|---|---:|---|---|---:|---|
| automated | 200 | yes | `https://crypticdesign.net/` | 921 ms | PASS |
| desktop-browser | 200 | yes | `https://crypticdesign.net/` | 263 ms | PASS |
| mobile-browser | 200 | yes | `https://crypticdesign.net/` | 283 ms | PASS |
| search-crawler | 200 | yes | `https://crypticdesign.net/` | 249 ms | PASS |
| social-crawler | 200 | yes | `https://crypticdesign.net/` | 393 ms | PASS |

Global measurement: [2cINQMUqTwrmSlJi000021Bal](https://api.globalping.io/v1/measurements/2cINQMUqTwrmSlJi000021Bal) — PASS.

| Probe | Network | HTTP | DNS/IP | TLS | Total | Result |
|---|---|---:|---|---|---:|---|
| Los Angeles, CA, US, Northern America | HostPapa | 301 | 52.52.192.191 | TLSv1.3 authorized | 161 ms | PASS |
| Falkenstein, DE, Western Europe | Hetzner Online | 301 | 63.176.8.218 | TLSv1.3 authorized | 180 ms | PASS |
| Sydney, AU, Australia and New Zealand | Oracle | 301 | 54.253.94.210 | TLSv1.3 authorized | 377 ms | PASS |

## /products/singularis

| Client profile | HTTP | Redirected | Final URL | Time | Result |
|---|---:|---|---|---:|---|
| automated | 200 | yes | `https://crypticdesign.net/products/singularis` | 270 ms | PASS |
| desktop-browser | 200 | yes | `https://crypticdesign.net/products/singularis` | 257 ms | PASS |
| mobile-browser | 200 | yes | `https://crypticdesign.net/products/singularis` | 290 ms | PASS |
| search-crawler | 200 | yes | `https://crypticdesign.net/products/singularis` | 269 ms | PASS |
| social-crawler | 200 | yes | `https://crypticdesign.net/products/singularis` | 246 ms | PASS |

Global measurement: [2Is6MftAMfzVtMPBQ00021Bal](https://api.globalping.io/v1/measurements/2Is6MftAMfzVtMPBQ00021Bal) — PASS.

| Probe | Network | HTTP | DNS/IP | TLS | Total | Result |
|---|---|---:|---|---|---:|---|
| Buffalo, NY, US, Northern America | HostPapa | 301 | 98.84.224.111 | TLSv1.3 authorized | 209 ms | PASS |
| Falkenstein, DE, Western Europe | Hetzner Online | 301 | 63.176.8.218 | TLSv1.3 authorized | 182 ms | PASS |
| Sydney, AU, Australia and New Zealand | Oracle | 301 | 54.253.94.210 | TLSv1.3 authorized | 504 ms | PASS |

## Boundary conclusion

No deterministic DNS, TLS, HTTP, or initial-HTML delivery boundary was identified across the tested routes and regions.

## Ticket disposition

The automated portions of CRY-320 acceptance pass. Add any separately required human-browser or operational verification before closing the ticket.

