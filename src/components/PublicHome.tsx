import Image from "next/image";
import Link from "next/link";

import PortalIcon, { type EcosystemPortalIconName } from "@/components/EcosystemPortalIcon";
import PageScene from "@/components/PageScene";
import type { AccountAdmissionMode } from "@/lib/account-admission";
import { MUSIC_ENTRIES } from "@/lib/media-catalog";
import { getProduct } from "@/lib/products";
import { getRelease, releaseDestination, releaseImage } from "@/lib/releases";

function requiredSource<T>(source: T | undefined, name: string): T {
  if (!source) throw new Error(`Missing governed Homepage source: ${name}`);
  return source;
}

const singularis = requiredSource(getProduct("singularis"), "Singularis product");
const lifa = requiredSource(getProduct("lifa"), "Lifa product");
const signalAndSystems = requiredSource(
  MUSIC_ENTRIES.find((entry) => entry.slug === "signal-and-systems" && entry.status === "Released" && entry.href),
  "released Signal & Systems media entry",
);
const visualStudy = requiredSource(getRelease("visual-study-01"), "Visual Study 01 release");

const featuredExperiences = [
  {
    href: `/products/${singularis.slug}`,
    image: "/images/singularis-marketing-02.jpg",
    icon: "worlds" as const,
    accent: "cyan",
    title: singularis.title,
    descriptor: "Science-fiction universe",
    state: singularis.status === "active" ? "Active" : "In development · Scheduled",
  },
  {
    href: `/products/${lifa.slug}`,
    image: "/images/lifa-marketing-intro-01.png",
    icon: "play" as const,
    accent: "indigo",
    title: "Lifa: Genesis",
    descriptor: "Living-systems game experience",
    state: lifa.status === "active" ? "Active" : "In development · Scheduled",
  },
  {
    href: signalAndSystems.href!,
    image: "/images/signal-systems.png",
    icon: "listen" as const,
    accent: "violet",
    title: signalAndSystems.title,
    descriptor: signalAndSystems.releaseType,
    state: signalAndSystems.status,
  },
  {
    href: releaseDestination(visualStudy),
    image: releaseImage(visualStudy),
    icon: "discover" as const,
    accent: "magenta",
    title: visualStudy.title,
    descriptor: "Visual systems and experiments",
    state: visualStudy.status === "released" ? "Released" : "Coming soon · Scheduled",
  },
] as const;

const explorePaths: readonly {
  href: string;
  icon: EcosystemPortalIconName;
  title: string;
  body: string;
  accent: string;
}[] = [
  { href: "/entertainment/explore", icon: "play", title: "Play", body: "Games, prototypes, arcade experiences, and interactive worlds.", accent: "blue" },
  { href: "/entertainment/listening-rooms", icon: "listen", title: "Watch & listen", body: "Music, film, visual media, stories, and cinematic experiences.", accent: "cyan" },
  { href: "/products", icon: "worlds", title: "Explore worlds", body: "Singularis, Lifa, releases, experiments, and interconnected projects.", accent: "indigo" },
  { href: "/community", icon: "crew", title: "Discover community", body: "Creators, groups, events, and governed participation.", accent: "violet" },
];

const communityPaths: readonly {
  href: string;
  icon: EcosystemPortalIconName;
  title: string;
  body: string;
}[] = [
  { href: "/community/creators", icon: "discover", title: "Creators", body: "Discover people through published work and approved public profiles." },
  { href: "/community/groups", icon: "crew", title: "Groups", body: "See the governed group model and current public availability." },
  { href: "/community/events", icon: "events", title: "Events", body: "Explore supported participation and the current published schedule or empty state." },
];

export default function PublicHome({ accountAdmissionMode }: { accountAdmissionMode: AccountAdmissionMode }) {
  const accountState = accountAdmissionMode === "invitation" ? "Invitation only" : "Accounts closed";

  return (
    <main className="public-home public-home-portal public-home-v2">
      <section className="visual-hero public-home-hero public-home-portal__hero" data-section-accent="blue" aria-labelledby="public-home-title">
        <PageScene sceneId="public-home" fallbackPoster="/images/entertainment-hero.png" interaction="ambient" quality="auto" />
        <div className="visual-hero__wash" />
        <div className="visual-hero__content public-home-portal__hero-content">
          <div className="signal-rail" />
          <span className="kicker">An independent entertainment universe</span>
          <h1 id="public-home-title" className="display-title">Worlds to explore.<br />Stories to experience.<br /><em>Systems that connect them.</em></h1>
          <p>Enter original games, worlds, music, stories, and interactive experiences built to exist as parts of one connected universe. Explore what is here now and follow what comes next.</p>
          <div className="hero-actions">
            <Link href="/entertainment" className="button home-primary-cta">Explore What&apos;s Here</Link>
            <Link href="/community" className="button home-secondary-cta">Enter Community</Link>
          </div>
          <div className="public-home-v2__member-link">
            <span>Already a member?</span>
            <Link href="/account/sign-in">Sign in to My Home <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <div className="shell public-home-portal__stack public-home-v2__stack">
        <section className="public-home-portal__featured" data-section-accent="cyan" aria-labelledby="featured-experiences-title">
          <div className="public-home-v2__heading">
            <div><span className="kicker">Featured experiences</span><h2 id="featured-experiences-title">Enter something real.</h2><p>Start with the worlds, releases, and experiments currently defining Cryptic Design.</p></div>
            <Link href="/entertainment" className="text-link">View All Entertainment <span aria-hidden="true">→</span></Link>
          </div>
          <div className="public-home-v2__experience-grid">
            {featuredExperiences.map((item) => (
              <Link href={item.href} className={`public-home-v2__experience portal-feature--${item.accent}`} key={item.href}>
                <Image src={item.image} alt="" fill sizes="(max-width: 760px) 100vw, 25vw" />
                <span className="public-home-v2__experience-wash" />
                <span className="portal-feature__icon"><PortalIcon name={item.icon} /></span>
                <span className="public-home-v2__experience-state">{item.state}</span>
                <span className="public-home-v2__experience-copy"><strong>{item.title}</strong><small>{item.descriptor}</small></span>
                <i aria-hidden="true">→</i>
              </Link>
            ))}
          </div>
        </section>

        <section data-section-accent="indigo" aria-labelledby="explore-paths-title">
          <div className="public-home-v2__heading"><div><span className="kicker">Explore</span><h2 id="explore-paths-title">Choose a signal.</h2></div></div>
          <nav className="public-home-v2__path-grid" aria-label="Entertainment and community discovery paths">
            {explorePaths.map((path) => (
              <Link href={path.href} className={`public-home-v2__path public-home-v2__path--${path.accent}`} key={path.title}>
                <span className="portal-entry__icon"><PortalIcon name={path.icon} /></span>
                <span><strong>{path.title}</strong><small>{path.body}</small></span>
                <i aria-hidden="true">→</i>
              </Link>
            ))}
          </nav>
        </section>

        <section className="public-home-v2__community" data-section-accent="violet" aria-labelledby="community-preview-title">
          <div className="public-home-v2__heading">
            <div><span className="kicker">Community</span><h2 id="community-preview-title">This isn&apos;t just something to watch.</h2><h3>Become part of what we&apos;re building.</h3><p>CrypticDesign.net is being built around persistent identity, shared experiences, creators, groups, and participation. Public discovery is open now; deeper participation will expand through controlled access as those systems come online.</p></div>
            <Link href="/community" className="text-link">Explore Community <span aria-hidden="true">→</span></Link>
          </div>
          <div className="public-home-v2__community-grid">
            {communityPaths.map((path) => (
              <Link href={path.href} className="public-home-v2__community-card" key={path.href}>
                <span className="portal-entry__icon"><PortalIcon name={path.icon} /></span>
                <span><strong>{path.title}</strong><small>{path.body}</small></span>
                <i aria-hidden="true">→</i>
              </Link>
            ))}
          </div>
        </section>

        <section className="public-home-v2__continuity" data-section-accent="magenta" aria-labelledby="continuity-title">
          <div className="public-home-v2__heading">
            <div><span className="kicker">Your place in the platform</span><h2 id="continuity-title">Your experience doesn&apos;t have to reset every time you leave a page.</h2><p>CrypticDesign.net is being built as a connected environment where identity, discoveries, saved work, participation, and experiences can persist across the platform.</p></div>
            <Link href="/account/sign-in" className="button secondary">Sign in to My Home</Link>
          </div>
          <div className="public-home-v2__continuity-grid">
            <article><span>Admitted-member capability</span><h3>Character</h3><p>Your persistent member representation across approved platform experiences.</p></article>
            <article><span>Available when signed in</span><h3>My Home</h3><p>Your private personalized home base when signed in.</p></article>
            <article><span>Current · browser-local</span><h3>Library</h3><p>Saved releases on this device, summarized in My Home for signed-in members.</p></article>
            <article><span>In development</span><h3>Mission Control</h3><p>Goals, progress, and unlock relationships as supported experiences come online.</p></article>
          </div>
        </section>

        <section className="public-home-v2__signal" data-section-accent="blue" aria-labelledby="current-signal-title">
          <div className="public-home-v2__signal-image"><Image src="/images/signal-systems.png" alt="" fill sizes="(max-width: 800px) 100vw, 46vw" /></div>
          <div className="public-home-v2__signal-copy">
            <span className="kicker">Current signal</span>
            <span className="public-home-v2__state">{signalAndSystems.status} · {signalAndSystems.releaseType}</span>
            <h2 id="current-signal-title">{signalAndSystems.title}</h2>
            <p>{signalAndSystems.premise}</p>
            <Link href={signalAndSystems.href!} className="text-link">Open the release <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section className="public-home-v2__creator" data-section-accent="cyan" aria-labelledby="creator-title">
          <div><span className="kicker">Built by Cryptic Design</span><h2 id="creator-title">Independent worlds, experiences, and systems.</h2><p>Cryptic Design creates original games, worlds, music, media, interactive systems, and the technology connecting them.</p></div>
          <ul aria-label="Cryptic Design disciplines"><li>Games &amp; Worlds</li><li>Music &amp; Media</li><li>Creative Technology</li><li>Experience Systems</li></ul>
          <Link href="/professional" className="button secondary">About Cryptic Design</Link>
        </section>

        <section className="public-home-v2__professional" data-section-accent="violet" aria-labelledby="professional-bridge-title">
          <div><span className="kicker">Professional</span><h2 id="professional-bridge-title">We build for others, too.</h2><p>Cryptic Design applies the same systems thinking behind this platform to complex products, games, interfaces, and emerging technology.</p></div>
          <p className="public-home-v2__capabilities">Product Strategy · UX &amp; Interaction · Interface Systems · Creative Technology</p>
          <Link href="/professional" className="text-link">Explore Professional <span aria-hidden="true">→</span></Link>
        </section>

        <section className="public-home-v2__join" data-section-accent="magenta" aria-labelledby="join-title">
          <div><span className="kicker">Join the next wave</span><h2 id="join-title">This is just the beginning.</h2><p>Explore publicly now. Account requests are not open yet; review availability if you want to become part of the platform as member capabilities expand.</p><span className="public-home-v2__state">{accountState}</span></div>
          <div className="hero-actions"><Link href="/account/create" className="button home-primary-cta">Account availability</Link><Link href="/account/sign-in" className="button secondary">Sign In</Link></div>
        </section>
      </div>
    </main>
  );
}
