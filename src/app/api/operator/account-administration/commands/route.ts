import { NextRequest, NextResponse } from "next/server";
import {
  AccountAdministrationError,
  operatorCapabilityForAction,
} from "@/lib/account-administration";
import { parseAccountAdministrationCommand } from "@/lib/account-administration-internal";
import {
  authorizeOperatorCommandRequest,
  OperatorBffUnavailableError,
  operatorCommandsConfigured,
} from "@/lib/account-administration-operator-bff";
import { executeSupabaseAccountAdministrationCommand } from "@/lib/account-administration-supabase";

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
  if (!operatorCommandsConfigured()) return response({ error: "Not found" }, 404);

  let authorization;
  try {
    authorization = await authorizeOperatorCommandRequest(request, "account:inspect");
  } catch (error) {
    if (error instanceof OperatorBffUnavailableError) return response({ error: "Operator service unavailable" }, 503);
    return response({ error: "Not found" }, 404);
  }
  if (!authorization) return response({ error: "Not found" }, 404);

  let command;
  try {
    command = parseAccountAdministrationCommand(await request.text());
  } catch {
    return authorization.applyCookies(response({ error: "Invalid command" }, 400));
  }
  if (!authorization.principal.capabilities.includes(operatorCapabilityForAction(command.action))) {
    return authorization.applyCookies(response({ error: "Not found" }, 404));
  }

  try {
    const outcome = await executeSupabaseAccountAdministrationCommand({
      operatorAccountId: authorization.principal.accountId,
      command,
    });
    return authorization.applyCookies(response(outcome, outcome.status === "pending" ? 202 : 200));
  } catch (error) {
    if (error instanceof AccountAdministrationError) {
      const status = error.code === "invalid"
        ? 400
        : error.code === "conflict"
          ? 409
          : error.code === "audit_incomplete"
            ? 503
            : 404;
      return authorization.applyCookies(response({ error: "Command rejected" }, status));
    }
    return authorization.applyCookies(response({ error: "Operator service unavailable" }, 503));
  }
}
