import type { Metadata } from "next";
import Link from "next/link";
import { publicServices } from "@/lib/services";

export const metadata: Metadata = {
  title: "Professional",
  alternates: { canonical: "/professional" },
  description: "The front door to Cryptic Design LLC services, collaborations, capabilities, and partnerships.",
};

export default function ProfessionalHub() {
  const services = publicServices();
  return (
    <main className="shell page-stack">
      <section className="art-field art-figure grid min-h-[27rem] items-center border border-accent-magenta/25 p-6 sm:p-10 lg:grid-cols-[1fr_.8fr]">
        <div className="flex flex-col gap-4">
        <span className="text-xs uppercase tracking-widest text-accent-blue">Cryptic Design LLC</span>
        <h1 className="display-title text-white">Designing systems people can understand, trust, and use.</h1>
        <p className="max-w-2xl text-neutral-400">
          The front door to our services, collaborations, capabilities, research,
          partnerships, and professional work. Explore a focused path or begin a review-based inquiry.
        </p><div className="flex flex-wrap gap-3"><Link href="/professional/inquiry" className="rounded-control bg-accent-magenta px-5 py-2.5 text-sm font-semibold text-black">Start an inquiry</Link><Link href="/professional/case-studies" className="rounded-control border border-border bg-background/40 px-5 py-2.5 text-sm text-foreground">View our work</Link></div>
        </div><div />
      </section>
      <section><div className="mb-5"><span className="eyebrow text-accent-magenta">Capabilities</span><h2 className="section-title mt-3">Capability built across the product stack.</h2></div><div className="grid gap-4 sm:grid-cols-3">
        {services.map((service) => (
          <Link key={service.slug} href={`/professional/${service.slug}`} className="panel panel-interactive min-h-44 p-5 hover:border-accent-magenta">
            <h2 className="font-medium text-foreground">{service.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{service.summary}</p>
          </Link>
        ))}
      </div></section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/professional/case-studies", title: "Case Studies" },
          { href: "/professional/articles", title: "Articles & Research" },
          { href: "/professional/creators", title: "Collaborating Creators" },
          { href: "/professional/contact", title: "Contact" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="rounded-card border border-border bg-surface p-4 text-sm font-medium text-foreground transition-colors hover:border-accent-blue">{item.title}</Link>
        ))}
      </section>
    </main>
  );
}
