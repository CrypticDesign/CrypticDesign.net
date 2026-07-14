# CRY-289 Production Authentication and Database Decision

**Status:** Selected for implementation; external provisioning not yet authorized or performed.

## Decision

Use **Supabase Auth + managed PostgreSQL** for the CrypticDesign.net V1 account and membership foundation. Use `@supabase/ssr` for cookie-based Next.js App Router sessions and PostgreSQL Row Level Security (RLS) as defense in depth.

## Why this fits V1

- One operational surface covers authentication, relational data, authorization policies, backups, and migrations.
- The subscription/event model is naturally relational and remains portable PostgreSQL rather than a proprietary document model.
- Supabase publishes an App Router quickstart and server-side cookie-session package for Next.js.
- Auth identity can be enforced both in route handlers and through PostgreSQL RLS.
- The current Pro baseline is $25/month, includes 100,000 monthly active users, 8 GB database storage, and seven days of daily backups.

## Alternatives considered

### Neon PostgreSQL + Neon Auth / Better Auth

Strong database branching, scale-to-zero, and point-in-time restore economics. Neon Auth is newer and the current pricing page still describes some auth capabilities as forthcoming. It is a credible future alternative if database branching becomes more important than an integrated, established V1 auth workflow.

### Separate auth vendor + managed PostgreSQL

Offers best-of-breed choice and easier provider substitution, but creates two vendor relationships, two billing surfaces, and more integration/incident work for a founder-operated V1.

## Security and privacy requirements

- Enable RLS on every application table in an exposed schema.
- Browser clients receive only the publishable key; service-role credentials remain server-only.
- Require email confirmation, CAPTCHA/rate-limit review, administrator MFA, SSL enforcement, and custom SMTP before public signup.
- Collect the minimum member data needed for account, character, library, and billing continuity.
- Run a logical `pg_dump` export on a separate schedule; provider backups alone are not the portability plan.

## Backup posture

- Development may use the free plan only with manual logical exports.
- Public production requires Supabase Pro or higher for non-pausing service and seven-day daily backups.
- Point-in-time recovery is deferred at launch because the published add-on starts around $100/month for seven-day retention. Revisit when billing volume or recovery objectives justify it.

## Cost guardrail

No paid project may be created without Robert's explicit approval. Initial expected production baseline: **$25/month**, excluding custom SMTP, domain, hosting, and optional PITR.

## Implementation boundary

The checked-in migration defines portable tables, constraints, indexes, and RLS policies. Application integration waits for a provisioned project URL and publishable key. The local signed-session and JSON store remain sandbox-only and must never be enabled in public production.

## Sources checked 2026-07-13

- Supabase Next.js Auth quickstart: https://supabase.com/docs/guides/auth/quickstarts/nextjs
- Supabase server-side Next.js pattern: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase production checklist: https://supabase.com/docs/guides/deployment/going-into-prod
- Supabase backups: https://supabase.com/docs/guides/platform/backups
- Supabase pricing: https://supabase.com/pricing
- Neon pricing/restore comparison: https://neon.com/pricing

## Revisit triggers

- Sustained cost above the approved operating envelope.
- Requirements for multi-region writes, a longer recovery window, HIPAA, enterprise SSO, or vendor-independent identity.
- Deployment-host constraints that materially alter connection pooling or session handling.
