import { NextRequest, NextResponse } from "next/server";
import { AccountAdministrationError } from "@/lib/account-administration";
import { inspectSupabaseAccountAdministrationTarget } from "@/lib/account-administration-inspection-supabase";
import {
  authorizeOperatorReadRequest,
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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ accountId: string }> },
) {
  let authorization;
  try {
    authorization = await authorizeOperatorReadRequest(request);
  } catch (error) {
    if (error instanceof OperatorBffUnavailableError) return response({ error: "Operator service unavailable" }, 503);
    return response({ error: "Not found" }, 404);
  }
  if (!authorization) return response({ error: "Not found" }, 404);

  try {
    const { accountId } = await context.params;
    const inspection = await inspectSupabaseAccountAdministrationTarget({
      operatorAccountId: authorization.principal.accountId,
      targetAccountId: accountId,
    });
    return authorization.applyCookies(response(inspection, 200));
  } catch (error) {
    if (error instanceof AccountAdministrationError && error.code === "audit_incomplete") {
      return authorization.applyCookies(response({ error: "Account inspection unavailable" }, 503));
    }
    return authorization.applyCookies(response({ error: "Not found" }, 404));
  }
}
