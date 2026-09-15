# CRY-522 Development-Experience Access Audit and Implementation

Owner: CRY-242 — Build CrypticDesign.net platform foundation
Jira: CRY-522
Audit baseline: `origin/main` at `8b9c07d515ff7ff1225b5ee48103cf76442624a5`
Status: Local implementation verified on 2026-09-15; no push, pull request, deployment, or production entitlement mutation performed.

## Decision

Unfinished products, worlds, games, prototypes, Arcade entries, and Play experiences may remain publicly discoverable, but they are not publicly executable unless Robert explicitly approves a public release. Signing in is necessary for development access but is not sufficient. Development execution requires an exact, server-resolved role or administration entitlement for the named experience and the `execute-development` action.

Stored declarations are:

- `PUBLIC_RELEASE`
- `PUBLIC_COMING_SOON`
- `INTERNAL_ONLY`

`DEVELOPMENT_UNLOCKED` is derived for the current viewer and is never stored as a product publication state.

Released media is independently governed. Gating a game or prototype must not hide music, video, images, articles, or releases already approved for public access.

## Baseline findings

1. `/products/singularis` mounted `ExperienceRuntime` and `SingularisGamespace` for every visitor.
2. Six executable HTML entry points were directly served from `public/`, bypassing any future page-only authorization check:
   - `/games/singularis/v05/index.html`
   - `/games/singularis/workspaces/arsenal/index.html`
   - `/games/singularis/workspaces/codex/index.html`
   - `/games/singularis/workspaces/hangar/index.html`
   - `/games/singularis/workspaces/pilot/index.html`
   - `/games/singularis/workspaces/war-effort/index.html`
3. Arcade copy described the Singularis prototype and public sample access as open.
4. Existing production identity and authorization foundations already included Supabase Auth, `member_profiles`, `entitlement_grants`, RLS, role/administration grant sources, and a pure entitlement resolver. The product and runtime routes did not consume them.
5. First Signal was authenticated and local-sandbox-only, but its internal-only experience classification was implicit.
6. The embedded Singularis message bridge checked origin and payload markers but did not check the exact sending window.

## Implemented boundary

- A centralized pure access resolver maps stored declarations and exact development authorization to viewer access.
- A server-only adapter resolves the verified Supabase user, maps the Auth account to its member profile, reads only that member's exact grants under RLS, and fails closed on missing configuration, missing identity/profile/grant, query error, expiry, or revocation.
- Only exact `role` or `administration` grants can authorize `execute-development`. Wildcards, tiers, purchases, events, and promotions cannot unlock development execution.
- Singularis and Lifa are declared `PUBLIC_COMING_SOON`.
- First Signal is declared `INTERNAL_ONLY` and retains its non-production sandbox boundary.
- Product pages no longer use static-parameter generation. They resolve viewer access on every server request so an authorized response cannot be baked into or shared from a pre-rendered page. Unauthorized visitors receive Coming Soon discovery content; only an executable decision mounts the Singularis development runtime.
- The six Singularis HTML files are removed from `public/` and stored under `protected-experiences/`.
- Their canonical URLs are preserved by a Node route handler that authorizes before file resolution, uses a fixed six-file manifest, rejects traversal/unknown paths, and returns private/no-store responses.
- The iframe bridge now requires both the expected origin and the exact expected `contentWindow`.
- Public Singularis releases remain rendered outside the runtime authorization branch.
- Arcade copy now distinguishes open discovery from separately authorized development execution.

## Threat review

| Threat | Baseline | Control |
| --- | --- | --- |
| Direct static URL bypass | Confirmed | Runtime files moved outside `public/`; protected route owns delivery. |
| Auth-only member bypass | Plausible | Exact entitlement is required after verified Auth identity. |
| Wildcard or commercial grant escalation | Plausible | Development resolver accepts exact role/administration evidence only. |
| Cache leaks between viewers | Plausible | Product access is dynamic; asset responses are private/no-store and vary on Cookie. |
| Path traversal in catch-all route | Future high-risk sink | Fixed manifest plus segment and resolved-root validation. |
| Forged same-origin frame messages | Confirmed missing check | Exact `event.source` check added. |
| Client state manipulation | Expected | Client state never authorizes page or asset delivery. |
| Media over-gating | Regression risk | Released media remains outside the executable branch. |
| Third-party Three.js script in same-origin iframe | Remaining conditional risk | Protected from public execution; localization or sandbox compatibility remains a separate follow-up. |

## Entitlement record contract

An authorized operator may later grant the current development account access through the existing entitlement administration path. The record must target the account's existing member profile and use:

- resource: `experience:singularis` (or the exact approved experience)
- action: `execute-development`
- source: `administration` or `role`
- source ID: an auditable operator/runbook identifier
- explicit effective, expiry, and revocation data as applicable

No account identifier is hardcoded in application code. No production entitlement is created by this local implementation.

## Verification requirements

- Pure access tests: public release, coming soon, internal-only, exact authorization, auth-only denial, invalid source denial, wildcard denial, expiry, and revocation.
- Asset manifest tests: every approved file plus unknown, sibling, separator, percent-encoded, and traversal rejection.
- Contract tests: server identity/profile/grant path, dynamic product gating, Coming Soon rendering, private route delivery, Arcade copy, and First Signal classification.
- Runtime proof: signed-out direct URLs return a fail-closed response; public product discovery and released media remain available.
- Repository checks: tests, TypeScript, lint, and production build.

## Verification result — 2026-09-15

- Focused security and compatibility suite: 30/30 passed.
- Full repository suite: 316/316 passed.
- TypeScript: `npx tsc --noEmit` passed.
- Lint: `npm run lint` passed.
- Production build: `npm run build` passed. Both `/products/[slug]` and `/games/singularis/[...assetPath]` are server-rendered on demand; the protected files are present in the route's output trace.
- Signed-out product smoke test: `/products/singularis` returned 200 with a visible H1 Coming Soon state, no Singularis runtime mount, and the public Overture and Themes releases still visible.
- Original bypass reproduction: all six formerly public runtime URLs returned 404 with `Cache-Control: private, no-store`, `X-Robots-Tag: noindex, nofollow, noarchive`, and `X-Content-Type-Options: nosniff`.
- Alternate malicious inputs: an unknown sibling asset and a double-encoded traversal candidate both returned the same fail-closed 404 response.
- Authorized control: pure authorization tests prove that an active exact administration grant produces `DEVELOPMENT_UNLOCKED`; all six legitimate assets resolve through the fixed manifest and are included in the production build trace. End-to-end delivery with a real production account was intentionally not attempted because no production entitlement mutation was authorized.
- Dependency audit: `npm audit --omit=dev` reports one critical Next.js advisory and one high-severity Sharp/libheif advisory on the baseline dependency versions. Those findings are outside this access-control patch and must remain in the existing dependency-remediation lane rather than being silently mixed into CRY-522.

## Unresolved external checks

- Confirm the entitlement foundation migration is applied in production before issuing a development grant.
- Confirm the intended development account has a member profile before issuing a grant.
- Audit external Singularis and Lifa franchise domains for separately hosted executable builds.
- Determine whether the v05 Three.js dependency can be localized without runtime drift, then evaluate iframe sandboxing with the message bridge.
- Verify final Netlify response headers and output-file tracing in a Deploy Preview before production release.
