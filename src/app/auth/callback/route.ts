import { NextRequest, NextResponse } from "next/server";
import { createRequestSupabaseClient, supabaseConfigured } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (!supabaseConfigured()) {
    return NextResponse.redirect(new URL("/account/sign-in?error=unavailable", request.url), 303);
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/account/sign-in?error=confirmation", request.url), 303);

  try {
    const session = createRequestSupabaseClient(request);
    const { error } = await session.client.auth.exchangeCodeForSession(code);
    const destination = error ? "/account/sign-in?error=confirmation" : "/account/reset-password";
    return session.applyCookies(NextResponse.redirect(new URL(destination, request.url), 303));
  } catch {
    return NextResponse.redirect(new URL("/account/sign-in?error=confirmation", request.url), 303);
  }
}
