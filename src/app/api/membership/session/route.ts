import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import {
  ACCOUNT_ADMISSION_CLOSED_MESSAGE,
  PUBLIC_ACCOUNT_CREATION_AVAILABLE,
  accountAdmissionMode,
} from "@/lib/account-admission";
import { membershipSandboxEnabled, membershipSandboxPreferred } from "@/lib/membership-store";
import { createSandboxSession, requireSandboxMember, SANDBOX_SESSION_COOKIE } from "@/lib/sandbox-session";
import { signOutSupabaseSession } from "@/lib/supabase/auth";
import { findAdmittedMember } from "@/lib/supabase/member-admission";
import { createRequestSupabaseClient, supabaseConfigured } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (membershipSandboxPreferred()) {
    const memberId = requireSandboxMember(request);
    return NextResponse.json({ authenticated: Boolean(memberId), memberId, mode: "sandbox", accountCreationAvailable: true });
  }
  if (supabaseConfigured()) {
    try {
      const session = createRequestSupabaseClient(request);
      const { data, error } = await session.client.auth.getUser();
      const profile = !error && data.user
        ? await findAdmittedMember(session.client, data.user.id)
        : { memberId: null, error: false };
      if (profile.error) {
        return session.applyCookies(NextResponse.json({ authenticated: false, error: "Account services are temporarily unavailable", mode: "supabase", accountCreationAvailable: false }, { status: 503 }));
      }
      if (data.user && !profile.memberId) await signOutSupabaseSession(session.client);
      return session.applyCookies(NextResponse.json({
        authenticated: Boolean(profile.memberId),
        memberId: profile.memberId,
        mode: "supabase",
        accountAdmissionMode: accountAdmissionMode(),
        accountCreationAvailable: PUBLIC_ACCOUNT_CREATION_AVAILABLE,
      }));
    } catch {
      return NextResponse.json({ authenticated: false, error: "Account services are temporarily unavailable", mode: "supabase", accountCreationAvailable: false }, { status: 503 });
    }
  }
  if (!membershipSandboxEnabled()) return NextResponse.json({ authenticated: false, error: "Membership sandbox is disabled", accountCreationAvailable: false }, { status: 503 });
  const memberId = requireSandboxMember(request);
  return NextResponse.json({ authenticated: Boolean(memberId), memberId, mode: "sandbox", accountCreationAvailable: true });
}

export async function POST(request: NextRequest) {
  if (membershipSandboxPreferred()) return createSandboxResponse();
  if (supabaseConfigured()) {
    let body: { action?: string; email?: string; password?: string; captchaToken?: string };
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: "Account details must be valid JSON", mode: "supabase" }, { status: 400 }); }

    if (body.action === "create") {
      return NextResponse.json({
        error: ACCOUNT_ADMISSION_CLOSED_MESSAGE,
        code: "ACCOUNT_ADMISSION_CLOSED",
        mode: "supabase",
        accountAdmissionMode: accountAdmissionMode(),
        accountCreationAvailable: PUBLIC_ACCOUNT_CREATION_AVAILABLE,
      }, { status: 403 });
    }

    if (body.action !== "sign-in") {
      return NextResponse.json({ error: "Unknown account action", mode: "supabase" }, { status: 422 });
    }

    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    const captchaToken = body.captchaToken?.trim();
    if (!email || password.length < 8) return NextResponse.json({ error: "Enter a valid email and a password of at least 8 characters", mode: "supabase" }, { status: 422 });
    if (!captchaToken) return NextResponse.json({ error: "Complete human verification before continuing", mode: "supabase" }, { status: 422 });

    try {
      const session = createRequestSupabaseClient(request);
      const { data, error } = await session.client.auth.signInWithPassword({ email, password, options: { captchaToken } });
      if (error) return session.applyCookies(NextResponse.json({ error: "Email or password was not accepted", mode: "supabase" }, { status: 401 }));
      const profile = await findAdmittedMember(session.client, data.user.id);
      if (profile.error) {
        await signOutSupabaseSession(session.client);
        return session.applyCookies(NextResponse.json({ error: "Account services are temporarily unavailable", mode: "supabase" }, { status: 503 }));
      }
      if (!profile.memberId) {
        await signOutSupabaseSession(session.client);
        return session.applyCookies(NextResponse.json({
          error: "This identity has not been admitted as a member.",
          code: "ACCOUNT_ADMISSION_REQUIRED",
          mode: "supabase",
        }, { status: 403 }));
      }
      return session.applyCookies(NextResponse.json({ authenticated: true, memberId: profile.memberId, mode: "supabase", message: "You are signed in." }));
    } catch {
      return NextResponse.json({ error: "Account services are temporarily unavailable", mode: "supabase" }, { status: 503 });
    }
  }
  if (!membershipSandboxEnabled()) return NextResponse.json({ error: "Membership sandbox is disabled" }, { status: 503 });
  return createSandboxResponse();
}

function createSandboxResponse() {
  const memberId = `member_local_${randomUUID()}`;
  const response = NextResponse.json({ authenticated: true, memberId, mode: "sandbox", accountCreationAvailable: true });
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
  if (membershipSandboxPreferred()) return clearSandboxResponse();
  if (supabaseConfigured()) {
    try {
      const session = createRequestSupabaseClient(request);
      await signOutSupabaseSession(session.client);
      return session.applyCookies(NextResponse.json({ authenticated: false, mode: "supabase", message: "You are signed out." }));
    } catch {
      return NextResponse.json({ error: "Account services are temporarily unavailable", mode: "supabase" }, { status: 503 });
    }
  }
  return clearSandboxResponse();
}

function clearSandboxResponse() {
  const response = NextResponse.json({ authenticated: false, mode: "sandbox", message: "You are signed out." });
  response.cookies.set(SANDBOX_SESSION_COOKIE, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
