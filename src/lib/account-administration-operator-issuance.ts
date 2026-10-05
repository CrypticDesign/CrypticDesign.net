import "server-only";

import type { NextRequest, NextResponse } from "next/server";
import {
  deriveVerifiedOperatorIdentityFromSupabaseMfa,
  OperatorStepUpError,
} from "./account-administration-operator-step-up";
import {
  OPERATOR_SESSION_MAX_AGE_SECONDS,
  OperatorSessionError,
} from "./account-administration-operator-session";
import { issueAndPersistSupabaseOperatorAccessSession } from "./account-administration-operator-session-supabase";
import { operatorBffConfigured } from "./account-administration-operator-bff";
import {
  authorizeLocalOperatorBrowserRequest,
  operatorCsrfCookieSettings,
  operatorSessionCookieSettings,
} from "./account-administration-operator-origin";
import { createRequestSupabaseClient } from "./supabase/server";

type RuntimeEnvironment = "development" | "test" | "production";

export type IssuedOperatorBrowserSession = {
  expiresAt: string;
  applyCookies<T extends NextResponse>(response: T): T;
};

export class OperatorSessionIssuanceUnavailableError extends Error {
  constructor() {
    super("Operator session issuance unavailable");
  }
}

function runtimeEnvironment(): RuntimeEnvironment {
  return process.env.NODE_ENV === "production"
    ? "production"
    : process.env.NODE_ENV === "test"
      ? "test"
      : "development";
}

export function operatorSessionIssuanceConfigured() {
  return process.env.NODE_ENV !== "production" &&
    process.env.ACCOUNT_ADMINISTRATION_OPERATOR_SESSION_ISSUANCE_ENABLED?.trim() === "true" &&
    operatorBffConfigured();
}

export async function issueOperatorBrowserSession(
  request: NextRequest,
): Promise<IssuedOperatorBrowserSession | null> {
  if (!operatorSessionIssuanceConfigured()) return null;

  const environment = runtimeEnvironment();
  const csrfCookie = operatorCsrfCookieSettings(environment);
  if (!authorizeLocalOperatorBrowserRequest({
    host: request.headers.get("host"),
    forwardedHost: request.headers.get("x-forwarded-host"),
    pathname: request.nextUrl.pathname,
    method: request.method,
    origin: request.headers.get("origin"),
    fetchSite: request.headers.get("sec-fetch-site"),
    fetchMode: request.headers.get("sec-fetch-mode"),
    operatorRequestHeader: request.headers.get("x-cry-operator-request"),
    csrfHeader: request.headers.get("x-cry-operator-csrf"),
    expectedCsrfToken: request.cookies.get(csrfCookie.name)?.value ?? null,
    environment,
  })) return null;

  try {
    const auth = createRequestSupabaseClient(request);
    const userResult = await auth.client.auth.getUser();
    if (userResult.error || !userResult.data.user) return null;

    const claimsResult = await auth.client.auth.getClaims();
    const claims = claimsResult.data?.claims;
    if (claimsResult.error || !claims) return null;

    const identity = deriveVerifiedOperatorIdentityFromSupabaseMfa({
      verifiedAccountId: userResult.data.user.id,
      claims: {
        sub: claims.sub,
        session_id: claims.session_id,
        aal: claims.aal,
        amr: claims.amr,
      },
      now: new Date().toISOString(),
    });
    const issued = await issueAndPersistSupabaseOperatorAccessSession({
      identity,
      requiredCapability: "account:inspect",
      durationSeconds: OPERATOR_SESSION_MAX_AGE_SECONDS,
    });
    const sessionCookie = operatorSessionCookieSettings(environment);

    return {
      expiresAt: issued.session.expiresAt,
      applyCookies<T extends NextResponse>(response: T): T {
        const withAuthCookies = auth.applyCookies(response);
        withAuthCookies.cookies.set(sessionCookie.name, issued.token, sessionCookie.options);
        return withAuthCookies;
      },
    };
  } catch (error) {
    if (error instanceof OperatorStepUpError || error instanceof OperatorSessionError) return null;
    throw new OperatorSessionIssuanceUnavailableError();
  }
}
