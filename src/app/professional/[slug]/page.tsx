import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getService, publicServices } from "@/lib/services";

export function generateStaticParams() {
  return publicServices().map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const service = getService((await params).slug);
  return service ? { title: service.title, description: service.summary, alternates: { canonical: `/professional/${service.slug}` } } : {};
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const service = getService((await params).slug);
  if (!service) notFound();

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-7 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">{service.title}</h1>
        <p className="text-lg text-neutral-400">{service.summary}</p>
      </header>
      <p className="max-w-2xl text-neutral-300">{service.description}</p>
      <section className="rounded-card border border-border bg-surface p-5">
        <h2 className="font-medium text-foreground">Who it helps</h2>
        <p className="mt-2 text-sm text-muted-foreground">{service.audience}</p>
        <ul className="mt-4 list-disc pl-5 text-sm text-muted-foreground">
          {service.capabilities.map((capability) => <li key={capability}>{capability}</li>)}
        </ul>
      </section>
      <Link href="/professional/inquiry" className="w-fit rounded-control bg-accent-blue px-5 py-2.5 text-sm font-medium text-black">Start an inquiry</Link>
    </main>
  );
}
