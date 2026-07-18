# CRY-335 Production Authentication and Character Slice

Date: 2026-07-18

Status: implementation verified locally; staging deployment pending

Jira: CRY-335

## Provisioned development service

- Supabase organization: Cryptic Design (Free)
- Supabase project: CrypticDesign.net Development
- Project reference: `befirywgilwrfgwkhhrn`
- Region: Canada Central (`ca-central-1`)
- No paid plan, production customer accounts, payment provider, service-role key, or database password is stored in this repository.
- Automatic RLS was enabled during project creation. Automatic table exposure was disabled, so the migration grants only the reads protected by checked-in RLS policies; character writes are limited to authenticated RPC functions.

## Implemented slice

- Supabase SSR cookie authentication for create account, sign in, sign out, and email confirmation callbacks.
- Automatic member-profile provisioning from confirmed Supabase users.
- Persistent, owner-scoped character create/read/update/status/history access.
- Transaction-safe character write functions with owner checks, idempotency records, and additive history events.
- Sandbox fallback remains available when Supabase is not configured.
- Staging and local confirmation redirect URLs are configured in Supabase.

## Verification evidence

- SQL migrations applied successfully to the isolated development project.
- Confirmed test account signed in, signed out, and signed back in successfully.
- Character `CRY-335 Test Character` was created through the application and remained available after a fresh sign-in.
- A separate HTTP client session independently authenticated and retrieved the same persisted character (HTTP 200/200).
- Live RLS simulation using a different authenticated UUID returned `0` visible character rows.
- TypeScript: pass.
- ESLint: pass.
- Unit tests: 91/91 pass.
- Clean Next.js production build: pass, 54 generated pages/routes.

## Security and launch boundaries

- The current Supabase Free project is for development/staging validation. A paid plan requires Robert's explicit approval.
- Public account launch still requires explicit production approval plus SMTP/email-deliverability validation, CAPTCHA and abuse-rate-limit review, administrator MFA, recovery/backup runbook confirmation, privacy/terms review, and a production-domain cutover decision.
- `npm audit` reports two moderate findings in Next.js's nested PostCSS dependency (GHSA-qx2v-qp2m-jg93). npm currently offers only an invalid major downgrade path for this dependency graph; resolve or formally accept this risk before public production launch.
- The confirmed test account and its character remain isolated test fixtures and should be removed or formally retained before production data initialization.

## Rollback

- Remove the Supabase environment variables from the staging deploy to return the application to its configured sandbox/disabled behavior.
- Do not delete the Supabase project or test fixtures without an explicit cleanup decision.
