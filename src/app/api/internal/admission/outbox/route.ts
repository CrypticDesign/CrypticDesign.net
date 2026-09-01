import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  admissionWorkerConfigured,
  authorizeAdmissionWorker,
  processAdmissionOutboxBatch,
  type AdmissionWorkerDependencies,
} from "@/lib/admission-worker";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

function createDependencies(): AdmissionWorkerDependencies {
  const client = createServiceRoleSupabaseClient();
  return {
    claim: async (workerId, limit) => await client.rpc("claim_admission_outbox", { p_worker_id: workerId, p_limit: limit }),
    completeInvite: async (outboxId, authUserId, resultCode) => await client.rpc("complete_admission_auth_invite", {
      p_outbox_id: outboxId, p_auth_user_id: authUserId, p_result_code: resultCode,
    }),
    completeDisable: async (outboxId, resultCode) => await client.rpc("complete_admission_auth_disable", {
      p_outbox_id: outboxId, p_result_code: resultCode,
    }),
    fail: async (outboxId, resultCode, retryable) => await client.rpc("fail_admission_outbox", {
      p_outbox_id: outboxId, p_result_code: resultCode, p_retryable: retryable,
    }),
    listUsers: async (page, perPage) => {
      const { data, error } = await client.auth.admin.listUsers({ page, perPage });
      return { users: data.users, nextPage: "nextPage" in data ? data.nextPage : null, error };
    },
    getUser: async (userId) => {
      const { data, error } = await client.auth.admin.getUserById(userId);
      return { user: data.user, error };
    },
    invite: async (email, invitationId, redirectTo) => {
      const { data, error } = await client.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data: { admission_invitation_id: invitationId },
      });
      return { user: data.user, error };
    },
    disable: async (userId) => {
      const { error } = await client.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
      return { error };
    },
  };
}

export async function POST(request: Request) {
  if (!admissionWorkerConfigured()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!authorizeAdmissionWorker(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const requestedLimit = Number(url.searchParams.get("limit") ?? "5");
    const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(10, Math.trunc(requestedLimit))) : 5;
    const summary = await processAdmissionOutboxBatch(createDependencies(), {
      workerId: randomUUID(),
      limit,
      redirectTo: process.env.ADMISSION_INVITE_REDIRECT_URL!.trim(),
    });
    return NextResponse.json(summary, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Worker unavailable" }, { status: 503 });
  }
}
