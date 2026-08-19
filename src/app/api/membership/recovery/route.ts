import { NextRequest, NextResponse } from "next/server";
import { createRequestSupabaseClient, supabaseConfigured } from "@/lib/supabase/server";

const GENERIC_RECOVERY_MESSAGE = "If that email belongs to an account, a reset link is on its way.";

export async function POST(request: NextRequest) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Recovery email is unavailable in this preview.", mode: "disabled" }, { status: 503 });
  }

  let body: { email?: string; captchaToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const captchaToken = body.captchaToken?.trim() ?? "";
  if (!email || !email.includes("@")) return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  if (!captchaToken) return NextResponse.json({ error: "Complete human verification before continuing." }, { status: 422 });

  try {
    const session = createRequestSupabaseClient(request);
    const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
    const redirectOrigin = configuredOrigin || request.nextUrl.origin;
    await session.client.auth.resetPasswordForEmail(email, {
      captchaToken,
      redirectTo: `${redirectOrigin}/auth/callback`,
    });
    return session.applyCookies(NextResponse.json({ message: GENERIC_RECOVERY_MESSAGE }, { status: 202 }));
  } catch {
    // The public response is deliberately identical so this endpoint cannot be used to discover accounts.
    return NextResponse.json({ message: GENERIC_RECOVERY_MESSAGE }, { status: 202 });
  }
}
