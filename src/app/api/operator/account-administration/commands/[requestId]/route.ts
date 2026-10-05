import { NextRequest, NextResponse } from "next/server";
import { inspectSupabaseAccountAdministrationCommandDiagnostics } from "@/lib/account-administration-diagnostics-supabase";
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
  context: { params: Promise<{ requestId: string }> },
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
    const { requestId } = await context.params;
    const diagnostics = await inspectSupabaseAccountAdministrationCommandDiagnostics({
      operatorAccountId: authorization.principal.accountId,
      requestId,
    });
    return authorization.applyCookies(response(diagnostics, 200));
  } catch {
    return authorization.applyCookies(response({ error: "Not found" }, 404));
  }
}
