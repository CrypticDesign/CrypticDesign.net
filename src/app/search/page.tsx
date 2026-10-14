import type { Metadata } from "next";
import { Suspense } from "react";
import SearchExperience from "@/components/SearchExperience";
import { publicSearchIndex } from "@/lib/public-search-index";
import { socialMetadata } from "@/lib/social-metadata";

const description = "Search Cryptic Design's approved local public index of releases, worlds, articles, and professional services.";

export const metadata: Metadata = {
  title: "Search",
  description,
  alternates: { canonical: "/search" },
  ...socialMetadata({ title: "Search | Cryptic Design", description, url: "/search", image: "/share/search.png" }),
};

export default function SearchPage() {
  const records = publicSearchIndex();

  return (
    <main className="shell page-stack py-12 sm:py-16">
      <header className="max-w-4xl">
        <div className="signal-rail" />
        <span className="kicker">Utility / Public discovery</span>
        <h1 className="display-title mt-3">Search what is public now.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[var(--muted)]">
          Find approved public work without implying access to private accounts, inactive services, or future entitlements.
        </p>
      </header>

      <Suspense fallback={<div className="panel p-6 text-[var(--muted)]" aria-live="polite" aria-busy="true">Loading the local public index…</div>}>
        <SearchExperience records={records} />
      </Suspense>
    </main>
  );
}
