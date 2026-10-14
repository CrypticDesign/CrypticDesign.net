import { NextRequest, NextResponse } from "next/server";
import { AccountAdministrationError } from "@/lib/account-administration";
import {
  AccountAdministrationLookupError,
  parseAccountAdministrationLookup,
} from "@/lib/account-administration-lookup";
import { lookupAndInspectSupabaseAccountAdministrationTarget } from "@/lib/account-administration-lookup-supabase";
import {
  authorizeOperatorLookupRequest,
  OperatorBffUnavailableError,
} from "@/lib/account-administration-operator-bff";

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
  let authorization;
  try {
    authorization = await authorizeOperatorLookupRequest(request);
  } catch (error) {
    if (error instanceof OperatorBffUnavailableError) return response({ error: "Operator service unavailable" }, 503);
    return response({ error: "Not found" }, 404);
  }
  if (!authorization) return response({ error: "Not found" }, 404);

  try {
    const lookup = parseAccountAdministrationLookup(await request.text());
    const inspection = await lookupAndInspectSupabaseAccountAdministrationTarget({
      operatorAccountId: authorization.principal.accountId,
      lookup,
    });
    return authorization.applyCookies(response(inspection, 200));
  } catch (error) {
    if (error instanceof AccountAdministrationLookupError) {
      return authorization.applyCookies(response({ error: "Invalid lookup" }, 400));
    }
    if (error instanceof AccountAdministrationError && error.code === "audit_incomplete") {
      return authorization.applyCookies(response({ error: "Account lookup unavailable" }, 503));
    }
    return authorization.applyCookies(response({ error: "Not found" }, 404));
  }
}
