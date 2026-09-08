export const ANALYTICS_CONSENT_STORAGE_KEY = "cryptic.analytics-consent.v1";
export const CANONICAL_ANALYTICS_HOSTS = ["crypticdesign.net", "www.crypticdesign.net"] as const;

export type AnalyticsConsent = "granted" | "denied";
export type AnalyticsEnvironment = "production" | "development" | "test";

export type AnalyticsPayloadMap = {
  page_view: { page_path: string };
  experience_play: { experience_id: string };
  community_open: { source: string };
  request_access_open: { source: string };
  request_access_submit: { method: "mailto_handoff" };
  sign_in_open: { source: string };
  release_view: { release_slug: string };
  product_view: { product_slug: string };
  outbound_link: { destination_domain: string; destination_category: "franchise" | "social" | "reference" | "other" };
};

export type AnalyticsEventName = keyof AnalyticsPayloadMap;
export type AnalyticsEvent = {
  [Name in AnalyticsEventName]: { name: Name; payload: AnalyticsPayloadMap[Name] }
}[AnalyticsEventName];

export const PROHIBITED_ANALYTICS_PROPERTY_NAMES = [
  "name",
  "email",
  "account_id",
  "member_id",
  "character_id",
  "form_contents",
  "invitation_token",
  "admission_token",
  "auth_token",
  "payment_data",
  "order_data",
  "query",
] as const;

const measurementIdPattern = /^G-[A-Z0-9]{6,20}$/;
const publicIdentifierPattern = /^[a-z0-9][a-z0-9:_-]{0,79}$/;
const campaignValuePattern = /^[A-Za-z0-9._~-]{1,100}$/;

export function sanitizeCanonicalPath(input: string): string {
  try {
    const path = new URL(input, "https://crypticdesign.net").pathname;
    return path.startsWith("/") ? path : "/";
  } catch {
    return "/";
  }
}

export function sanitizeReferrer(input: string): string | undefined {
  if (!input) return undefined;
  try {
    const referrer = new URL(input);
    if (referrer.protocol !== "https:" && referrer.protocol !== "http:") return undefined;
    return `${referrer.origin}${sanitizeCanonicalPath(referrer.pathname)}`;
  } catch {
    return undefined;
  }
}

export function sanitizePublicIdentifier(value: string): string {
  if (!publicIdentifierPattern.test(value)) throw new Error("Analytics identifiers must be stable public keys.");
  return value;
}

export function sanitizeOutboundDestination(input: string): string {
  const destination = new URL(input);
  if (destination.protocol !== "https:" && destination.protocol !== "http:") {
    throw new Error("Analytics outbound destinations must use HTTP(S).");
  }
  return destination.hostname.toLowerCase();
}

export function sanitizeCampaignAttribution(search: string): Record<string, string> {
  const input = new URLSearchParams(search);
  const allowed = {
    utm_source: "campaign_source",
    utm_medium: "campaign_medium",
    utm_campaign: "campaign_name",
    utm_content: "campaign_content",
    utm_term: "campaign_term",
  } as const;
  const result: Record<string, string> = {};
  for (const [queryName, analyticsName] of Object.entries(allowed)) {
    const value = input.get(queryName);
    if (value && campaignValuePattern.test(value)) result[analyticsName] = value;
  }
  return result;
}

export function isAnalyticsEnvironmentAuthorized(input: {
  measurementId?: string;
  environment?: AnalyticsEnvironment | string;
  hostname: string;
}): boolean {
  return input.environment === "production"
    && Boolean(input.measurementId && measurementIdPattern.test(input.measurementId))
    && CANONICAL_ANALYTICS_HOSTS.includes(input.hostname.toLowerCase() as (typeof CANONICAL_ANALYTICS_HOSTS)[number]);
}

export function buildAnalyticsEvent<Name extends AnalyticsEventName>(
  name: Name,
  payload: AnalyticsPayloadMap[Name],
): AnalyticsEvent {
  switch (name) {
    case "page_view":
      return { name, payload: { page_path: sanitizeCanonicalPath((payload as AnalyticsPayloadMap["page_view"]).page_path) } } as AnalyticsEvent;
    case "experience_play":
      return { name, payload: { experience_id: sanitizePublicIdentifier((payload as AnalyticsPayloadMap["experience_play"]).experience_id) } } as AnalyticsEvent;
    case "release_view":
      return { name, payload: { release_slug: sanitizePublicIdentifier((payload as AnalyticsPayloadMap["release_view"]).release_slug) } } as AnalyticsEvent;
    case "product_view":
      return { name, payload: { product_slug: sanitizePublicIdentifier((payload as AnalyticsPayloadMap["product_view"]).product_slug) } } as AnalyticsEvent;
    case "community_open":
    case "request_access_open":
    case "sign_in_open":
      return { name, payload: { source: sanitizePublicIdentifier((payload as { source: string }).source) } } as AnalyticsEvent;
    case "request_access_submit":
      return { name, payload: { method: "mailto_handoff" } } as AnalyticsEvent;
    case "outbound_link": {
      const outbound = payload as AnalyticsPayloadMap["outbound_link"];
      return { name, payload: { destination_domain: sanitizeOutboundDestination(`https://${outbound.destination_domain}`), destination_category: outbound.destination_category } } as AnalyticsEvent;
    }
  }
}

export function deriveRouteViewEvents(pathname: string): AnalyticsEvent[] {
  const path = sanitizeCanonicalPath(pathname);
  const events: AnalyticsEvent[] = [buildAnalyticsEvent("page_view", { page_path: path })];
  const release = path.match(/^\/releases\/([a-z0-9][a-z0-9-]{0,79})\/?$/)?.[1];
  const product = path.match(/^\/products\/([a-z0-9][a-z0-9-]{0,79})\/?$/)?.[1];
  if (release) events.push(buildAnalyticsEvent("release_view", { release_slug: release }));
  if (product) events.push(buildAnalyticsEvent("product_view", { product_slug: product }));
  return events;
}

export function shouldTrackPageView(previousPath: string | null, nextPath: string): boolean {
  return previousPath !== sanitizeCanonicalPath(nextPath);
}
