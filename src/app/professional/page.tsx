import type { Metadata } from "next";
import Link from "next/link";
import { publicServices } from "@/lib/services";

export const metadata: Metadata = {
  title: "Professional Services",
  alternates: { canonical: "/professional" },
  description: "Cryptic Design's professional UX and creative technology practice.",
};

export default function ProfessionalHub() {
  const services = publicServices();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Professional Services</h1>
        <p className="max-w-xl text-neutral-400">
          Cryptic Design is a UX and creative technology studio. Explore a focused service path, then start a review-based inquiry.
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
      <Link href="/professional/inquiry" className="w-fit rounded-control bg-accent-blue px-5 py-2.5 text-sm font-medium text-black">
        Start an inquiry
      </Link>
    </main>
  );
}
