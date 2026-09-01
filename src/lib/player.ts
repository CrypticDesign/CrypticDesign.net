/**
 * Cryptic Signal player model (CRY-242 shared player).
 *
 * The default queue only includes tracks with published audio. This keeps the
 * global player honest: every item shown in the library can actually play.
 */

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

/** Published audio in library order. Durations are refined from file metadata on load. */
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
  {
    id: "kyrie-of-a-dying-star-cabaret",
    title: "Kyrie of a Dying Star Cabaret",
    artist: "Cryptic Signal",
    artwork: "/images/singularis.png",
    duration: 257,
    src: audioUrl("sin-kyrie-of-a-dying-star-cabaret.mp3"),
    format: "MP3",
    bitrate: "181 Kbps",
    href: "/products/singularis",
  },
  {
    id: "leviathan-dreaming",
    title: "Leviathan Dreaming",
    artist: "Cryptic Signal",
    artwork: "/images/singularis.png",
    duration: 393,
    src: audioUrl("sin-leviathan-dreaming.mp3"),
    format: "MP3",
    bitrate: "173 Kbps",
    href: "/products/singularis",
  },
];

/** The default listening queue contains playable, published audio only. */
export function defaultQueue(): PlayerTrack[] {
  return [...CATALOG_TRACKS];
}

/** mm:ss, padded so the timeline does not shift width as it counts. */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}
