# CRY-520 Account Crawl and Indexing Policy

Owner: Robert Croft

Approved: 2026-09-22

Status: Implemented and locally verified; deployment remains approval-gated

## Approved decision

| Surface | Indexing policy | Sitemap policy |
|---|---|---|
| Account overview (`/account`) | `index, follow` | Included |
| Request Access (`/account/create`) | `index, follow` | Included |
| Sign In (`/account/sign-in`) | `noindex, follow` | Excluded |
| Recovery, invitation, authenticated/private Account, Library, API, callback, auth, and system routes | `noindex, nofollow, noarchive` | Excluded |

Account overview and Request Access are public information surfaces. Sign In is a public utility but not a search destination. Private and system routes must never become search destinations.

## Delivery rules

- Production robots permits crawling of Account overview, Request Access, and Sign In so their page directives are observable.
- Production robots blocks the bounded private Account, Library, API, and auth route prefixes.
- Account overview and Request Access publish explicit `index, follow` metadata and canonical URLs.
- Sign In publishes explicit `noindex, follow` metadata and an aligned response header.
- Private/system routes publish `noindex, nofollow` metadata where they render HTML and receive an aligned `X-Robots-Tag` response header.
- Non-production hosts remain fail-closed under the CRY-521 policy.

## Verification requirements

- Repository tests cover the route matrix, robots exclusions, and sitemap inclusion.
- A production build must preserve production canonicals and compile the middleware.
- Deploy Preview verification must inspect initial HTML and raw headers for all three public Account entry surfaces plus representative private routes.
- Post-deploy CRY-433 verification must confirm production robots, sitemap, Account metadata, private-route headers, and absence of conflicting directives.

## Local verification evidence

Verified on 2026-09-22 against the optimized production build:

- TypeScript completed without errors.
- ESLint completed without errors.
- All 336 repository tests passed.
- Next.js production build completed, generated 74 pages, and compiled the indexing middleware.
- Runtime host-and-path assertions passed for Account overview, Request Access, Sign In, a private Account route, Library, an auth callback, an API route, and the demo hostname.
- Production `robots.txt` uses bounded private-route exclusions and does not block Account overview, Request Access, or Sign In.
- The 51-URL sitemap includes Account overview and Request Access and excludes Sign In.
- The auth callback redirected to the canonical `https://crypticdesign.net` host.

Deploy Preview and post-deploy production verification remain outstanding and require an approved remote workflow.
