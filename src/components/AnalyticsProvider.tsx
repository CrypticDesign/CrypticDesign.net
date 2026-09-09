"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  deriveRouteViewEvents,
  isAnalyticsEnvironmentAuthorized,
  sanitizeCanonicalPath,
  shouldTrackPageView,
  type AnalyticsConsent,
} from "@/lib/analytics";
import { configuredMeasurementId, disableGoogleTag, ensureGoogleTag, readAnalyticsConsent, trackAnalyticsEvent } from "@/lib/analytics-client";

type AnalyticsPreferenceContextValue = {
  consent: AnalyticsConsent | null;
  eligible: boolean;
  settingsOpen: boolean;
  openSettings: () => void;
  setConsent: (preference: AnalyticsConsent) => void;
};

const AnalyticsPreferenceContext = createContext<AnalyticsPreferenceContextValue | null>(null);

export function useAnalyticsPreference() {
  const value = useContext(AnalyticsPreferenceContext);
  if (!value) throw new Error("useAnalyticsPreference must be used inside AnalyticsProvider.");
  return value;
}

export function AnalyticsPreferencesButton({ className = "" }: { className?: string }) {
  const { eligible, openSettings } = useAnalyticsPreference();
  if (!eligible) return null;
  return <button type="button" className={className} onClick={openSettings}>Analytics preferences</button>;
}

export default function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [consent, setConsentState] = useState<AnalyticsConsent | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const lastTrackedPath = useRef<string | null>(null);
  const eligible = hydrated && isAnalyticsEnvironmentAuthorized({
    measurementId: configuredMeasurementId,
    environment: process.env.NODE_ENV,
    hostname: window.location.hostname,
  });

  useEffect(() => {
    setConsentState(readAnalyticsConsent());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!eligible || !configuredMeasurementId) return;
    if (consent === "granted") ensureGoogleTag(configuredMeasurementId);
    if (consent === "denied") disableGoogleTag(configuredMeasurementId);
  }, [consent, eligible]);

  useEffect(() => {
    if (!eligible || consent !== "granted" || !shouldTrackPageView(lastTrackedPath.current, pathname)) return;
    lastTrackedPath.current = sanitizeCanonicalPath(pathname);
    for (const event of deriveRouteViewEvents(pathname)) {
      trackAnalyticsEvent(event.name, event.payload as never);
    }
  }, [consent, eligible, pathname]);

  const setConsent = (preference: AnalyticsConsent) => {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, preference);
    lastTrackedPath.current = null;
    setConsentState(preference);
    setSettingsOpen(false);
  };

  const showPanel = eligible && (consent === null || settingsOpen);
  return (
    <AnalyticsPreferenceContext.Provider value={{ consent, eligible, settingsOpen, openSettings: () => setSettingsOpen(true), setConsent }}>
      {children}
      {showPanel ? (
        <section className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-2xl border border-[#31506c] bg-[#080d16] p-5 shadow-2xl" role="dialog" aria-modal="false" aria-labelledby="analytics-preference-title">
          <h2 id="analytics-preference-title" className="text-lg font-semibold text-white">Analytics preference</h2>
          <p className="mt-2 text-sm text-neutral-300">Allow privacy-aware Google Analytics measurement to help us understand aggregate visits and public feature use. Direct account, form, Character, and payment identifiers are not intentionally sent.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="button" onClick={() => setConsent("granted")}>Allow analytics</button>
            <button type="button" className="button secondary" onClick={() => setConsent("denied")}>Decline analytics</button>
            {consent !== null ? <button type="button" className="text-link" onClick={() => setSettingsOpen(false)}>Cancel</button> : null}
          </div>
        </section>
      ) : null}
    </AnalyticsPreferenceContext.Provider>
  );
}
