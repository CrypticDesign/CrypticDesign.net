import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  alternates: { canonical: "/search" },
  description: "Search Cryptic Design releases.",
};

export default function SearchPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Search</h1>
      <p className="max-w-xl text-neutral-400">
        Site-wide search across releases arrives with the basic search release
        (CRY-259).
      </p>
      <input
        type="search"
        disabled
        placeholder="Search releases — coming soon"
        className="max-w-md rounded border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-neutral-400 placeholder:text-neutral-600"
      />
    </main>
  );
}
