import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { createRequestSupabaseClient, supabaseConfigured } from "@/lib/supabase/server";

const confirmationTypes = new Set<EmailOtpType>([
  "email",
  "email_change",
  "invite",
  "magiclink",
  "recovery",
  "signup",
]);

export async function POST(request: NextRequest) {
  if (!supabaseConfigured()) {
    return NextResponse.redirect(new URL("/account/sign-in?error=unavailable", request.url), 303);
  }

  const form = await request.formData();
  const tokenHash = form.get("token_hash");
  const requestedType = form.get("type");
  const type =
    typeof requestedType === "string" &&
    confirmationTypes.has(requestedType as EmailOtpType)
      ? (requestedType as EmailOtpType)
      : null;

  if (typeof tokenHash !== "string" || !tokenHash || !type) {
    return NextResponse.redirect(new URL("/account/sign-in?error=confirmation", request.url), 303);
  }

  const session = createRequestSupabaseClient(request);
  const result = await session.client.auth.verifyOtp({ token_hash: tokenHash, type });
  const destination = result.error
    ? new URL("/account/sign-in?error=confirmation", request.url)
    : new URL("/account/create-character", request.url);

  return session.applyCookies(NextResponse.redirect(destination, 303));
}
