import { NextRequest, NextResponse } from "next/server";
import {
  issueOperatorBrowserSession,
  OperatorSessionIssuanceUnavailableError,
} from "@/lib/account-administration-operator-issuance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function response(body: object, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "cache-control": "private, no-store, max-age=0",
      pragma: "no-cache",
      "x-robots-tag": "noindex, nofollow, noarchive",
    },
  });
}

export async function POST(request: NextRequest) {
  const contentLength = request.headers.get("content-length");
  if (
    request.headers.has("transfer-encoding") ||
    (contentLength !== null && contentLength !== "0")
  ) return response({ error: "Not found" }, 404);
  const body = await request.text();
  if (body.length !== 0) return response({ error: "Not found" }, 404);

  try {
    const issued = await issueOperatorBrowserSession(request);
    if (!issued) return response({ error: "Not found" }, 404);
    return issued.applyCookies(response({ issued: true, expiresAt: issued.expiresAt }, 201));
  } catch (error) {
    if (error instanceof OperatorSessionIssuanceUnavailableError) {
      return response({ error: "Operator service unavailable" }, 503);
    }
    return response({ error: "Not found" }, 404);
  }
}
