import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  PROHIBITED_ANALYTICS_PROPERTY_NAMES,
  buildAnalyticsEvent,
  deriveRouteViewEvents,
  isAnalyticsEnvironmentAuthorized,
  sanitizeCampaignAttribution,
  sanitizeCanonicalPath,
  sanitizeOutboundDestination,
  sanitizeReferrer,
  shouldTrackPageView,
} from "./analytics.ts";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("analytics fails closed without authorized production configuration", () => {
  assert.equal(isAnalyticsEnvironmentAuthorized({ measurementId: undefined, environment: "production", hostname: "crypticdesign.net" }), false);
  assert.equal(isAnalyticsEnvironmentAuthorized({ measurementId: "G-WRXM0WLPF9", environment: "development", hostname: "crypticdesign.net" }), false);
  assert.equal(isAnalyticsEnvironmentAuthorized({ measurementId: "G-WRXM0WLPF9", environment: "test", hostname: "crypticdesign.net" }), false);
  assert.equal(isAnalyticsEnvironmentAuthorized({ measurementId: "G-WRXM0WLPF9", environment: "production", hostname: "demo.crypticdesign.net" }), false);
  assert.equal(isAnalyticsEnvironmentAuthorized({ measurementId: "G-WRXM0WLPF9", environment: "production", hostname: "localhost" }), false);
  assert.equal(isAnalyticsEnvironmentAuthorized({ measurementId: "G-WRXM0WLPF9", environment: "production", hostname: "crypticdesign.net" }), true);
});

test("canonical page and referrer values exclude query strings, fragments, and tokens", () => {
  assert.equal(sanitizeCanonicalPath("/account/accept-invitation?token=private#continue"), "/account/accept-invitation");
  assert.equal(sanitizeCanonicalPath("https://crypticdesign.net/releases/example?auth=secret"), "/releases/example");
  assert.equal(sanitizeReferrer("https://example.com/launch?email=person@example.com#private"), "https://example.com/launch");
});

test("campaign attribution is allowlisted, non-persistent, and rejects personal-looking values", () => {
  assert.deepEqual(sanitizeCampaignAttribution("?utm_source=newsletter&utm_medium=email&utm_campaign=wave-0&token=secret"), {
    campaign_source: "newsletter",
    campaign_medium: "email",
    campaign_name: "wave-0",
  });
  assert.deepEqual(sanitizeCampaignAttribution("?utm_source=person%40example.com&utm_campaign=launch%20list&email=person%40example.com"), {});
});

test("typed event builders retain only bounded payload properties", () => {
  const submit = buildAnalyticsEvent("request_access_submit", { method: "mailto_handoff", email: "private@example.com", name: "Private" } as never);
  assert.deepEqual(submit, { name: "request_access_submit", payload: { method: "mailto_handoff" } });
  for (const key of PROHIBITED_ANALYTICS_PROPERTY_NAMES) assert.equal(key in submit.payload, false);
  assert.deepEqual(buildAnalyticsEvent("outbound_link", { destination_domain: "Example.COM", destination_category: "reference" }), {
    name: "outbound_link",
    payload: { destination_domain: "example.com", destination_category: "reference" },
  });
  assert.equal(sanitizeOutboundDestination("https://example.com/path?token=private"), "example.com");
});

test("route events are stable, identifier-only, and page views deduplicate by pathname", () => {
  assert.deepEqual(deriveRouteViewEvents("/releases/signal-and-systems?token=secret"), [
    { name: "page_view", payload: { page_path: "/releases/signal-and-systems" } },
    { name: "release_view", payload: { release_slug: "signal-and-systems" } },
  ]);
  assert.deepEqual(deriveRouteViewEvents("/products/singularis?release=private"), [
    { name: "page_view", payload: { page_path: "/products/singularis" } },
    { name: "product_view", payload: { product_slug: "singularis" } },
  ]);
  assert.equal(shouldTrackPageView("/community", "/community?token=private"), false);
  assert.equal(shouldTrackPageView("/community", "/account/create"), true);
});

test("consent, Request Access, and Play hooks sit at the governed boundaries", () => {
  const provider = source("../components/AnalyticsProvider.tsx");
  const request = source("../components/RequestAccessForm.tsx");
  const runtime = source("../components/ExperienceRuntime.tsx");
  assert.match(provider, /consent === "granted"\) ensureGoogleTag/);
  assert.match(provider, /lastTrackedPath/);
  assert.match(provider, /send_page_view: false/);
  assert.match(request, /trackAnalyticsEvent\("request_access_submit", \{ method: "mailto_handoff" \}\)/);
  assert.doesNotMatch(request, /trackAnalyticsEvent\([^\n]*request\./);
  assert.match(runtime, /trackAnalyticsEvent\("experience_play", \{ experience_id: runtimeId \}\)/);
  assert.equal(runtime.match(/trackAnalyticsEvent\("experience_play", \{ experience_id: runtimeId \}\)/g)?.length, 2);
  assert.doesNotMatch(runtime.slice(0, runtime.indexOf("const activate = useCallback")), /trackAnalyticsEvent\("experience_play"/);
});
