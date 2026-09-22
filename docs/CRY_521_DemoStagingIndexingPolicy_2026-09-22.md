# CRY-521 Demo and Staging Indexing Policy

Owner: Robert Croft  
Implemented: 2026-09-22  
Status: Repository implementation pending Deploy Preview and demo verification

## Policy

- `crypticdesign.net` and `www.crypticdesign.net` are the only indexable hosts.
- Every other host fails closed with `X-Robots-Tag: noindex, nofollow, noarchive`.
- The non-production rule covers `demo.crypticdesign.net`, Netlify main aliases, Deploy Previews, branch deploys, localhost, and unknown hosts.
- Canonical URLs remain rooted at `https://crypticdesign.net` in every environment.
- Production robots and sitemap behavior remain unchanged by CRY-521.
- Netlify's existing Deploy Preview `noindex` behavior is preserved and reinforced by the application rule.

## Implementation

`src/middleware.ts` evaluates the public request host and applies the non-production response directive. `src/lib/indexing-policy.ts` contains the fail-closed host policy and is covered by unit tests.

The policy deliberately uses a response header rather than a host-specific `robots.txt` body. Next.js emits one canonical robots route for every host, while the response directive can be applied safely without provider, DNS, deploy-control, plan, or billing changes.

## Local verification — 2026-09-22

The optimized production build was served locally with controlled `Host` headers:

| Simulated host / route | Result |
|---|---|
| `crypticdesign.net/` | `200`; no non-production `X-Robots-Tag`; production canonical |
| `www.crypticdesign.net/` | `200`; no non-production `X-Robots-Tag`; production canonical |
| `demo.crypticdesign.net/` | `200`; `noindex, nofollow, noarchive`; production canonical |
| Netlify main alias `/` | `200`; `noindex, nofollow, noarchive`; production canonical |
| Netlify Deploy Preview `/` | `200`; `noindex, nofollow, noarchive`; production canonical |
| `localhost/` | `200`; `noindex, nofollow, noarchive`; production canonical |
| Demo `/robots.txt` | `200`; non-production response directive present; canonical production robots body unchanged |
| Netlify main alias `/auth/callback` | `303` to `https://crypticdesign.net/account/sign-in?error=unavailable` |
| Demo `/auth/confirm/complete` | `303` to `https://crypticdesign.net/account/sign-in?error=unavailable` |

Repository gates passed: 330 tests, TypeScript, ESLint, and the optimized Next.js production build.

## Deployment verification

The deployed verification pass must confirm:

- apex and `www` responses do not receive a non-production directive;
- demo, Netlify alias, Deploy Preview, localhost, and unknown hosts receive the directive;
- canonical tags continue to target production;
- callback and confirmation redirects never expose a Netlify hostname;
- production robots and sitemap output remain unchanged.

After a branch push and pull request, repeat the raw-header matrix against the Netlify Deploy Preview. After an approved merge/deploy, repeat it against demo and production before closing CRY-521 or CRY-433.
