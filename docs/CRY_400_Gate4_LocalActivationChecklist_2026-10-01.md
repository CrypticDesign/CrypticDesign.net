# CRY-400 Gate 4 Local Activation Checklist

**Status:** TOTP/AAL2 ceremony and local default-off issuance path implemented; CRY-400 migrations validated against a disposable local database; no hosted migration, provider, secret, deployment, or hosted-project change authorized
**Date:** 2026-10-02
**Scope:** Local read-only account/Character inspection BFF

## Approved Ceremony

Robert approved a fresh Supabase TOTP MFA challenge as the CRY-400 human step-up ceremony on 2026-10-01. After challenge verification, the server must verify the signed Auth claims and require:

- `sub` equals the independently verified Supabase user ID;
- `session_id` is a valid UUID and becomes the operator session binding;
- `aal` is `aal2`;
- `amr` contains a timestamped `totp` entry no older than five minutes;
- token refresh, JWT `iat`, password-only login, email OTP, and SMS do not qualify as fresh operator step-up evidence.

Supabase currently documents TOTP and phone as MFA factors that can produce AAL2. TOTP is free and documented as enabled across project tiers; phone depends on messaging infrastructure and is more exposed to carrier/account takeover. Supabase passkeys are phishing-resistant but are still documented as experimental. For CRY-400, TOTP is the stable provider-supported choice now; WebAuthn/passkeys can be reconsidered when Supabase marks the relevant MFA path stable.

Official references:

- https://supabase.com/docs/guides/auth/auth-mfa
- https://supabase.com/docs/guides/auth/auth-mfa/totp
- https://supabase.com/docs/guides/auth/jwt-fields
- https://supabase.com/docs/guides/auth/passkeys

## Current Default-Off State

- `supabase/config.toml` has TOTP, phone, and WebAuthn MFA verification disabled.
- `supabase/migrations/202609290001_operator_access_sessions.sql` is validated locally but remains unapplied to every hosted project.
- The local browser operator-session issuance route exists but is unavailable unless its independent gate and the BFF gate are explicitly enabled outside production.
- `ACCOUNT_ADMINISTRATION_OPERATOR_BFF_ENABLED=false` by default.
- `ACCOUNT_ADMINISTRATION_OPERATOR_LIVE_UI_ENABLED=false` by default.
- `ACCOUNT_ADMINISTRATION_OPERATOR_SESSION_ISSUANCE_ENABLED=false` by default.
- The live-read panel appears only when the fixture, BFF, and live-read gates are all explicitly true in non-production.
- Commands remain compile-time disabled.

## Activation Sequence

Each numbered stage has its own stop point. Do not combine provider or database mutations merely for convenience.

### 1. Ceremony approval — complete

- [x] Robert explicitly approved TOTP/AAL2 for CRY-400 operator step-up on 2026-10-01.
- Confirm the operator has two verified TOTP factors or another documented recovery path before relying on the surface.
- Confirm the maximum operator session remains 15 minutes or choose a shorter duration.

**Stop if:** recovery ownership, factor enrollment, or session duration is unresolved.

### 2. Validate the database migration locally

- [x] Start an isolated local Supabase stack.
- [x] Apply both CRY-400 migrations locally only.
- [x] Run database tests for grants, immutable events, digest-only storage, revocation, expiry, duplicate tokens, and disabled/capability-free operators.
- [x] Confirm anonymous and ordinary authenticated roles cannot read or invoke operator storage/functions.

Completed locally on 2026-10-02 with Supabase CLI 2.119.0 and a fresh `db reset --local`. The full migration chain applied through `202609290001_operator_access_sessions.sql`, and `supabase/tests/account_administration_operator_sessions.sql` passed inside a transaction that rolled back all fixtures. The disposable stack was then stopped without a backup. No hosted Supabase project was contacted or changed.

**Stop if:** the migration cannot be rolled back by destroying only the disposable local database, or any privilege test fails.

### 3. Implement the issuance endpoint locally — code complete, activation pending

- [x] Accept no password, TOTP secret, service key, account ID, step-up timestamp, operator identity, factor ID, verification code, access token, or refresh token from the browser POST.
- [x] Let the browser call Supabase's TOTP challenge/verify API directly through its normal authenticated client.
- [x] On the server, call `auth.getUser()` and `auth.getClaims()` from a fresh request-scoped Supabase client.
- [x] Pass only verified claims through `deriveVerifiedOperatorIdentityFromSupabaseMfa`.
- [x] Persist the digest-only operator session, then set the host-only HttpOnly cookie.
- [x] Require exact numeric-loopback origin, custom request header, double-submit CSRF binding, an empty request body, and no CORS response.
- [x] Return generic failures and keep the endpoint independently default-disabled outside production.

Implementation completed locally on 2026-10-02. Its database boundary has been exercised against the disposable local stack. The end-to-end browser/provider ceremony remains unexercised because hosted TOTP verification remains disabled and the migration remains unapplied to every hosted project.

**Stop if:** freshness can only be inferred from JWT issuance/refresh time, or the provider stops supplying timestamped TOTP evidence.

### 4. Exercise the read-only UI locally

- Set the three local gates explicitly in `.env.local`; never commit credential values.
- [x] Use only `http://127.0.0.1:<port>/internal/account-administration` for the operator UI.
- [x] Verify the public `localhost` alias cannot serve the operator page or browser API.
- [x] Inspect a dedicated non-protected test account and confirm the immutable audit event exists before accepting the response.
- [x] Disable the operator principal between two reads and confirm the second read fails.
- Wait past fixed expiry and confirm the session does not renew silently.

Partial local evidence completed on 2026-10-03. The fixture UI passed the loopback-origin browser test with the browser BFF, live panel, session issuance, and commands disabled. A process-only machine endpoint then inspected a synthetic local account and Character through Supabase Auth/REST, returned `200` with `Cache-Control: no-store`, and produced an exact `account_administration_summary_v1` audit row before returning. Missing bearer credentials and any browser `Origin` were denied with `401`, no CORS header was emitted, and disabling the operator changed the next read to `403` without adding an audit row. The disposable database and process-only credentials were destroyed after verification.

The browser-session/TOTP path and fixed-expiry behavior remain pending. They require the separately gated issuance flow and must not be inferred from the machine-endpoint result.

**Stop if:** any response is cacheable, CORS-enabled, accessible without the custom header, or visible from the public origin.

### 5. Production eligibility review

- Complete database-backed integration tests, browser security tests, bundle-secret scanning, XSS/CSRF/IDOR review, and audit retention/recovery decisions.
- [x] Confirm dedicated-host routing and Netlify cost without deploying.
- Obtain separate Robert approvals for hosted MFA configuration, migration application, secrets, hostname/DNS, deployment, and eventual operator access.

The routing/cost decision was completed locally on 2026-10-03 in `docs/CRY_400_ProductionIsolationCostDecision_2026-10-03.md`. The selected current state is local-only and default-off. If activation is later approved, the preferred cost-minimizing topology is an exact dedicated hostname alias on the existing Netlify site, bundled into one planned coherent release. No hostname, DNS, provider setting, PR, deploy, or hosted change was made. The actual Netlify plan, remaining credits, and prior duplicate-deploy behavior still require a read-only account-specific check before any activation.

**Stop condition:** produce an eligibility report. Do not apply, provision, push, open a PR, or deploy under this checklist.

## Rollback and Recovery

- Local UI rollback: set `ACCOUNT_ADMINISTRATION_OPERATOR_LIVE_UI_ENABLED=false` and restart the local server.
- Local BFF rollback: set `ACCOUNT_ADMINISTRATION_OPERATOR_BFF_ENABLED=false` and restart the local server.
- Session response: revoke the specific operator session, then disable the principal if compromise is suspected.
- Provider recovery: retain at least two independently controlled TOTP factors for the operator; provider-side recovery remains owner-controlled.
- Hosted database rollback is not defined or authorized by this draft. It must be designed and approved before any hosted migration.

## Loop Contract

- **Trigger:** Robert explicitly authorizes the next named stage.
- **Stop condition:** that stage's verification passes or its stop condition is reached.
- **Source inputs:** CRY-400 ADR, current repository, Supabase official documentation, local test output, and approved provider/database evidence.
- **Authority class:** local code and draft documentation only; every external or hosted mutation remains separately gated.
- **Verification:** focused tests, full tests, lint, typecheck, production build, local database tests, and browser boundary tests proportional to the stage.
- **Escalation boundary:** hosted configuration, migration application, secrets, DNS/hostname, deployment, production account access, or mutation capability.
- **Usage guardrail:** stop after the authorized stage; do not use GitHub or Netlify as a debugging loop.

## 2026-10-05 Packaging Handoff

Robert authorized packaging the completed local CRY-400 foundation into a commit and a separate pull request for review. This supersedes the earlier checklist prohibition on creating a PR for this packaging step only. It does not authorize merge, Netlify deployment, hosted Supabase migrations, MFA/provider configuration, secrets, DNS/hostname changes, production activation, or operator mutation capability.

Pre-PR verification on 2026-10-05 completed with a sealed security diff scan reporting zero findings, 441/441 repository tests passing, focused operator-boundary tests passing, lint passing, TypeScript no-emit passing, the numeric-loopback browser-origin suite passing, and the Next.js production build passing. A real Chromium same-origin request also confirmed that read-only fetches omit `Origin` but supply `Sec-Fetch-Site: same-origin` and `Sec-Fetch-Mode: cors`; the browser boundary now accepts only that narrow GET/HEAD case while preserving exact-Origin and CSRF requirements for writes.
