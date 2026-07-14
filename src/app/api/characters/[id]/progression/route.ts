import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCharacterStore } from "@/lib/character-store";
import { membershipSandboxEnabled } from "@/lib/membership-store";
import { getProgressionStore } from "@/lib/progression-store";
import { QUALIFYING_ACTIVITY_TYPES, type QualifyingActivityType } from "@/lib/progression";
import { requireSandboxMember } from "@/lib/sandbox-session";

async function ownedActiveCharacter(request: NextRequest, id: string) {
  const accountId = requireSandboxMember(request);
  if (!accountId) return { error: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  const character = await getCharacterStore().findByOwner(accountId);
  if (!character || character.id !== id) return { error: NextResponse.json({ error: "Character not found" }, { status: 404 }) };
  return { accountId, character };
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!membershipSandboxEnabled()) return NextResponse.json({ error: "Progression sandbox is disabled" }, { status: 503 });
  const { id } = await context.params; const ownership = await ownedActiveCharacter(request, id);
  if ("error" in ownership) return ownership.error;
  return NextResponse.json({ progression: await getProgressionStore().snapshot(id) });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!membershipSandboxEnabled()) return NextResponse.json({ error: "Progression sandbox is disabled" }, { status: 503 });
  const { id } = await context.params; const ownership = await ownedActiveCharacter(request, id);
  if ("error" in ownership) return ownership.error;
  if (ownership.character.status !== "active") return NextResponse.json({ error: "Only active characters can receive progression" }, { status: 409 });
  try {
    const body = await request.json(); const requestId = request.headers.get("idempotency-key") ?? randomUUID(); const now = new Date().toISOString();
    const entry = body.action === "reverse"
      ? await getProgressionStore().reverse({ characterId: id, accountId: ownership.accountId, entryId: body.entryId, requestId, recordedAt: now })
      : QUALIFYING_ACTIVITY_TYPES.includes(body.type as QualifyingActivityType)
        ? await getProgressionStore().recordActivity({ characterId: id, accountId: ownership.accountId, type: body.type, requestId, occurredAt: body.occurredAt ?? now, recordedAt: now })
        : null;
    if (!entry) return NextResponse.json({ error: "Activity type is not approved" }, { status: 422 });
    return NextResponse.json({ entry, progression: await getProgressionStore().snapshot(id) }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: /Idempotency|already reversed/.test((error as Error).message) ? 409 : 422 }); }
}
