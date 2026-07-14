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

export interface PublicContentGovernance {
  rights_status: RightsStatus;
  visibility_status: VisibilityStatus;
  publication_status: PublicationStatus;
  owner: string;
  approval_notes: string;
  last_reviewed: string;
}

type ReviewMetadata = "owner" | "approval_notes" | "last_reviewed";
type GovernedSeed<T extends PublicContentGovernance> = Omit<T, ReviewMetadata>;

export function withReviewMetadata<T extends PublicContentGovernance>(
  items: GovernedSeed<T>[],
): T[] {
  return items.map((item) => ({
    ...item,
    owner: "Cryptic Design, LLC",
    approval_notes: "Owned seed content; final publishing review required.",
    last_reviewed: "2026-07-13",
  })) as T[];
}

export interface Release extends PublicContentGovernance {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  kind: ReleaseKind;
  lanes: LaneSlug[];
  /** Originating project (grouping metadata only — projects are not hubs). */
  project?: string;
  /** In-platform product context used for franchise release discovery. */
  productSlug?: string;
  /** ISO date (YYYY-MM-DD). */
  releasedAt: string;
  status: "released" | "coming-soon";
  accent: Accent;
  /** Benefit required when visibility_status is entitlement-required. */
  requiredBenefitId?: string;
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

export const RELEASES: Release[] = withReviewMetadata<Release>([
  {
    slug: "singularis-vertical-slice",
    title: "Singularis: Vertical Slice",
    tagline: "A playable first passage into the Singularis universe.",
    description:
      "The first playable slice of Singularis — a browser-first experience exploring the core loop, tone, and world of Cryptic Design's flagship original IP.",
    kind: "game",
    lanes: ["play"],
    project: "Singularis",
    productSlug: "singularis",
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
      "A short cinematic introducing the Singularis universe, produced through the studio's Unreal-plus-AI creative process.",
    kind: "video",
    lanes: ["watch"],
    project: "Singularis",
    productSlug: "singularis",
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
      "Early thematic material from the Singularis score — motifs and atmospheres from the world's first act.",
    kind: "audio",
    lanes: ["listen"],
    project: "Singularis",
    productSlug: "singularis",
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
      "The first entry in the Creative Labs visual-studies series — an experiment at the intersection of code, composition, and motion.",
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
      "Notes from two decades of UX practice across games, entertainment, and enterprise — on designing systems holistically rather than screen by screen.",
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
      "The first development log for CrypticDesign.net — its architecture, guiding principles, and what ships next.",
    kind: "article",
    lanes: ["read"],
    project: "Platform",
    releasedAt: "2026-07-15",
    status: "coming-soon",
    rights_status: "owned",
    visibility_status: "entitlement-required",
    requiredBenefitId: "benefit_updates",
    publication_status: "scheduled",
    accent: "cyan",
  },
]);

export function getLane(slug: string): Lane | undefined {
  return LANES.find((lane) => lane.slug === slug);
}

/**
 * Public pages must use this guard before rendering content. Its explicit
 * checks keep a future untyped/admin-fed item from leaking by default.
 */
export function isPubliclyRenderable<T extends PublicContentGovernance>(
  content: T,
): boolean {
  const rightsPermitPublicView = [
    "owned",
    "licensed",
    "client-approved",
    "collaborator-approved",
  ].includes(content.rights_status);

  const isPubliclyVisible = ["public", "account-required", "entitlement-required"].includes(content.visibility_status);
  const isPublishedOrScheduled =
    content.publication_status === "published" ||
    content.publication_status === "scheduled";

  return rightsPermitPublicView && isPubliclyVisible && isPublishedOrScheduled;
}

export type ContentAccessDecision = "granted" | "account-required" | "entitlement-required" | "not-renderable";

export function evaluateReleaseAccess(
  release: Release,
  viewer: { authenticated: boolean; entitlements: readonly string[] },
): ContentAccessDecision {
  if (!isPubliclyRenderable(release)) return "not-renderable";
  if (release.visibility_status === "public") return "granted";
  if (!viewer.authenticated) return "account-required";
  if (release.visibility_status === "account-required") return "granted";
  return release.requiredBenefitId && viewer.entitlements.includes(release.requiredBenefitId)
    ? "granted"
    : "entitlement-required";
}

export function publicReleases(): Release[] {
  return RELEASES.filter(isPubliclyRenderable);
}

export function getRelease(slug: string): Release | undefined {
  return publicReleases().find((release) => release.slug === slug);
}

export function releaseImage(release: Release): string {
  if (release.productSlug === "singularis") return "/images/singularis.png";
  if (release.kind === "audio") return "/images/signal-systems.png";
  if (release.kind === "article") return "/images/human-machine.png";
  return "/images/entertainment-feature.png";
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
