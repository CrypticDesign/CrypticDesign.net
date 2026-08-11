import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getService, publicServices } from "@/lib/services";

const details: Record<string, { image: string; accent: string; promise: string; process: string[]; deliverables: string[]; proof: { label: string; href: string }[] }> = {
  "product-strategy": {
    image: "/images/service-strategy.png", accent: "#ed00a8",
    promise: "Turn uncertainty into a shared product direction your team can explain, test, and deliver.",
    process: ["Frame the decision, constraints, and evidence gaps.", "Study users, stakeholders, competitors, and the existing product.", "Model journeys, services, risks, and opportunity areas.", "Prioritize a practical roadmap with measurable decision points."],
    deliverables: ["Research plan and synthesis", "Experience or service audit", "Journey and ecosystem maps", "Product principles", "Opportunity backlog", "Prioritized roadmap and decision brief"],
    proof: [{ label: "WellSky enterprise portfolio", href: "/professional/case-studies#wellsky" }, { label: "WIN Reality product experience", href: "/professional/case-studies#win-reality" }],
  },
  "ux-interaction": {
    image: "/images/service-ux.png", accent: "#00e5ff",
    promise: "Make complex workflows feel direct, learnable, and dependable across screens, controllers, and immersive environments.",
    process: ["Understand user goals, contexts, failure points, and system constraints.", "Map information architecture and critical end-to-end workflows.", "Prototype interaction models at the right fidelity for each decision.", "Evaluate, iterate, and support implementation with the delivery team."],
    deliverables: ["Information architecture", "Task and user flows", "Wireframes and interaction models", "Interactive prototypes", "Usability findings", "Accessibility and implementation guidance"],
    proof: [{ label: "Humankind console editions", href: "/professional/case-studies#humankind-console" }, { label: "Onward tactical VR", href: "/professional/case-studies#onward-vr" }],
  },
  "interface-systems": {
    image: "/images/service-interface.png", accent: "#ffd400",
    promise: "Create an interface language that stays coherent as products, teams, and platforms grow.",
    process: ["Audit existing patterns, inconsistencies, and implementation constraints.", "Define foundations for hierarchy, color, type, spacing, states, and motion.", "Build reusable components around real product workflows.", "Document governance and partner with engineering through adoption."],
    deliverables: ["Interface inventory and audit", "Design foundations", "Component architecture", "Responsive patterns", "Accessibility specifications", "Documentation and adoption plan"],
    proof: [{ label: "WellSky design language system", href: "/professional/case-studies#wellsky" }, { label: "WIN Reality component system", href: "/professional/case-studies#win-reality" }],
  },
  "creative-technology": {
    image: "/images/service-creative-tech.png", accent: "#00f0a8",
    promise: "Use emerging technology to prove meaningful experiences—not novelty without a product purpose.",
    process: ["Define the audience value and the question a prototype must answer.", "Select the smallest credible technical approach.", "Build and test an experiential prototype under real constraints.", "Document feasibility, risks, production requirements, and next decisions."],
    deliverables: ["Experience concept and technical framing", "Real-time or immersive prototype", "Interaction and content model", "Feasibility assessment", "Production pipeline guidance", "Experiment findings and recommended next step"],
    proof: [{ label: "Digimancy Project WIRE", href: "/professional/case-studies#digimancy-wire" }, { label: "Onward tactical VR", href: "/professional/case-studies#onward-vr" }],
  },
};

export function generateStaticParams() { return publicServices().map((service) => ({ slug: service.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const service = getService((await params).slug);
  return service ? { title: service.title, description: service.summary, alternates: { canonical: `/professional/${service.slug}` }, openGraph: { images: ["/share/professional.png"] }, twitter: { card: "summary_large_image", images: ["/share/professional.png"] } } : {};
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const service = getService((await params).slug);
  if (!service) notFound();
  const detail = details[service.slug];
  if (!detail) notFound();

  return (
    <main>
      <section className="visual-hero !min-h-[560px]">
        <div className="visual-hero__image"><Image src={detail.image} alt="" fill priority sizes="100vw" /></div>
        <div className="visual-hero__wash" />
        <div className="visual-hero__content">
          <div className="signal-rail" style={{ color: detail.accent }} />
          <span className="kicker" style={{ color: detail.accent }}>Professional capability</span>
          <h1 className="display-title">{service.title}</h1>
          <p>{detail.promise}</p>
          <div className="hero-actions"><Link href="/professional/inquiry" className="button">Start a project</Link><Link href="/professional/services" className="button secondary" style={{ borderColor: detail.accent }}>All services</Link></div>
        </div>
      </section>

      <div className="shell page-stack">
        <section className="feature-split">
          <div className="feature-split__image"><Image src={detail.image} alt={`${service.title} capability illustration`} fill sizes="(max-width:900px) 100vw, 58vw" /></div>
          <div className="feature-split__content !border-l-2" style={{ borderLeftColor: detail.accent }}>
            <span className="kicker" style={{ color: detail.accent }}>The engagement</span>
            <h2>{service.summary}</h2>
            <p>{service.description}</p>
            <p><strong className="text-[var(--foreground)]">Best suited for:</strong> {service.audience}</p>
          </div>
        </section>

        <section>
          <div className="section-heading"><div><span className="kicker" style={{ color: detail.accent }}>How the work moves</span><h2 className="section-title">From ambiguity to an implementable system.</h2></div><p>The exact shape adapts to the team, evidence, and production stage.</p></div>
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{detail.process.map((step, index) => <li key={step} className="panel p-6"><span className="mb-4 block text-xs font-bold" style={{ color: detail.accent }}>0{index + 1}</span><p className="m-0 text-sm leading-relaxed text-[var(--muted)]">{step}</p></li>)}</ol>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="panel p-7"><span className="kicker" style={{ color: detail.accent }}>Typical deliverables</span><h2 className="section-title">Tangible tools for decisions and delivery.</h2><ul className="mt-6 grid gap-3 sm:grid-cols-2">{detail.deliverables.map((item) => <li key={item} className="border-l-2 pl-3 text-sm text-[var(--muted)]" style={{ borderColor: detail.accent }}>{item}</li>)}</ul></div>
          <div className="panel p-7"><span className="kicker" style={{ color: detail.accent }}>Selected proof</span><h2 className="section-title">See the capability in context.</h2><div className="mt-6 flex flex-col">{detail.proof.map((item) => <Link key={item.href} href={item.href} className="border-t border-[var(--border)] py-4 text-sm font-semibold transition hover:pl-2" style={{ color: detail.accent }}>{item.label} <span aria-hidden>→</span></Link>)}</div></div>
        </section>

        <section className="panel p-8 sm:p-10"><span className="kicker" style={{ color: detail.accent }}>Start with the problem</span><div className="section-heading !mb-0"><h2 className="section-title">Not sure which capability fits?</h2><p>Describe the decision, workflow, or system that is creating friction. We can shape the right engagement from there.</p></div><div className="hero-actions"><Link href="/professional/inquiry" className="button">Start a project inquiry</Link></div></section>
      </div>
    </main>
  );
}
