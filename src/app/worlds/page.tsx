import type { Metadata } from "next";
import Link from "next/link";
import { publicWorks } from "@/lib/works";

export const metadata: Metadata = {
  title: "Worlds",
  description: "Cryptic Design worlds and their connected works and releases.",
  alternates: { canonical: "/worlds" },
};

export default function WorldsPage() {
  const worlds = publicWorks().filter((work) => work.kind === "world");

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Worlds</h1>
        <p className="max-w-2xl text-muted-foreground">
          Worlds connect original works, releases, and future member
          experiences. Browsing stays open — characters only matter inside
          experiences that call for them.
        </p>
      </header>
      {worlds.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2">
          {worlds.map((world) => (
            <Link
              key={world.slug}
              href={`/creative-works/${world.slug}`}
              className="rounded-card border border-border bg-surface p-6 transition-colors hover:border-accent-magenta"
            >
              <h2 className="text-lg font-medium text-foreground">
                {world.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {world.summary}
              </p>
              <span className="mt-4 block text-xs uppercase tracking-wider text-muted-foreground">
                {world.releaseSlugs.length} connected release
                {world.releaseSlugs.length === 1 ? "" : "s"}
              </span>
            </Link>
          ))}
        </section>
      ) : (
        <p className="rounded-card border border-dashed border-border p-8 text-sm text-muted-foreground">
          The first rights-safe world entries are in review.
        </p>
      )}
    </main>
  );
}
