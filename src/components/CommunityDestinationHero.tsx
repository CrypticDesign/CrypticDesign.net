import type { EcosystemPortalIconName } from "@/components/EcosystemPortalIcon";
import PortalIcon from "@/components/EcosystemPortalIcon";
import PageScene from "@/components/PageScene";

type CommunityDestinationHeroProps = {
  eyebrow: string;
  title: string;
  body: string;
  icon: EcosystemPortalIconName;
  status: string;
  image?: string;
};

export default function CommunityDestinationHero({ eyebrow, title, body, icon, status, image = "/images/current-focus.png" }: CommunityDestinationHeroProps) {
  return (
    <section className="visual-hero community-destination__hero" data-section-accent="periwinkle" aria-labelledby="community-destination-title">
      <PageScene sceneId="community" fallbackPoster={image} />
      <div className="visual-hero__wash" />
      <div className="visual-hero__content community-destination__hero-content">
        <div className="signal-rail" />
        <span className="kicker">{eyebrow}</span>
        <h1 id="community-destination-title" className="display-title">{title}</h1>
        <p>{body}</p>
        <div className="community-destination__state"><span className="portal-entry__icon"><PortalIcon name={icon} /></span><strong>{status}</strong></div>
      </div>
    </section>
  );
}
