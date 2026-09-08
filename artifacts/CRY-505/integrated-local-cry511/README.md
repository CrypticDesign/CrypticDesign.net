# CRY-505 integrated evidence refresh — CRY-511

Date: 2026-09-07 (America/Chicago)

Branch: `fix/cry-511-request-access-continuation`

Current-main base: `bad451e0f8a2bba60ff6421df2670613d6e876ca`

Disposition: **PASS (local branch evidence)**

## Request Access continuation

The local production build of `/account/create` now uses the governed Wave 0 continuation treatment and presents:

- **Explore Community** → `/community`
- **Browse Releases** → `/releases`
- **Sign In to My Home** → `/account/sign-in`

The legacy `account-link-rail`, **Already have access? Sign In**, and **Return to Account** are absent.

## Browser verification

- 390 × 844: pass
- 768 × 1024: pass
- 1440 × 900: pass
- No horizontal overflow at any tested width.
- All three governed CTAs are visible and use native link semantics.
- Keyboard focus exposes the existing visible 2 px focus outline on all three CTAs.
- Browser interaction reached `/community`, `/releases`, and `/account/sign-in` successfully.

Machine-readable results: `results.json`

Screenshots:

- `account-create-mobile-390-continuation.png`
- `account-create-tablet-768-continuation.png`
- `account-create-desktop-1440-continuation.png`

## Preserved boundaries

`RequestAccessForm`, canonical metadata, accountless public browsing language, mailto behavior, fail-closed admission, authentication behavior, Supabase/provider configuration, and production credentials/configuration were not changed.

## Limitation

This is local production-build evidence. No branch push, pull request, merge, deployment, or production-provider verification was performed.
