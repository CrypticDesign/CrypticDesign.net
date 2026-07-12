import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Creator Tools",
  description: "Governed creator pathways for work, releases, and collaboration.",
  alternates: { canonical: "/creator-tools" },
};

const PATHWAYS = [
  {
    title: "Collaboration",
    body: "Work with the studio on Singularis, Visual Studies, audio releases, and platform experiments - review-based and rights-first.",
  },
  {
    title: "Publishing pathways",
    body: "Approved collaborator work can route into governed releases on the platform. Every item carries rights, visibility, and publication status.",
  },
  {
    title: "Tooling previews",
    body: "Creator-facing tools and workflows are in development. Overviews will appear here before operational access opens.",
  },
] as const;

export default function CreatorToolsPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-white">Creator Tools</h1>
        <p className="max-w-2xl text-muted-foreground">
          The maker and collaborator side of CrypticDesign.net. V1 access is
          review-based: tell us who you are and what you want to make, and
          requests enter a browser-local review-queue placeholder - no open
          onboarding, no account required to apply, and no email delivery yet.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {PATHWAYS.map((pathway) => (
          <div
            key={pathway.title}
            className="flex flex-col gap-2 rounded-card border border-border bg-surface p-5"
          >
            <h2 className="font-medium text-foreground">{pathway.title}</h2>
            <p className="text-sm text-muted-foreground">{pathway.body}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3 rounded-card border border-border bg-surface p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Request access</h2>
        <p className="max-w-xl text-sm text-muted-foreground">
          Creators and collaborators can request access now. Requests are
          stored locally in this browser for V1; no collaboration or publishing
          begins automatically.
        </p>
        <Link
          href="/creator-tools/request"
          className="w-fit rounded-control bg-accent-cyan px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Start an access request
        </Link>
      </section>
    </main>
  );
}
