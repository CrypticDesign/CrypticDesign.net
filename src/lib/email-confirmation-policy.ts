import type { EmailOtpType } from "@supabase/supabase-js";

export type EmailConfirmationPolicy = {
  type: EmailOtpType;
  allowed: boolean;
  destination: "/account" | "/account/reset-password";
  kind: "account-security" | "admission-required";
};

const policies: Readonly<Record<EmailOtpType, EmailConfirmationPolicy>> = {
  email: { type: "email", allowed: false, destination: "/account", kind: "admission-required" },
  email_change: { type: "email_change", allowed: true, destination: "/account", kind: "account-security" },
  invite: { type: "invite", allowed: false, destination: "/account", kind: "admission-required" },
  magiclink: { type: "magiclink", allowed: false, destination: "/account", kind: "admission-required" },
  recovery: { type: "recovery", allowed: true, destination: "/account/reset-password", kind: "account-security" },
  signup: { type: "signup", allowed: false, destination: "/account", kind: "admission-required" },
};

export function resolveEmailConfirmationPolicy(value: string): EmailConfirmationPolicy | null {
  return Object.prototype.hasOwnProperty.call(policies, value)
    ? policies[value as EmailOtpType]
    : null;
}
