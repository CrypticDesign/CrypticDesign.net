import Link from "next/link";
import ReleaseCard from "@/components/ReleaseCard";
import type { Release } from "@/lib/releases";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  releases: Release[];
  emptyMessage: string;
  secondaryLink?: { href: string; label: string };
};

export default function EntertainmentDestinationPage({ eyebrow, title, description, releases, emptyMessage, secondaryLink }: Props) {
  return (
    <main>
      <header className="destination-hero">
        <div className="shell destination-hero__content">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="display-title">{title}</h1>
          <p>{description}</p>
          <div className="hero-actions">
            <a className="button" href="#featured">Explore {title}</a>
            <Link className="button secondary" href="/entertainment">Entertainment home</Link>
          </div>
        </div>
      </header>
      <div className="shell page-stack">
        <section id="featured" aria-labelledby="featured-heading">
          <div className="section-heading">
            <div><span className="kicker">Featured</span><h2 id="featured-heading" className="section-title">Featured in {title}</h2></div>
            <p>New and featured releases you can explore here.</p>
          </div>
          {releases.length > 0 ? <div className="media-grid">{releases.map((release) => <ReleaseCard key={release.slug} release={release} />)}</div> : <p className="ui-empty">{emptyMessage}</p>}
        </section>
        <section className="destination-state panel" aria-labelledby="destination-state-heading">
          <span className="kicker">Come back anytime</span>
          <h2 id="destination-state-heading" className="section-title">Your place is saved</h2>
          <p>When something is unavailable or still loading, you will always know what happened and what you can do next.</p>
          {secondaryLink ? <Link className="text-link" href={secondaryLink.href}>{secondaryLink.label} →</Link> : null}
        </section>
      </div>
    </main>
  );
}
