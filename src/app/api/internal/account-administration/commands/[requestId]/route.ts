import { NextResponse } from "next/server";
import { AccountAdministrationError } from "@/lib/account-administration";
import { inspectSupabaseAccountAdministrationCommandDiagnostics } from "@/lib/account-administration-diagnostics-supabase";
import {
  authorizeAccountAdministrationInternalRequest,
  readAccountAdministrationInternalConfig,
} from "@/lib/account-administration-internal";

export const runtime = "nodejs";

function response(body: object, status: number) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
}

export async function GET(request: Request, context: { params: Promise<{ requestId: string }> }) {
  const config = readAccountAdministrationInternalConfig();
  if (!config) return response({ error: "Not found" }, 404);
  if (!authorizeAccountAdministrationInternalRequest({
    authorization: request.headers.get("authorization"),
    origin: request.headers.get("origin"),
    secret: config.secret,
  })) return response({ error: "Unauthorized" }, 401);

  try {
    const { requestId } = await context.params;
    const diagnostics = await inspectSupabaseAccountAdministrationCommandDiagnostics({
      operatorAccountId: config.operatorAccountId,
      requestId,
    });
    return response(diagnostics, 200);
  } catch (error) {
    if (error instanceof AccountAdministrationError) {
      const status = error.code === "forbidden" ? 403 : error.code === "invalid" ? 404 : 503;
      return response({ error: error.message }, status);
    }
    return response({ error: "Command diagnostics unavailable" }, 503);
  }
}
