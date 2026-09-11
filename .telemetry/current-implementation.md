## Current Implementation

**SDK:** Google Analytics 4 browser `gtag.js` loaded from `www.googletagmanager.com`
**Captured:** 2026-09-09

### Initialization
`src/lib/analytics-gtag.ts` defines the dependency-free Google-compatible queue helper. `src/lib/analytics-client.ts` initializes `window.dataLayer`, assigns the queue to `window.gtag`, applies consent defaults and campaign sanitization, configures the environment-provided measurement ID with automatic page views disabled, and appends the asynchronous Google tag script after affirmative consent. `src/components/AnalyticsProvider.tsx` owns consent state and invokes the centralized initialization boundary.

### Client vs Server
All Wave 0 analytics calls are browser-side. No Measurement Protocol, API secret, server analytics worker, identify call, or group call is present.

### Call Routing
Event names, payload types, and sanitization are centralized in `src/lib/analytics.ts`. `src/lib/analytics-client.ts` is the single browser initializer and dispatcher. `AnalyticsProvider` derives route events, `AnalyticsLink` and `AnalyticsAnchor` wrap governed links, and direct calls exist at the experience-activation and mailto-handoff boundaries. All implementation call sites reference the typed `ANALYTICS_EVENTS` registry.

### Identity Management
No application identity is sent. GA4 may manage its browser client identifier after consent, but the implementation does not transmit account, member, Character, form, token, or payment identifiers.

### Environment Variables
`NEXT_PUBLIC_GA_MEASUREMENT_ID` provides the public GA4 measurement ID. Delivery additionally requires a production build, `crypticdesign.net` or `www.crypticdesign.net`, and stored visitor consent set to `granted`.

### Error Handling
Tracking is non-blocking. The dispatcher returns `false` without throwing when consent, environment, host, configuration, or the tag queue is unavailable. Payload builders reject invalid public identifiers and strip disallowed data before dispatch.

### Shutdown / Flush
Browser `gtag.js` manages network delivery. There is no application shutdown hook. Revoking consent sets `ga-disable-G-WRXM0WLPF9` and updates analytics storage consent to denied.

### Production Diagnostic and Local Correction
On 2026-09-09, Google Tag Assistant detected the correct tag, the on-page configuration, and destination `G-WRXM0WLPF9`, but reported deferred hits and no hits sent. The merged implementation queued rest-parameter arrays instead of Google's documented function `arguments` object.

The current hotfix branch now queues an `Arguments` object. A runtime regression proves the queued command is not an Array and retains the expected command values. The production build contains `G-WRXM0WLPF9`, contains no `G-XBP2025J3N`, and emits `push(arguments)`. Canonical production hit verification remains pending reviewed merge and deployment.
