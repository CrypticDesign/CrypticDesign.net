import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import RootPageHero from "@/components/RootPageHero";
import { AnalyticsLink } from "@/components/AnalyticsLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics";
import MediaCard from "@/components/MediaCard";
import { entertainmentSelection, releaseAvailability } from "@/lib/entertainment-frontdoor";
import { publicProducts } from "@/lib/products";
import { publicReleases, releaseDestination, releaseImage } from "@/lib/releases";
import ReleaseCard from "@/components/ReleaseCard";

export const metadata: Metadata = {
  title: "Entertainment Hub",
  description: "Explore games, music, video, original worlds, releases, and experiments across Cryptic Design.",
  alternates: { canonical: "/entertainment" },
  openGraph: { title: "Entertainment Hub", url: "/entertainment", images: ["/share/entertainment.png"] },
  twitter: { card: "summary_large_image", images: ["/share/entertainment.png"] },
};

export default function EntertainmentHub() {
  const { featured } = entertainmentSelection();
  const releases = publicReleases();
  const worlds = publicProducts().filter((product) => ["singularis", "lifa"].includes(product.slug));
  return <main>
    <RootPageHero sceneId="entertainment" fallbackPoster="/images/entertainment-hero.png" accent="cyan" labelledBy="entertainment-title" accessibleLabel="Entertainment interactive experience">
      <div className="signal-rail" /><span className="kicker">Enter Entertainment</span>
        <h1 id="entertainment-title" className="display-title">Enter the worlds, sound, and systems in motion.</h1>
        <p>Explore games, music, video, original worlds, releases, and experiments across one connected entertainment platform.</p>
        <div className="hero-actions"><a href="#choose-a-mode" className="button">Explore Entertainment</a><a href="#public-releases" className="button secondary">Browse Releases</a></div>
    </RootPageHero>
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
          <MediaCard href="/entertainment/arcade" image="/images/singularis-marketing-02.jpg" eyebrow="Play" title="Arcade" body="Games, announced prototypes, and interactive worlds with clear availability." />
          <MediaCard href="/audio" image="/images/signal-systems.png" eyebrow="Listen" title="Music" body="Scores, albums, tracks, signals, and audio releases." accent="violet" />
          <MediaCard href="/entertainment/video" image="/images/entertainment-hero.png" eyebrow="Watch" title="Video" body="Trailers, episodes, transmissions, shorts, and visualizers." accent="indigo" />
        </div>
      </section>
      <section data-section-accent="magenta" aria-labelledby="entertainment-worlds-title">
        <div className="section-heading"><div><span className="kicker">Enter a world</span><h2 id="entertainment-worlds-title" className="section-title">Worlds beyond a single medium</h2></div><p>Original properties connecting games, music, stories, and experiments.</p></div>
        <div className="media-grid">{worlds.map((world) => <MediaCard key={world.slug} href={`/products/${world.slug}`} image={world.slug === "singularis" ? "/images/singularis.png" : "/images/entertainment-feature.png"} eyebrow={`World / ${world.status.replaceAll("-", " ")}`} title={world.title} body={world.summary} accent="magenta" />)}</div>
      </section>
      <section id="public-releases" className="scroll-mt-52" data-section-accent="cyan" aria-labelledby="public-releases-title">
        <div className="section-heading"><div><span className="kicker">Across Cryptic Design</span><h2 id="public-releases-title" className="section-title">Public releases</h2></div><p>Games, video, music, stories, and experiments—ready now or clearly marked as coming soon.</p></div>
        {releases.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>a]:w-full [&>a]:max-w-none">{releases.map((release) => <ReleaseCard key={release.slug} release={release} />)}</div> : <p>No public releases are available yet.</p>}
      </section>
      <section className="explore-portal__continuum explore-portal__continuum--cta" data-section-accent="indigo" aria-labelledby="entertainment-continue-title">
        <div><span className="kicker">Continue</span><h2 id="entertainment-continue-title">Find your next connection.</h2><p>Discover Community participation paths, browse releases, or sign in to your personal My Home.</p></div>
        <nav className="hero-actions explore-portal__continuum-actions" aria-label="Continue from Entertainment"><AnalyticsLink href="/community" className="button home-primary-cta" analyticsEvent={{ name: ANALYTICS_EVENTS.COMMUNITY_OPEN, payload: { source: "entertainment_continue" } }}>Explore Community</AnalyticsLink><a href="#public-releases" className="button secondary">Browse Releases</a><AnalyticsLink href="/account/sign-in" className="button secondary" analyticsEvent={{ name: ANALYTICS_EVENTS.SIGN_IN_OPEN, payload: { source: "entertainment_continue" } }}>Sign In to My Home</AnalyticsLink></nav>
      </section>
    </div>
  </main>;
}
