import Link from "next/link";
import type { Release } from "@/lib/releases";

const ACCENT_BORDER: Record<Release["accent"], string> = {
  blue: "border-t-accent-blue",
  cyan: "border-t-accent-cyan",
  magenta: "border-t-accent-magenta",
  gold: "border-t-accent-gold",
};

const KIND_LABEL: Record<Release["kind"], string> = {
  video: "Video",
  audio: "Audio",
  game: "Game",
  article: "Article",
  lab: "Lab",
};

export default function ReleaseCard({ release }: { release: Release }) {
  const href = release.productSlug
    ? `/products/${release.productSlug}?release=${release.slug}`
    : `/releases/${release.slug}`;

  return (
    <Link
      href={href}
      className={`group flex w-64 shrink-0 flex-col gap-2 rounded-lg border border-neutral-800 border-t-2 bg-neutral-950 p-4 transition-colors hover:border-neutral-600 sm:w-72 ${ACCENT_BORDER[release.accent]}`}
    >
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span className="uppercase tracking-wider">
          {KIND_LABEL[release.kind]}
        </span>
        {release.status === "coming-soon" && (
          <span className="rounded bg-neutral-900 px-2 py-0.5">
            Coming soon
          </span>
        )}
      </div>
      <h3 className="font-medium text-neutral-100 group-hover:text-white">
        {release.title}
      </h3>
      <p className="text-sm text-neutral-400">{release.tagline}</p>
    </Link>
  );
}
