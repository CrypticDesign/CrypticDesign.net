import Link from "next/link";
import type { Release } from "@/lib/releases";

const ACCENT_BORDER: Record<Release["accent"], string> = {
  blue: "after:bg-accent-blue",
  cyan: "after:bg-accent-cyan",
  magenta: "after:bg-accent-magenta",
  gold: "after:bg-accent-gold",
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
      className={`panel panel-interactive group relative flex w-[82vw] max-w-80 shrink-0 flex-col overflow-hidden after:absolute after:inset-x-0 after:bottom-0 after:h-px sm:w-72 ${ACCENT_BORDER[release.accent]}`}
    >
      <div className={`art-field h-32 border-b border-border ${release.kind === "video" ? "art-orb" : release.kind === "article" ? "art-figure" : ""}`} />
      <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="uppercase tracking-wider">
          {KIND_LABEL[release.kind]}
        </span>
        {release.status === "coming-soon" && (
          <span className="border border-border bg-surface-raised px-2 py-0.5">
            Coming soon
          </span>
        )}
      </div>
      <h3 className="font-semibold text-foreground group-hover:text-white">
        {release.title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{release.tagline}</p>
      </div>
    </Link>
  );
}
