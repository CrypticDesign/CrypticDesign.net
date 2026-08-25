import Image from "next/image";
import Link from "next/link";

import AccountEcosystemStatus from "@/components/AccountEcosystemStatus";
import PortalIcon from "@/components/EcosystemPortalIcon";
import PageScene from "@/components/PageScene";
import type { AccountAdmissionMode } from "@/lib/account-admission";

export default function PublicHome({ accountAdmissionMode }: { accountAdmissionMode: AccountAdmissionMode }) {
  return (
    <main className="public-home public-home-portal">
      <section className="visual-hero public-home-hero public-home-portal__hero" data-section-accent="blue" aria-labelledby="public-home-title">
        <PageScene sceneId="public-home" fallbackPoster="/images/entertainment-hero.png" interaction="ambient" quality="auto" />
        <div className="visual-hero__wash" />
        <div className="visual-hero__content public-home-portal__hero-content">
          <div className="signal-rail" />
          <span className="kicker">One platform. Many paths.</span>
          <h1 id="public-home-title" className="display-title">Worlds to explore.<br />Stories to experience.<br /><em>Systems that connect them.</em></h1>
          <p>Explore original worlds, interactive releases, creative technology, and the independent design practice behind the platform.</p>
          <div className="hero-actions">
            <Link href="/entertainment" className="button home-primary-cta">Explore entertainment</Link>
            <Link href="/professional" className="button home-secondary-cta">Discover the studio</Link>
          </div>
        </div>
        <aside className="public-home-portal__member" aria-labelledby="member-entry-title">
          <span className="kicker">Already have an account?</span>
          <h2 id="member-entry-title">Return to your private space.</h2>
          <p>Sign in to open your Character, Library, activity, and account utilities.</p>
          <Link href="/account/sign-in">Go to My Home <span aria-hidden="true">→</span></Link>
        </aside>
      </section>

      <div className="shell public-home-portal__stack">
        <section className="public-home-portal__featured" data-section-accent="cyan" aria-labelledby="featured-now-title">
          <div className="public-home-portal__section-label"><h2 id="featured-now-title">Featured now</h2><Link href="/entertainment">View entertainment</Link></div>
          <div className="public-home-portal__featured-grid">
            <Link href="/products/singularis" className="portal-feature portal-feature--cyan"><Image src="/images/singularis-marketing-02.jpg" alt="" fill sizes="(max-width: 760px) 100vw, 25vw" /><span className="portal-feature__wash" /><span className="portal-feature__icon"><PortalIcon name="worlds" /></span><span className="portal-feature__copy"><strong>Singularis</strong><small>Science-fiction universe</small></span><i aria-hidden="true">→</i></Link>
            <Link href="/entertainment/explore" className="portal-feature portal-feature--magenta"><Image src="/images/entertainment-feature.png" alt="" fill sizes="(max-width: 760px) 100vw, 25vw" /><span className="portal-feature__wash" /><span className="portal-feature__icon"><PortalIcon name="arcade" /></span><span className="portal-feature__copy"><strong>Explore</strong><small>Games, worlds &amp; discovery</small></span><i aria-hidden="true">→</i></Link>
            <Link href="/entertainment/listening-rooms" className="portal-feature portal-feature--violet"><Image src="/images/signal-systems.png" alt="" fill sizes="(max-width: 760px) 100vw, 25vw" /><span className="portal-feature__wash" /><span className="portal-feature__icon"><PortalIcon name="media" /></span><span className="portal-feature__copy"><strong>Music &amp; media</strong><small>Listen, watch, immerse</small></span><i aria-hidden="true">→</i></Link>
            <Link href="/community" className="portal-feature portal-feature--blue"><Image src="/images/current-focus.png" alt="" fill sizes="(max-width: 760px) 100vw, 25vw" /><span className="portal-feature__wash" /><span className="portal-feature__icon"><PortalIcon name="crew" /></span><span className="portal-feature__copy"><strong>Community</strong><small>Public paths &amp; future participation</small></span><i aria-hidden="true">→</i></Link>
          </div>
        </section>

        <section className="public-home-portal__entries" data-section-accent="indigo" aria-labelledby="ways-in-title">
          <div className="public-home-portal__section-label"><h2 id="ways-in-title">One ecosystem. Three ways in.</h2></div>
          <div className="public-home-portal__entry-grid">
            <Link href="/entertainment/explore" className="portal-entry portal-entry--violet"><span className="portal-entry__icon"><PortalIcon name="play" /></span><span><strong>Play</strong><small>Explore games, interactive experiments, and worlds in development.</small></span><i aria-hidden="true">→</i></Link>
            <Link href="/entertainment/listening-rooms" className="portal-entry portal-entry--cyan"><span className="portal-entry__icon"><PortalIcon name="listen" /></span><span><strong>Watch &amp; listen</strong><small>Enter original stories, music, video, and cinematic experiences.</small></span><i aria-hidden="true">→</i></Link>
            <Link href="/professional" className="portal-entry portal-entry--magenta"><span className="portal-entry__icon"><PortalIcon name="discover" /></span><span><strong>Discover &amp; build</strong><small>See the design systems, research, and studio practice behind the work.</small></span><i aria-hidden="true">→</i></Link>
          </div>
        </section>

        <section className="public-home-portal__utility-grid" data-section-accent="violet" aria-label="Platform access and status">
          <article className="portal-utility portal-utility--identity"><span className="kicker">Public by default</span><h2>Explore without an account.</h2><p>Entertainment, studio work, articles, and approved releases remain available through the public platform.</p><Link href="/entertainment">Start exploring <span aria-hidden="true">→</span></Link></article>
          <AccountEcosystemStatus admissionMode={accountAdmissionMode} showAvailabilityAction={false} className="portal-utility portal-utility--status" />
          <article className="portal-utility portal-utility--home">
            <div className="portal-utility__image"><Image src="/images/my-home-hero.png" alt="" fill sizes="(max-width: 760px) 100vw, 33vw" /></div>
            <div className="portal-utility__home-copy"><span className="portal-entry__icon"><PortalIcon name="home" /></span><div><span className="kicker">Your Home. Your space.</span><h2>Personal when signed in.</h2></div></div>
            <p>An account adds your private My Home, Character identity, Library, and account utilities. Signing in does not start or change a subscription.</p>
            <Link href="/account/sign-in">Sign in to My Home <span aria-hidden="true">→</span></Link>
          </article>
        </section>

        <section className="public-home-portal__studio" data-section-accent="magenta" aria-labelledby="studio-strip-title">
          <div><span className="kicker">From the studio behind the platform</span><h2 id="studio-strip-title">Independent worlds, experiences, and systems.</h2><p>Cryptic Design combines original entertainment with product thinking, interaction design, interface systems, and creative technology.</p></div>
          <ul aria-label="Studio disciplines"><li>World-building</li><li>Experience design</li><li>Creative technology</li><li>Research &amp; systems</li></ul>
          <Link href="/professional" className="button secondary">About the studio</Link>
        </section>
      </div>
    </main>
  );
}
