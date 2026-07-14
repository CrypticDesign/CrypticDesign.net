import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCharacterStore } from "@/lib/character-store";
import { publicCharacter } from "@/lib/characters";
import { membershipSandboxEnabled } from "@/lib/membership-store";
import { requireSandboxMember } from "@/lib/sandbox-session";

export async function GET(request: NextRequest) {
  const accountId = requireSandboxMember(request);
  if (!accountId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const character = await getCharacterStore().findByOwner(accountId);
  return NextResponse.json({ character: character ? publicCharacter(character) : null });
}

export async function POST(request: NextRequest) {
  if (!membershipSandboxEnabled()) return NextResponse.json({ error: "Character sandbox is disabled" }, { status: 503 });
  const accountId = requireSandboxMember(request);
  if (!accountId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  try {
    const body = await request.json();
    const requestId = request.headers.get("idempotency-key") ?? randomUUID();
    const character = await getCharacterStore().create({ id: randomUUID(), accountId, name: body.name, archetype: body.archetype, bio: body.bio, affiliation: body.affiliation, requestId, occurredAt: new Date().toISOString() });
    return NextResponse.json({ character: publicCharacter(character) }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 400 }); }
}

