import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createRequestSupabaseClient, supabaseConfigured } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const destination = new URL("/account/create-character", request.url);
  if (!supabaseConfigured()) return NextResponse.redirect(new URL("/account/sign-in?error=unavailable", request.url));
  const session = createRequestSupabaseClient(request);
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const code = request.nextUrl.searchParams.get("code");
  const result = tokenHash && type
    ? await session.client.auth.verifyOtp({ token_hash: tokenHash, type })
    : code
      ? await session.client.auth.exchangeCodeForSession(code)
      : { error: new Error("Confirmation token is missing") };
  return session.applyCookies(NextResponse.redirect(result.error ? new URL("/account/sign-in?error=confirmation", request.url) : destination));
}
