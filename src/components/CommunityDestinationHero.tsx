import Image from "next/image";
import type { EcosystemPortalIconName } from "@/components/EcosystemPortalIcon";
import PortalIcon from "@/components/EcosystemPortalIcon";

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
    <section className="visual-hero community-destination__hero" aria-labelledby="community-destination-title">
      <div className="visual-hero__image"><Image src={image} alt="" fill priority sizes="100vw" /></div>
      <div className="visual-hero__wash" />
      <div className="visual-hero__content community-destination__hero-content">
        <div className="signal-rail text-[#9b5cff]" />
        <span className="kicker !text-[#b786ff]">{eyebrow}</span>
        <h1 id="community-destination-title" className="display-title">{title}</h1>
        <p>{body}</p>
        <div className="community-destination__state"><span className="portal-entry__icon"><PortalIcon name={icon} /></span><strong>{status}</strong></div>
      </div>
    </section>
  );
}
