import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { publicServices } from "@/lib/services";

export const metadata: Metadata = {
  title: "Professional Services",
  description: "Product strategy, UX and interaction, interface systems, and creative technology services from Cryptic Design.",
  alternates: { canonical: "/professional/services" },
  openGraph: { images: ["/share/professional.png"] },
  twitter: { card: "summary_large_image", images: ["/share/professional.png"] },
};

const images = ["/images/service-strategy.png", "/images/service-ux.png", "/images/service-interface.png", "/images/service-creative-tech.png"];

export default function ServicesPage() {
  const services = publicServices().slice(0, 4);
  return <main>
    <section className="visual-hero !min-h-[520px]">
      <div className="visual-hero__image"><Image src="/images/professional-hero.png" alt="Abstract connected product systems" fill priority sizes="100vw" /></div>
      <div className="visual-hero__wash" />
      <div className="visual-hero__content"><div className="signal-rail text-[#ed00a8]" /><span className="kicker !text-[#ed00a8]">Professional services</span><h1 className="display-title">One practice, from product direction through delivery.</h1><p>Choose the capability that matches the problem in front of you. Each engagement can stand alone or combine into a focused product-design partnership.</p></div>
    </section>
    <div className="shell page-stack">
      <section><div className="section-heading"><div><span className="kicker !text-[#ed00a8]">Capabilities</span><h2 className="section-title">How Cryptic Design can help.</h2></div><p>Senior, systems-level support shaped around the work—not a fixed package.</p></div>
        <div className="service-grid">{services.map((service, index) => <Link key={service.slug} href={`/professional/${service.slug}`} className="service-card"><div className="service-card__image"><Image src={images[index]} alt={`${service.title} capability illustration`} fill sizes="(max-width:640px) 100vw, 25vw" /></div><div className="service-card__copy"><span className="kicker">0{index + 1} / Capability</span><h3>{service.title}</h3><p>{service.summary}</p><span className="text-link">Explore service +</span></div></Link>)}</div>
      </section>
      <section className="feature-split"><div className="feature-split__content"><span className="kicker !text-[#ed00a8]">Not sure where to start?</span><h2>Bring the problem. We’ll define the right engagement.</h2><p>The inquiry path captures the product context, constraints, and outcome so the first conversation can be useful.</p><div className="hero-actions"><Link href="/professional/inquiry" className="button">Start a project</Link><Link href="/professional/case-studies" className="button secondary !border-[#ed00a8]">See the work</Link></div></div><div className="feature-split__image"><Image src="/images/professional-case.png" alt="Complex systems visualization" fill sizes="(max-width:900px) 100vw, 45vw" /></div></section>
    </div>
  </main>;
}
