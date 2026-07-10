"use client";

import { useEffect, useState } from "react";
import ReleaseCard from "@/components/ReleaseCard";
import { getSavedSlugs } from "@/lib/library";
import { RELEASES, type Release } from "@/lib/releases";

export default function LibraryPage() {
  const [saved, setSaved] = useState<Release[] | null>(null);

  useEffect(() => {
    const slugs = getSavedSlugs();
    setSaved(RELEASES.filter((release) => slugs.includes(release.slug)));
  }, []);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Library</h1>
        <p className="max-w-xl text-neutral-400">
          Releases you save live here. For now this is stored on this device —
          it moves to your character when accounts arrive.
        </p>
      </header>
      {saved === null ? null : saved.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {saved.map((release) => (
            <ReleaseCard key={release.slug} release={release} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-neutral-800 p-8 text-sm text-neutral-500">
          Nothing saved yet. Open any release and choose “Save to Library.”
        </p>
      )}
    </main>
  );
}
