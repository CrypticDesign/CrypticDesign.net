import type { Metadata } from "next";
import Link from "next/link";
import CommunityAvailabilityPanel from "@/components/CommunityAvailabilityPanel";
import PortalIcon from "@/components/EcosystemPortalIcon";
import PageScene from "@/components/PageScene";
import { getInitialAccountAuthenticated } from "@/lib/server-account-state";
import "./frontdoor.css";

export const metadata: Metadata = {
  title: "Community",
  description: "Discover creators and explore participation paths as public Community opens in stages. See current group and event availability.",
  alternates: { canonical: "/community" },
  openGraph: { title: "Community", url: "/community", images: ["/images/current-focus.png"] },
  twitter: { card: "summary_large_image", images: ["/images/current-focus.png"] },
};

export default async function CommunityPage() {
  const authenticated = await getInitialAccountAuthenticated();
  return (
    <main className="community-portal community-explore">
      <section className="visual-hero community-portal__hero" data-section-accent="indigo" aria-labelledby="community-title">
        <PageScene sceneId="community" fallbackPoster="/images/current-focus.png" /><div className="visual-hero__wash" />
        <div className="visual-hero__content community-portal__hero-content"><div className="signal-rail" /><span className="kicker">Community / Explore</span><h1 id="community-title" className="display-title">Find the signal.<br /><em>Share the journey.</em></h1><p>Discover the people, groups, events, and shared experiences forming around Cryptic Design. Public Community is opening in stages, and every visible path reflects real current availability.</p><div className="hero-actions"><a href="#participation-paths" className="button community-primary-cta">See Participation Paths</a><Link href={authenticated ? "/" : "/account/sign-in"} className="button community-secondary-cta">{authenticated ? "Return to My Home" : "Sign in to My Home"}</Link></div></div>
        <CommunityAvailabilityPanel className="community-portal__hero-status" showSignInAction={false} />
      </section>
      <div className="shell community-portal__stack community-explore__stack">
        <section id="participation-paths" data-section-accent="indigo" aria-labelledby="participation-paths-title">
          <div className="public-home-portal__section-label"><h2 id="participation-paths-title">Participation paths</h2><span>What is open, and what is next</span></div>
          <div className="community-explore__participation-grid">
            <article className="community-explore-card"><span className="portal-entry__icon"><PortalIcon name="discover" /></span><div><span className="kicker">Creators / Available</span><h3>Discover people through work.</h3><p>Explore Robert K. Croft’s approved public profile and the projects, releases, research, and studio practice behind it.</p><Link href="/community/creators">Discover Creators <span aria-hidden="true">→</span></Link></div></article>
            <article className="community-explore-card"><span className="portal-entry__icon"><PortalIcon name="crew" /></span><div><span className="kicker">Groups / Opening in stages</span><h3>Find shared purpose.</h3><p>No groups are published yet. Learn about the planned ways to take part; group membership is not available.</p><Link href="/community/groups">View Group plans <span aria-hidden="true">→</span></Link></div></article>
            <article className="community-explore-card community-explore-card--social"><span className="portal-entry__icon"><PortalIcon name="events" /></span><div><span className="kicker">Events / Opening in stages</span><h3>Make room for shared experiences.</h3><p>No approved event calendar is connected. Explore the planned event formats; there are no events to register for yet.</p><Link href="/community/events">View Event plans <span aria-hidden="true">→</span></Link></div></article>
          </div>
        </section>
        <section className="explore-portal__continuum" data-section-accent="magenta" aria-labelledby="community-explore-platform-title">
          <div><span className="kicker">From across the platform</span><h2 id="community-explore-platform-title">Explore while Community opens.</h2><p>Games, music, video, and release previews are open to browse. These are Entertainment destinations, not Community activity.</p></div>
          <nav aria-label="Explore beyond Community"><Link href="/entertainment">Explore Entertainment <span aria-hidden="true">→</span></Link><Link href="/releases">Browse Releases <span aria-hidden="true">→</span></Link></nav>
        </section>
        {authenticated ? <section className="community-explore__continue" data-section-accent="indigo" aria-labelledby="continue-participating-title"><div><span className="kicker">Continue Participating</span><h2 id="continue-participating-title">Return to your personal space.</h2><p>Open your My Home, saved releases, or account settings.</p></div><nav aria-label="Authenticated participation shortcuts"><Link href="/">My Home <span aria-hidden="true">→</span></Link><Link href="/library">My Library <span aria-hidden="true">→</span></Link><Link href="/account">Account <span aria-hidden="true">→</span></Link></nav></section> : null}
        <section className="community-portal__code" data-section-accent="blue" aria-labelledby="community-code-title"><div><span className="kicker">Our community. Our code.</span><h2 id="community-code-title">Participation with clear boundaries.</h2></div><ul><li><strong>Be respectful</strong><span>Treat people and their work with care.</span></li><li><strong>Be inclusive</strong><span>Design for welcome, access, and belonging.</span></li><li><strong>Be creative</strong><span>Share ideas without taking ownership.</span></li><li><strong>Protect the space</strong><span>Safety and privacy outrank engagement.</span></li></ul></section>
      </div>
    </main>
  );
}
