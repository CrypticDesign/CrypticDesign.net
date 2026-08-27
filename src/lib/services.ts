import { isPubliclyRenderable, type PublicContentGovernance, withReviewMetadata } from "@/lib/releases";

export interface Service extends PublicContentGovernance {
  slug: string;
  title: string;
  summary: string;
  description: string;
  image: string;
  capabilities: string[];
  groups: { title: string; items: string[] }[];
  engagements: string[];
}

// Current services strategy: Confluence 465076225. Governance is unchanged.
export const SERVICES: Service[] = withReviewMetadata<Service>([
  {
    "slug": "product-strategy",
    "title": "Product Strategy",
    "summary": "Frame the right problem before committing to the solution. Research, audits, product framing, roadmaps, stakeholder alignment, and senior design leadership.",
    "description": "Define the right problem, align the system around it, and make the decisions that should exist before delivery cost accelerates.",
    "image": "/images/service-strategy.png",
    "capabilities": [
      "Research and UX/product audits",
      "Product framing",
      "Roadmaps and service models",
      "Stakeholder alignment",
      "Fractional design leadership"
    ],
    "groups": [
      {
        "title": "Research & Assessment",
        "items": [
          "UX/product audits",
          "user and stakeholder research",
          "competitive/system analysis",
          "evidence synthesis"
        ]
      },
      {
        "title": "Product Framing",
        "items": [
          "problem and opportunity definition",
          "experience principles",
          "requirements and constraints",
          "success measures"
        ]
      },
      {
        "title": "Roadmaps & Service Models",
        "items": [
          "experience roadmaps",
          "journey/service models",
          "prioritization",
          "phased delivery strategy"
        ]
      },
      {
        "title": "Senior Design Leadership",
        "items": [
          "fractional leadership",
          "design direction",
          "cross-functional alignment",
          "critique and decision governance"
        ]
      }
    ],
    "engagements": [
      "Audit & Assessment",
      "Scoped Product / UX Engagement",
      "Embedded / Fractional Leadership"
    ],
    "rights_status": "owned",
    "visibility_status": "public",
    "publication_status": "published"
  },
  {
    "slug": "ux-interaction",
    "title": "UX & Interaction",
    "summary": "Turn complex tasks, player systems, and workflows into clear, learnable interactions through information architecture, flows, prototyping, and validation.",
    "description": "Make complex workflows, game systems, and product behavior understandable without stripping away the depth that makes them valuable.",
    "image": "/images/service-ux.png",
    "capabilities": [
      "User and player flows",
      "Game UX",
      "Information architecture",
      "Interaction design and prototyping",
      "Usability evaluation"
    ],
    "groups": [
      {
        "title": "User / Player Flows",
        "items": [
          "task models",
          "game/player flows",
          "journeys",
          "state transitions"
        ]
      },
      {
        "title": "Information Architecture",
        "items": [
          "navigation",
          "hierarchy",
          "content/system relationships",
          "discovery models"
        ]
      },
      {
        "title": "Interaction Design",
        "items": [
          "wireframes",
          "prototypes",
          "control models",
          "responsive interaction behavior"
        ]
      },
      {
        "title": "Validation",
        "items": [
          "usability evaluation",
          "heuristic review",
          "playtest/interaction feedback",
          "iterative refinement"
        ]
      }
    ],
    "engagements": [
      "Audit & Assessment",
      "Scoped Product / UX Engagement",
      "Prototype & Systems Sprint"
    ],
    "rights_status": "owned",
    "visibility_status": "public",
    "publication_status": "published"
  },
  {
    "slug": "interface-systems",
    "title": "Interface Systems",
    "summary": "Build reusable interface foundations that stay coherent as products scale: design systems, UI architecture, accessibility, states, patterns, and implementation guidance.",
    "description": "Build reusable interface foundations that make products easier to scale, implement, maintain, and understand.",
    "image": "/images/service-interface.png",
    "capabilities": [
      "Design systems",
      "UI architecture",
      "Accessibility and state behavior",
      "Implementation patterns",
      "Delivery governance"
    ],
    "groups": [
      {
        "title": "Design Systems",
        "items": [
          "tokens",
          "components",
          "patterns",
          "documentation"
        ]
      },
      {
        "title": "UI Architecture",
        "items": [
          "hierarchy",
          "states",
          "responsive behavior",
          "interaction contracts"
        ]
      },
      {
        "title": "Accessibility & Quality",
        "items": [
          "keyboard/focus behavior",
          "contrast and semantic states",
          "responsive validation",
          "implementation QA"
        ]
      },
      {
        "title": "Delivery Governance",
        "items": [
          "design-to-development handoff",
          "implementation patterns",
          "traceable decisions",
          "reusable standards"
        ]
      }
    ],
    "engagements": [
      "Audit & Assessment",
      "Scoped Product / UX Engagement",
      "Embedded / Fractional Leadership"
    ],
    "rights_status": "owned",
    "visibility_status": "public",
    "publication_status": "published"
  },
  {
    "slug": "creative-technology",
    "title": "Creative Technology",
    "summary": "Prototype and integrate emerging interaction systems across games, real-time experiences, XR, spatial computing, and AI-assisted production workflows.",
    "description": "Use real-time, spatial, game, and AI-assisted systems where they create a meaningful capability advantage rather than novelty for its own sake.",
    "image": "/images/service-creative-tech.png",
    "capabilities": [
      "Games and real-time systems",
      "XR and spatial prototyping",
      "AI-assisted workflow systems",
      "Production-system consulting",
      "Selective implementation support"
    ],
    "groups": [
      {
        "title": "Games & Real-Time Systems",
        "items": [
          "game UX prototypes",
          "real-time interfaces",
          "interactive simulations",
          "WebGL / engine-based proof work"
        ]
      },
      {
        "title": "XR & Spatial Prototyping",
        "items": [
          "VR/AR interaction models",
          "spatial interfaces",
          "immersive workflows",
          "experience prototypes"
        ]
      },
      {
        "title": "AI-Assisted Workflow Systems",
        "items": [
          "production workflow design",
          "human-in-the-loop systems",
          "generative pipeline integration",
          "reusable agent/tooling patterns"
        ]
      },
      {
        "title": "Selective Implementation Support",
        "items": [
          "prototype implementation",
          "front-end/interaction support",
          "design QA",
          "technical handoff continuity"
        ]
      }
    ],
    "engagements": [
      "Prototype & Systems Sprint",
      "Scoped Product / UX Engagement",
      "Embedded / Fractional Leadership"
    ],
    "rights_status": "owned",
    "visibility_status": "public",
    "publication_status": "published"
  }
]);
export function publicServices(): Service[] { return SERVICES.filter(isPubliclyRenderable); }
export function getService(slug: string): Service | undefined { return publicServices().find(service => service.slug === slug); }
