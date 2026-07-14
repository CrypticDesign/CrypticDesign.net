import { NextRequest, NextResponse } from "next/server";

import { SUBSCRIPTION_STATUSES, type SubscriptionStatus } from "@/lib/membership";
import { getMembershipStore, membershipSandboxEnabled } from "@/lib/membership-store";
import { requireSandboxMember } from "@/lib/sandbox-session";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!membershipSandboxEnabled()) return NextResponse.json({ error: "Membership sandbox is disabled" }, { status: 503 });
  const memberId = requireSandboxMember(request);
  if (!memberId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const requestId = request.headers.get("idempotency-key");
  if (!body || !SUBSCRIPTION_STATUSES.includes(body.status as SubscriptionStatus) || typeof body.reason !== "string" || !requestId) {
    return NextResponse.json({ error: "valid status, reason, and Idempotency-Key are required" }, { status: 400 });
  }
  try {
    const { id } = await context.params;
    const data = await getMembershipStore().read();
    if (!data.subscriptions.some((item) => item.id === id && item.memberId === memberId)) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }
    const result = await getMembershipStore().transition({
      subscriptionId: id,
      status: body.status as SubscriptionStatus,
      reason: body.reason,
      requestId,
      occurredAt: new Date().toISOString(),
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = (error as Error).message;
    return NextResponse.json({ error: message }, { status: message === "Subscription not found" ? 404 : 422 });
  }
}
