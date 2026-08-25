import Image from "next/image";
import type { ReactNode } from "react";

export default function AccountSectionHero({ eyebrow, title, description, image, imageAlt, aside }: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  aside?: ReactNode;
}) {
  return (
    <header className="visual-hero account-section-hero">
      <div className="visual-hero__image"><Image src={image} alt={imageAlt} fill priority sizes="100vw" /></div>
      <div className="visual-hero__wash" />
      <div className="visual-hero__content account-section-hero__content">
        <div className="account-section-hero__copy">
          <div className="signal-rail text-[var(--cry-accent-blue)]" />
          <span className="kicker !text-[var(--cry-accent-blue)]">{eyebrow}</span>
          <h1 className="display-title">{title}</h1>
          <p>{description}</p>
        </div>
        {aside ? <aside className="account-section-hero__aside">{aside}</aside> : null}
      </div>
    </header>
  );
}
