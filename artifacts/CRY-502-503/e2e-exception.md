# Existing account E2E exception — 2026-08-27

`npm run test:e2e` against the isolated development sandbox completed membership and character suites successfully, then exited 1 in `tests/account-auth-ctas.e2e.mjs:17`:

> AssertionError: Public Home must lead into Entertainment (false !== true)

The test expects the exact Homepage link label **Explore entertainment**. Merged Homepage v2 uses **Explore What's Here** to the same `/entertainment` destination. Subsequent legacy expectations also reference **Discover the studio**, **Featured now**, and **One ecosystem. Three ways in.**, superseded by Homepage v2.

`git diff origin/main -- src/components/PublicHome.tsx tests/account-auth-ctas.e2e.mjs` was empty. Neither the page nor this account test was changed by CRY-502/503.

The account suite is NOT reported as passing. Keep its repair with the integrated account/Homepage acceptance work; do not overwrite CRY-504 changes. The new local-only `qa-cry502503-continuity.mjs` independently passed the current Homepage handoff and signed-out → sandbox-authenticated → signed-out Community continuation checks.
