import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CaseStudyGallery from "@/components/CaseStudyGallery";

export const metadata: Metadata = {
  title: "Case Studies",
  alternates: { canonical: "/professional/case-studies" }, openGraph: { title: "UX & Product Design Case Studies", description: "Console game UX, VR training, enterprise health systems, tactical games, and mobile strategy work.", url: "/professional/case-studies", images: ["/share/case-studies.png"] }, twitter: { card: "summary_large_image", images: ["/share/case-studies.png"] }, robots: { index: true, follow: true },
  description: "Selected Cryptic Design work — console game UX, VR training, enterprise health systems, and mobile strategy — told as problem, approach, craft, and outcome.",
};

import { caseStudies } from "@/lib/case-studies";
import ProfessionalProofCards from "@/components/ProfessionalProofCards";
import { professionalCopy as copy } from "@/lib/professional-copy";

const accentHex = {
  magenta: "var(--cry-accent-magenta)",
  cyan: "var(--cry-accent-cyan)",
  violet: "var(--section-accent-text)",
  indigo: "var(--cry-accent-indigo)",
} as const;

export default function CaseStudiesPage() {
  return (
    <main>
      <section className="visual-hero">
        <div className="visual-hero__image">
          <Image
            src="/images/professional-hero.png"
            alt="Abstract luminous network representing interconnected experience systems"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="visual-hero__wash" />
        <div className="visual-hero__content">
          <div className="signal-rail " />
          <span className="kicker ">
            Selected work / problem → approach → craft → outcome
          </span>
          <h1 className="display-title">{copy.cases.title}</h1><p>{copy.cases.lead}</p>
          <div className="hero-actions">
            <Link href="/professional/inquiry" className="button">
              Start a Project
            </Link>
            <Link
              href="/professional"
              className="button secondary !border-[var(--section-accent)]"
            >
              Professional Studio
            </Link>
          </div>
        </div>
      </section>

      <div className="shell page-stack">
        <nav id="case-study-index" aria-label="Case study index"><h2 className="section-title mb-6">Explore the work</h2><ProfessionalProofCards /></nav>

        {caseStudies.map((cs, index) => {
          const hex = accentHex[cs.accent];
          const imageFirst = index % 2 === 0;
          return (
            <section key={cs.slug} id={cs.slug} className="flex flex-col gap-5">
              <div className="section-heading">
                <div>
                  <span className="kicker" style={{ color: hex }}>
                    {cs.years} / {cs.discipline}
                  </span>
                  <h2 className="section-title">{cs.title}</h2>
                </div>
                <p>{cs.engagement}</p>
              </div>

              <div className={`feature-split ${imageFirst ? "" : "reverse"}`}>
                <div className="feature-split__image">
                  <Image
                    src={cs.hero.src}
                    alt={cs.hero.alt}
                    fill
                    sizes="(max-width:900px) 100vw, 60vw"
                  />
                </div>
                <div
                  className="feature-split__content !border-l-2"
                  style={{ borderLeftColor: hex }}
                >
                  <dl className="grid gap-5 sm:grid-cols-2">
                    {(
                      [
                        ["Problem", cs.problem],
                        ["Approach", cs.approach],
                        ["Craft", cs.craft],
                        ["Outcome", cs.outcome],
                      ] as const
                    ).map(([label, body]) => (
                      <div key={label} className="flex flex-col gap-2">
                        <dt
                          className="text-[10px] font-bold uppercase tracking-[.1em]"
                          style={{ color: hex }}
                        >
                          {label}
                        </dt>
                        <dd className="m-0 text-[13px] leading-relaxed text-[var(--muted)]">
                          {body}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <details className="panel group" open={index === 0}>
                <summary className="cursor-pointer list-none p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="kicker" style={{ color: hex }}>Project gallery</span>
                      <h3 className="text-lg font-semibold">Explore {cs.shots.length} design views</h3>
                    </div>
                    <span aria-hidden="true" className="text-2xl transition-transform group-open:rotate-45" style={{ color: hex }}>+</span>
                  </div>
                </summary>
                <div className="border-t border-[var(--border)] p-5 sm:p-6">
                  <CaseStudyGallery shots={cs.shots} accent={cs.accent} accentHex={hex} studyTitle={cs.title} />
                </div>
              </details>

              {cs.faq && (
                <section aria-labelledby={`${cs.slug}-faq-heading`} className="panel p-6 sm:p-8">
                  <div className="mb-6 max-w-3xl">
                    <span className="kicker" style={{ color: hex }}>Project FAQ</span>
                    <h3 id={`${cs.slug}-faq-heading`} className="section-title">Questions about the work</h3>
                  </div>
                  <div className="grid gap-8 lg:grid-cols-3">
                    {cs.faq.map((group) => (
                      <div key={group.title} className="flex flex-col gap-3">
                        <h4 className="text-sm font-semibold uppercase tracking-[.08em]" style={{ color: hex }}>
                          {group.title}
                        </h4>
                        {group.items.map((item) => (
                          <details key={item.question} className="border-t border-[var(--border)] py-4">
                            <summary className="cursor-pointer text-sm font-semibold leading-relaxed text-[var(--foreground)]">
                              {item.question}
                            </summary>
                            <div className="pt-3 text-[13px] leading-relaxed text-[var(--muted)]">
                              <p>{item.answer}</p>
                              {item.bullets && (
                                <ul className="mt-3 list-disc space-y-2 pl-5">
                                  {item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                                </ul>
                              )}
                            </div>
                          </details>
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              )}
              <div className="hero-actions"><Link href="/professional/case-studies#case-study-index" className="button secondary">View All Case Studies</Link><Link href="/professional/inquiry" className="button">Start a Project</Link></div>
            </section>
          );
        })}

        <section className="panel p-7 sm:p-10">
          <div className="section-heading !mb-0">
            <div>
              <span className="kicker ">Working together</span>
              <h2 className="section-title">
                Have a system that needs to make sense to real people?
              </h2>
            </div>
            <p>
              Client material appears here only after explicit case-safe
              review. Engagement context is stated with each study.
            </p>
          </div>
          <div className="hero-actions">
            <Link href="/professional/inquiry" className="button">
              Start a Project
            </Link>
            <Link
              href="/professional/contact"
              className="button secondary !border-[var(--section-accent)]"
            >
              Contact the studio
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
