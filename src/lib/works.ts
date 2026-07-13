import {
  isPubliclyRenderable,
  type PublicContentGovernance,
  withReviewMetadata,
} from "@/lib/releases";

export type WorkKind = "world" | "lab" | "article" | "platform";

export interface Work extends PublicContentGovernance {
  slug: string;
  title: string;
  summary: string;
  description: string;
  kind: WorkKind;
  releaseSlugs: string[];
}

export const WORKS: Work[] = withReviewMetadata<Work>([
  {
    slug: "singularis",
    title: "Singularis",
    summary: "A flagship original world spanning playable and cinematic releases.",
    description:
      "Singularis is an original Cryptic Design world. Its first public releases provide a rights-safe entry point while the broader world continues in development.",
    kind: "world",
    releaseSlugs: ["singularis-vertical-slice", "singularis-overture", "singularis-themes-vol-1"],
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "scheduled",
  },
  {
    slug: "visual-studies",
    title: "Visual Studies",
    summary: "A Creative Labs series exploring signal, structure, light, and motion.",
    description:
      "Visual Studies gathers rights-safe experiments and process work from Cryptic Design's Creative Labs practice.",
    kind: "lab",
    releaseSlugs: ["visual-study-01"],
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "scheduled",
  },
  {
    slug: "holistic-ux",
    title: "Holistic UX",
    summary: "Systems-level design practice across games, entertainment, and technology.",
    description:
      "Holistic UX is Cryptic Design's approach to connecting audience needs, systems, interfaces, and production realities into coherent experiences.",
    kind: "article",
    releaseSlugs: ["holistic-ux-field-notes"],
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "scheduled",
  },
  {
    slug: "crypticdesign-net",
    title: "CrypticDesign.net",
    summary: "The browser-first platform foundation for Cryptic Design.",
    description:
      "CrypticDesign.net brings together original releases, professional services, creator opportunities, and the worlds behind the work.",
    kind: "platform",
    releaseSlugs: ["platform-devlog-01"],
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "scheduled",
  },
]);

export function publicWorks(): Work[] {
  return WORKS.filter(isPubliclyRenderable);
}

export function getWork(slug: string): Work | undefined {
  return publicWorks().find((work) => work.slug === slug);
}
