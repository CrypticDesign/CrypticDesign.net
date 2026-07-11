import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Notifications",
  alternates: { canonical: "/account/notifications" },
  description: "Release alerts and platform messages.",
};

export default function NotificationsPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Notifications</h1>
      <p className="max-w-xl text-muted-foreground">
        Release alerts, room announcements, and platform messages arrive with
        accounts. Messaging stays strict and platform-owned — no open DMs.
      </p>
      <Link href="/account" className="text-sm text-accent-cyan hover:underline">← Account</Link>
    </main>
  );
}
