import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { membershipSandboxEnabled } from "@/lib/membership-store";
import { createSandboxSession, requireSandboxMember, SANDBOX_SESSION_COOKIE } from "@/lib/sandbox-session";
import { signOutSupabaseSession } from "@/lib/supabase/auth";
import { createRequestSupabaseClient, supabaseConfigured } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (supabaseConfigured()) {
    try {
      const session = createRequestSupabaseClient(request);
      const { data, error } = await session.client.auth.getUser();
      return session.applyCookies(NextResponse.json({ authenticated: !error && Boolean(data.user), memberId: data.user?.id ?? null, mode: "supabase" }));
    } catch {
      return NextResponse.json({ authenticated: false, error: "Account services are temporarily unavailable", mode: "supabase" }, { status: 503 });
    }
  }
  if (!membershipSandboxEnabled()) return NextResponse.json({ authenticated: false, error: "Membership sandbox is disabled" }, { status: 503 });
  const memberId = requireSandboxMember(request);
  return NextResponse.json({ authenticated: Boolean(memberId), memberId, mode: "sandbox" });
}

export async function POST(request: NextRequest) {
  if (supabaseConfigured()) {
    let body: { action?: string; email?: string; password?: string; displayName?: string };
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: "Account details must be valid JSON", mode: "supabase" }, { status: 400 }); }
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    if (!email || password.length < 8) return NextResponse.json({ error: "Enter a valid email and a password of at least 8 characters", mode: "supabase" }, { status: 422 });

    try {
      const session = createRequestSupabaseClient(request);
      if (body.action === "create") {
        const displayName = body.displayName?.trim();
        if (!displayName) return NextResponse.json({ error: "Display name is required", mode: "supabase" }, { status: 422 });
        const { data, error } = await session.client.auth.signUp({ email, password, options: { data: { display_name: displayName }, emailRedirectTo: `${request.nextUrl.origin}/auth/confirm` } });
        if (error) return session.applyCookies(NextResponse.json({ error: error.message, mode: "supabase" }, { status: 400 }));
        const authenticated = Boolean(data.session && data.user);
        return session.applyCookies(NextResponse.json({ authenticated, memberId: data.user?.id ?? null, mode: "supabase", message: authenticated ? "Your account is ready." : "Check your email to confirm your account, then sign in." }, { status: 201 }));
      }

      if (body.action === "sign-in") {
        const { data, error } = await session.client.auth.signInWithPassword({ email, password });
        if (error) return session.applyCookies(NextResponse.json({ error: "Email or password was not accepted", mode: "supabase" }, { status: 401 }));
        return session.applyCookies(NextResponse.json({ authenticated: true, memberId: data.user.id, mode: "supabase", message: "You are signed in." }));
      }

      return NextResponse.json({ error: "Unknown account action", mode: "supabase" }, { status: 422 });
    } catch {
      return NextResponse.json({ error: "Account services are temporarily unavailable", mode: "supabase" }, { status: 503 });
    }
  }
  if (!membershipSandboxEnabled()) return NextResponse.json({ error: "Membership sandbox is disabled" }, { status: 503 });
  const memberId = `member_local_${randomUUID()}`;
  const response = NextResponse.json({ authenticated: true, memberId, mode: "sandbox" });
  response.cookies.set(SANDBOX_SESSION_COOKIE, createSandboxSession(memberId), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  if (supabaseConfigured()) {
    try {
      const session = createRequestSupabaseClient(request);
      await signOutSupabaseSession(session.client);
      return session.applyCookies(NextResponse.json({ authenticated: false, mode: "supabase", message: "You are signed out." }));
    } catch {
      return NextResponse.json({ error: "Account services are temporarily unavailable", mode: "supabase" }, { status: 503 });
    }
  }
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(SANDBOX_SESSION_COOKIE, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
