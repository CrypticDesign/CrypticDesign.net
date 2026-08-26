import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageScene from "@/components/PageScene";
import ProfessionalServiceCards from "@/components/ProfessionalServiceCards";
import ProfessionalProofCards from "@/components/ProfessionalProofCards";
import { professionalCopy as copy } from "@/lib/professional-copy";

export const metadata:Metadata={title:"Professional",alternates:{canonical:"/professional"}, openGraph: { title:"Professional Design Services",description:"Senior UX, product strategy, interface systems, and creative-technology consulting for complex products.",url:"/professional",images: ["/share/professional.png"] }, twitter: { card: "summary_large_image", images: ["/share/professional.png"] }, robots:{index:true,follow:true}, description: "Cryptic Design LLC: senior UX, product, and creative-technology consulting — research, interaction design, interface systems, and case studies for complex work."};

export default function ProfessionalHub() {
  return <main>
    <section className="visual-hero !min-h-[620px]" data-section-accent="violet" aria-labelledby="professional-title">
      <PageScene sceneId="professional" fallbackPoster="/images/professional-hero.png" /><div className="visual-hero__wash" />
      <div className="visual-hero__content"><div className="signal-rail" /><span className="kicker">Professional</span><h1 id="professional-title" className="display-title">{copy.hero.title}</h1><p>{copy.hero.lead}</p><div className="hero-actions"><Link href="/professional/inquiry" className="button">Start a Project</Link><Link href="/professional/case-studies" className="button secondary">View Case Studies</Link></div></div>
    </section>
    <div className="shell page-stack">
      <section id="capabilities" aria-labelledby="capabilities-title"><div className="section-heading"><div><span className="kicker">Capabilities</span><h2 id="capabilities-title" className="section-title">{copy.capabilities.title}</h2></div><p>{copy.capabilities.lead}</p></div><ProfessionalServiceCards /><Link href="/professional/services" className="text-link">Explore Services</Link></section>
      <section id="engagement" aria-labelledby="engagement-title"><div className="section-heading"><div><span className="kicker">Engagement / Ways to Engage</span><h2 id="engagement-title" className="section-title">{copy.engagement.title}</h2></div><p>{copy.engagement.lead}</p></div><div className="grid gap-4 md:grid-cols-2">{copy.engagement.cards.map(card => <div key={card.title} className="panel border-t-2 border-t-[var(--section-accent)] p-6"><h3 className="text-xl font-semibold">{card.title}</h3><p className="mt-3 leading-relaxed text-[var(--muted)]">{card.copy}</p></div>)}</div><p className="mt-6 text-[var(--muted)]">{copy.engagement.support}</p><Link href="/professional/inquiry" className="text-link">Discuss the Work</Link></section>
      <section id="selected-proof" aria-labelledby="proof-title"><div className="section-heading"><div><span className="kicker">Selected Work</span><h2 id="proof-title" className="section-title">{copy.proof.title}</h2></div><p>{copy.proof.lead}</p></div><ProfessionalProofCards selected /><Link href="/professional/case-studies" className="text-link">View All Case Studies</Link></section>
      <section id="experience" className="panel p-7 sm:p-10" aria-labelledby="experience-title"><span className="kicker">Experience Context</span><h2 id="experience-title" className="section-title mt-3">{copy.experience.title}</h2><p className="mt-5 max-w-4xl leading-relaxed text-[var(--muted)]">{copy.experience.lead}</p></section>
      <section id="method" aria-labelledby="method-title"><div className="section-heading"><div><span className="kicker">Method</span><h2 id="method-title" className="section-title">{copy.method.title}</h2></div></div><div className="method-grid">{copy.method.steps.map((step,index) => <div className="method-step" key={step.title}><strong>0{index + 1}</strong><h3>{step.title}</h3><p>{step.copy}</p></div>)}</div></section>
      <section id="principles" aria-labelledby="principles-title"><span className="kicker">Principles</span><h2 id="principles-title" className="section-title mt-3">How we work</h2><ul className="mt-6 grid gap-4 sm:grid-cols-2">{copy.principles.map(item => <li key={item.title} className="border-l-2 border-[var(--section-accent-border)] pl-4 leading-relaxed"><strong>{item.title}</strong> <span className="text-[var(--muted)]">{item.copy}</span></li>)}</ul></section>
      <section id="founder" className="feature-split" aria-labelledby="founder-title"><div className="feature-split__content"><span className="kicker">Founder / Senior Practice</span><h2 id="founder-title">{copy.founder.title}</h2><p>{copy.founder.lead}</p><Link href="/professional/case-studies" className="text-link">View Case Studies</Link></div><div className="feature-split__image"><Image src="/images/team/robert-croft.png" alt="Portrait of Robert Croft, founder of Cryptic Design" fill sizes="(max-width:900px) 100vw, 40vw" /></div></section>
      <section id="start-project" className="panel p-7 sm:p-10" aria-labelledby="start-title"><h2 id="start-title" className="section-title">{copy.final.title}</h2><p className="mt-5 max-w-3xl leading-relaxed text-[var(--muted)]">{copy.final.lead}</p><div className="hero-actions"><Link href="/professional/inquiry" className="button">Start a Project</Link></div></section>
    </div>
  </main>;
}
