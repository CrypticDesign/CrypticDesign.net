import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { resolveEmailConfirmationPolicy } from "@/lib/email-confirmation-policy";
import { createRequestSupabaseClient, supabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!supabaseConfigured()) {
    return NextResponse.redirect(new URL("/account/sign-in?error=unavailable", request.url), 303);
  }

  const form = await request.formData();
  const tokenHash = form.get("token_hash");
  const requestedType = form.get("type");
  const policy = typeof requestedType === "string"
    ? resolveEmailConfirmationPolicy(requestedType)
    : null;
  const type: EmailOtpType | null = policy?.type ?? null;

  if (typeof tokenHash !== "string" || !tokenHash || !type || !policy) {
    return NextResponse.redirect(new URL("/account/sign-in?error=confirmation", request.url), 303);
  }
  if (!policy.allowed) {
    return NextResponse.redirect(new URL("/account/sign-in?error=admission", request.url), 303);
  }

  const session = createRequestSupabaseClient(request);
  const result = await session.client.auth.verifyOtp({ token_hash: tokenHash, type });
  const destination = result.error
    ? new URL("/account/sign-in?error=confirmation", request.url)
    : new URL(policy.destination, request.url);

  return session.applyCookies(NextResponse.redirect(destination, 303));
}
