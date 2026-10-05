import { NextRequest, NextResponse } from "next/server";
import { AccountAdministrationError } from "@/lib/account-administration";
import { listSupabaseAccountAdministrationInspectionHistory } from "@/lib/account-administration-inspection-history-supabase";
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

function readQuery(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (
    Array.from(params.keys()).some((key) => key !== "limit" && key !== "targetAccountId" && key !== "cursor") ||
    params.getAll("limit").length > 1 ||
    params.getAll("targetAccountId").length > 1 ||
    params.getAll("cursor").length > 1
  ) throw new AccountAdministrationError("Unsupported inspection history query", "invalid");

  const limit = params.get("limit");
  if (limit !== null && !/^(?:[1-9]|[1-9][0-9]|100)$/.test(limit)) {
    throw new AccountAdministrationError("Inspection history limit must be between 1 and 100", "invalid");
  }
  return {
    limit: limit === null ? 50 : Number(limit),
    targetAccountId: params.get("targetAccountId"),
    cursor: params.get("cursor"),
  };
}

export async function GET(request: NextRequest) {
  let authorization;
  try {
    authorization = await authorizeOperatorReadRequest(request);
  } catch (error) {
    if (error instanceof OperatorBffUnavailableError) return response({ error: "Operator service unavailable" }, 503);
    return response({ error: "Not found" }, 404);
  }
  if (!authorization) return response({ error: "Not found" }, 404);

  try {
    const query = readQuery(request);
    const history = await listSupabaseAccountAdministrationInspectionHistory({
      operatorAccountId: authorization.principal.accountId,
      targetAccountId: query.targetAccountId,
      cursor: query.cursor,
      limit: query.limit,
    });
    return authorization.applyCookies(response(history, 200));
  } catch (error) {
    const status = error instanceof AccountAdministrationError && error.code === "invalid" ? 400 : 503;
    const message = status === 400 ? "Invalid request" : "Inspection history unavailable";
    return authorization.applyCookies(response({ error: message }, status));
  }
}
