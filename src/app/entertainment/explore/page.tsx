import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import PortalIcon, { type EcosystemPortalIconName } from "@/components/EcosystemPortalIcon";
import { arcadeEntriesFor, type ArcadeEntry } from "@/lib/arcade";
import { arcadeCategory } from "@/lib/entertainment-navigation";

export const metadata: Metadata = {
  title: "Explore",
  alternates: { canonical: "/entertainment/explore" },
  description: "Explore public games, worlds, music, stories, releases, and experiments across Cryptic Design.",
};

const featuredPaths = [
  { href: "/products/singularis", image: "/images/singularis-marketing-02.jpg", icon: "play" as const, accent: "blue", type: "Playable sample", title: "Singularis", body: "Enter the public browser prototype and follow the evolving science-fiction universe." },
  { href: "/entertainment/listening-rooms", image: "/images/signal-systems.png", icon: "listen" as const, accent: "cyan", type: "Music & audio", title: "Listening rooms", body: "Move through approved tracks, scores, signals, and connected sonic work." },
  { href: "/entertainment/cinema", image: "/images/entertainment-hero.png", icon: "media" as const, accent: "green", type: "Stories & video", title: "Cinema", body: "Watch public films, transmissions, trailers, and visual storytelling as they become available." },
  { href: "/entertainment/creative-labs", image: "/images/professional-case.png", icon: "discover" as const, accent: "yellow", type: "Experiments", title: "Creative Labs", body: "See approved prototypes, studies, and creative-technology work without fictional activity." },
] as const;

const categories: readonly { href: string; icon: EcosystemPortalIconName; title: string; body: string; accent: string }[] = [
  { href: "#playable-catalog", icon: "play", title: "Games", body: "Playable samples and future experiences", accent: "blue" },
  { href: "/products", icon: "worlds", title: "Worlds", body: "Original properties and connected releases", accent: "cyan" },
  { href: "/audio", icon: "listen", title: "Music & audio", body: "Scores, signals, songs, and sound", accent: "green" },
  { href: "/entertainment/cinema", icon: "media", title: "Stories & video", body: "Films, trailers, transmissions, and series", accent: "yellow" },
  { href: "/entertainment/creative-labs", icon: "discover", title: "Experiments", body: "Prototypes and creative technology", accent: "magenta" },
  { href: "/professional/creators", icon: "crew", title: "Creators", body: "People and disciplines behind the work", accent: "violet" },
];

function ExploreCatalogCard({ entry }: { entry: ArcadeEntry }) {
  const content = <>
    <div className="arcade-card__heading"><span>{entry.franchise}</span><strong>{entry.status}</strong></div>
    <h3>{entry.title}</h3>
    <p>{entry.premise}</p>
    <dl><div><dt>Platform</dt><dd>{entry.platform}</dd></div><div><dt>Access</dt><dd>{entry.access}</dd></div><div><dt>Genres</dt><dd>{entry.genres.join(" · ")}</dd></div></dl>
    <span className="arcade-card__action">{entry.href ? "Open experience →" : "Status details — no access yet"}</span>
  </>;
  return entry.href ? <Link className="arcade-card" href={entry.href}>{content}</Link> : <article className="arcade-card arcade-card--construction">{content}</article>;
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ genre?: string }> }) {
  const requestedCategory = (await searchParams).genre;
  if (requestedCategory === "singularis") redirect("/products/singularis");
  if (requestedCategory === "lifa") redirect("/products/lifa");
  if (["featured", "cryptic-originals", "missions", "experiments", "coming-soon"].includes(requestedCategory ?? "")) redirect("/entertainment/explore");
  const selected = arcadeCategory(requestedCategory) ?? arcadeCategory("all")!;
  const entries = arcadeEntriesFor(selected.slug);

  return <main className="explore-portal">
    <section className="visual-hero explore-portal__hero" data-section-accent="blue" aria-labelledby="explore-title">
      <div className="visual-hero__image"><Image src="/images/entertainment-feature.png" alt="A luminous field of connected worlds representing Cryptic Design entertainment" fill priority sizes="100vw" /></div>
      <div className="visual-hero__wash" />
      <div className="visual-hero__content explore-portal__hero-content">
        <div className="signal-rail" />
        <span className="kicker">Discover. Play. Watch. Listen.</span>
        <h1 id="explore-title" className="display-title">Explore the<br /><em>Cryptic universe.</em></h1>
        <p>Browse public games, worlds, music, stories, releases, and experiments. An account can connect private saved state later, but public discovery stays open.</p>
        <div className="hero-actions"><a href="#featured-experiences" className="button home-primary-cta">Browse featured</a><Link href="/entertainment" className="button home-secondary-cta">Entertainment overview</Link></div>
      </div>
      <aside className="explore-portal__access" aria-labelledby="explore-access-title">
        <span className="kicker">Explore access</span><h2 id="explore-access-title">Public discovery is open.</h2>
        <dl><div><dt>Public catalog</dt><dd><span className="account-status-label" data-state="open">Open</span></dd></div><div><dt>Playable sample</dt><dd><span className="account-status-label" data-state="open">Open</span></dd></div><div><dt>Saved progress</dt><dd>Account feature</dd></div></dl>
        <p>No account or subscription is required to browse approved public work.</p>
      </aside>
    </section>

    <div className="shell explore-portal__stack">
      <section id="featured-experiences" data-section-accent="cyan" aria-labelledby="featured-experiences-title">
        <div className="public-home-portal__section-label"><h2 id="featured-experiences-title">Featured experiences</h2><span>Real public destinations</span></div>
        <div className="explore-portal__featured-grid">{featuredPaths.map((item) => <Link href={item.href} className={`explore-feature explore-feature--${item.accent}`} key={item.href}><Image src={item.image} alt="" fill sizes="(max-width:800px) 100vw,25vw"/><span className="explore-feature__wash"/><span className="portal-feature__icon"><PortalIcon name={item.icon}/></span><span className="explore-feature__type">{item.type}</span><span className="explore-feature__copy"><strong>{item.title}</strong><small>{item.body}</small></span><i aria-hidden="true">→</i></Link>)}</div>
      </section>

      <section data-section-accent="green" aria-labelledby="explore-categories-title">
        <div className="public-home-portal__section-label"><h2 id="explore-categories-title">Browse categories</h2><span>One ecosystem. Many paths.</span></div>
        <nav className="explore-portal__categories" aria-label="Explore categories">{categories.map((category) => <Link href={category.href} className={`explore-category explore-category--${category.accent}`} key={category.title}><span className="portal-entry__icon"><PortalIcon name={category.icon}/></span><span><strong>{category.title}</strong><small>{category.body}</small></span><i aria-hidden="true">→</i></Link>)}</nav>
      </section>

      <section id="playable-catalog" data-section-accent="yellow" aria-labelledby="playable-catalog-title">
        <div className="public-home-portal__section-label"><h2 id="playable-catalog-title">{selected.slug === "all" ? "Playable catalog" : `${selected.label} experiences`}</h2><span>Availability shown per experience</span></div>
        <div className="arcade-grid">{entries.map((entry) => <ExploreCatalogCard entry={entry} key={entry.slug}/>)}</div>
      </section>

      <section className="explore-portal__continuum" data-section-accent="magenta" aria-labelledby="explore-continuum-title">
        <div><span className="kicker">Every path connects</span><h2 id="explore-continuum-title">Move through the ecosystem at your pace.</h2><p>Public exploration remains independent from account admission, invitations, subscriptions, and payment systems.</p></div>
        <nav aria-label="Continue exploring"><Link href="/releases">Public releases <span aria-hidden="true">→</span></Link><Link href="/community">Community <span aria-hidden="true">→</span></Link><Link href="/account/sign-in">My Home <span aria-hidden="true">→</span></Link></nav>
      </section>
    </div>
  </main>;
}
