import { NextRequest, NextResponse } from "next/server";
import { characterErrorResponse } from "@/lib/character-api";
import { getAccountCharacterStore } from "@/lib/character-store";
import { accountServicesConfigured, resolveAccountSession } from "@/lib/account-session";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!accountServicesConfigured()) return NextResponse.json({ error: "Character services are disabled" }, { status: 503 });
  const session = await resolveAccountSession(request);
  const accountId = session.accountId;
  if (!accountId) return session.applyCookies(NextResponse.json({ error: "Authentication required" }, { status: 401 }));
  try {
    const { id } = await context.params;
    return session.applyCookies(NextResponse.json({ history: await (await getAccountCharacterStore(session.client)).historyFor(id, accountId) }));
  } catch (error) { return session.applyCookies(characterErrorResponse(error)); }
}
