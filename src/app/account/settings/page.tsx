import type { Metadata } from "next";
import AccountFeatureIntro from "@/components/AccountFeatureIntro";
import { getInitialAccountAuthenticated } from "@/lib/server-account-state";

export const metadata: Metadata = {
  title: "Settings",
  alternates: { canonical: "/account/settings" },
  description: "Control your Cryptic Design identity, privacy, communication, and account preferences.",
};

export default async function SettingsPage() {
  const initialAuthenticated = await getInitialAccountAuthenticated();

  return (
    <main className="account-page account-feature-page">
      <AccountFeatureIntro
        accent="blue"
        eyebrow="Account settings"
        title="Make your account work for you."
        description="Choose what you share, which updates you receive, and how Cryptic Design works for you."
        image="/images/service-interface.png"
        imageAlt="A blue interface system visualization"
        benefits={[
          { title: "Private until you say otherwise", body: "Your identity and activity stay private unless you choose to share them." },
          { title: "Your preferences in one place", body: "Manage display, accessibility, communication, and personalization settings together." },
          { title: "Clear account controls", body: "Review your sign-in, subscription, personal data, and account status whenever you need to." },
        ]}
        steps={[
          { title: "Choose your settings", body: "Set your privacy, communication, display, and accessibility preferences." },
          { title: "See what will change", body: "We explain what each setting does before you save it." },
          { title: "Update them anytime", body: "Come back whenever your needs or subscription change." },
        ]}
        primaryAction={{ href: "/account/sign-in", label: "Sign in" }}
        secondaryAction={{ href: "/account", label: "Account overview" }}
        signedInPrimaryAction={{ href: "/account", label: "Account overview" }}
        signedInSecondaryAction={{ href: "/account/subscription", label: "View subscription" }}
        initialAuthenticated={initialAuthenticated}
        note="These settings are still being built. Nothing shown here will publish your information, start billing, or make your account public."
      />
    </main>
  );
}
