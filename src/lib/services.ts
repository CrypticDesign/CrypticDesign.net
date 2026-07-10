import {
  isPubliclyRenderable,
  type PublicContentGovernance,
} from "@/lib/releases";

export interface Service extends PublicContentGovernance {
  slug: string;
  title: string;
  summary: string;
  description: string;
  audience: string;
  capabilities: string[];
}

export const SERVICES: Service[] = [
  {
    slug: "holistic-ux",
    title: "Holistic UX",
    summary: "Design systems and experiences that connect strategy, interaction, and craft.",
    description:
      "Cryptic Design helps teams frame complex product and experience challenges as coherent systems, from research and information architecture through interaction design.",
    audience: "Teams shaping connected products, platforms, and experiences.",
    capabilities: ["UX strategy", "Information architecture", "Interaction design"],
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "published",
  },
  {
    slug: "game-ux",
    title: "Game UX",
    summary: "Player-facing systems, onboarding, and interface design for games.",
    description:
      "Cryptic Design brings systems-minded UX practice to game experiences, helping teams make complex mechanics, progression, and player journeys clear and usable.",
    audience: "Studios building games, interactive worlds, and live experiences.",
    capabilities: ["Game UX", "Onboarding", "Systems design"],
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "published",
  },
  {
    slug: "creative-technology",
    title: "Creative Technology",
    summary: "Practical experimentation where science, art, and technology meet.",
    description:
      "Cryptic Design explores real-time, generative, and interactive production approaches while grounding them in a clear audience and product purpose.",
    audience: "Organizations exploring new media, tools, and interactive formats.",
    capabilities: ["Creative prototyping", "Real-time workflows", "AI-native exploration"],
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "published",
  },
];

export function publicServices(): Service[] {
  return SERVICES.filter(isPubliclyRenderable);
}

export function getService(slug: string): Service | undefined {
  return publicServices().find((service) => service.slug === slug);
}
