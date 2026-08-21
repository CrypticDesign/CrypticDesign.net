import { NextRequest, NextResponse } from "next/server";
import {
  ADMISSION_SESSION_COOKIE,
  ADMISSION_SESSION_MAX_AGE_SECONDS,
  createAdmissionSession,
  digestAdmissionToken,
} from "@/lib/admission";
import { admissionBackendConfigured, createServiceRoleSupabaseClient } from "@/lib/supabase/service";

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export async function POST(request: NextRequest) {
  if (!admissionBackendConfigured()) {
    return NextResponse.json({ error: "Invitations are not available yet." }, { status: 503 });
  }

  const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";
  const body = await request.json().catch(() => null) as { token?: unknown } | null;
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  if (!TOKEN_PATTERN.test(token) || !idempotencyKey || idempotencyKey.length > 128) {
    return NextResponse.json({ error: "This invitation cannot be accepted." }, { status: 400 });
  }

  try {
    const client = createServiceRoleSupabaseClient();
    const { data, error } = await client.rpc("exchange_admission_token", {
      p_token_digest: digestAdmissionToken(token),
      p_idempotency_key: idempotencyKey,
    });
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row || typeof row.invitation_id !== "string") {
      return NextResponse.json({ error: "This invitation cannot be accepted." }, { status: 409 });
    }
    const response = NextResponse.json({ accepted: true, next: "/account/subscription" });
    response.cookies.set(ADMISSION_SESSION_COOKIE, createAdmissionSession(row.invitation_id), {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      path: "/api/admission",
      maxAge: ADMISSION_SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invitation services are temporarily unavailable." }, { status: 503 });
  }
}
