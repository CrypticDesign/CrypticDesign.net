import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Creator Tools",
  description: "Governed creator pathways for work, releases, and collaboration.",
  alternates: { canonical: "/creator-tools" },
};

export default function CreatorToolsPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Creator Tools</h1>
      <p className="max-w-2xl text-neutral-400">
        Creator workflows will help collaborators prepare governed works and
        releases. Access remains review-based in V1.
      </p>
      <Link
        href="/professional"
        className="w-fit rounded-control border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-accent-cyan"
      >
        Explore professional collaboration
      </Link>
    </main>
  );
}
