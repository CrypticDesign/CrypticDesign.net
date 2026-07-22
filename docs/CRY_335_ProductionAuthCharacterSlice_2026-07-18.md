# CRY-335 Production Authentication and Character Slice

Date: 2026-07-18; verification updated 2026-07-22

Status: draft pull request verified locally and in staging; production approval pending

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
- The complete migration chain, including the 2026-07-22 RPC hardening migration, applied successfully to a disposable local PostgreSQL 18 instance.
- Database-boundary regression checks confirmed canonical archetype enforcement, database-owned character/history timestamps, and removal of every caller-timestamp RPC overload.
- Confirmed test account signed in, signed out, and signed back in successfully.
- Character `CRY-335 Test Character` was created through the application and remained available after a fresh sign-in.
- A separate HTTP client session independently authenticated and retrieved the same persisted character (HTTP 200/200).
- Live RLS simulation using a different authenticated UUID returned `0` visible character rows.
- TypeScript: pass.
- ESLint: pass.
- Unit tests: 97/97 pass, including account-control, sign-out, RPC-argument, and migration-hardening regressions.
- Account controls: visible border, opaque background, 45.3px computed height, and 12px padding confirmed in a real browser.
- Clean Next.js production build: pass, 68 generated pages/routes.

## Security and launch boundaries

- The current Supabase Free project is for development/staging validation. A paid plan requires Robert's explicit approval.
- Public account launch still requires explicit production approval plus SMTP/email-deliverability validation, CAPTCHA and abuse-rate-limit review, administrator MFA, recovery/backup runbook confirmation, privacy/terms review, and a production-domain cutover decision.
- `npm audit` reports three advisories: one moderate PostCSS finding and two high findings in the current Next.js/Sharp dependency path. npm currently offers only an invalid or breaking forced downgrade path for this dependency graph; resolve or formally accept this risk before public production launch.
- The confirmed test account and its character remain isolated test fixtures and should be removed or formally retained before production data initialization.

## Netlify staging configuration

- Branch deploys explicitly include `codex/cry-335-production-auth` while `main` remains the production branch.
- The Supabase URL and publishable key are configured as branch-specific values for `codex/cry-335-production-auth`; they were not added to the production deploy context.
- A generic manual deploy was canceled after Netlify identified its target as `main`; its deploy stage was skipped and the published production site was not changed.

## Rollback

- Remove the Supabase environment variables from the staging deploy to return the application to its configured sandbox/disabled behavior.
- Do not delete the Supabase project or test fixtures without an explicit cleanup decision.
