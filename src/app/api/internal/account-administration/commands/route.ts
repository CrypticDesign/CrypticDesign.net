import { NextResponse } from "next/server";
import { AccountAdministrationError } from "@/lib/account-administration";
import {
  authorizeAccountAdministrationInternalRequest,
  parseAccountAdministrationCommand,
  readAccountAdministrationInternalConfig,
} from "@/lib/account-administration-internal";
import { executeSupabaseAccountAdministrationCommand } from "@/lib/account-administration-supabase";

export const runtime = "nodejs";

function response(body: object, status: number) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const config = readAccountAdministrationInternalConfig();
  if (!config) return response({ error: "Not found" }, 404);
  if (!authorizeAccountAdministrationInternalRequest({
    authorization: request.headers.get("authorization"),
    origin: request.headers.get("origin"),
    secret: config.secret,
  })) return response({ error: "Unauthorized" }, 401);

  try {
    const command = parseAccountAdministrationCommand(await request.text());
    const outcome = await executeSupabaseAccountAdministrationCommand({
      operatorAccountId: config.operatorAccountId,
      command,
    });
    return response(outcome, outcome.status === "pending" ? 202 : 200);
  } catch (error) {
    if (error instanceof SyntaxError) return response({ error: "Invalid JSON" }, 400);
    if (error instanceof AccountAdministrationError) {
      const status = error.code === "forbidden" ? 403 : error.code === "conflict" ? 409 : error.code === "invalid" ? 400 : 503;
      return response({ error: error.message }, status);
    }
    if (error instanceof Error && ["Request body is too large", "Command must be an object", "Command shape is invalid"].includes(error.message)) {
      return response({ error: error.message }, 400);
    }
    return response({ error: "Account administration unavailable" }, 503);
  }
}
