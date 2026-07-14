import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCharacterStore } from "@/lib/character-store";
import { characterErrorResponse } from "@/lib/character-api";
import { characterProfile } from "@/lib/characters";
import { membershipSandboxEnabled } from "@/lib/membership-store";
import { requireSandboxMember } from "@/lib/sandbox-session";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!membershipSandboxEnabled()) return NextResponse.json({ error: "Character sandbox is disabled" }, { status: 503 });
  const accountId = requireSandboxMember(request);
  if (!accountId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  try {
    const [{ id }, body] = await Promise.all([context.params, request.json()]);
    const common = { characterId: id, accountId, requestId: request.headers.get("idempotency-key") ?? randomUUID(), occurredAt: new Date().toISOString() };
    const character = body.status === "active" || body.status === "retired"
      ? await getCharacterStore().setStatus({ ...common, status: body.status })
      : await getCharacterStore().update({ ...common, name: body.name, handle: body.handle, archetype: body.archetype, bio: body.bio, portraitUrl: body.portraitUrl, avatarRecipe: body.avatarRecipe, affiliation: body.affiliation, presence: body.presence, discoverable: body.discoverable, visibility: body.visibility, publicationConsent: body.publicationConsent });
    return NextResponse.json({ character: characterProfile(character) });
  } catch (error) { return characterErrorResponse(error); }
}
