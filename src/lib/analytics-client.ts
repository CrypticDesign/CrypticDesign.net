"use client";

import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  buildAnalyticsEvent,
  isAnalyticsEnvironmentAuthorized,
  sanitizeCanonicalPath,
  sanitizeReferrer,
  type AnalyticsConsent,
  type AnalyticsEventName,
  type AnalyticsPayloadMap,
} from "@/lib/analytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const configuredMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function readAnalyticsConsent(): AnalyticsConsent | null {
  const preference = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
  return preference === "granted" || preference === "denied" ? preference : null;
}

export function analyticsCollectionIsAuthorized(consent: AnalyticsConsent | null): boolean {
  return consent === "granted" && isAnalyticsEnvironmentAuthorized({
    measurementId: configuredMeasurementId,
    environment: process.env.NODE_ENV,
    hostname: window.location.hostname,
  });
}

export function trackAnalyticsEvent<Name extends AnalyticsEventName>(name: Name, payload: AnalyticsPayloadMap[Name]): boolean {
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

