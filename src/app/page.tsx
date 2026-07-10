import type { Metadata } from "next";
import Link from "next/link";
import LaneRow from "@/components/LaneRow";
import { newestReleases } from "@/lib/releases";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  description:
    "Cryptic Design — original entertainment, holistic UX, and creative technology from one studio, on one platform.",
};

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6">
      <section className="flex flex-col gap-4 py-8 sm:py-16">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Original worlds. Holistic design.
        </h1>
        <p className="max-w-xl text-neutral-400">
          CrypticDesign.net is the home of Cryptic Design&apos;s original
          releases and its professional practice — entertainment and expertise,
          published from one platform.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href="/personal"
            className="rounded bg-accent-cyan px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Explore the Hub
          </Link>
          <Link
            href="/professional"
            className="rounded border border-neutral-700 px-5 py-2.5 text-sm text-neutral-200 transition-colors hover:border-neutral-400"
          >
            Work with the studio
          </Link>
        </div>
      </section>
      <LaneRow
        title="New Releases"
        href="/personal"
        releases={newestReleases(6)}
      />
    </main>
  );
}
