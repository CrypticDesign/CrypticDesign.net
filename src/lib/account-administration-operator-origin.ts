export const LOCAL_OPERATOR_HOSTNAME = "127.0.0.1";
export const OPERATOR_FIXTURE_PATH = "/internal/account-administration";
export const OPERATOR_API_PATH = "/api/operator/";
export const OPERATOR_REQUEST_HEADER = "x-cry-operator-request";
export const OPERATOR_CSRF_HEADER = "x-cry-operator-csrf";
export const OPERATOR_CSRF_REQUEST_TOKEN_HEADER = "x-cry-operator-csrf-token";
export const OPERATOR_COMMANDS_ENABLED = false;

type RuntimeEnvironment = "development" | "test" | "production";

function normalizeHost(host: string | null) {
  if (!host || host.includes(",") || /[\s\\/@]/.test(host)) return null;
  const match = host.toLowerCase().match(/^([^:]+)(?::(\d{1,5}))?$/);
  if (!match) return null;
  const port = match[2] ? Number(match[2]) : null;
  if (port !== null && (port < 1 || port > 65535)) return null;
  return { hostname: match[1], authority: match[0] };
}

function verifiedOperatorAuthority(host: string | null, forwardedHost: string | null) {
  const direct = normalizeHost(host);
  if (!direct) return null;

  if (forwardedHost === null) return direct;

  const forwarded = normalizeHost(forwardedHost);
  if (!forwarded || forwarded.authority !== direct.authority) return null;
  return direct;
}

function claimsLocalOperatorHostname(host: string | null) {
  if (!host) return false;
  return host.split(",").some((value) => (
    /^127\.0\.0\.1(?:$|[:\s\\/@])/.test(value.trim().toLowerCase())
  ));
}

function isOperatorSurface(pathname: string) {
  return (
    pathname === OPERATOR_FIXTURE_PATH ||
    pathname.startsWith(`${OPERATOR_FIXTURE_PATH}/`) ||
    pathname.startsWith(OPERATOR_API_PATH)
  );
}

export type OperatorOriginDecision = "operator" | "public" | "deny";

export function operatorOriginDecision(input: {
  host: string | null;
  forwardedHost: string | null;
  pathname: string;
  environment: RuntimeEnvironment;
}): OperatorOriginDecision {
  const host = verifiedOperatorAuthority(input.host, input.forwardedHost);
  const directHost = normalizeHost(input.host);
  const forwardedHost = input.forwardedHost === null ? null : normalizeHost(input.forwardedHost);
  const operatorHostClaimed = input.environment !== "production" && (
    directHost?.hostname === LOCAL_OPERATOR_HOSTNAME ||
    forwardedHost?.hostname === LOCAL_OPERATOR_HOSTNAME ||
    claimsLocalOperatorHostname(input.host) ||
    claimsLocalOperatorHostname(input.forwardedHost)
  );
  const operatorHost = input.environment !== "production" && host?.hostname === LOCAL_OPERATOR_HOSTNAME;
  const operatorSurface = isOperatorSurface(input.pathname);

  if (operatorSurface) return operatorHost ? "operator" : "deny";
  if (operatorHostClaimed) return "deny";
  return "public";
}

export function operatorContentSecurityPolicy(nonce: string, environment: RuntimeEnvironment) {
  const developmentScript = environment === "development" ? " 'unsafe-eval'" : "";
  const developmentStyle = environment === "development" ? " 'unsafe-inline'" : ` 'nonce-${nonce}'`;
  const developmentConnect = environment === "development" ? " ws: wss:" : "";
  const authConnect = operatorAuthConnectSource(process.env.NEXT_PUBLIC_SUPABASE_URL, environment);
  return [
    "default-src 'none'",
    "base-uri 'none'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "worker-src 'none'",
    "media-src 'none'",
    "manifest-src 'none'",
    "form-action 'self'",
    `script-src 'nonce-${nonce}' 'strict-dynamic'${developmentScript}`,
    `style-src 'self'${developmentStyle}`,
    "img-src 'self' data:",
    "font-src 'self' data:",
    `connect-src 'self'${developmentConnect}${authConnect}`,
  ].join("; ");
}

function operatorAuthConnectSource(value: string | undefined, environment: RuntimeEnvironment) {
  if (!value) return "";
  try {
    const url = new URL(value);
    const secure = url.protocol === "https:";
    const localDevelopment = environment !== "production" &&
      url.protocol === "http:" &&
      (url.hostname === "127.0.0.1" || url.hostname === "localhost");
    return secure || localDevelopment ? ` ${url.origin}` : "";
  } catch {
    return "";
  }
}

export function operatorSecurityHeaders(nonce: string, environment: RuntimeEnvironment) {
  return {
    "Cache-Control": "private, no-store, max-age=0",
    "Content-Security-Policy": operatorContentSecurityPolicy(nonce, environment),
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    Pragma: "no-cache",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  } as const;
}

export function operatorSessionCookieSettings(environment: RuntimeEnvironment) {
  const production = environment === "production";
  return {
    name: production ? "__Host-cry_operator" : "cry_operator_local",
    options: {
      httpOnly: true,
      secure: production,
      sameSite: "strict" as const,
      path: "/",
      maxAge: 15 * 60,
    },
  };
}

export function operatorCsrfCookieSettings(environment: RuntimeEnvironment) {
  const production = environment === "production";
  return {
    name: production ? "__Host-cry_operator_csrf" : "cry_operator_csrf_local",
    options: {
      httpOnly: true,
      secure: production,
      sameSite: "strict" as const,
      path: "/",
      maxAge: 15 * 60,
    },
  };
}

export function validOperatorCsrfToken(value: string | null | undefined): value is string {
  return typeof value === "string" && /^[0-9a-f]{32}$/.test(value);
}

function constantTimeStringEqual(actual: string, expected: string) {
  const length = Math.max(actual.length, expected.length);
  let difference = actual.length ^ expected.length;
  for (let index = 0; index < length; index += 1) {
    difference |= (actual.charCodeAt(index) || 0) ^ (expected.charCodeAt(index) || 0);
  }
  return difference === 0;
}

export function authorizeLocalOperatorBrowserRequest(input: {
  host: string | null;
  forwardedHost: string | null;
  pathname: string;
  method: string;
  origin: string | null;
  fetchSite: string | null;
  fetchMode: string | null;
  operatorRequestHeader: string | null;
  csrfHeader: string | null;
  expectedCsrfToken: string | null;
  environment: RuntimeEnvironment;
}) {
  const host = verifiedOperatorAuthority(input.host, input.forwardedHost);
  const method = input.method.toUpperCase();
  const exactOrigin = input.origin === `http://${host?.authority}`;
  const verifiedSameOriginRead = (
    (method === "GET" || method === "HEAD") &&
    input.origin === null &&
    input.fetchSite === "same-origin" &&
    input.fetchMode === "cors"
  );
  if (
    input.environment === "production" ||
    host?.hostname !== LOCAL_OPERATOR_HOSTNAME ||
    !input.pathname.startsWith(OPERATOR_API_PATH) ||
    (!exactOrigin && !verifiedSameOriginRead) ||
    input.operatorRequestHeader !== "1"
  ) return false;

  if (method === "GET" || method === "HEAD") return true;
  return Boolean(
    input.csrfHeader &&
    input.expectedCsrfToken &&
    constantTimeStringEqual(input.csrfHeader, input.expectedCsrfToken),
  );
}
