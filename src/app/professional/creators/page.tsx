import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contributing Creators",
  alternates: { canonical: "/professional/creators" },
  description: "The review-based path for creators and collaborators.",
};

export default function CreatorsPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Contributing Creators</h1>
      <p className="max-w-xl text-muted-foreground">
        Musicians, artists, writers, and developers can apply to publish
        governed work through the platform. Applications are reviewed
        individually — identity, portfolio, content type, and rights
        confirmation.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/creator-tools/request" className="rounded-control bg-accent-cyan px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90">
          Start a creator application
        </Link>
        <Link href="/professional" className="rounded-control border border-border px-5 py-2.5 text-sm text-foreground hover:border-neutral-500">
          ← Professional Studio
        </Link>
      </div>
    </main>
  );
}
