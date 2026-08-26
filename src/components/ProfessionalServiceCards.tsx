import Image from "next/image";
import Link from "next/link";
import { publicServices } from "@/lib/services";

export default function ProfessionalServiceCards({ expanded = false }: { expanded?: boolean }) {
  return <div className="service-grid">{publicServices().map((service, index) => <Link key={service.slug} href={"/professional/" + service.slug} className="service-card">
    <div className="service-card__image"><Image src={service.image} alt="" fill sizes="(max-width:640px) 100vw, 25vw" /></div>
    <div className="service-card__copy"><span className="kicker">0{index + 1} / Capability</span><h3>{service.title}</h3><p>{service.summary}</p>{expanded && <ul className="mt-5 list-disc space-y-2 pl-4 text-sm text-[var(--muted)]">{service.capabilities.map(item => <li key={item}>{item}</li>)}</ul>}<span className="text-link">Explore {service.title} <span aria-hidden="true">→</span></span></div>
  </Link>)}</div>;
}
