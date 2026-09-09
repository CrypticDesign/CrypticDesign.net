# Delta: Current → Target

**Designed:** 2026-09-09
**Current events:** 9 live, 0 orphaned
**Target events:** 9

## Implementation Status

- Queue correction: implemented.
- Typed event registry and call-site migration: implemented.
- Runtime queue regression: implemented and passing.
- Full unit, TypeScript, lint, and production build gates: passing.
- Canonical production hit verification: pending reviewed merge and Netlify deployment.

## Add

No new events. The hotfix must not expand production collection.

## Remove

No events removed.

## Rename

No events renamed. Existing GA4-compatible snake_case names and downstream continuity are preserved.

## Keep

| Current Event | Target Event | Notes |
|---------------|--------------|-------|
| `page_view` | `page_view` | Keep canonical SPA route measurement. |
| `experience_play` | `experience_play` | Keep deliberate activation boundary. |
| `community_open` | `community_open` | Keep governed CTA source. |
| `request_access_open` | `request_access_open` | Keep access-intent source. |
| `request_access_submit` | `request_access_submit` | Keep fixed mailto method; no form data. |
| `sign_in_open` | `sign_in_open` | Keep governed sign-in source. |
| `release_view` | `release_view` | Keep public release slug. |
| `product_view` | `product_view` | Keep public product slug. |
| `outbound_link` | `outbound_link` | Keep bounded domain and category. |

**Accounting:** Add 0 + Rename 0 + Keep 9 = 9 target events.

## Change

| Area | Current | Target |
|------|---------|--------|
| gtag queue | Arrow function pushes rest-parameter arrays into `dataLayer`. | Standard function pushes its `arguments` object into `dataLayer`. |
| delivery regression coverage | Tests assert consent and hook placement but not the Google-compatible queue contract. | Test asserts `dataLayer.push(arguments)` and rejects rest-array queueing. |
| event-name registry | Event names are centralized as payload-map keys but referenced as raw literals at call sites. | Export one typed `ANALYTICS_EVENTS` registry and use it in implementation paths. |
| production verification | Correct tag and config detected; Tag Assistant reported deferred hits and zero hits sent. | Tag Assistant or browser network diagnostics confirms at least one GA4 collection hit after consent. |

## Implementation Priority

1. Correct the queue contract without changing consent, privacy, host, measurement ID, or event scope.
2. Add automated regression coverage for the queue and centralized event-name registry.
3. Run unit tests, TypeScript, lint, and production build locally.
4. Verify delivery against the canonical production deployment only after the reviewed fix is merged and deployed.
