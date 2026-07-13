import {
  isPubliclyRenderable,
  type PublicContentGovernance,
  withReviewMetadata,
} from "@/lib/releases";

export interface Service extends PublicContentGovernance {
  slug: string;
  title: string;
  summary: string;
  description: string;
  audience: string;
  capabilities: string[];
}

export const SERVICES: Service[] = withReviewMetadata<Service>([
  {
    slug: "product-strategy",
    title: "Product Strategy",
    summary: "Research, framing, roadmaps, and service models for complex products.",
    description:
      "Cryptic Design helps teams understand customers and markets, audit existing experiences, prioritize opportunities, and turn ambiguous product challenges into clear strategic direction.",
    audience: "Leaders shaping connected products, platforms, services, and portfolios.",
    capabilities: ["Customer and market research", "Heuristic review", "Prioritization and roadmaps", "Journey maps", "Service blueprints", "Contextual inquiry", "Data analysis"],
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "published",
  },
  {
    slug: "ux-interaction",
    title: "UX & Interaction",
    summary: "Research-driven workflows, interaction models, and prototypes.",
    description:
      "From key workflow wireframes through interaction design and concept validation, Cryptic Design creates intuitive experiences grounded in user needs and real system constraints.",
    audience: "Teams building software, games, immersive products, and digital services.",
    capabilities: ["Key workflow wireframes", "Interaction design", "Visual design", "Prototyping", "Concept validation", "Content strategy", "Accessibility"],
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "published",
  },
  {
    slug: "interface-systems",
    title: "Interface Systems",
    summary: "Scalable design systems and front-end patterns built for delivery.",
    description:
      "Cryptic Design connects interface architecture, reusable components, accessibility, and implementation guidance so product teams can move from concepts to coherent, durable systems.",
    audience: "Organizations modernizing complex products or aligning design and development.",
    capabilities: ["Design systems", "Component architecture", "Front-end development", "Accessibility", "Workflow documentation", "Implementation support"],
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "published",
  },
  {
    slug: "creative-technology",
    title: "Creative Technology",
    summary: "Games, real-time systems, XR, AI, and immersive prototyping.",
    description:
      "Cryptic Design explores real-time, generative, and interactive production approaches while grounding them in a clear audience and product purpose.",
    audience: "Organizations exploring new media, tools, and interactive formats.",
    capabilities: ["Creative prototyping", "Unreal Engine", "Unity", "AR and VR", "AI-native exploration", "Mobile and console interaction"],
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "published",
  },
]);

export function publicServices(): Service[] {
  return SERVICES.filter(isPubliclyRenderable);
}

export function getService(slug: string): Service | undefined {
  return publicServices().find((service) => service.slug === slug);
}
