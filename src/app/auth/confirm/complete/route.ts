import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { resolveEmailConfirmationPolicy } from "@/lib/email-confirmation-policy";
import { admissionAcceptanceConfigured } from "@/lib/admission-acceptance";
import { normalizeAdmissionEmail } from "@/lib/admission";
import { signOutSupabaseSession } from "@/lib/supabase/auth";
import { createRequestSupabaseClient, supabaseConfigured } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service";
import { canonicalSiteUrl } from "@/lib/site-origin";

export async function POST(request: NextRequest) {
  if (!supabaseConfigured()) {
    return NextResponse.redirect(canonicalSiteUrl("/account/sign-in?error=unavailable"), 303);
  }

  const form = await request.formData();
  const tokenHash = form.get("token_hash");
  const requestedType = form.get("type");
  const policy = typeof requestedType === "string"
    ? resolveEmailConfirmationPolicy(requestedType)
    : null;
  const type: EmailOtpType | null = policy?.type ?? null;

  if (typeof tokenHash !== "string" || !tokenHash || !type || !policy) {
    return NextResponse.redirect(canonicalSiteUrl("/account/sign-in?error=confirmation"), 303);
  }
  if (!policy.allowed) {
    return NextResponse.redirect(canonicalSiteUrl("/account/sign-in?error=admission"), 303);
  }
  if (policy.kind === "admission" && !admissionAcceptanceConfigured()) {
    return NextResponse.redirect(canonicalSiteUrl("/account/sign-in?error=admission"), 303);
  }

  const session = createRequestSupabaseClient(request);
  const result = await session.client.auth.verifyOtp({ token_hash: tokenHash, type });
  if (!result.error && policy.kind === "admission") {
    const user = result.data.user;
    if (!user?.email) {
      await signOutSupabaseSession(session.client);
      return session.applyCookies(NextResponse.redirect(canonicalSiteUrl("/account/sign-in?error=admission"), 303));
    }
    try {
      const readiness = await createServiceRoleSupabaseClient().rpc("admission_invite_ready", {
        p_account_id: user.id,
        p_normalized_email: normalizeAdmissionEmail(user.email),
      });
      if (!readiness.error && readiness.data === true) {
        const destination = canonicalSiteUrl(policy.destination);
        return session.applyCookies(NextResponse.redirect(destination, 303));
      }
    } catch {
      // Fail closed below if service-role configuration or the readiness check fails.
    }

    await signOutSupabaseSession(session.client);
    return session.applyCookies(NextResponse.redirect(canonicalSiteUrl("/account/sign-in?error=admission"), 303));
  }
  const destination = result.error
    ? canonicalSiteUrl("/account/sign-in?error=confirmation")
    : canonicalSiteUrl(policy.destination);

  return session.applyCookies(NextResponse.redirect(destination, 303));
}
