import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import CommunityAvailabilityPanel from "@/components/CommunityAvailabilityPanel";
import PortalIcon from "@/components/EcosystemPortalIcon";
import PageScene from "@/components/PageScene";
import { getInitialAccountAuthenticated } from "@/lib/server-account-state";

export const metadata: Metadata = {
  title: "Community Explore",
  description: "Explore public activity, groups, events, creators, and governed participation across Cryptic Design.",
  alternates: { canonical: "/community" },
};

export default async function CommunityPage() {
  const authenticated = await getInitialAccountAuthenticated();
  return (
    <main className="community-portal community-explore">
      <section className="visual-hero community-portal__hero" data-section-accent="indigo" aria-labelledby="community-title">
        <PageScene sceneId="community" fallbackPoster="/images/current-focus.png" /><div className="visual-hero__wash" />
        <div className="visual-hero__content community-portal__hero-content"><div className="signal-rail" /><span className="kicker">Community / Explore</span><h1 id="community-title" className="display-title">Find the signal.<br /><em>Share the journey.</em></h1><p>See what is happening across the public Cryptic Design ecosystem and find truthful entry points into groups, events, creators, releases, and future governed participation.</p><div className="hero-actions"><Link href="#happening-now" className="button community-primary-cta">Explore what is happening</Link><Link href={authenticated ? "/" : "/account/sign-in"} className="button community-secondary-cta">{authenticated ? "Return to My Home" : "Sign in to My Home"}</Link></div></div>
        <CommunityAvailabilityPanel className="community-portal__hero-status" />
      </section>
      <div className="shell community-portal__stack community-explore__stack">
        <section id="happening-now" data-section-accent="blue" aria-labelledby="happening-now-title"><div className="public-home-portal__section-label"><h2 id="happening-now-title">Happening now / Featured</h2><span>Curated public destinations</span></div><div className="public-home-portal__featured-grid">
          <Link href="/products/singularis" className="portal-feature portal-feature--cyan"><Image src="/images/singularis-marketing-02.jpg" alt="" fill sizes="(max-width:760px) 100vw,25vw"/><span className="portal-feature__wash"/><span className="portal-feature__icon"><PortalIcon name="worlds"/></span><span className="portal-feature__copy"><strong>Singularis</strong><small>World &amp; releases</small></span><i aria-hidden="true">→</i></Link>
          <Link href="/entertainment/explore" className="portal-feature portal-feature--indigo"><Image src="/images/entertainment-feature.png" alt="" fill sizes="(max-width:760px) 100vw,25vw"/><span className="portal-feature__wash"/><span className="portal-feature__icon"><PortalIcon name="arcade"/></span><span className="portal-feature__copy"><strong>Explore</strong><small>Games, worlds &amp; discovery</small></span><i aria-hidden="true">→</i></Link>
          <Link href="/entertainment/listening-rooms" className="portal-feature portal-feature--violet"><Image src="/images/signal-systems.png" alt="" fill sizes="(max-width:760px) 100vw,25vw"/><span className="portal-feature__wash"/><span className="portal-feature__icon"><PortalIcon name="media"/></span><span className="portal-feature__copy"><strong>Listening rooms</strong><small>Music &amp; audio</small></span><i aria-hidden="true">→</i></Link>
          <Link href="/professional/articles" className="portal-feature portal-feature--blue"><Image src="/images/human-machine.png" alt="" fill sizes="(max-width:760px) 100vw,25vw"/><span className="portal-feature__wash"/><span className="portal-feature__icon"><PortalIcon name="discussion"/></span><span className="portal-feature__copy"><strong>Published thinking</strong><small>Articles &amp; research</small></span><i aria-hidden="true">→</i></Link>
        </div></section>
        <section className="community-explore__participation-grid" data-section-accent="cyan" aria-label="Community participation entry points">
          <article className="community-explore-card"><span className="portal-entry__icon"><PortalIcon name="crew"/></span><div><span className="kicker">Explore Groups</span><h2>Find shared purpose.</h2><p>No groups are published yet. The destination explains the governed membership model without manufacturing communities or counts.</p><Link href="/community/groups">Open Groups <span aria-hidden="true">→</span></Link></div></article>
          <article className="community-explore-card community-explore-card--social"><span className="portal-entry__icon"><PortalIcon name="events"/></span><div><span className="kicker">Upcoming Events</span><h2>Enter scheduled participation.</h2><p>No approved event calendar is connected. Review the supported event architecture and current intentional empty state.</p><Link href="/community/events">Open Events <span aria-hidden="true">→</span></Link></div></article>
          <article className="community-explore-card"><span className="portal-entry__icon"><PortalIcon name="discover"/></span><div><span className="kicker">Featured Creators</span><h2>Discover people through work.</h2><p>Explore the verified public creator currently connected to Cryptic Design projects, releases, research, and studio practice.</p><Link href="/community/creators">Open Creators <span aria-hidden="true">→</span></Link></div></article>
        </section>
        <section className="community-explore__activity" data-section-accent="magenta" aria-labelledby="community-activity-title"><div><span className="kicker">Selected Community Activity</span><h2 id="community-activity-title">No governed activity stream is connected.</h2><p>Community Explore uses curated destinations instead of a generic infinite feed. No posts, reactions, attendance, member activity, or engagement metrics are fabricated.</p></div><span className="account-status-label" data-state="closed">Activity unavailable</span></section>
        {authenticated ? <section className="community-explore__continue" data-section-accent="indigo" aria-labelledby="continue-participating-title"><div><span className="kicker">Continue Participating</span><h2 id="continue-participating-title">Continue from your private platform state.</h2><p>Your authenticated identity remains authoritative while moving between Community, My Home, Library, and Account.</p></div><nav aria-label="Authenticated participation shortcuts"><Link href="/">My Home <span aria-hidden="true">→</span></Link><Link href="/library">My Library <span aria-hidden="true">→</span></Link><Link href="/account">Account <span aria-hidden="true">→</span></Link></nav></section> : null}
        <section className="community-portal__code" data-section-accent="blue" aria-labelledby="community-code-title"><div><span className="kicker">Our community. Our code.</span><h2 id="community-code-title">Participation with clear boundaries.</h2></div><ul><li><strong>Be respectful</strong><span>Treat people and their work with care.</span></li><li><strong>Be inclusive</strong><span>Design for welcome, access, and belonging.</span></li><li><strong>Be creative</strong><span>Share ideas without taking ownership.</span></li><li><strong>Protect the space</strong><span>Safety and privacy outrank engagement.</span></li></ul></section>
      </div>
    </main>
  );
}
