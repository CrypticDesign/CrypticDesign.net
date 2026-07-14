"use client";

import { useEffect, useState } from "react";

import ReleaseCard from "@/components/ReleaseCard";
import { getSavedSlugs } from "@/lib/library";
import { evaluateReleaseAccess, publicReleases, type Release } from "@/lib/releases";

export default function LibraryPage() {
  const [saved, setSaved] = useState<Release[] | null>(null);
  const [viewer, setViewer] = useState<{ authenticated: boolean; entitlements: string[] }>({ authenticated: false, entitlements: [] });

  useEffect(() => {
    const slugs = getSavedSlugs();
    setSaved(publicReleases().filter((release) => slugs.includes(release.slug)));
    fetch("/api/membership/subscriptions", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data: { entitlements?: string[] } | null) => {
        setViewer({ authenticated: Boolean(data), entitlements: data?.entitlements ?? [] });
      })
      .catch(() => setViewer({ authenticated: false, entitlements: [] }));
  }, []);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Library</h1>
        <p className="max-w-xl text-muted-foreground">
          Saved releases remain visible even when member access is locked. Saves stay on this device during the local framework phase.
        </p>
      </header>
      {saved === null ? <p className="ui-loading" aria-busy="true">Loading your saved releases…</p> : saved.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {saved.map((release) => (
            <ReleaseCard key={release.slug} release={release} accessDecision={evaluateReleaseAccess(release, viewer)} />
          ))}
        </div>
      ) : (
        <p className="rounded-card border border-dashed border-border p-8 text-sm text-muted-foreground">
          Nothing saved yet. Open any release and choose “Save to Library.”
        </p>
      )}
    </main>
  );
}
