# Instrumentation Guide

## Target: Google Analytics 4 browser gtag.js

Generated from `tracking-plan.yaml` v2 on 2026-09-09. This guide preserves the centralized, consent-governed implementation described in `current-implementation.md` and corrects the Google tag queue contract.

## SDK Setup

### Dependencies

No npm analytics dependency is required. The browser loads Google's hosted `gtag.js` only after affirmative consent.

### Initialization

1. Require a production build, a canonical production hostname, a valid `G-` measurement ID, and stored consent equal to `granted`.
2. Initialize `window.dataLayer`.
3. Assign a normal function that queues its `arguments` object to `window.gtag`.
4. Queue consent defaults, campaign fields, `js`, and `config` commands.
5. Set `send_page_view: false` and send manual SPA route views.
6. Append the Google script once.

### Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Public GA4 web-stream measurement ID | Production only |

The authorized production value is `G-WRXM0WLPF9`. Development, test, localhost, preview, and `demo.crypticdesign.net` remain disabled even if the variable exists.

## Identity

### identify()

GA4 supports known-user identity through `gtag('config', measurementId, { user_id })`, but Wave 0 intentionally does not call it. Account, member, and Character identifiers are prohibited by the current contract.

**User Traits:** none.

**When to Call:** not applicable in Wave 0. A future identity proposal requires a new privacy and tracking-plan revision.

### group()

GA4 has no native `group()` call. CrypticDesign.net does not emulate groups through user properties in Wave 0.

**Group Hierarchy:** none.

**When to Call:** not applicable.

## Events

### track()

```typescript
window.gtag?.("event", ANALYTICS_EVENTS.RELEASE_VIEW, {
  release_slug: "singularis-themes-vol-1",
  page_location: "https://crypticdesign.net/releases/singularis-themes-vol-1",
});
```

The application uses the typed `trackAnalyticsEvent()` wrapper so call sites cannot add arbitrary parameters.

### SDK Constraints

- GA4 event names use lowercase letters, numbers, and underscores and must remain within 40 characters.
- Custom event parameters are bounded to 25 per event.
- Automatic page views are disabled; the application sends one manual `page_view` for each new canonical pathname.
- `page_location` includes the origin and canonical pathname only; query strings and fragments are excluded.
- GA4 has no native account/group model.
- Standard reports can lag; Tag Assistant, DebugView, or `g/collect` network requests are the delivery checks.

### Group-Level Attribution

Not applicable. Events are anonymous browser/client events and contain no account or user grouping properties.

## Complete Tracking Module

The repository implementation remains split between the pure schema in `src/lib/analytics.ts`, the dependency-free queue helper in `src/lib/analytics-gtag.ts`, and this browser delivery module. The queue helper is:

```typescript
export function createGoogleTagQueue(dataLayer: unknown[]): (...args: unknown[]) => void {
  return function queueGoogleTagCommand() {
    // Google gtag.js requires each queued command to retain the function Arguments object.
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };
}
```

The complete browser delivery module is:

```typescript
"use client";

import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  buildAnalyticsEvent,
  isAnalyticsEnvironmentAuthorized,
  sanitizeCampaignAttribution,
  sanitizeCanonicalPath,
  sanitizeReferrer,
  type AnalyticsConsent,
  type AnalyticsEventName,
  type AnalyticsPayloadMap,
} from "@/lib/analytics";
import { createGoogleTagQueue } from "@/lib/analytics-gtag";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const configuredMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function ensureGoogleTag(measurementId: string) {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = window.gtag ?? createGoogleTagQueue(window.dataLayer);
  const flags = window as unknown as Record<string, unknown>;
  flags[`ga-disable-${measurementId}`] = false;
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  window.gtag("set", sanitizeCampaignAttribution(window.location.search));
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: `${window.location.origin}${sanitizeCanonicalPath(window.location.pathname)}`,
    page_referrer: sanitizeReferrer(document.referrer),
  });
  if (!document.querySelector(`script[data-cryptic-ga="${measurementId}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.crypticGa = measurementId;
    document.head.appendChild(script);
  }
}

export function disableGoogleTag(measurementId: string) {
  const flags = window as unknown as Record<string, unknown>;
  flags[`ga-disable-${measurementId}`] = true;
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
}

export function readAnalyticsConsent(): AnalyticsConsent | null {
  const value = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

export function analyticsCollectionIsAuthorized(consent: AnalyticsConsent | null): boolean {
  return consent === "granted" && isAnalyticsEnvironmentAuthorized({
    measurementId: configuredMeasurementId,
    environment: process.env.NODE_ENV,
    hostname: window.location.hostname,
  });
}

export function trackAnalyticsEvent<Name extends AnalyticsEventName>(
  name: Name,
  payload: AnalyticsPayloadMap[Name],
): boolean {
  if (!analyticsCollectionIsAuthorized(readAnalyticsConsent()) || !window.gtag) return false;
  const event = buildAnalyticsEvent(name, payload);
  const pagePath = sanitizeCanonicalPath(window.location.pathname);
  window.gtag("event", event.name, {
    ...event.payload,
    page_location: `${window.location.origin}${pagePath}`,
    page_referrer: sanitizeReferrer(document.referrer),
  });
  return true;
}
```

## Architecture

### Client vs Server

All Wave 0 calls remain in the browser. No GA4 API secret or Measurement Protocol endpoint is introduced.

### Queues and Batching

The pre-load queue must use Google's function `arguments` contract. Google's library owns transmission and batching after the asynchronous script initializes.

### Shutdown / Flush

No browser shutdown hook is required. Consent revocation enables the measurement-specific `ga-disable` flag and updates analytics storage to denied.

### Error Handling

Analytics remains non-blocking. Calls return without delivery when the environment, host, ID, consent, or queue is unavailable. Navigation, experience activation, and mailto behavior must continue if analytics fails.

## Verification

### Confirming Delivery

1. Build locally with `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-WRXM0WLPF9` and confirm the production bundle contains the correct ID only.
2. Verify local/demo hosts load no Google tag.
3. After reviewed deployment, open the canonical site, allow analytics, and use Tag Assistant or DevTools Network.
4. Confirm `www.google-analytics.com/g/collect` (or the regional GA4 collection endpoint) after a manual route event.
5. Confirm the hit targets `G-WRXM0WLPF9`, then verify Realtime or DebugView.
6. Revoke consent and confirm no subsequent governed events are sent.

### Expected Latency

Tag Assistant and network delivery are immediate. GA4 Realtime normally follows quickly but can require initial property processing; standard reports may take 24–48 hours.

### Success vs Failure

- **Success:** correct tag found, event listed as a sent hit, and a GA4 collection request observed.
- **Failure:** tag found but event remains deferred, no hit is listed, or no GA4 collection request leaves the page.

### Development Testing

Development, preview, demo, and localhost remain fail-closed. Unit tests assert schema, consent, host isolation, and queue shape without sending production telemetry.

## SDK-Specific Constraints

- No identify or group calls in Wave 0.
- No PII, form values, private identifiers, tokens, arbitrary queries, advertising audiences, or replay collection.
- Campaign values are allowlisted and sanitized.
- Event delivery begins only after affirmative consent.

## Coverage Gaps

Canonical production delivery cannot be conclusively reverified until the reviewed hotfix is merged and Netlify publishes the new main build. Local and preview hosts are intentionally prohibited from using the production property.
