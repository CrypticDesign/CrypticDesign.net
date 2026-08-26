import { professionalCopy as copy } from "@/lib/professional-copy";
import Image from "next/image";
import Link from "next/link";
import { caseStudies } from "@/lib/case-studies";

export default function ProfessionalProofCards({ selected = false }: { selected?: boolean }) {
  const studies = selected ? ["humankind-console", "win-reality", "wellsky"].flatMap(slug => caseStudies.filter(study => study.slug === slug)) : caseStudies;
  return <div className="media-grid">{studies.map(study => <Link key={study.slug} href={"/professional/case-studies#" + study.slug} className="media-card accent-violet">
    <div className="media-card__image"><Image src={study.hero.src} alt="" fill sizes="(max-width:640px) 100vw, 33vw" /></div>
    <div className="media-card__body"><span className="kicker">{study.discipline}</span><h3>{study.title}</h3><p className="!mb-3 !text-[var(--foreground)]">{study.engagement}</p><p>{selected ? copy.proof.summaries[study.slug as keyof typeof copy.proof.summaries] : study.problem}</p><span className="text-link">View Case Study <span aria-hidden="true">→</span></span></div>
  </Link>)}</div>;
}
