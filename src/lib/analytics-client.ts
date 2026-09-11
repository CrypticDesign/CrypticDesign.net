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
  const disabledWindow = window as unknown as Record<string, unknown>;
  disabledWindow[`ga-disable-${measurementId}`] = false;
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
  const disabledWindow = window as unknown as Record<string, unknown>;
  disabledWindow[`ga-disable-${measurementId}`] = true;
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
}

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
