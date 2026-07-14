# CRY-289 Identity and Persistence Boundary

## Decision

Use a signed, HTTP-only local preview session for the current sandbox. Membership APIs derive the member identity from the server-verified session and never accept a client-supplied member ID.

```text
Browser -> preview-session route -> signed HTTP-only cookie
Browser -> membership API -> identity resolver -> membership store
                                          \-> member-scoped subscriptions/events
```

## Current constraints

- Next.js 15 is the only approved application stack in the repository.
- No production authentication system or datastore has been selected.
- Payments and provider integration remain out of scope.
- Sandbox state must remain local, reversible, and excluded from Git.

## Boundaries

- `sandbox-session.ts` owns local session signing and verification.
- API handlers enforce authentication and resource ownership.
- `MembershipStore` owns persistence behind a replaceable interface boundary.
- `.data/` and `.env.local` remain ignored local runtime state.

## Trade-offs

- The local JSON store is transparent and low-cost, but it is not safe for concurrent production instances.
- The preview cookie demonstrates server-side identity enforcement, but it is not account authentication and stores no credentials.
- Deferring vendor selection avoids lock-in, but production rollout requires a separate authentication and datastore decision.

## Production selection criteria

Supabase Auth and managed PostgreSQL were selected for V1 on 2026-07-13. See `CRY_289_ProductionAuthDatabaseDecision_2026-07-13.md`. External provisioning, paid-plan activation, and credential creation still require Robert's explicit approval.

## Revisit trigger

Replace the preview session and JSON store before any public account creation, personal-data collection, live billing, multi-instance deployment, or production membership migration.
