const DEVELOPMENT_AUTH_HOSTS = new Set([
  "demo.crypticdesign.net",
  "localhost",
  "127.0.0.1",
  "::1",
]);

const DEVELOPMENT_NETLIFY_SITE = "frabjous-frangipane-650548.netlify.app";

const MEMBER_AUTH_PAGE_PATHS = new Set([
  "/account/accept-invitation",
  "/account/create-character",
  "/account/notifications",
  "/account/recover",
  "/account/reset-password",
  "/account/security",
  "/account/settings",
  "/account/sign-in",
  "/account/subscription",
  "/library",
]);

function isPathOrChild(pathname: string, root: string): boolean {
  return pathname === root || pathname.startsWith(`${root}/`);
}

export function normalizeRequestHost(host: string | null | undefined): string {
  const candidate = host?.split(",", 1)[0]?.trim().toLowerCase() ?? "";
  if (!candidate) return "";
  if (candidate.startsWith("[")) return candidate.slice(1, candidate.indexOf("]"));
  return candidate.replace(/\.$/, "").replace(/:\d+$/, "");
}

/**
 * Production member authentication stays unavailable until CRY-395 has a
 * separately owned and configured production Supabase project. Unknown hosts
 * fail closed; only the named development surfaces may exercise Auth.
 */
export function memberAuthAvailableForHost(host: string | null | undefined): boolean {
  const normalizedHost = normalizeRequestHost(host);
  return DEVELOPMENT_AUTH_HOSTS.has(normalizedHost)
    || normalizedHost === DEVELOPMENT_NETLIFY_SITE
    || normalizedHost.endsWith(`--${DEVELOPMENT_NETLIFY_SITE}`);
}

export function memberAuthAvailableForHeaders(headers: Pick<Headers, "get">): boolean {
  const candidates = [headers.get("host"), headers.get("x-forwarded-host")]
    .filter((host): host is string => Boolean(host?.trim()));
  return candidates.length > 0 && candidates.every(memberAuthAvailableForHost);
}

export function isMemberAuthPagePath(pathname: string): boolean {
  return MEMBER_AUTH_PAGE_PATHS.has(pathname)
    || isPathOrChild(pathname, "/account/character")
    || isPathOrChild(pathname, "/auth");
}

export function isMemberAuthApiPath(pathname: string): boolean {
  return isPathOrChild(pathname, "/api/admission")
    || isPathOrChild(pathname, "/api/internal/admission")
    || isPathOrChild(pathname, "/api/membership")
    || isPathOrChild(pathname, "/api/characters");
}
