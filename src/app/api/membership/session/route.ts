import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { membershipSandboxEnabled } from "@/lib/membership-store";
import { createSandboxSession, requireSandboxMember, SANDBOX_SESSION_COOKIE } from "@/lib/sandbox-session";

export async function GET(request: NextRequest) {
  if (!membershipSandboxEnabled()) return NextResponse.json({ authenticated: false, error: "Membership sandbox is disabled" }, { status: 503 });
  const memberId = requireSandboxMember(request);
  return NextResponse.json({ authenticated: Boolean(memberId), memberId });
}

export async function POST() {
  if (!membershipSandboxEnabled()) return NextResponse.json({ error: "Membership sandbox is disabled" }, { status: 503 });
  const memberId = `member_local_${randomUUID()}`;
  const response = NextResponse.json({ authenticated: true, memberId });
  response.cookies.set(SANDBOX_SESSION_COOKIE, createSandboxSession(memberId), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(SANDBOX_SESSION_COOKIE, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
