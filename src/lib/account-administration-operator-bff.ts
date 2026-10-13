import "server-only";

import type { NextRequest, NextResponse } from "next/server";
import {
  authorizeOperatorAccessSession,
  OperatorSessionError,
  type VerifiedOperatorIdentity,
} from "./account-administration-operator-session";
import { createSupabaseOperatorSessionAuthorizationDependencies } from "./account-administration-operator-session-supabase";
import {
  authorizeLocalOperatorBrowserRequest,
  operatorCommandsEnabled,
  operatorLookupEnabled,
  operatorSessionCookieSettings,
  OPERATOR_CSRF_REQUEST_TOKEN_HEADER,
} from "./account-administration-operator-origin";
import type { OperatorCapability, OperatorPrincipal } from "./account-administration";
import { createRequestSupabaseClient } from "./supabase/server";

type RuntimeEnvironment = "development" | "test" | "production";

export type AuthorizedOperatorReadRequest = {
  principal: OperatorPrincipal;
  sessionId: string;
  expiresAt: string;
  applyCookies<T extends NextResponse>(response: T): T;
};

export class OperatorBffUnavailableError extends Error {
  constructor() {
    super("Operator service unavailable");
  }
}

function runtimeEnvironment(): RuntimeEnvironment {
  return process.env.NODE_ENV === "production"
    ? "production"
    : process.env.NODE_ENV === "test"
      ? "test"
      : "development";
}

export function operatorBffConfigured(): boolean {
  return Boolean(
    process.env.ACCOUNT_ADMINISTRATION_OPERATOR_BFF_ENABLED?.trim() === "true" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() &&
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

export function operatorLookupConfigured(): boolean {
  return operatorBffConfigured() && operatorLookupEnabled();
}

export function operatorCommandsConfigured(): boolean {
  return operatorBffConfigured() && operatorCommandsEnabled();
}

async function verifiedSupabaseIdentity(request: NextRequest): Promise<{
  identity: Pick<VerifiedOperatorIdentity, "accountId" | "authSessionReference">;
  applyCookies<T extends NextResponse>(response: T): T;
} | null> {
  const auth = createRequestSupabaseClient(request);
  const userResult = await auth.client.auth.getUser();
  if (userResult.error || !userResult.data.user) return null;

  const claimsResult = await auth.client.auth.getClaims();
  const claims = claimsResult.data?.claims;
  if (
    claimsResult.error ||
    !claims ||
    claims.sub !== userResult.data.user.id ||
    typeof claims.session_id !== "string" ||
    claims.session_id.length < 16
  ) return null;

  return {
    identity: {
      accountId: userResult.data.user.id,
      authSessionReference: claims.session_id,
    },
    applyCookies: auth.applyCookies,
  };
}

async function authorizeOperatorRequest(
  request: NextRequest,
  requiredCapability: OperatorCapability,
  expectedCsrfToken: string | null,
): Promise<AuthorizedOperatorReadRequest | null> {
  if (!operatorBffConfigured()) return null;

  const environment = runtimeEnvironment();
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
    expectedCsrfToken,
    environment,
  })) return null;

  const verified = await verifiedSupabaseIdentity(request);
  if (!verified) return null;

  const cookie = operatorSessionCookieSettings(environment);
  const token = request.cookies.get(cookie.name)?.value;
  if (!token) return null;

  try {
    const authorization = await authorizeOperatorAccessSession(
      {
        token,
        identity: verified.identity,
        requiredCapability,
        now: new Date().toISOString(),
      },
      createSupabaseOperatorSessionAuthorizationDependencies(),
    );
    return {
      ...authorization,
      applyCookies: verified.applyCookies,
    };
  } catch (error) {
    if (error instanceof OperatorSessionError) return null;
    throw new OperatorBffUnavailableError();
  }
}


export async function authorizeOperatorReadRequest(
  request: NextRequest,
  requiredCapability: OperatorCapability = "account:inspect",
): Promise<AuthorizedOperatorReadRequest | null> {
  return authorizeOperatorRequest(request, requiredCapability, null);
}

export async function authorizeOperatorLookupRequest(
  request: NextRequest,
): Promise<AuthorizedOperatorReadRequest | null> {
  if (!operatorLookupConfigured()) return null;
  return authorizeOperatorRequest(
    request,
    "account:inspect",
    request.headers.get(OPERATOR_CSRF_REQUEST_TOKEN_HEADER),
  );
}

export async function authorizeOperatorCommandRequest(
  request: NextRequest,
  requiredCapability: OperatorCapability,
): Promise<AuthorizedOperatorReadRequest | null> {
  if (!operatorCommandsConfigured()) return null;
  return authorizeOperatorRequest(
    request,
    requiredCapability,
    request.headers.get(OPERATOR_CSRF_REQUEST_TOKEN_HEADER),
  );
}
