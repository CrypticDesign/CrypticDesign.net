import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAccountCharacterStore } from "@/lib/character-store";
import { characterErrorResponse } from "@/lib/character-api";
import { characterProfile } from "@/lib/characters";
import { accountServicesConfigured, resolveAccountSession } from "@/lib/account-session";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!accountServicesConfigured()) return NextResponse.json({ error: "Character services are disabled" }, { status: 503 });
  const session = await resolveAccountSession(request);
  const accountId = session.accountId;
  if (!accountId) return session.applyCookies(NextResponse.json({ error: "Authentication required" }, { status: 401 }));
  try {
    const [{ id }, body] = await Promise.all([context.params, request.json()]);
    const common = { characterId: id, accountId, requestId: request.headers.get("idempotency-key") ?? randomUUID(), occurredAt: new Date().toISOString() };
    const character = body.status === "active" || body.status === "retired"
      ? await (await getAccountCharacterStore(session.client)).setStatus({ ...common, status: body.status })
      : await (await getAccountCharacterStore(session.client)).update({ ...common, name: body.name, handle: body.handle, archetype: body.archetype, bio: body.bio, portraitUrl: body.portraitUrl, avatarRecipe: body.avatarRecipe, affiliation: body.affiliation, presence: body.presence, discoverable: body.discoverable, visibility: body.visibility, publicationConsent: body.publicationConsent });
    return session.applyCookies(NextResponse.json({ character: characterProfile(character) }));
  } catch (error) { return session.applyCookies(characterErrorResponse(error)); }
}
