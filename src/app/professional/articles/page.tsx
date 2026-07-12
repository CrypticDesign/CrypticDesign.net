import type { Metadata } from "next";
import Link from "next/link";
import ReleaseCard from "@/components/ReleaseCard";
import { publicReleases } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Articles & Research",
  alternates: { canonical: "/professional/articles" },
  description: "Writing and research from the Cryptic Design studio.",
};

export default function ArticlesPage() {
  const articles = publicReleases().filter((r) => r.kind === "article");
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Articles &amp; Research</h1>
        <p className="max-w-xl text-muted-foreground">
          Holistic UX practice, platform devlogs, and research notes.
        </p>
      </header>
      {articles.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {articles.map((r) => <ReleaseCard key={r.slug} release={r} />)}
        </div>
      ) : (
        <p className="rounded-card border border-dashed border-border p-8 text-sm text-muted-foreground">
          First articles are being prepared.
        </p>
      )}
      <Link href="/professional" className="text-sm text-accent-cyan hover:underline">← Professional Studio</Link>
    </main>
  );
}
