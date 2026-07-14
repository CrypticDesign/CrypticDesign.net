import { NextRequest, NextResponse } from "next/server";
import { characterErrorResponse } from "@/lib/character-api";
import { getCharacterStore } from "@/lib/character-store";
import { membershipSandboxEnabled } from "@/lib/membership-store";
import { requireSandboxMember } from "@/lib/sandbox-session";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!membershipSandboxEnabled()) return NextResponse.json({ error: "Character sandbox is disabled" }, { status: 503 });
  const accountId = requireSandboxMember(request);
  if (!accountId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  try {
    const { id } = await context.params;
    return NextResponse.json({ history: await getCharacterStore().historyFor(id, accountId) });
  } catch (error) { return characterErrorResponse(error); }
}
