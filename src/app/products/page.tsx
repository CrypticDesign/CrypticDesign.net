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
    <main className="shell page-stack">
      <header className="art-field grid min-h-72 items-end border border-border p-6 sm:p-8 lg:grid-cols-[1fr_.7fr]">
        <div className="flex flex-col gap-3"><span className="eyebrow text-accent-magenta">Entertainment collection</span>
        <h1 className="display-title text-white">Products &amp; Franchises</h1>
        <p className="max-w-2xl text-muted-foreground">
          Each product home gathers its releases, updates, and story on the
          platform.
        </p></div><div />
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {publicProducts().map((p) => (
          <Link key={p.slug} href={`/products/${p.slug}`} className="panel panel-interactive min-h-44 p-5 hover:border-accent-magenta">
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
