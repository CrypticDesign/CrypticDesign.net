# GA4 Tracking Integration

CrypticDesign.net uses a repository-adapted tracking module rather than a duplicated generated SDK folder:

- `src/lib/analytics.ts` — event-name registry, payload types, validation, and sanitization
- `src/lib/analytics-gtag.ts` — dependency-free Google-compatible queue helper
- `src/lib/analytics-client.ts` — consent/environment checks, Google tag initialization, and browser dispatch
- `src/components/AnalyticsProvider.tsx` — consent UI and SPA route hooks
- `src/components/AnalyticsLink.tsx` — governed link tracking
- `.telemetry/tracking-plan.yaml` — target event contract
- `.telemetry/instrument.md` — complete implementation and verification guide

No analytics npm package is required. Configure `NEXT_PUBLIC_GA_MEASUREMENT_ID` in the production build environment. Collection remains disabled outside a production build on `crypticdesign.net` or `www.crypticdesign.net`, and until the visitor explicitly allows analytics.

Run `npm test`, TypeScript no-emit, `npm run lint`, and `npm run build` before review. After deployment, verify a real GA4 collection hit with Tag Assistant or the browser Network panel before closing production verification.

Regenerate or update these artifacts through the product-tracking lifecycle whenever the event contract, destination, identity policy, or consent model changes.
