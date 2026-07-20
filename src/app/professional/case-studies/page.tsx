import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Case Studies",
  alternates: { canonical: "/professional/case-studies" },
  description:
    "Selected Cryptic Design work — problem, approach, craft, outcome.",
};

// CRY-344 item 4: content migrated from the legacy services/portfolio pages.
// Rights confirmed by Robert 2026-07-20. Imagery ships with item 6 asset export.
type CaseStudy = {
  slug: string;
  title: string;
  years: string;
  engagement: string;
  problem: string;
  approach: string;
  craft: string;
  outcome: string;
};

const caseStudies: CaseStudy[] = [
  {
    slug: "humankind-console",
    title: "Humankind — Console Editions",
    years: "2022",
    engagement:
      "Cryptic Design engagement with Amplitude Studios and Aspyr Media",
    problem:
      "Bring a deep, systems-heavy 4X strategy game designed for PC to console platforms without losing the depth and complexity players expect.",
    approach:
      "Reverse-engineered the PC SKU's design systems and interaction models, then rebuilt them for controller-based play through iterative prototyping and user testing.",
    craft:
      "Optimized interfaces and refined control schemes across the game's core management systems — wonders, military movement and tactical actions, outposts, and cities — tuned for readability and strategy-focused interaction on console.",
    outcome:
      "Console editions retained the original PC version's depth while fitting the constraints and capabilities of console platforms, delivering a polished, user-friendly strategy experience.",
  },
  {
    slug: "win-reality",
    title: "WIN Reality — VR Baseball Training",
    years: "2021–2022",
    engagement: "Founder engagement at WIN Reality",
    problem:
      "Enhance the overall user experience of a VR baseball training simulator, including a new visual theme, branding, and user flow.",
    approach:
      "Began with a comprehensive research phase to build deep insight into the product, user behavior, company needs, and stakeholder perspectives before designing.",
    craft:
      "New visual theme, brand direction, and restructured user flows designed for immersive VR training contexts.",
    outcome:
      "A clearer, more cohesive training experience grounded in research rather than assumption, aligned with both athlete needs and company goals.",
  },
  {
    slug: "wellsky",
    title: "WellSky — Enterprise Health Portfolio",
    years: "2019–2020",
    engagement:
      "Senior User Experience Designer within WellSky's engineering organization",
    problem:
      "Address the UX needs of an extensive healthcare software portfolio spanning roughly 70 products.",
    approach:
      "Worked embedded with a team of UX designers, researchers, and managers, bringing senior product thinking to a large multi-role enterprise environment.",
    craft:
      "Information architecture, workflows, and interface systems for complex operational healthcare products.",
    outcome:
      "Coherent, user-centered UX support across one of the largest product portfolios in post-acute healthcare software.",
  },
  {
    slug: "rise-to-power",
    title: "Star Wars: Rise to Power",
    years: "2018",
    engagement:
      "UI/UX design at Electronic Arts, in collaboration with Lucasfilm",
    problem:
      "Establish and define the UI design for an unlaunched mobile strategy game, aligned with Star Wars' strategic and cinematic identity.",
    approach:
      "Worked closely with game designers, UI artists, programmers, and QA to problem-solve, implement, and test designs through iteration.",
    craft:
      "High-quality concept interfaces focused on intuitive navigation, strategic decision-making mechanics, and scalable UI elements supporting fleet management, diplomacy, and base building.",
    outcome:
      "A defined UI design language for the game's core systems; the title was ultimately unlaunched, and the work stands as a study in strategy-game interface design at franchise scale.",
  },
];

export default function CaseStudiesPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-white">Case Studies</h1>
        <p className="max-w-xl text-muted-foreground">
          Selected work told as problem → approach → craft → outcome. Client
          material appears here only after explicit case-safe review.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {caseStudies.map((cs) => (
          <article
            key={cs.slug}
            id={cs.slug}
            className="rounded-card border border-border p-6 sm:p-8"
          >
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-2xl font-semibold text-white">{cs.title}</h2>
              <p className="text-sm text-neutral-500">
                {cs.years} · {cs.engagement}
              </p>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["Problem", cs.problem],
                  ["Approach", cs.approach],
                  ["Craft", cs.craft],
                  ["Outcome", cs.outcome],
                ] as const
              ).map(([label, body]) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <dt className="text-xs font-semibold uppercase tracking-[.08em] text-accent-cyan">
                    {label}
                  </dt>
                  <dd className="text-sm leading-relaxed text-neutral-400">
                    {body}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <p className="text-sm text-neutral-500">
        Case-study imagery is being prepared from the studio archive and will
        accompany these engagements.
      </p>
      <Link
        href="/professional"
        className="text-sm text-accent-cyan hover:underline"
      >
        ← Professional Studio
      </Link>
    </main>
  );
}
