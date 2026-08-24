import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import CommunityDestinationHero from "@/components/CommunityDestinationHero";

export const metadata: Metadata = {
  title: "Community Creators",
  description: "Discover verified creators and their published relationship to Cryptic Design work.",
  alternates: { canonical: "/community/creators" },
};

export default function CommunityCreatorsPage() {
  return (
    <main className="community-destination">
      <CommunityDestinationHero eyebrow="Community / Creators" title="Discover people through their work." body="Creator discovery connects verified people to public projects, releases, media, games, and community participation. It does not grant publishing or account authority." icon="discover" status="One verified public creator profile" image="/images/professional-hero.png" />
      <div className="shell community-destination__stack">
        <section aria-labelledby="featured-creators-title">
          <div className="public-home-portal__section-label"><h2 id="featured-creators-title">Featured creators</h2><span>Verified public information only</span></div>
          <article className="community-creator-card">
            <div className="community-creator-card__image"><Image src="/images/professional-case.png" alt="Abstract Cryptic Design studio artwork" fill sizes="(max-width:800px) 100vw,40vw" /></div>
            <div className="community-creator-card__copy"><span className="kicker !text-[var(--cry-spectrum-yellow)]">Founder &amp; managing member</span><h2>Robert K. Croft</h2><p>User-experience designer, creative strategist, author, and founder of Cryptic Design. Public work spans experience design, games, research, original worlds, and creative technology.</p><div className="hero-actions"><Link href="/professional" className="button home-primary-cta">View studio profile</Link><Link href="/professional/articles" className="button secondary">Read published work</Link></div></div>
          </article>
        </section>
        <section className="community-creator-boundary" aria-labelledby="creator-boundary-title"><span className="kicker">Authority boundary</span><h2 id="creator-boundary-title">Discovery is not publishing authority.</h2><p>A discoverable creator remains governed by the authenticated platform account, review workflows, content permissions, and publication approval. Community does not create a second identity or Creator Studio.</p><Link href="/professional/creators">View the reviewed contributor path <span aria-hidden="true">→</span></Link></section>
      </div>
    </main>
  );
}
