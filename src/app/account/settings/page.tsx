import type { Metadata } from "next";
import AccountFeatureIntro from "@/components/AccountFeatureIntro";

export const metadata: Metadata = {
  title: "Settings",
  alternates: { canonical: "/account/settings" },
  description: "Control your Cryptic Design identity, privacy, communication, and account preferences.",
};

export default function SettingsPage() {
  return (
    <main className="account-page account-feature-page">
      <AccountFeatureIntro
        accent="blue"
        eyebrow="Control center · Settings"
        title="Your account. Your boundaries."
        description="Settings is where you shape how Cryptic Design recognizes you, protects your information, and communicates with you across connected experiences."
        image="/images/service-interface.png"
        imageAlt="A blue interface system visualization"
        benefits={[
          { title: "Privacy by default", body: "Keep identity and activity private until you explicitly choose a different visibility level." },
          { title: "One place for preferences", body: "Manage presentation, accessibility, communication, and future personalization controls together." },
          { title: "Visible account control", body: "Review sign-in, subscription, data, and lifecycle settings without hidden commercial states." },
        ]}
        steps={[
          { title: "Choose defaults", body: "Set privacy, communication, display, and accessibility preferences." },
          { title: "Review changes", body: "Understand what each setting affects before it changes your account experience." },
          { title: "Stay in control", body: "Return whenever your boundaries, needs, or subscription status change." },
        ]}
        primaryAction={{ href: "/account/sign-in", label: "Sign in" }}
        secondaryAction={{ href: "/account", label: "Account overview" }}
        note="Account controls are being completed with the production identity backend. No preference shown here should silently publish data, activate billing, or expand account visibility."
      />
    </main>
  );
}
