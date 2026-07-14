import { NextResponse } from "next/server";

import { getMembershipStore, membershipSandboxEnabled } from "@/lib/membership-store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!membershipSandboxEnabled()) return NextResponse.json({ error: "Membership sandbox is disabled" }, { status: 503 });
  const data = await getMembershipStore().read();
  return NextResponse.json({ tiers: data.tiers, prices: data.prices });
}
