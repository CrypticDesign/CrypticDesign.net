import Image from "next/image";
import AccountFeatureActions, { type AccountFeatureAction } from "@/components/AccountFeatureActions";

type FeatureAccent = "blue" | "cyan" | "gold" | "magenta";
type FeatureItem = { title: string; body: string };

export default function AccountFeatureIntro({ accent, eyebrow, title, description, image, imageAlt, benefits, steps, primaryAction, secondaryAction, signedInPrimaryAction, signedInSecondaryAction, initialAuthenticated = false, note }: {
  accent: FeatureAccent;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  benefits: readonly FeatureItem[];
  steps: readonly FeatureItem[];
  primaryAction: AccountFeatureAction;
  secondaryAction?: AccountFeatureAction;
  signedInPrimaryAction?: AccountFeatureAction;
  signedInSecondaryAction?: AccountFeatureAction;
  initialAuthenticated?: boolean;
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
          <AccountFeatureActions
            initialAuthenticated={initialAuthenticated}
            signedOutPrimary={primaryAction}
            signedOutSecondary={secondaryAction}
            signedInPrimary={signedInPrimaryAction}
            signedInSecondary={signedInSecondaryAction}
          />
        </div>
      </div>
      <div className="account-feature-intro__value">
        <header><span className="eyebrow">Why subscribe</span><h2>What you get with a subscription</h2></header>
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
