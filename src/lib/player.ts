/**
 * Cryptic Signal player model (CRY-242 shared player).
 *
 * Tracks are derived from published releases so the shared player inherits the
 * same rights and visibility governance as every other public surface —
 * `publicReleases()` has already applied `isPubliclyRenderable`, and
 * `releaseDestination()` keeps links pointing at the consolidated routes.
 *
 * Catalog audio is not published yet, so seed tracks carry no `src`. The
 * player treats a src-less track as a silent preview: transport, timeline and
 * queue all behave normally against the declared duration, and real streaming
 * begins the moment a file URL is attached to a track here.
 */

import {
  publicReleases,
  releaseDestination,
  releaseImage,
  type Release,
} from "@/lib/releases";

export interface PlayerTrack {
  id: string;
  title: string;
  artist: string;
  /** Square-ish artwork served from /public. */
  artwork: string;
  /** Runtime in seconds. */
  duration: number;
  /** Audio file URL. Absent until catalog audio publishes. */
  src?: string;
  format: string;
  bitrate: string;
  /** In-platform destination for the track's release view. */
  href?: string;
}

/**
 * Where the audio bytes come from.
 *
 * Default is `/audio`, i.e. files committed under `public/audio` and served
 * by Next as static assets. That is fine for a few preview tracks; it is not
 * the production answer (see docs/CRY_AudioStorage notes). Point
 * NEXT_PUBLIC_AUDIO_BASE_URL at a bucket or CDN origin and every track here
 * moves with it — the player itself never changes.
 */
const AUDIO_BASE = (process.env.NEXT_PUBLIC_AUDIO_BASE_URL ?? "/audio").replace(/\/$/, "");

function audioUrl(file: string): string {
  return `${AUDIO_BASE}/${file}`;
}

/** Published audio, newest first. Durations are refined from file metadata on load. */
const CATALOG_TRACKS: PlayerTrack[] = [
  {
    id: "reflection",
    title: "Reflection",
    artist: "Cryptic Signal",
    artwork: "/images/signal-systems.png",
    duration: 149,
    src: audioUrl("cda001-reflection.mp3"),
    format: "MP3",
    bitrate: "320 Kbps",
    href: "/audio",
  },
  {
    id: "baseline",
    title: "Baseline",
    artist: "Cryptic Signal",
    artwork: "/images/entertainment-feature.png",
    duration: 205,
    src: audioUrl("labprmg001-baseline.mp3"),
    format: "MP3",
    bitrate: "320 Kbps",
    href: "/audio",
  },
];

const FLAGSHIP_TRACK: PlayerTrack = {
  id: "signal-systems",
  title: "Signal & Systems",
  artist: "Cryptic Signal",
  artwork: "/images/signal-systems.png",
  duration: 312,
  format: "MP3",
  bitrate: "320 Kbps",
  href: "/audio",
};

/** Deterministic placeholder runtime so the timeline reads naturally. */
function seedDuration(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) hash = (hash * 31 + slug.charCodeAt(i)) % 997;
  return 168 + (hash % 220);
}

function trackFromRelease(release: Release): PlayerTrack {
  return {
    id: release.slug,
    title: release.title,
    artist: "Cryptic Signal",
    artwork: releaseImage(release),
    duration: seedDuration(release.slug),
    format: "MP3",
    bitrate: "320 Kbps",
    href: releaseDestination(release),
  };
}

/** The default listening queue: the flagship release plus published audio. */
export function defaultQueue(): PlayerTrack[] {
  const seen = new Set<string>([FLAGSHIP_TRACK.id, ...CATALOG_TRACKS.map((t) => t.id)]);
  const listening: PlayerTrack[] = [];

  for (const release of publicReleases()) {
    const isListening = release.kind === "audio" || release.lanes.includes("listen");
    if (!isListening || seen.has(release.slug)) continue;
    seen.add(release.slug);
    listening.push(trackFromRelease(release));
  }

  return [...CATALOG_TRACKS, FLAGSHIP_TRACK, ...listening];
}

/** mm:ss, padded so the timeline does not shift width as it counts. */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}
