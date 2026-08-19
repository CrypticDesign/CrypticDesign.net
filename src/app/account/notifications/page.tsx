import type { Metadata } from "next";
import AccountFeatureIntro from "@/components/AccountFeatureIntro";

export const metadata: Metadata = {
  title: "Notifications",
  alternates: { canonical: "/account/notifications" },
  description: "Follow release signals, account events, and relevant Cryptic Design platform updates.",
};

export default function NotificationsPage() {
  return (
    <main className="account-page account-feature-page">
      <AccountFeatureIntro
        accent="cyan"
        eyebrow="Notifications"
        title="Get the updates you actually want."
        description="Follow the projects you care about and get important account updates without filling your inbox with noise."
        image="/images/signal-systems.png"
        imageAlt="Blue signal waves moving through a dark system"
        benefits={[
          { title: "Updates on what you follow", body: "Hear when a saved release, world, or member preview is ready." },
          { title: "Important account notices", body: "See sign-in, subscription, privacy, and security updates in one place." },
          { title: "No unwanted messages", body: "Choose the updates you want. There are no open direct messages or unsolicited contact." },
        ]}
        steps={[
          { title: "Choose what to follow", body: "Select the projects, releases, and account updates you care about." },
          { title: "Open the update", body: "Each notification takes you to the release or account setting it is about." },
          { title: "Change your choices anytime", body: "Turn off optional updates without missing important account or security notices." },
        ]}
        primaryAction={{ href: "/account/sign-in", label: "Sign in" }}
        secondaryAction={{ href: "/account", label: "Account overview" }}
        note="Notifications are not active yet. Important account and security notices will stay separate from optional updates. Direct messaging is not planned."
      />
    </main>
  );
}
