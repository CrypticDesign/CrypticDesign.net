export const CANONICAL_INDEX_HOSTS = ["crypticdesign.net", "www.crypticdesign.net"] as const;
export const NON_PRODUCTION_ROBOTS_DIRECTIVE = "noindex, nofollow, noarchive";
export const PUBLIC_UTILITY_ROBOTS_DIRECTIVE = "noindex, follow";

export const ROBOTS_DISALLOW_PATHS = [
  "/account/accept-invitation",
  "/account/character",
  "/account/create-character",
  "/account/notifications",
  "/account/recover",
  "/account/reset-password",
  "/account/security",
  "/account/settings",
  "/account/subscription",
  "/api/",
  "/auth/",
  "/library",
] as const;

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

function matchesPathPrefix(pathname: string, prefix: string): boolean {
  const normalizedPrefix = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
  return pathname === normalizedPrefix || pathname.startsWith(`${normalizedPrefix}/`);
}

export function isPrivateSystemPath(pathname: string): boolean {
  return ROBOTS_DISALLOW_PATHS.some((prefix) => matchesPathPrefix(pathname, prefix));
}

export function indexingDirectiveForRequest(host: string | null, pathname: string): string | null {
  const hostDirective = indexingDirectiveForHost(host);
  if (hostDirective) return hostDirective;
  if (pathname === "/account/sign-in") return PUBLIC_UTILITY_ROBOTS_DIRECTIVE;
  return isPrivateSystemPath(pathname) ? NON_PRODUCTION_ROBOTS_DIRECTIVE : null;
}
