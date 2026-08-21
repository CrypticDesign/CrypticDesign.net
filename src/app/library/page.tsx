"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ReleaseCard from "@/components/ReleaseCard";
import AccountSectionHero from "@/components/AccountSectionHero";
import { getSavedSlugs, toggleSaved } from "@/lib/library";
import { evaluateReleaseAccess, publicReleases, type Release } from "@/lib/releases";

export default function LibraryPage() {
  const [saved, setSaved] = useState<Release[] | null>(null);
  const [viewer, setViewer] = useState<{ authenticated: boolean; entitlements: string[] }>({ authenticated: false, entitlements: [] });
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | Release["kind"]>("all");
  const [sort, setSort] = useState<"recent" | "title" | "type">("recent");

  useEffect(() => {
    const slugs = getSavedSlugs();
    setSaved(publicReleases().filter((release) => slugs.includes(release.slug)));
    Promise.all([
      fetch("/api/membership/session", { cache: "no-store" }).then(async (response) => response.ok ? response.json() : null),
      fetch("/api/membership/subscriptions", { cache: "no-store" }).then(async (response) => response.ok ? response.json() : null),
    ])
      .then(([session, membership]: [{ authenticated?: boolean } | null, { entitlements?: string[] } | null]) => {
        setViewer({ authenticated: Boolean(session?.authenticated), entitlements: membership?.entitlements ?? [] });
      })
      .catch(() => setViewer({ authenticated: false, entitlements: [] }))
      .finally(() => setSessionLoaded(true));
  }, []);

  const visibleSaved = useMemo(() => {
    if (!saved) return [];
    const filtered = typeFilter === "all" ? saved : saved.filter((release) => release.kind === typeFilter);
    if (sort === "title") return [...filtered].sort((left, right) => left.title.localeCompare(right.title));
    if (sort === "type") return [...filtered].sort((left, right) => left.kind.localeCompare(right.kind) || left.title.localeCompare(right.title));
    return [...filtered].reverse();
  }, [saved, sort, typeFilter]);

  function removeRelease(slug: string) {
    if (getSavedSlugs().includes(slug)) toggleSaved(slug);
    setSaved((current) => current?.filter((release) => release.slug !== slug) ?? []);
  }

  if (saved === null || !sessionLoaded) return <main className="account-page"><p className="ui-loading account-access-card" aria-busy="true">Loading My Library…</p></main>;

  if (!viewer.authenticated) return (
    <main className="account-page account-operational-page">
      <section className="account-state-message"><span className="eyebrow">My Library</span><h1>Sign in to open My Library</h1><p>My Library is a private account utility. Public releases remain available without an account.</p><Link href="/account/sign-in" className="button">Sign in</Link></section>
    </main>
  );

  if (saved.length === 0) return (
    <main className="account-section-page">
      <AccountSectionHero
        eyebrow="Account / collection / library"
        title="My Library"
        description="Keep saved releases, articles, worlds, and music together in a personal collection on this device."
        image="/images/entertainment-hero.png"
        imageAlt="A cinematic digital iris representing a personal media collection"
      />
      <div className="shell page-stack account-section-page__body">
        <section className="account-control-section" aria-labelledby="empty-library-title">
          <header className="account-section-heading"><div><span className="eyebrow">Personal collection</span><h2 id="empty-library-title">Save what you want to come back to.</h2></div><p>Saved items currently stay on this device. Cross-device account syncing is not active.</p></header>
          <div className="account-empty-state"><strong>Your library is ready.</strong><p>Explore public releases and choose Save to Library on anything you want to keep close.</p><div className="account-action-row"><Link href="/entertainment" className="button">Explore releases</Link><Link href="/account" className="button secondary">Account overview</Link></div></div>
        </section>
        <section className="account-control-section" aria-labelledby="library-model-title">
          <header className="account-section-heading"><div><span className="eyebrow">How it works</span><h2 id="library-model-title">Explore. Save. Return.</h2></div></header>
          <div className="account-utility-grid">
            <article><span className="eyebrow">01 / Explore</span><h3>Find public work</h3><p>Browse Entertainment, articles, products, and original releases.</p></article>
            <article><span className="eyebrow">02 / Save</span><h3>Build your collection</h3><p>Choose Save to Library on anything you want to keep close.</p></article>
            <article><span className="eyebrow">03 / Return</span><h3>Manage saved work</h3><p>Come back here to filter, sort, open, or remove saved releases.</p></article>
          </div>
        </section>
      </div>
    </main>
  );

  return (
    <main className="account-section-page">
      <AccountSectionHero
        eyebrow="Account / collection / library"
        title="My Library"
        description="Saved releases remain visible even when member access is locked. Your collection currently stays on this device."
        image="/images/entertainment-hero.png"
        imageAlt="A cinematic digital iris representing a personal media collection"
        aside={<div className="account-section-hero__stat"><strong>{saved.length.toString().padStart(2, "0")}</strong><span>Saved releases</span></div>}
      />
      <div className="shell page-stack account-section-page__body">
      <section className="account-control-section" aria-labelledby="saved-library-title">
        <div className="section-heading"><div><span className="eyebrow">Saved &amp; recent</span><h2 id="saved-library-title" className="section-title">Your collection</h2></div><p>Filter, sort, open, or remove saved releases.</p></div>
        <div className="library-controls" aria-label="Library filters">
          <label>Media type<select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}><option value="all">All types</option><option value="article">Articles</option><option value="audio">Audio</option><option value="game">Games</option><option value="lab">Labs</option><option value="video">Video</option></select></label>
          <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="recent">Recently saved</option><option value="title">Title</option><option value="type">Media type</option></select></label>
        </div>
        {visibleSaved.length ? <div className="library-account-grid">
          {visibleSaved.map((release) => <article key={release.slug} className="library-account-item"><ReleaseCard release={release} accessDecision={evaluateReleaseAccess(release, viewer)} /><button type="button" className="button secondary" onClick={() => removeRelease(release.slug)} aria-label={`Remove ${release.title} from My Library`}>Remove saved release</button></article>)}
        </div> : <div className="account-empty-state"><strong>No saved items match this filter.</strong><p>Choose another media type or explore public releases.</p></div>}
      </section>
      </div>
    </main>
  );
}
