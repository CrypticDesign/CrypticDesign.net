import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCharacterStore } from "@/lib/character-store";
import { publicCharacter } from "@/lib/characters";
import { membershipSandboxEnabled } from "@/lib/membership-store";
import { requireSandboxMember } from "@/lib/sandbox-session";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!membershipSandboxEnabled()) return NextResponse.json({ error: "Character sandbox is disabled" }, { status: 503 });
  const accountId = requireSandboxMember(request);
  if (!accountId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  try {
    const [{ id }, body] = await Promise.all([context.params, request.json()]);
    const character = await getCharacterStore().update({ characterId: id, accountId, name: body.name, archetype: body.archetype, bio: body.bio, affiliation: body.affiliation, requestId: request.headers.get("idempotency-key") ?? randomUUID(), occurredAt: new Date().toISOString() });
    return NextResponse.json({ character: publicCharacter(character) });
  } catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 404 }); }
}

