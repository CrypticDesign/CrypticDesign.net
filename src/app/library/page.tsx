"use client";

import { useEffect, useState } from "react";

import ReleaseCard from "@/components/ReleaseCard";
import AccountFeatureIntro from "@/components/AccountFeatureIntro";
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

  if (saved === null) return <main className="account-page"><p className="ui-loading account-access-card" aria-busy="true">Loading your saved releases…</p></main>;

  if (saved.length === 0) return (
    <main className="account-page account-feature-page">
      <AccountFeatureIntro
        accent="cyan"
        eyebrow="Personal collection · Library"
        title="Keep the signals worth returning to."
        description="Your Library is the personal layer of Cryptic Design—a focused collection of releases, research, worlds, sounds, and experiences you want to revisit."
        image="/images/entertainment-feature.png"
        imageAlt="A cinematic Cryptic Design entertainment scene"
        benefits={[
          { title: "A collection with continuity", body: "Keep releases and references organized around your interests instead of losing them between visits." },
          { title: "Member access in one place", body: "See which saved experiences are public, account-based, or available through your membership." },
          { title: "Return where you left off", body: "Use your account as the foundation for future history, progress, and cross-device continuity." },
        ]}
        steps={[
          { title: "Explore", body: "Browse Entertainment, articles, products, and original releases." },
          { title: "Save", body: "Choose Save to Library on anything you want to keep close." },
          { title: "Return", body: "Come back here to continue exploring your personal collection." },
        ]}
        primaryAction={{ href: "/entertainment", label: "Explore releases" }}
        secondaryAction={{ href: viewer.authenticated ? "/account/subscription" : "/account/sign-in", label: viewer.authenticated ? "Explore membership" : "Sign in" }}
        note="Device saves work without a subscription. Account syncing, persistent history, and entitlement-based access are planned subscriber capabilities and are not active yet."
      />
    </main>
  );

  return (
    <main className="account-page account-feature-page">
      <header className="account-collection-header">
        <div><span className="eyebrow">Personal collection</span><h1 className="display-title">Library</h1><p>Saved releases remain visible even when member access is locked. Saves currently stay on this device.</p></div>
        <aside><strong>{saved.length.toString().padStart(2, "0")}</strong><span>Saved signals</span></aside>
      </header>
      <section aria-labelledby="saved-library-title">
        <div className="section-heading"><div><span className="eyebrow">Saved &amp; recent</span><h2 id="saved-library-title" className="section-title">Your collection</h2></div><p>Subscriber access is evaluated per release; public items remain available to everyone.</p></div>
        <div className="media-grid">
          {saved.map((release) => <ReleaseCard key={release.slug} release={release} accessDecision={evaluateReleaseAccess(release, viewer)} />)}
        </div>
      </section>
    </main>
  );
}
