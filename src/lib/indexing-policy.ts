export const CANONICAL_INDEX_HOSTS = ["crypticdesign.net", "www.crypticdesign.net"] as const;
export const NON_PRODUCTION_ROBOTS_DIRECTIVE = "noindex, nofollow, noarchive";

export function normalizeRequestHost(value: string | null): string {
  const forwardedHost = value?.split(",", 1)[0]?.trim().toLowerCase() ?? "";
  return forwardedHost.replace(/:\d+$/, "");
}

export function isCanonicalIndexHost(value: string | null): boolean {
  const hostname = normalizeRequestHost(value);
  return CANONICAL_INDEX_HOSTS.includes(hostname as (typeof CANONICAL_INDEX_HOSTS)[number]);
}

export function indexingDirectiveForHost(value: string | null): string | null {
  return isCanonicalIndexHost(value) ? null : NON_PRODUCTION_ROBOTS_DIRECTIVE;
}
