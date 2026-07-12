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
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6">
      <section className="flex flex-col gap-4">
        <span className="text-xs uppercase tracking-widest text-accent-blue">Cryptic Design LLC</span>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Professional</h1>
        <p className="max-w-2xl text-neutral-400">
          The front door to our services, collaborations, capabilities, research,
          partnerships, and professional work. Explore a focused path or begin a review-based inquiry.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        {services.map((service) => (
          <Link key={service.slug} href={`/professional/${service.slug}`} className="rounded-card border border-border bg-surface p-5 transition-colors hover:border-accent-blue">
            <h2 className="font-medium text-foreground">{service.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{service.summary}</p>
          </Link>
        ))}
      </section>
      <Link href="/professional/inquiry" className="w-fit rounded-control bg-accent-blue px-5 py-2.5 text-sm font-medium text-black">Start an inquiry</Link>
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
