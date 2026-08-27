import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { arcadeEntriesFor, type ArcadeEntry } from "@/lib/arcade";
import { arcadeCategory } from "@/lib/entertainment-navigation";

export const metadata: Metadata = {
  title: "Arcade",
  alternates: { canonical: "/entertainment/explore" },
  description: "Browse games, playable samples, prototypes, and interactive experiences. Availability is shown for each Arcade entry.",
  openGraph: { title: "Arcade", url: "/entertainment/explore", images: ["/share/entertainment.png"] },
  twitter: { card: "summary_large_image", images: ["/share/entertainment.png"] },
};

function ArcadeCatalogCard({ entry }: { entry: ArcadeEntry }) {
  const content = <>
    <div className="arcade-card__heading"><span>{entry.franchise}</span><strong>{entry.status}</strong></div>
    <h3>{entry.title}</h3>
    <p>{entry.premise}</p>
    <dl><div><dt>Platform</dt><dd>{entry.platform}</dd></div><div><dt>Access</dt><dd>{entry.access}</dd></div><div><dt>Genres</dt><dd>{entry.genres.join(" · ")}</dd></div></dl>
    <span className="arcade-card__action">{entry.href ? "Open experience →" : "Status details — no access yet"}</span>
  </>;
  return entry.href ? <Link className="arcade-card" href={entry.href}>{content}</Link> : <article className="arcade-card arcade-card--construction">{content}</article>;
}

export default async function ArcadePage({ searchParams }: { searchParams: Promise<{ genre?: string }> }) {
  const requestedCategory = (await searchParams).genre;
  if (requestedCategory === "singularis") redirect("/products/singularis");
  if (requestedCategory === "lifa") redirect("/products/lifa");
  if (["featured", "cryptic-originals", "missions", "experiments", "coming-soon"].includes(requestedCategory ?? "")) redirect("/entertainment/explore");
  const selected = arcadeCategory(requestedCategory) ?? arcadeCategory("all")!;
  const entries = arcadeEntriesFor(selected.slug);

  return <main className="explore-portal">
    <section className="visual-hero explore-portal__hero" data-section-accent="cyan" aria-labelledby="explore-title">
      <div className="visual-hero__image"><Image src="/images/entertainment-feature.png" alt="" fill priority sizes="100vw" /></div>
      <div className="visual-hero__wash" />
      <div className="visual-hero__content explore-portal__hero-content">
        <div className="signal-rail" />
        <span className="kicker">Arcade / playable catalog</span>
        <h1 id="explore-title" className="display-title">Find your next<br /><em>playable experience.</em></h1>
        <p>Browse games, playable samples, prototypes, and interactive experiences. Check each entry for what you can play and what is still in development.</p>
        <div className="hero-actions"><a href="#playable-catalog" className="button home-primary-cta">Browse playable catalog</a><Link href="/entertainment" className="button home-secondary-cta">Explore Entertainment</Link></div>
      </div>
      <aside className="explore-portal__access" aria-labelledby="explore-access-title">
        <span className="kicker">Arcade availability</span><h2 id="explore-access-title">Public browsing is open.</h2>
        <dl><div><dt>Public catalog</dt><dd><span className="account-status-label" data-state="open">Open</span></dd></div><div><dt>Playable sample</dt><dd><span className="account-status-label" data-state="open">Open</span></dd></div></dl>
        <p>No account or subscription is required to browse the catalog or open a public sample.</p>
      </aside>
    </section>

    <div className="shell explore-portal__stack">
      <section id="playable-catalog" data-section-accent="indigo" aria-labelledby="playable-catalog-title">
        <div className="public-home-portal__section-label"><h2 id="playable-catalog-title">{selected.slug === "all" ? "Playable catalog" : `${selected.label} experiences`}</h2><span>Availability shown per experience</span></div>
        <div className="arcade-grid">{entries.map((entry) => <ArcadeCatalogCard entry={entry} key={entry.slug}/>)}</div>
      </section>

      <section className="explore-portal__continuum" data-section-accent="blue" aria-labelledby="explore-continuum-title">
        <div><span className="kicker">Every path connects</span><h2 id="explore-continuum-title">Continue beyond Arcade.</h2><p>Find music, video, worlds, and releases at the Entertainment front door.</p></div>
        <nav aria-label="Continue exploring"><Link href="/entertainment">Explore Entertainment <span aria-hidden="true">→</span></Link><Link href="/releases">Public releases <span aria-hidden="true">→</span></Link><Link href="/community">Community <span aria-hidden="true">→</span></Link><Link href="/account/sign-in">Sign In to My Home <span aria-hidden="true">→</span></Link></nav>
      </section>
    </div>
  </main>;
}
