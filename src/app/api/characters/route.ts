import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAccountCharacterStore } from "@/lib/character-store";
import { characterErrorResponse } from "@/lib/character-api";
import { characterProfile } from "@/lib/characters";
import { accountServicesConfigured, resolveAccountSession } from "@/lib/account-session";

export async function GET(request: NextRequest) {
  if (!accountServicesConfigured()) return NextResponse.json({ error: "Character services are disabled" }, { status: 503 });
  const session = await resolveAccountSession(request);
  if (!session.accountId) return session.applyCookies(NextResponse.json({ error: "Authentication required" }, { status: 401 }));
  const character = await (await getAccountCharacterStore(session.client)).findByOwner(session.accountId);
  return session.applyCookies(NextResponse.json({ character: character ? characterProfile(character) : null }));
}

export async function POST(request: NextRequest) {
  if (!accountServicesConfigured()) return NextResponse.json({ error: "Character services are disabled" }, { status: 503 });
  const session = await resolveAccountSession(request);
  const accountId = session.accountId;
  if (!accountId) return session.applyCookies(NextResponse.json({ error: "Authentication required" }, { status: 401 }));
  try {
    const body = await request.json();
    const requestId = request.headers.get("idempotency-key") ?? randomUUID();
    const character = await (await getAccountCharacterStore(session.client)).create({ id: randomUUID(), accountId, name: body.name, handle: body.handle, archetype: body.archetype, bio: body.bio, portraitUrl: body.portraitUrl, avatarRecipe: body.avatarRecipe, affiliation: body.affiliation, presence: body.presence, discoverable: body.discoverable, visibility: body.visibility, publicationConsent: body.publicationConsent, requestId, occurredAt: new Date().toISOString() });
    return session.applyCookies(NextResponse.json({ character: characterProfile(character) }, { status: 201 }));
  } catch (error) { return session.applyCookies(characterErrorResponse(error)); }
}
