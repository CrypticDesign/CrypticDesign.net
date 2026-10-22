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
  /** Whether this browser may request the source. Restricted tracks never expose one. */
  availability: "public" | "unavailable" | "restricted";
  /** Explicit V1 disposition for optional navigation and accessibility media. */
  support: {
    chapters: "available" | "not-offered";
    captions: "available" | "not-applicable" | "not-offered";
    transcript: "available" | "not-offered";
  };
  format: string;
  bitrate: string;
  /** In-platform destination for the track's release view. */
  href?: string;
}

export type PlayerPlaybackStatus =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "buffering"
  | "offline"
  | "unavailable"
  | "restricted"
  | "interrupted"
  | "error";

export interface PlayerStatusPresentation {
  label: string;
  message: string;
  retryable: boolean;
}

/** Establish the truthful state before the browser attempts playback. */
export function initialPlaybackStatus(
  track: PlayerTrack | undefined,
  online = true,
): PlayerPlaybackStatus {
  if (!track) return "unavailable";
  if (track.availability === "restricted") return "restricted";
  if (track.availability === "unavailable" || !track.src) return "unavailable";
  if (!online) return "offline";
  return "idle";
}

/** Public-facing status copy shared by the visual and assistive interfaces. */
export function playerStatusPresentation(status: PlayerPlaybackStatus): PlayerStatusPresentation {
  switch (status) {
    case "loading":
      return { label: "Loading", message: "Preparing this track.", retryable: false };
    case "ready":
      return { label: "Ready", message: "This track is ready to play.", retryable: false };
    case "playing":
      return { label: "Playing", message: "Playback is active.", retryable: false };
    case "paused":
      return { label: "Paused", message: "Playback is paused.", retryable: false };
    case "buffering":
      return { label: "Buffering", message: "Playback will continue when enough audio is ready.", retryable: false };
    case "offline":
      return { label: "Offline", message: "Reconnect to continue listening.", retryable: true };
    case "unavailable":
      return { label: "Unavailable", message: "Audio is not available for this track.", retryable: false };
    case "restricted":
      return { label: "Restricted", message: "This track is not available with your current access.", retryable: false };
    case "interrupted":
      return { label: "Paused for experience", message: "Another experience is using audio. Playback will resume when it ends.", retryable: false };
    case "error":
      return { label: "Playback problem", message: "The track could not be played. Try again.", retryable: true };
    default:
      return { label: "Ready", message: "Choose play to begin listening.", retryable: false };
  }
}

export function playbackIsBlocked(status: PlayerPlaybackStatus): boolean {
  return status === "offline" || status === "unavailable" || status === "restricted" || status === "interrupted";
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
    availability: "public",
    support: { chapters: "not-offered", captions: "not-applicable", transcript: "not-offered" },
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
    availability: "public",
    support: { chapters: "not-offered", captions: "not-applicable", transcript: "not-offered" },
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
    availability: "public",
    support: { chapters: "not-offered", captions: "not-applicable", transcript: "not-offered" },
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
    availability: "public",
    support: { chapters: "not-offered", captions: "not-applicable", transcript: "not-offered" },
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
