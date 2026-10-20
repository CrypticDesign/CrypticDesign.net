import { NextRequest, NextResponse } from "next/server";

import {
  operatorCsrfCookieSettings,
  operatorOriginDecision,
  operatorSecurityHeaders,
  OPERATOR_CSRF_REQUEST_TOKEN_HEADER,
  validOperatorCsrfToken,
} from "@/lib/account-administration-operator-origin";
import { indexingDirectiveForRequest } from "@/lib/indexing-policy";
import {
  isMemberAuthApiPath,
  isMemberAuthPagePath,
  memberAuthAvailableForHeaders,
} from "@/lib/member-auth-environment";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const publicHost = forwardedHost ?? host;
  const pathname = request.nextUrl.pathname;
  const environment = process.env.NODE_ENV;
  const operatorDecision = operatorOriginDecision({
    host,
    forwardedHost,
    pathname,
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

  if (!memberAuthAvailableForHeaders(request.headers)) {
    if (isMemberAuthApiPath(pathname)) {
      return NextResponse.json({
        authenticated: false,
        accountCreationAvailable: false,
        mode: "disabled",
        error: "Member authentication is unavailable on this site.",
      }, {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      });
    }

    if (isMemberAuthPagePath(pathname)) {
      const destination = request.nextUrl.clone();
      destination.pathname = "/account";
      destination.search = "?auth=unavailable";
      return NextResponse.redirect(destination, 307);
    }
  }

  const directive = indexingDirectiveForRequest(publicHost, request.nextUrl.pathname);
  const response = NextResponse.next();

  if (directive) response.headers.set("X-Robots-Tag", directive);
  return response;
}

export const config = {
  // Public assets are already served by Netlify's CDN and do not need auth,
  // operator-origin, or indexing policy evaluation. Keeping them out of the
  // middleware prevents an Edge Function invocation for every image/audio
  // request while preserving middleware coverage for pages and APIs.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|audio/|brand/|images/|share/|share\\.png|share-placeholder\\.svg).*)",
  ],
};
