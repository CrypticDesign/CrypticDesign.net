# CRY-335 Production Authentication and Character Slice

Date: 2026-07-18; verification updated 2026-07-22

Status: draft pull request verified locally, in staging, and against the isolated development database; production approval pending

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

- SQL migrations, including `202607220001_harden_production_auth_character_slice.sql`, applied successfully to the isolated development project on 2026-07-22.
- Post-deployment database inspection confirmed the old caller-timestamp `create_member_character` overload is absent, the hardened overload is present, and the `valid_member_character_archetype` constraint is installed.
- A rollback-only authenticated database acceptance test passed create, update, retire, reactivate, four-event history generation, and invalid-archetype rejection. The transaction was rolled back and retained no acceptance-test character or history.
- The complete migration chain, including the 2026-07-22 RPC hardening migration, applied successfully to a disposable local PostgreSQL 18 instance.
- Database-boundary regression checks confirmed canonical archetype enforcement, database-owned character/history timestamps, and removal of every caller-timestamp RPC overload.
- Confirmed test account signed in, signed out, and signed back in successfully.
- Character `CRY-335 Test Character` was created through the application and remained available after a fresh sign-in.
- A separate HTTP client session independently authenticated and retrieved the same persisted character (HTTP 200/200).
- A representative external Gmail account completed the hosted sign-up and required email-confirmation flow through Resend on 2026-07-22; Resend reported the confirmation message as delivered and the confirmed account signed in successfully.
- Character `CRY-335 Persistence` was created through deploy preview 32, the account was signed out and signed back in, and the same owner-scoped character, handle, archetype, and creation-history event were retrieved from Supabase.
- Live RLS simulation using a different authenticated UUID returned `0` visible character rows.
- TypeScript: pass.
- ESLint: pass.
- Unit tests: 97/97 pass, including account-control, sign-out, RPC-argument, and migration-hardening regressions.
- Account controls: visible border, opaque background, 45.3px computed height, and 12px padding confirmed in a real browser.
- Clean Next.js production build: pass, 68 generated pages/routes.
- Netlify environment inspection confirmed both Supabase public client variables are configured for the Production deploy context and retain their `codex/cry-335-production-auth` branch overrides.

## Security and launch boundaries

- The current Supabase Free project is for development/staging validation. A paid plan requires Robert's explicit approval.
- Public account launch still requires explicit production approval plus CAPTCHA implementation, recovery/backup runbook confirmation, privacy/terms review, dependency-advisory handling, and a production-domain cutover decision.
- Next.js and `eslint-config-next` were upgraded from 15.5.20 to 15.5.21. The patched stack passed 97/97 unit tests, ESLint, the 68-route production build, and both membership and character HTTP end-to-end suites. This clears the direct Next.js advisories, but `npm audit` still reports one moderate PostCSS finding and one high Sharp/libvips finding inherited through Next.js. npm offers only an invalid breaking downgrade to Next.js 9.3.3 for those transitive findings; resolve or explicitly accept that residual risk before public production launch.
- The confirmed test account and its character remain isolated test fixtures and should be removed or formally retained before production data initialization.

### Authentication launch-gate audit (2026-07-22)

- Pass: email/password sign-up is enabled and email confirmation is required.
- Pass: Supabase Auth rate limits are active. After custom SMTP configuration, the dashboard allows 25 auth emails per hour and 30 sign-up/sign-in requests per 5 minutes per IP address.
- Pass for staging only: the Site URL is `https://demo.crypticdesign.net`, with confirmation redirects allowed for staging and local development.
- Pass: Resend Free is connected through the official Supabase integration, `auth.crypticdesign.net` has verified DKIM/SPF/MX records in GoDaddy, and Supabase custom SMTP is enabled with sender `Cryptic Design <no-reply@auth.crypticdesign.net>`. Resend reported a representative external Gmail confirmation message as delivered, and the recipient completed confirmation and authenticated successfully.
- Blocked for public launch: CAPTCHA protection is disabled, and the application does not yet supply a CAPTCHA token in its sign-up flow.
- Pass: the Supabase administrator account has a primary TOTP authenticator configured. Supabase verified one enrolled app on 2026-07-22; a separate backup factor remains part of the recovery gate.
- Blocked for public launch: this Free project has no scheduled database backups. A recovery runbook and off-site logical backup are not yet established.
- Blocked for production-domain cutover: `https://crypticdesign.net/auth/confirm` is not yet in the redirect allow list, and the Site URL intentionally remains the staging domain.
- Administrator MFA was enrolled by Robert after the read-only audit. Robert authorized the official Resend integration's Supabase organization-level Auth and Projects read/write scope before custom SMTP configuration. The email-delivery and hosted persistence gates passed on 2026-07-22. The pull request must remain draft until recovery, CAPTCHA implementation, dependency-advisory handling, and production-domain decisions are completed or explicitly deferred with accepted risk.

## Netlify staging configuration

- Branch deploys explicitly include `codex/cry-335-production-auth` while `main` remains the production branch.
- The Supabase URL and publishable key are configured for both the Production deploy context and the `codex/cry-335-production-auth` branch override as of 2026-07-22.
- Adding the Production-context values did not trigger a production deploy; the live production site was not changed.
- A generic manual deploy was canceled after Netlify identified its target as `main`; its deploy stage was skipped and the published production site was not changed.

## Rollback

- Remove the Supabase environment variables from the Production deploy context and staging branch override to return those deploys to the configured sandbox/disabled behavior.
- Do not delete the Supabase project or test fixtures without an explicit cleanup decision.
