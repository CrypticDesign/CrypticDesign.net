import { NextRequest, NextResponse } from "next/server";

import {
  operatorCsrfCookieSettings,
  operatorOriginDecision,
  operatorSecurityHeaders,
  OPERATOR_CSRF_REQUEST_TOKEN_HEADER,
  validOperatorCsrfToken,
} from "@/lib/account-administration-operator-origin";
import { indexingDirectiveForRequest } from "@/lib/indexing-policy";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const publicHost = forwardedHost ?? host;
  const environment = process.env.NODE_ENV;
  const operatorDecision = operatorOriginDecision({
    host,
    forwardedHost,
    pathname: request.nextUrl.pathname,
    environment,
  });

  if (operatorDecision === "deny") {
    return new NextResponse(null, {
      status: 404,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  }

  if (operatorDecision === "operator") {
    const nonce = crypto.randomUUID().replaceAll("-", "");
    const csrfCookie = operatorCsrfCookieSettings(environment);
    const existingCsrfToken = request.cookies.get(csrfCookie.name)?.value;
    const csrfToken = validOperatorCsrfToken(existingCsrfToken)
      ? existingCsrfToken
      : crypto.randomUUID().replaceAll("-", "");
    const requestHeaders = new Headers(request.headers);
    const securityHeaders = operatorSecurityHeaders(nonce, environment);
    requestHeaders.set("x-cry-operator-nonce", nonce);
    requestHeaders.set("x-cry-operator-surface", "1");
    requestHeaders.set(OPERATOR_CSRF_REQUEST_TOKEN_HEADER, csrfToken);
    requestHeaders.set("Content-Security-Policy", securityHeaders["Content-Security-Policy"]);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    for (const [name, value] of Object.entries(securityHeaders)) response.headers.set(name, value);
    if (!validOperatorCsrfToken(existingCsrfToken)) {
      response.cookies.set(csrfCookie.name, csrfToken, csrfCookie.options);
    }
    return response;
  }

  const directive = indexingDirectiveForRequest(publicHost, request.nextUrl.pathname);
  const response = NextResponse.next();

  if (directive) response.headers.set("X-Robots-Tag", directive);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
