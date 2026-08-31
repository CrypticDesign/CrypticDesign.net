import { NextRequest, NextResponse } from "next/server";
import { signOutSupabaseSession } from "@/lib/supabase/auth";
import { findAdmittedMember } from "@/lib/supabase/member-admission";
import { createRequestSupabaseClient, supabaseConfigured } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (!supabaseConfigured()) {
    return NextResponse.redirect(new URL("/account/sign-in?error=unavailable", request.url), 303);
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/account/sign-in?error=confirmation", request.url), 303);

  try {
    const session = createRequestSupabaseClient(request);
    const { data, error } = await session.client.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      return session.applyCookies(NextResponse.redirect(new URL("/account/sign-in?error=confirmation", request.url), 303));
    }
    const profile = await findAdmittedMember(session.client, data.user.id);
    if (profile.error || !profile.memberId) {
      await signOutSupabaseSession(session.client);
      const reason = profile.error ? "unavailable" : "admission";
      return session.applyCookies(NextResponse.redirect(new URL(`/account/sign-in?error=${reason}`, request.url), 303));
    }
    const destination = "/account/reset-password";
    return session.applyCookies(NextResponse.redirect(new URL(destination, request.url), 303));
  } catch {
    return NextResponse.redirect(new URL("/account/sign-in?error=confirmation", request.url), 303);
  }
}
