# CRY-395 Production Auth Containment

**Date:** 2026-10-12

**State:** Host containment implemented; production sign-in retained; provider separation remains incomplete and approval-gated.

## Decision

CrypticDesign.net does not yet have a separately owned and configured production Supabase project. Existing production account access must remain available while CRY-395 completes that separation. The host boundary therefore permits the current public hosts but does not claim that provider isolation is complete.

Member Auth is limited to the named application surfaces:

- `crypticdesign.net` and `www.crypticdesign.net`;
- `demo.crypticdesign.net`;
- local loopback hosts;
- `frabjous-frangipane-650548.netlify.app`; and
- branch/deploy-preview hosts ending in `--frabjous-frangipane-650548.netlify.app`.

Unknown hosts fail closed. When both `Host` and `X-Forwarded-Host` are present, both must resolve to an allowed development surface.

## Enforced boundary

- Requests from unknown or conflicting hosts to sign-in, invitation, recovery, password-reset, private Account, My Library, and Auth callback routes redirect to `/account?auth=unavailable`.
- Requests from unknown or conflicting hosts to admission, membership, and Character APIs return `503` with `Cache-Control: no-store` before route handlers can resolve a session or write data.
- Server-rendered account identity and gated-experience resolution check the same host boundary before contacting Supabase.
- Production and development account flows remain available on their named hosts while the provider projects are separated.
- The CRY-400 operator boundary remains separate and is evaluated before member-auth containment.

## Verification

On 2026-10-12:

- `npm test`: pass, 462 tests;
- `npm run lint`: pass;
- `npm run build`: pass, Next.js 15.5.21 production build; and
- focused member-auth boundary tests: pass, including production account availability, denial of unrelated Netlify hosts, and preservation of public `/account` and `/account/create` routes.

An optional localhost HTTP smoke probe could not be completed because the approval service returned HTTP 429 while authorizing the sandbox-external request. This was an execution-environment limitation, not an application failure.

## Remaining gates

To complete CRY-395 without interrupting existing production accounts:

1. provision or approve the separately owned production Supabase project;
2. scope Netlify production and deploy-preview variables to their intended projects;
3. configure production-specific redirects, SMTP, CAPTCHA, and closed-signup settings;
4. verify that preview/local contexts cannot reach the production project;
5. run deployed negative and positive boundary checks; and
6. record the CRY-320 deferral/activation decision and CRY-395 evidence in Jira/Confluence.

No provider configuration, deployment, production write, or external source-of-truth mutation is authorized by this document.
