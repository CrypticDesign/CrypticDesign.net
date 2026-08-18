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
        eyebrow="Activity center · Notifications"
        title="Stay close to what matters."
        description="Notifications brings relevant release signals, account events, and experience updates into one controlled feed—without turning Cryptic Design into another noisy social inbox."
        image="/images/signal-systems.png"
        imageAlt="Blue signal waves moving through a dark system"
        benefits={[
          { title: "Release signals", body: "Know when followed worlds, saved releases, and member previews become available or meaningfully change." },
          { title: "Account awareness", body: "See important identity, access, subscription, and security events in a platform-owned record." },
          { title: "Deliberate communication", body: "Choose relevant categories and avoid open direct messages, unsolicited contact, and engagement noise." },
        ]}
        steps={[
          { title: "Choose signals", body: "Follow the projects, release types, and account events that matter to you." },
          { title: "Review in context", body: "Each notification routes back to the release, setting, or account event that created it." },
          { title: "Tune the feed", body: "Adjust categories or silence nonessential updates without losing critical account notices." },
        ]}
        primaryAction={{ href: "/account/sign-in", label: "Sign in" }}
        secondaryAction={{ href: "/account", label: "Account overview" }}
        note="Notifications are not active yet. Critical account and security notices will remain distinct from optional release and membership updates. Open direct messaging is not planned."
      />
    </main>
  );
}
