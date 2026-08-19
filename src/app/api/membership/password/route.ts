import { NextRequest, NextResponse } from "next/server";
import { createRequestSupabaseClient, supabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Password changes are unavailable in this preview." }, { status: 503 });
  }

  let body: { password?: string; confirmation?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Password details must be valid JSON." }, { status: 400 });
  }

  const password = body.password ?? "";
  if (password.length < 8) return NextResponse.json({ error: "Use at least 8 characters." }, { status: 422 });
  if (password !== body.confirmation) return NextResponse.json({ error: "The passwords do not match." }, { status: 422 });

  try {
    const session = createRequestSupabaseClient(request);
    const { data, error: userError } = await session.client.auth.getUser();
    if (userError || !data.user) {
      return session.applyCookies(NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 401 }));
    }
    const { error } = await session.client.auth.updateUser({ password });
    if (error) return session.applyCookies(NextResponse.json({ error: "Your password could not be changed. Request a new reset link and try again." }, { status: 422 }));
    return session.applyCookies(NextResponse.json({ message: "Your password has been changed. You are signed in." }));
  } catch {
    return NextResponse.json({ error: "Password services could not be reached. Please try again." }, { status: 503 });
  }
}
