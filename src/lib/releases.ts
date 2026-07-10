/**
 * Release object model — releases are the core published objects of the
 * platform. Entertainment lanes are discovery lanes that route to releases.
 * Data here is placeholder-safe seed content (owned Cryptic Design IP only)
 * until the admin publishing workflow (CRY-252) exists.
 */

export type LaneSlug =
  | "watch"
  | "listen"
  | "play"
  | "read"
  | "creative-labs"
  | "rooms"
  | "collections";

export type ReleaseKind = "video" | "audio" | "game" | "article" | "lab";

export type Accent = "blue" | "cyan" | "magenta" | "gold";

/** Asset-rights state. Restricted states always override public visibility. */
export type RightsStatus =
  | "owned"
  | "licensed"
  | "client-approved"
  | "collaborator-approved"
  | "restricted"
  | "internal-only"
  | "blocked-pending-review";

/** Audience/access state, evaluated after rights status. */
export type VisibilityStatus =
  | "public"
  | "unlisted"
  | "account-required"
  | "entitlement-required"
  | "client-private"
  | "operator-only"
  | "hidden";

export type PublicationStatus = "draft" | "scheduled" | "published";

export interface Lane {
  slug: LaneSlug;
  name: string;
  blurb: string;
}

export interface Release {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  kind: ReleaseKind;
  lanes: LaneSlug[];
  /** Originating project (grouping metadata only — projects are not hubs). */
  project?: string;
  /** ISO date (YYYY-MM-DD). */
  releasedAt: string;
  status: "released" | "coming-soon";
  /** Required before any public rendering decision. */
  rights_status: RightsStatus;
  visibility_status: VisibilityStatus;
  publication_status: PublicationStatus;
  accent: Accent;
}

export const LANES: Lane[] = [
  { slug: "watch", name: "Watch", blurb: "Cinematics, shorts, and series." },
  { slug: "listen", name: "Listen", blurb: "Original scores and audio works." },
  { slug: "play", name: "Play", blurb: "Playable releases and prototypes." },
  { slug: "read", name: "Read", blurb: "Articles, research, and worldbuilding." },
  {
    slug: "creative-labs",
    name: "Creative Labs",
    blurb: "Visual studies and experiments in progress.",
  },
  { slug: "rooms", name: "Rooms", blurb: "Shared spaces. Opening in a later release." },
  {
    slug: "collections",
    name: "Collections",
    blurb: "Curated groupings across every lane.",
  },
];

export const RELEASES: Release[] = [
  {
    slug: "singularis-vertical-slice",
    title: "Singularis: Vertical Slice",
    tagline: "A playable first passage into the Singularis universe.",
    description:
      "The first playable slice of Singularis — a browser-first vertical slice exploring the core loop, tone, and world of Cryptic Design's flagship original IP. Placeholder entry pending the published build.",
    kind: "game",
    lanes: ["play"],
    project: "Singularis",
    releasedAt: "2026-08-01",
    status: "coming-soon",
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "scheduled",
    accent: "magenta",
  },
  {
    slug: "singularis-overture",
    title: "Singularis: Overture",
    tagline: "A cinematic prologue rendered in the Unreal + AI pipeline.",
    description:
      "A short cinematic introducing the Singularis universe, produced through the studio's Unreal-plus-AI production pipeline. Placeholder entry pending the published cut.",
    kind: "video",
    lanes: ["watch"],
    project: "Singularis",
    releasedAt: "2026-08-15",
    status: "coming-soon",
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "scheduled",
    accent: "blue",
  },
  {
    slug: "singularis-themes-vol-1",
    title: "Singularis Themes, Vol. 1",
    tagline: "First musical sketches from the Singularis score.",
    description:
      "Early thematic material from the Singularis score — motifs and atmospheres from the world's first act. Placeholder entry pending the published tracks.",
    kind: "audio",
    lanes: ["listen"],
    project: "Singularis",
    releasedAt: "2026-08-15",
    status: "coming-soon",
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "scheduled",
    accent: "gold",
  },
  {
    slug: "visual-study-01",
    title: "Visual Study 01",
    tagline: "A generative study in signal, structure, and light.",
    description:
      "The first entry in the Creative Labs visual-studies series — an experiment at the intersection of code, composition, and motion. Placeholder entry pending migration of the Visual Studies archive (CRY-256).",
    kind: "lab",
    lanes: ["creative-labs"],
    project: "Creative Labs",
    releasedAt: "2026-07-20",
    status: "coming-soon",
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "scheduled",
    accent: "cyan",
  },
  {
    slug: "holistic-ux-field-notes",
    title: "Holistic UX: Field Notes",
    tagline: "Designing whole systems, not screens.",
    description:
      "Notes from two decades of UX practice across games, entertainment, and enterprise — on designing systems holistically rather than screen by screen. Placeholder entry pending the published article.",
    kind: "article",
    lanes: ["read"],
    project: "Studio",
    releasedAt: "2026-07-25",
    status: "coming-soon",
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "scheduled",
    accent: "blue",
  },
  {
    slug: "platform-devlog-01",
    title: "Platform Devlog 01",
    tagline: "Building CrypticDesign.net in the open.",
    description:
      "The first development log for the CrypticDesign.net platform itself — architecture, doctrine, and what ships next. Placeholder entry pending the published post.",
    kind: "article",
    lanes: ["read"],
    project: "Platform",
    releasedAt: "2026-07-15",
    status: "coming-soon",
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "scheduled",
    accent: "cyan",
  },
];

export function getLane(slug: string): Lane | undefined {
  return LANES.find((lane) => lane.slug === slug);
}

/**
 * Public pages must use this guard before rendering content. Its explicit
 * checks keep a future untyped/admin-fed item from leaking by default.
 */
export function isPubliclyRenderable(release: Release): boolean {
  const rightsPermitPublicView = [
    "owned",
    "licensed",
    "client-approved",
    "collaborator-approved",
  ].includes(release.rights_status);

  const isPubliclyVisible = release.visibility_status === "public";
  const isPublishedOrScheduled =
    release.publication_status === "published" ||
    release.publication_status === "scheduled";

  return rightsPermitPublicView && isPubliclyVisible && isPublishedOrScheduled;
}

export function publicReleases(): Release[] {
  return RELEASES.filter(isPubliclyRenderable);
}

export function getRelease(slug: string): Release | undefined {
  return publicReleases().find((release) => release.slug === slug);
}

export function releasesForLane(lane: LaneSlug): Release[] {
  return publicReleases().filter((release) => release.lanes.includes(lane)).sort(
    (a, b) => b.releasedAt.localeCompare(a.releasedAt),
  );
}

export function newestReleases(count: number): Release[] {
  return publicReleases()
    .sort((a, b) => b.releasedAt.localeCompare(a.releasedAt))
    .slice(0, count);
}
