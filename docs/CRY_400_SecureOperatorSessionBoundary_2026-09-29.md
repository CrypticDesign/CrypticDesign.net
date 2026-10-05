# ADR-CRY-400: Secure Operator Session and Threat Boundary

**Status:** Accepted for local Gates 1–4; production activation remains approval-gated
**Date:** 2026-09-29
**Decider:** Robert K. Croft
**Related work:** CRY-400
**Repository scope:** CrypticDesign.net

## Context

CRY-400 now has local account/Character inspection, immutable inspection auditing, command diagnostics, and a fixture-only operator interface. The current `/api/internal/account-administration/*` routes are machine-only. They use a configured operator UUID plus a shared bearer secret, reject every browser `Origin`, and keep the Supabase service-role credential on the server.

That machine boundary must not be weakened to connect a browser UI. Shipping the bearer secret to JavaScript, accepting it from a browser, or exposing the service-role key would turn a narrow internal interface into a reusable administrative credential. A normal member session is also insufficient: operator access needs an active registry entry, a recent step-up authentication ceremony, short revocable lifetime, capability rechecks, CSRF protection, immutable evidence, and stronger isolation from the public site's XSS surface.

This ADR chooses the architecture boundary. The local implementation now includes default-disabled read-only BFF routes and server-owned session-token generation, but it does not apply a migration, expose a provider reauthentication endpoint, connect the fixture UI to live data, enable commands, deploy an operator host, or approve production use.

## Local Gate Progress

On 2026-09-29, after reviewing the fixture UI, Robert instructed Codex to continue CRY-400 locally. Gate 1 is therefore implemented as a provider-neutral domain model and test suite only. It covers digest-only token storage, recent step-up validation, a fixed session lifetime of no more than 15 minutes, Auth-session binding, revocation, expiry, and live operator-status/capability rechecks.

Robert then explicitly selected the Gate 2 local-only option. Gate 2 now includes an unapplied migration draft for digest-only session records and immutable issue/revoke events, plus a server-only Supabase persistence adapter and static contract tests. Anonymous and ordinary authenticated roles receive no table or function grants; state changes remain service-role RPC-only and append their evidence atomically.

Robert then explicitly selected the Gate 3 local-only option. The fixture is isolated to the numeric loopback origin (`127.0.0.1`) while the public local site remains on `localhost`. The operator path fails with `404` on the public origin, and public routes fail with `404` on the operator origin. Middleware emits a per-request nonce CSP, no-store/indexing controls, frame denial, strict referrer and permission policies, and cross-origin isolation headers. Production cookie settings are host-only, `Secure`, `HttpOnly`, `SameSite=Strict`, and limited to 15 minutes; local settings use a separate non-production cookie name. Future browser API requests have exact-origin, custom-header, and write-CSRF contracts. The reauthentication UI is visibly disabled, accepts no credentials, and creates no session. Commands remain disabled.

On 2026-09-30, after the focused security review and local remediation of forwarded-host trust, Robert explicitly selected Gate 4 local implementation. The domain now owns UUID and 256-bit opaque-token generation through Node cryptography. A server-only helper can issue and atomically persist a digest-only operator session after receiving provider-verified reauthentication evidence. Default-disabled read-only `/api/operator/account-administration/*` BFF routes now connect account inspection, command diagnostics, and inspection history to the existing server-only services. Each request independently enforces numeric-loopback routing, exact origin, the custom operator header, verified Supabase identity, Auth-session binding, the host-only operator cookie, fixed session expiry, and live operator capability. Responses are no-store and return generic authorization/target errors. No browser session-issuance route exists because the provider-backed step-up ceremony remains undecided.

On 2026-10-01, Robert selected the combined local follow-up: research the provider ceremony, add a mock issuance harness, prepare the read-only UI transport behind a disabled gate, and draft activation controls. Current Supabase documentation supports TOTP and phone MFA at AAL2; passkey support is marked experimental. The local Supabase configuration has TOTP, phone, and WebAuthn MFA verification disabled. The approved CRY-400 ceremony is a fresh TOTP challenge and verification, followed by server verification of the signed `aal2`, `sub`, `session_id`, and timestamped `totp` authentication-method claims. Password-only reauthentication, SMS, token issuance time, and token refresh do not satisfy the operator step-up boundary. This approval selects the ceremony; it does not authorize hosted MFA configuration, migration application, production operator access, or a browser issuance endpoint.

The local code now validates that proposed provider evidence, binds operator sessions to Supabase's stable `session_id`, and exercises issuance with an in-memory persistence harness. A read-only browser probe is also prepared, but it requires the fixture, BFF, and live-read UI flags simultaneously and remains off by default. It exposes only GET controls and still cannot create an operator session. The activation sequence and rollback conditions are recorded in `docs/CRY_400_Gate4_LocalActivationChecklist_2026-10-01.md`.

The same-day visual-source audit verified that the CRY-400 worktree, local `main`, and GitHub `main` all resolve to commit `89ab2f9`; the operator fixture was not based on an older Git branch. The mismatch came from rendering the isolated operator route through the public navigation, breadcrumb, analytics, footer, and media-player shell while styling it with one-off cyan values. The local correction now marks the operator request in middleware, selects a minimal no-analytics operator root before public-session lookup, removes public navigation from the numeric-loopback surface, and reuses the checked-in blue account/identity VDS tokens and shared typography/control classes.

Local development permits CSP `unsafe-eval` for the Next.js development runtime and `unsafe-inline` styles for development rendering only. The production CSP contract uses a nonce and does not permit inline scripts. Browser verification covers the allowed operator origin, denied public alias, denied public route on the operator host, response headers, absent CORS permission, and disabled step-up control.

This progress does not accept a production deployment, apply a hosted database migration, provision a hostname or secret, deploy, or enable mutations. The provider ceremony is selected and the local read-only path is implemented, but every hosted activation boundary remains approval-gated.

On 2026-10-03, the production isolation and cost review selected no production action now. CRY-400 remains local-only and default-off. If production activation is later approved, the cost-minimizing candidate is an exact dedicated hostname alias on the existing Netlify site, bundled into one planned coherent release rather than a second Netlify site or standalone PR. This is logical host isolation on a shared artifact and applies only to read-only Gate 4; mutation capability requires a separate decision. See `docs/CRY_400_ProductionIsolationCostDecision_2026-10-03.md`.

## Requirements and Constraints

- Robert remains the approval authority for provisioning, deployment, migrations, secrets, and live operator access.
- The browser must never receive the service-role key or machine bearer secret.
- Ordinary Cryptic Design accounts must remain unable to discover or use operator functions.
- Operator authorization must be derived server-side from the verified account identity and current `operator_principals` record.
- A refreshed access token or JWT issuance time must not be treated as proof of recent human reauthentication.
- Operator access must expire after at most 15 minutes and must not silently slide forever.
- Disabling an operator or removing a capability must take effect on the next request.
- Read-only inspection must retain fail-closed immutable auditing before sensitive data is returned.
- Future mutation requests must retain exact confirmation, reason, idempotency, target protection, reconciliation, and immutable completion evidence.
- Responses and logs must not expose secrets, raw session tokens, credential material, freeform reasons, or unnecessary account data.
- The production design must minimize hosting/build cost and may reuse one codebase or deployment only if the origin and cookie boundary remains real.

## Decision

Use a **stateful, short-lived operator session behind a server-side Backend-for-Frontend (BFF)**. The production operator surface should run on a dedicated operator origin with no CORS and a host-only operator cookie. The browser calls only same-origin `/api/operator/*` routes. Those routes derive identity from the verified Supabase user session, validate a separate operator session record, recheck the live operator registry and required capability, and then invoke the existing domain services through server-only adapters.

The existing `/api/internal/account-administration/*` endpoints remain machine-only and must never be called by the browser UI. They continue rejecting browser origins and retain a separate secret and configuration gate.

An isolated operator origin is the production default because any XSS on the public site could otherwise act with the operator's same-origin cookies. If one deployment can serve a dedicated hostname with host-aware routing and security headers, a second build is not inherently required; hosting and build cost must be verified before approval. A same-origin `/internal` production UI is not approved by this ADR. It would require Robert to explicitly accept the larger XSS blast radius after security review.

## Target Architecture

```mermaid
flowchart LR
    B[Operator browser\nUntrusted runtime] -->|Supabase member session + step-up| O[Dedicated operator origin\nNo CORS, strict CSP]
    O -->|Same-origin request\nHost-only HttpOnly cookie\nCSRF header for writes| BFF[Next.js operator BFF]
    BFF -->|Verify user with Auth provider| A[Supabase Auth]
    BFF -->|Hash opaque token; load session| S[(Operator session store)]
    BFF -->|Recheck active status + capability| R[(operator_principals)]
    BFF -->|Server-only domain call| D[CRY-400 authorization\nand workflow services]
    D -->|Service role stays server-side| P[(Supabase/PostgreSQL)]
    D -->|Fail closed before disclosure| E[(Immutable inspection\nand command events)]
    M[Machine automation] -->|Existing bearer; no Origin| I[/api/internal/account-administration/*]
    I --> D
```

### Trust boundaries

1. **Browser boundary:** all browser state and input are untrusted, including account IDs, Character IDs, request IDs, cursors, reasons, confirmations, and displayed state.
2. **Operator-origin boundary:** only the approved host serves operator assets and BFF routes. It emits no permissive CORS headers and loads no third-party scripts, analytics, embeds, or remote media.
3. **BFF boundary:** the BFF is the first authority-bearing component. It verifies the underlying account, operator session, registry state, capability, request origin, input bounds, and target rules.
4. **Service-role boundary:** only server-only adapters can use the service-role client. Domain code remains provider-neutral where practical.
5. **Audit boundary:** sensitive reads are disclosed only after their immutable audit event succeeds. Commands are accepted and finalized through their existing durable command/event boundary.
6. **Machine boundary:** machine bearer endpoints remain distinct from browser sessions, use separate secrets, reject `Origin`, and cannot be used as the UI's transport.

## Operator Session Contract

The conceptual `operator_access_sessions` record is stateful and revocable. A future migration may implement it only after approval.

| Field | Purpose | Rule |
|---|---|---|
| `id` | Non-secret record identifier | Random UUID |
| `token_digest` | Lookup for the opaque browser token | SHA-256 digest; raw token is never stored |
| `operator_account_id` | Bound verified account | References `operator_principals`; never caller-selected |
| `auth_session_reference_digest` | Binds to the underlying Auth session where supported | Store a digest, not a raw provider token |
| `reauthenticated_at` | Human step-up time | Must be provider-verified; refresh time does not qualify |
| `issued_at` / `expires_at` | Fixed authorization window | Maximum 15 minutes; no indefinite sliding extension |
| `revoked_at` | Immediate operator-session termination | Nullable; checked on every request |
| `last_used_at` | Operational evidence | Optional and non-authoritative |

The production browser receives a cryptographically random 256-bit token only in a host-only `__Host-cry_operator` cookie with `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/`, and a maximum age no greater than 900 seconds. No `Domain` attribute is allowed. Local development uses a clearly separate non-production cookie name because the production cookie requirements must not be weakened for convenience.

The token is opaque. It must not contain account data, capabilities, email, reasons, or service credentials. The server stores only its digest and uses constant-time comparison where applicable. Session records do not snapshot authority: `operator_principals.status` and required capability are rechecked on every request.

### Session lifecycle

1. Verify the normal Supabase user with a server-side `auth.getUser()` call; never trust client-provided identity or an unverified local session claim.
2. Confirm the account has an active operator principal before offering step-up.
3. Complete an approved human reauthentication ceremony. MFA/AAL2 should be required for production administration when provider configuration supports it. Token refresh alone is not reauthentication.
4. Generate the opaque operator token, persist only its digest, and set the production cookie.
5. On every BFF request, verify the user, token digest, session status, fixed expiry, Auth-session binding, operator status, and endpoint capability.
6. Revoke on explicit operator sign-out, underlying account sign-out, operator disablement, detected session mismatch, or security intervention.
7. Require a new step-up after expiry; do not silently renew the operator session.

## Request Boundary

Future browser routes use a new `/api/operator/account-administration/*` namespace. They do not proxy the machine bearer and do not accept an operator account ID from the client.

Every operator request must:

1. Require the approved operator host and reject unexpected `Host` / forwarded-host combinations.
2. Require the operator cookie and verified Supabase user.
3. Recheck the stateful session and live operator capability.
4. Require a same-origin-only custom request header. No operator endpoint emits permissive CORS headers.
5. For writes, validate exact `Origin`, a session-bound CSRF token, content type, and body-size limit before parsing the command.
6. Validate all identifiers and pagination inputs using the existing bounded domain contracts.
7. Use `Cache-Control: no-store`; prevent intermediary caching and browser history disclosure where applicable.
8. Return generic authorization/not-found errors that do not reveal whether an account, Character, operator, or command exists.
9. Redact structured logs. Never log cookies, bearer values, service keys, passwords, MFA material, freeform reasons, email addresses, or complete sensitive response bodies.

Sensitive GET APIs also require the custom same-origin header, so direct navigations and cross-origin simple requests cannot obtain JSON. Because subdomains can be same-site while remaining cross-origin, `SameSite=Strict` is defense in depth rather than the sole CSRF control. Exact origin checks, no CORS, and the custom header remain mandatory.

## Operator-Origin Security Contract

- Dedicated production hostname selected and approved by Robert.
- Host-only cookies; never set a parent-domain operator cookie.
- Strict CSP with nonces or hashes, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`, and `connect-src` limited to the operator origin and explicitly required Auth endpoints.
- No third-party analytics, tag managers, chat widgets, embeds, remote fonts, or arbitrary media.
- `X-Content-Type-Options: nosniff`, strict referrer policy, restrictive Permissions Policy, and HSTS at the approved deployment boundary.
- `X-Robots-Tag: noindex, nofollow, noarchive` plus robots exclusion. Index controls are not authentication.
- No service worker shared with the public site.
- No cross-origin opener relationship to public pages where avoidable.
- Host routing must fail closed if the deployment receives the wrong hostname.
- DNS ownership and custom-domain configuration must be monitored to avoid subdomain takeover.

## Threat Model and Required Controls

| Threat | Control | Verification |
|---|---|---|
| Browser receives machine bearer or service-role key | Separate machine and BFF namespaces; secrets imported only by server-only modules | Static contract tests and built-client bundle inspection |
| Ordinary member reaches operator APIs | Verified Auth user + active `operator_principals` lookup + endpoint capability | Negative integration tests for ordinary, disabled, and capability-free accounts |
| Stolen long-lived operator session | Random opaque token, digest-only storage, fixed 15-minute expiry, revocation, Auth-session binding | Expiry, revocation, mismatch, and replay tests |
| Token refresh impersonates recent login | Explicit provider-verified step-up time; never JWT `iat` or refresh time | Reauth freshness tests at boundary values |
| CSRF from public site or sibling subdomain | Exact origin, session-bound CSRF token for writes, custom header, no CORS | Cross-origin form, fetch, preflight, missing-header, and duplicate-header tests |
| XSS on public site acts as operator | Dedicated operator origin, host-only cookie, no CORS, strict operator CSP | Host-isolation and CSP browser tests |
| XSS on operator origin | No third-party scripts, nonce/hash CSP, output encoding, bounded server projections | CSP violation tests and dependency review |
| IDOR / target substitution | Server derives operator; UUID validation; account/Character ownership and protected-target checks | Cross-account and substituted-target tests |
| Command replay or ambiguity | Existing idempotency fingerprint, same-target serialization, lease/reconciliation, immutable events | Existing CRY-400 command/reconciliation suite |
| Inspection without evidence | Audit RPC must succeed before sensitive projection returns | Existing fail-closed inspection-audit tests |
| Audit deletion or alteration | Immutable triggers; service-role-only functions; no browser table access | Migration contract and database integration tests |
| Data leakage through caching or logs | `no-store`, redaction allowlist, generic errors, no sensitive telemetry | Header tests and log-capture tests |
| Disabled operator remains active | Live principal/capability recheck on every request; session revocation | Disable-between-requests integration test |
| Shared deployment routes wrong host | Explicit host allowlist and fail-closed middleware | Host-header matrix tests |

## Options Considered

### Option A: Dedicated operator origin + stateful BFF session — Selected

| Dimension | Assessment |
|---|---|
| Security isolation | High |
| Implementation complexity | Medium-high |
| Revocation | Immediate |
| Browser secret exposure | None |
| Cost | Must verify whether one deployment can safely serve the additional hostname |

**Pros:** smallest public-site XSS blast radius; short revocable authorization; clear machine/browser separation; live capability changes take effect immediately; compatible with current server-only adapters.

**Cons:** requires step-up UX, a session store, host-aware routing, stronger CSP, and additional integration testing.

### Option B: Same-origin path + stateful BFF session

| Dimension | Assessment |
|---|---|
| Security isolation | Medium-low |
| Implementation complexity | Medium |
| Revocation | Immediate |
| Browser secret exposure | None |
| Cost | Lowest likely hosting overhead |

**Pros:** simpler routing and deployment; reuses the current application host.

**Cons:** any same-origin public-site XSS can act with operator cookies. This is not the approved production default and requires explicit risk acceptance.

### Option C: Browser calls existing machine endpoints

| Dimension | Assessment |
|---|---|
| Security isolation | Unacceptable |
| Implementation complexity | Low |
| Revocation | Shared-secret rotation |
| Browser secret exposure | Required |
| Cost | Low initially; high incident risk |

**Rejected:** it requires exposing or proxying the machine bearer, weakens the deliberate `Origin` rejection, and cannot establish a trustworthy human operator identity.

### Option D: Direct browser access through Supabase RLS

| Dimension | Assessment |
|---|---|
| Security isolation | Medium for ordinary tables; insufficient for Auth administration |
| Implementation complexity | Medium-high |
| Revocation | Policy-dependent |
| Browser secret exposure | Publishable key only |
| Cost | Low additional hosting cost |

**Rejected for CRY-400:** Auth administration requires server authority; splitting policy between browser RLS and server Auth calls increases ambiguity. The BFF provides one authorization and audit boundary.

## Consequences

- The fixture interface remains intentionally disconnected until the session boundary passes local and database-backed validation.
- The existing machine endpoints are preserved rather than repurposed.
- A new stateful session table and narrow server functions will eventually be required, but this ADR does not authorize their migration.
- Operator access will require more ceremony than ordinary account access. That friction is intentional because the surface can inspect private account state and may later issue destructive commands.
- Production operator hosting needs a hostname, CSP, DNS ownership, and cost review before deployment.
- Session and authorization failures must favor denial, even when this reduces operator convenience.

## Phased Implementation Gates

### Gate 0 — Current state

- Fixture UI only.
- Machine endpoints remain default-disabled.
- No live browser operator session.
- No deployment, migration application, or secret provisioning.

### Gate 1 — Provider-neutral local model

- Implement pure operator-session issuance, expiry, revocation, Auth-session binding, and capability-recheck contracts.
- Add negative tests for replay, stale step-up, operator disablement, capability removal, and session mismatch.
- No API connection and no database application.

### Gate 2 — Local persistence adapter

- Draft an unapplied migration for digest-only stateful sessions and immutable session events.
- Build server-only adapters and contract tests.
- Verify that ordinary authenticated and anonymous roles receive no table access.

### Gate 3 — Isolated local operator origin

- Add host allowlisting, strict operator headers/CSP, cookie separation, no-CORS behavior, CSRF checks, and reauthentication UX.
- Validate with browser tests on local host aliases.
- Keep all commands disabled.

### Gate 4 — Read-only connection

- After Robert approval and security review, connect account inspection, command diagnostics, and inspection history through `/api/operator/*` BFF routes.
- Confirm immutable inspection auditing, redaction, cache headers, and access revocation end to end.

### Gate 5 — Mutation consideration

- Requires separate Robert approval.
- Review exact confirmation, protected targets, recent step-up, idempotency, reconciliation, incident rollback, and audit export before enabling any command UI.

## Verification Required Before Production Eligibility

- Unit and contract tests for every session state and capability boundary.
- Database tests against the actual migration, RLS/grants, immutable events, revocation, and concurrent session behavior.
- Browser tests for host isolation, cookies, no CORS, CSRF, CSP, logout, expiry, and back-button/cache behavior.
- Security review for XSS, CSRF, IDOR, session fixation, replay, token leakage, log leakage, and subdomain configuration.
- Built-client bundle scan proving no machine secret, service key, operator token, or privileged environment value is embedded.
- Manual verification that disabling the operator blocks the next request.
- Cost review proving the chosen hostname/deployment configuration will not create an unapproved build or hosting expense.
- Robert approval for migration application, secrets, hostname/DNS, deployment, and any mutation capability.

## Open Decisions for Robert

1. [Partially resolved 2026-10-03] Remain local-only now. If activation is later approved, use an exact dedicated hostname alias on the existing Netlify site as the cost-minimizing candidate; the final hostname and account-specific budget remain separately gated.
2. [Resolved 2026-10-01] Fresh TOTP/AAL2 is the approved step-up method. Provider configuration and endpoint activation remain separately gated.
3. Maximum operator-session duration below the 15-minute ceiling.
4. Inspection and operator-session audit retention/export policy.
5. Emergency access and recovery procedure if the primary operator identity is unavailable.

## Action Items

1. [x] Robert accepted local implementation through Gate 4 by successive explicit option-1 instructions; production activation remains unapproved.
2. [x] Implement Gate 1 only in the local CRY-400 worktree; completed 2026-09-29 under Robert's local-only continuation instruction.
3. [x] Implement Gate 2 as an unapplied local migration draft and disconnected server-only adapter; completed 2026-09-29 under Robert's explicit option-1 instruction.
4. [x] Implement and verify Gate 3 isolated local-host routing, security headers, cookie/CSRF contracts, and disabled reauthentication preview; completed 2026-09-29 under Robert's explicit option-1 instruction.
5. [x] Implement Gate 4 default-disabled read-only BFF routes and server-owned cryptographic session generation locally; completed 2026-09-30 under Robert's explicit option-1 instruction.
6. [x] Evaluate production isolated-host routing and hosting/build cost without provisioning or deploying; completed 2026-10-03 in `docs/CRY_400_ProductionIsolationCostDecision_2026-10-03.md`. No production action was taken or authorized.
7. [x] Robert approved the fresh TOTP/AAL2 provider ceremony on 2026-10-01 and separately authorized the local session-issuance endpoint on 2026-10-02. The browser challenge UI, empty-body server issuance route, fresh signed-claim verification, digest-only persistence call, host-only HttpOnly cookie, and CSRF/origin controls are implemented behind an independent default-off non-production gate. Provider configuration, migration application, test data, and activation remain separately gated.
8. [x] Prepare the read-only fixture-to-BFF transport behind a separate default-off local gate; completed 2026-10-01. Keep that gate disabled until provider configuration, migration application, test data, and activation are separately approved.
