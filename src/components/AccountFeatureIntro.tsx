import Image from "next/image";
import Link from "next/link";

type FeatureAccent = "blue" | "cyan" | "gold" | "magenta";
type FeatureItem = { title: string; body: string };
type FeatureAction = { href: string; label: string };

export default function AccountFeatureIntro({ accent, eyebrow, title, description, image, imageAlt, benefits, steps, primaryAction, secondaryAction, note }: {
  accent: FeatureAccent;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  benefits: readonly FeatureItem[];
  steps: readonly FeatureItem[];
  primaryAction: FeatureAction;
  secondaryAction?: FeatureAction;
  note: string;
}) {
  return (
    <section className="account-feature-intro" data-accent={accent}>
      <div className="account-feature-intro__hero">
        <div className="account-feature-intro__image"><Image src={image} alt={imageAlt} fill sizes="(max-width: 900px) 100vw, 64vw" priority /></div>
        <div className="account-feature-intro__wash" />
        <div className="account-feature-intro__copy">
          <div className="signal-rail" />
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="hero-actions">
            <Link href={primaryAction.href} className="button">{primaryAction.label}</Link>
            {secondaryAction ? <Link href={secondaryAction.href} className="button secondary">{secondaryAction.label}</Link> : null}
          </div>
        </div>
      </div>
      <div className="account-feature-intro__value">
        <header><span className="eyebrow">Subscriber value</span><h2>What membership is designed to unlock</h2></header>
        <div className="account-feature-benefits">
          {benefits.map((benefit, index) => <article key={benefit.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{benefit.title}</h3><p>{benefit.body}</p></article>)}
        </div>
      </div>
      <div className="account-feature-intro__steps">
        <span className="eyebrow">How it works</span>
        <ol>{steps.map((step, index) => <li key={step.title}><strong>{index + 1}</strong><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol>
        <p className="account-feature-intro__note">{note}</p>
      </div>
    </section>
  );
}
