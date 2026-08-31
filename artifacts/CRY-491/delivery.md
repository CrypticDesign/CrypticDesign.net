# CRY-491 Wave 0 admission-boundary evidence

Date: 2026-08-31 (America/Chicago)

Branch: `agent/cry-491-wave0-hardening`

Base: `410d190b73abac926e66a2ac98dfc2095b59b8ab` (`origin/main`)

Disposition: **CONDITIONAL PASS — repository hardening verified; provider and deployment evidence remain external gates**

## Implemented boundary

- Added one shared email-confirmation policy used by both confirmation presentation and OTP consumption.
- Rejected `signup`, `invite`, `magiclink`, and generic `email` confirmation in Wave 0 closed-admission mode.
- Preserved existing-account `recovery` and `email_change` confirmation.
- Required an existing `member_profiles` row before Supabase sessions are treated as admitted member sessions.
- Required the same admitted-member check after PKCE code exchange and before password mutation.
- Added a forward migration that removes unconditional `auth.users` profile provisioning without deleting existing member profiles.
- Required an admitted member profile before the security-definer character-creation RPC can create member state.
- Kept browser `action: "create"` fail-closed and did not add public signup, payment, entitlement, provider, or invitation activation.

## Verification

- Focused confirmation/admission/recovery tests: **12/12 passed**.
- Full automated suite: **268/268 passed**.
- TypeScript `--noEmit`: **passed**.
- ESLint: **passed**.
- Next.js 15.5.21 production build: **passed**, 75 static/dynamic routes generated.
- `git diff --check`: **passed**.

## Migration safety

`202608310001_close_unapproved_auth_member_boundary.sql` is forward-only. It:

- drops the unconditional `create_member_profile_after_signup` trigger;
- removes the obsolete trigger function;
- does not delete or disable existing member profiles;
- preserves authenticated character creation for identities that already have an admitted member profile;
- leaves future approved invitation/payment admission responsible for explicit server-side profile creation.

The migration has been reviewed and contract-tested locally but has **not** been applied to any Supabase environment.

## Intentionally fail-closed limitations

- Public and ordinary signup OTPs cannot be completed.
- Invitation OTP completion remains closed because the approved invitation/payment acceptance transaction is not active.
- No provider success was fabricated in local tests.

## CRY-489 provider evidence still required

Before CRY-489 can receive final PASS, the intended production Supabase project still needs separately authorized evidence that:

1. public provider signup is disabled;
2. a direct publishable-key signup attempt is denied without creating an Auth user;
3. the verified environment is the intended production project and is not a development/shared write target;
4. the forward migration is applied in the approved environment;
5. no dashboard/API/provider path bypasses the closed admission boundary.

No provider configuration, direct signup attempt, production migration, deployment, email send, payment activation, invitation activation, or spend occurred during this implementation.
