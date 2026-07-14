import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { getMembershipStore, membershipSandboxEnabled } from "@/lib/membership-store";
import { resolveEntitlements } from "@/lib/membership";
import { requireSandboxMember } from "@/lib/sandbox-session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!membershipSandboxEnabled()) return NextResponse.json({ error: "Membership sandbox is disabled" }, { status: 503 });
  const memberId = requireSandboxMember(request);
  if (!memberId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const data = await getMembershipStore().read();
  const subscriptions = data.subscriptions.filter((item) => item.memberId === memberId);
  const ids = new Set(subscriptions.map((item) => item.id));
  return NextResponse.json({
    subscriptions,
    events: data.events.filter((item) => ids.has(item.subscriptionId)),
    entitlements: resolveEntitlements(subscriptions, data.tiers),
  });
}

export async function POST(request: NextRequest) {
  if (!membershipSandboxEnabled()) return NextResponse.json({ error: "Membership sandbox is disabled" }, { status: 503 });
  const memberId = requireSandboxMember(request);
  if (!memberId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const requestId = request.headers.get("idempotency-key");
  if (!body || typeof body.tierId !== "string" || typeof body.priceId !== "string" || !requestId) {
    return NextResponse.json({ error: "tierId, priceId, and Idempotency-Key are required" }, { status: 400 });
  }
  try {
    const subscription = await getMembershipStore().createSubscription({
      id: typeof body.id === "string" ? body.id : `sub_${randomUUID()}`,
      memberId,
      tierId: body.tierId,
      priceId: body.priceId,
      requestId,
      occurredAt: new Date().toISOString(),
    });
    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 422 });
  }
}
