import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ANALYTICS_EVENTS,
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
import { createGoogleTagQueue } from "./analytics-gtag.ts";

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
  assert.equal(new Set(Object.values(ANALYTICS_EVENTS)).size, 9);
  const submit = buildAnalyticsEvent(ANALYTICS_EVENTS.REQUEST_ACCESS_SUBMIT, { method: "mailto_handoff", email: "private@example.com", name: "Private" } as never);
  assert.deepEqual(submit, { name: "request_access_submit", payload: { method: "mailto_handoff" } });
  for (const key of PROHIBITED_ANALYTICS_PROPERTY_NAMES) assert.equal(key in submit.payload, false);
  assert.deepEqual(buildAnalyticsEvent(ANALYTICS_EVENTS.OUTBOUND_LINK, { destination_domain: "Example.COM", destination_category: "reference" }), {
    name: "outbound_link",
    payload: { destination_domain: "example.com", destination_category: "reference" },
  });
  assert.equal(sanitizeOutboundDestination("https://example.com/path?token=private"), "example.com");
});

test("Google tag queue preserves command arguments instead of rest-parameter arrays", () => {
  const dataLayer: unknown[] = [];
  const gtag = createGoogleTagQueue(dataLayer);
  gtag("config", "G-WRXM0WLPF9", { send_page_view: false });
  assert.equal(dataLayer.length, 1);
  assert.equal(Array.isArray(dataLayer[0]), false);
  assert.deepEqual(Array.from(dataLayer[0] as IArguments), ["config", "G-WRXM0WLPF9", { send_page_view: false }]);
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
  const client = source("./analytics-client.ts");
  const queue = source("./analytics-gtag.ts");
  const request = source("../components/RequestAccessForm.tsx");
  const runtime = source("../components/ExperienceRuntime.tsx");
  assert.match(provider, /consent === "granted"\) ensureGoogleTag/);
  assert.match(provider, /lastTrackedPath/);
  assert.match(client, /send_page_view: false/);
  assert.match(queue, /function queueGoogleTagCommand\(\)/);
  assert.match(queue, /dataLayer\.push\(arguments\)/);
  assert.doesNotMatch(queue, /dataLayer\.push\(args\)/);
  assert.match(request, /trackAnalyticsEvent\(ANALYTICS_EVENTS\.REQUEST_ACCESS_SUBMIT, \{ method: "mailto_handoff" \}\)/);
  assert.doesNotMatch(request, /trackAnalyticsEvent\([^\n]*request\./);
  assert.match(runtime, /trackAnalyticsEvent\(ANALYTICS_EVENTS\.EXPERIENCE_PLAY, \{ experience_id: runtimeId \}\)/);
  assert.equal(runtime.match(/trackAnalyticsEvent\(ANALYTICS_EVENTS\.EXPERIENCE_PLAY, \{ experience_id: runtimeId \}\)/g)?.length, 2);
  assert.doesNotMatch(runtime.slice(0, runtime.indexOf("const activate = useCallback")), /trackAnalyticsEvent\(ANALYTICS_EVENTS\.EXPERIENCE_PLAY/);
});
