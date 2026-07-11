import type { Metadata } from "next";
import Link from "next/link";
import { publicProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Products & Franchises",
  alternates: { canonical: "/products" },
  description: "Cryptic Design product and franchise homes.",
};

export default function ProductsPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Products &amp; Franchises</h1>
        <p className="max-w-2xl text-muted-foreground">
          Each product home gathers its releases, updates, and story on the
          platform.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {publicProducts().map((p) => (
          <Link key={p.slug} href={`/products/${p.slug}`} className="rounded-card border border-border bg-surface p-5 transition-colors hover:border-accent-blue">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-foreground">{p.title}</h2>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{p.status.replace("-", " ")}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
