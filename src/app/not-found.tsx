import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-4 py-24 sm:px-6">
      <span className="kicker text-accent-cyan">Error 404</span>
      <h1 className="display-title text-white">This signal didn&rsquo;t resolve.</h1>
      <p className="max-w-xl text-muted-foreground">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved. Head back to a front door and keep exploring.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className="button">My Home</Link>
        <Link href="/entertainment" className="button secondary">Entertainment</Link>
        <Link href="/professional" className="button secondary">Professional</Link>
      </div>
    </main>
  );
}
