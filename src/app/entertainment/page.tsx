import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MediaCard from "@/components/MediaCard";
import PageScene from "@/components/PageScene";
import { entertainmentSelection, releaseAvailability } from "@/lib/entertainment-frontdoor";
import { publicProducts } from "@/lib/products";
import { releaseDestination, releaseImage } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Entertainment Hub",
  description: "Explore games, music, video, original worlds, releases, and experiments across Cryptic Design.",
  alternates: { canonical: "/entertainment" },
  openGraph: { title: "Entertainment Hub", url: "/entertainment", images: ["/share/entertainment.png"] },
  twitter: { card: "summary_large_image", images: ["/share/entertainment.png"] },
};

export default function EntertainmentHub() {
  const { featured, selected } = entertainmentSelection();
  const worlds = publicProducts().filter((product) => ["singularis", "lifa"].includes(product.slug));
  return <main>
    <section className="visual-hero !min-h-[560px]" data-section-accent="cyan" aria-labelledby="entertainment-title">
      <PageScene sceneId="entertainment" fallbackPoster="/images/entertainment-hero.png" />
      <div className="visual-hero__wash" />
      <div className="visual-hero__content"><div className="signal-rail" /><span className="kicker">Enter Entertainment</span>
        <h1 id="entertainment-title" className="display-title">Enter the worlds, sound, and systems in motion.</h1>
        <p>Explore games, music, video, original worlds, releases, and experiments across one connected entertainment platform.</p>
        <div className="hero-actions"><a href="#choose-a-mode" className="button">Explore Entertainment</a><Link href="/releases" className="button secondary">Browse Releases</Link></div>
      </div>
    </section>
    <div className="shell page-stack">
      {featured ? <section className="feature-split" data-section-accent="indigo" aria-labelledby="featured-release-title">
        <div className="feature-split__image"><Image src={releaseImage(featured)} alt="" fill sizes="(max-width:900px) 100vw, 60vw" /></div>
        <div className="feature-split__content !border-l-2 !border-[var(--section-accent)]"><span className="kicker">Featured / {featured.kind} / {releaseAvailability(featured)}</span>
          <h2 id="featured-release-title">{featured.title}</h2><p>{featured.description}</p>
          <div className="hero-actions"><Link href={releaseDestination(featured)} className="button">View release details</Link><Link href="/audio" className="button secondary">Explore Music</Link></div>
        </div>
      </section> : null}
      <section id="choose-a-mode" data-section-accent="violet" aria-labelledby="choose-a-mode-title">
        <div className="section-heading"><div><span className="kicker">Choose a mode</span><h2 id="choose-a-mode-title" className="section-title">Play. Listen. Watch.</h2></div><p>Browse each catalog without an account. Availability is shown for each experience.</p></div>
        <div className="media-grid">
          <MediaCard href="/entertainment/explore" image="/images/singularis-marketing-02.jpg" eyebrow="Play" title="Arcade" body="Games, playable samples, prototypes, and interactive experiences." />
          <MediaCard href="/audio" image="/images/signal-systems.png" eyebrow="Listen" title="Music" body="Scores, albums, tracks, signals, and audio releases." accent="violet" />
          <MediaCard href="/entertainment/cinema" image="/images/entertainment-hero.png" eyebrow="Watch" title="Video" body="Films, trailers, transmissions, visual stories, and series." accent="indigo" />
        </div>
      </section>
      <section data-section-accent="magenta" aria-labelledby="entertainment-worlds-title">
        <div className="section-heading"><div><span className="kicker">Enter a world</span><h2 id="entertainment-worlds-title" className="section-title">Worlds beyond a single medium</h2></div><p>Original properties connecting games, music, stories, and experiments.</p></div>
        <div className="media-grid">{worlds.map((world) => <MediaCard key={world.slug} href={`/products/${world.slug}`} image={world.slug === "singularis" ? "/images/singularis.png" : "/images/entertainment-feature.png"} eyebrow={`World / ${world.status.replaceAll("-", " ")}`} title={world.title} body={world.summary} accent="magenta" />)}</div>
      </section>
      <section data-section-accent="cyan" aria-labelledby="selected-releases-title">
        <div className="section-heading"><div><span className="kicker">Featured across Cryptic Design</span><h2 id="selected-releases-title" className="section-title">Selected releases</h2></div><p>Explore announced work and its current availability.</p></div>
        <div className="media-grid">{selected.map((release) => <MediaCard key={release.slug} href={releaseDestination(release)} image={releaseImage(release)} eyebrow={`${release.kind} / ${releaseAvailability(release)}`} title={release.title} body={release.tagline} />)}</div>
        {!selected.length ? <p>No public selections are available yet.</p> : null}
      </section>
      <section className="explore-portal__continuum" data-section-accent="indigo" aria-labelledby="entertainment-continue-title">
        <div><span className="kicker">Continue</span><h2 id="entertainment-continue-title">Find your next connection.</h2><p>Discover Community participation paths, browse releases, or sign in to your personal My Home.</p></div>
        <nav aria-label="Continue from Entertainment"><Link href="/community">Explore Community <span aria-hidden="true">→</span></Link><Link href="/releases">Browse Releases <span aria-hidden="true">→</span></Link><Link href="/account/sign-in">Sign In to My Home <span aria-hidden="true">→</span></Link></nav>
      </section>
    </div>
  </main>;
}
