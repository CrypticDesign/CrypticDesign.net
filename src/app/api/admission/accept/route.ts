import { NextRequest, NextResponse } from "next/server";

import {
  admissionAcceptanceConfigured,
  admissionDisplayName,
  parseAdmissionAcceptance,
  validAdmissionIdempotencyKey,
} from "@/lib/admission-acceptance";
import { normalizeAdmissionEmail } from "@/lib/admission";
import { createRequestSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!admissionAcceptanceConfigured()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const idempotencyKey = request.headers.get("idempotency-key");
  if (!validAdmissionIdempotencyKey(idempotencyKey)) {
    return NextResponse.json({ error: "A valid Idempotency-Key is required" }, { status: 400 });
  }

  try {
    const session = createRequestSupabaseClient(request);
    const { data, error } = await session.client.auth.getUser();
    if (error || !data.user?.email) {
      return session.applyCookies(NextResponse.json({ error: "Authentication required" }, { status: 401 }));
    }

    const email = normalizeAdmissionEmail(data.user.email);
    const displayName = admissionDisplayName(data.user.user_metadata as Record<string, unknown>, email);
    const service = createServiceRoleSupabaseClient();
    const result = await service.rpc("accept_admission_invitation", {
      p_account_id: data.user.id,
      p_normalized_email: email,
      p_display_name: displayName,
      p_idempotency_key: idempotencyKey,
    });
    const accepted = result.error ? null : parseAdmissionAcceptance(result.data);
    if (!accepted) {
      const authorityDenied = result.error && ["22023", "23505", "42501"].includes(result.error.code ?? "");
      return session.applyCookies(NextResponse.json(
        { error: "Account access could not be accepted" },
        { status: authorityDenied ? 403 : 503 },
      ));
    }

    return session.applyCookies(NextResponse.json(
      { accepted: true, memberId: accepted.memberId, subscriptionId: accepted.subscriptionId },
      { headers: { "cache-control": "no-store" } },
    ));
  } catch {
    return NextResponse.json({ error: "Account access is temporarily unavailable" }, { status: 503 });
  }
}
