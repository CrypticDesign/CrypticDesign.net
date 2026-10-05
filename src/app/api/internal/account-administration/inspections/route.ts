import { NextResponse } from "next/server";
import { AccountAdministrationError } from "@/lib/account-administration";
import { listSupabaseAccountAdministrationInspectionHistory } from "@/lib/account-administration-inspection-history-supabase";
import {
  authorizeAccountAdministrationInternalRequest,
  readAccountAdministrationInternalConfig,
} from "@/lib/account-administration-internal";

export const runtime = "nodejs";

function response(body: object, status: number) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
}

function readQuery(request: Request): { limit: number; targetAccountId: string | null; cursor: string | null } {
  const params = new URL(request.url).searchParams;
  if (
    Array.from(params.keys()).some((key) => key !== "limit" && key !== "targetAccountId" && key !== "cursor") ||
    params.getAll("limit").length > 1 ||
    params.getAll("targetAccountId").length > 1 ||
    params.getAll("cursor").length > 1
  ) {
    throw new AccountAdministrationError("Unsupported inspection history query", "invalid");
  }
  const value = params.get("limit");
  if (value !== null && !/^(?:[1-9]|[1-9][0-9]|100)$/.test(value)) {
    throw new AccountAdministrationError("Inspection history limit must be between 1 and 100", "invalid");
  }
  return {
    limit: value === null ? 50 : Number(value),
    targetAccountId: params.get("targetAccountId"),
    cursor: params.get("cursor"),
  };
}

export async function GET(request: Request) {
  const config = readAccountAdministrationInternalConfig();
  if (!config) return response({ error: "Not found" }, 404);
  if (!authorizeAccountAdministrationInternalRequest({
    authorization: request.headers.get("authorization"),
    origin: request.headers.get("origin"),
    secret: config.secret,
  })) return response({ error: "Unauthorized" }, 401);

  try {
    const query = readQuery(request);
    const history = await listSupabaseAccountAdministrationInspectionHistory({
      operatorAccountId: config.operatorAccountId,
      targetAccountId: query.targetAccountId,
      cursor: query.cursor,
      limit: query.limit,
    });
    return response(history, 200);
  } catch (error) {
    if (error instanceof AccountAdministrationError) {
      const status = error.code === "forbidden" ? 403 : error.code === "invalid" ? 400 : 503;
      return response({ error: error.message }, status);
    }
    return response({ error: "Inspection history unavailable" }, 503);
  }
}
