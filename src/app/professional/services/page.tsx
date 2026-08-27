import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProfessionalServiceCards from "@/components/ProfessionalServiceCards";
import { professionalCopy as copy } from "@/lib/professional-copy";
export const metadata: Metadata = {
  title: "Professional Services",
  description: "Product strategy, UX and interaction, interface systems, and creative technology services from Cryptic Design.",
  alternates: { canonical: "/professional/services" },
  openGraph: { title: "Professional Services", description: "Product strategy, UX and interaction, interface systems, and creative technology services.", url: "/professional/services", images: ["/share/professional.png"] },
  twitter: { card: "summary_large_image", images: ["/share/professional.png"] },
  robots: { index: true, follow: true },
};

export default function ServicesPage() {
  return <main><section className="visual-hero !min-h-[520px]"><div className="visual-hero__image"><Image src="/images/professional-hero.png" alt="" fill priority sizes="100vw" /></div><div className="visual-hero__wash" /><div className="visual-hero__content"><div className="signal-rail" /><span className="kicker">Services</span><h1 className="display-title">{copy.services.title}</h1><p>{copy.services.lead}</p><div className="hero-actions"><Link href="/professional/inquiry" className="button">Start a Project</Link></div></div></section>
    <div className="shell page-stack"><section aria-labelledby="services-title"><h2 id="services-title" className="section-title mb-6">Four connected capability areas</h2><ProfessionalServiceCards expanded /></section>
    <section className="panel p-7 sm:p-10"><h2 className="section-title">Engagements scale around the problem, not headcount.</h2><p className="mt-5 max-w-4xl leading-relaxed text-[var(--muted)]">{copy.services.engagement}</p><Link href="/professional/inquiry" className="text-link">Start a Project</Link></section>
    <section className="feature-split"><div className="feature-split__content"><h2>{copy.services.proof}</h2><Link href="/professional/case-studies" className="text-link">Explore Case Studies</Link></div><div className="feature-split__image"><Image src="/images/professional-case.png" alt="Complex systems visualization" fill sizes="(max-width:900px) 100vw, 45vw" /></div></section></div>
  </main>;
}
