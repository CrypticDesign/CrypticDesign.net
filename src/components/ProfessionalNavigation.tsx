"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const serviceSlugs = new Set(["product-strategy", "ux-interaction", "interface-systems", "creative-technology"]);
const items = [
  { label: "Overview", description: "Professional studio", href: "/professional", icon: "overview" },
  { label: "Services", description: "Strategy through delivery", href: "/professional/services", icon: "services" },
  { label: "Case Studies", description: "Selected client work", href: "/professional/case-studies", icon: "cases" },
  { label: "Articles", description: "Research & analysis", href: "/professional/articles", icon: "articles" },
  { label: "Start a Project", description: "Tell us the problem", href: "/professional/inquiry", icon: "inquiry" },
];

function Icon({ name }: { name: string }) {
  if (name === "services") return <svg viewBox="0 0 32 32" aria-hidden><path d="M5 9h22M5 16h22M5 23h22"/><circle cx="11" cy="9" r="2"/><circle cx="21" cy="16" r="2"/><circle cx="14" cy="23" r="2"/></svg>;
  if (name === "cases") return <svg viewBox="0 0 32 32" aria-hidden><rect x="5" y="8" width="22" height="17" rx="1"/><path d="M11 8V5h10v3M5 14h22M13 14v3h6v-3"/></svg>;
  if (name === "articles") return <svg viewBox="0 0 32 32" aria-hidden><path d="M8 4h12l5 5v19H8zM20 4v6h5M12 15h9M12 20h9M12 25h6"/></svg>;
  if (name === "inquiry") return <svg viewBox="0 0 32 32" aria-hidden><path d="M4 7h24v18H4zM5 8l11 9L27 8"/></svg>;
  return <svg viewBox="0 0 32 32" aria-hidden><circle cx="16" cy="16" r="6"/><path d="M16 2v6M16 24v6M2 16h6M24 16h6M6 6l4 4M22 22l4 4M26 6l-4 4M10 22l-4 4"/></svg>;
}

export default function ProfessionalNavigation() {
  const pathname = usePathname();
  const segment = pathname.split("/")[2] ?? "";
  const active = (href: string) => href === "/professional/services" ? pathname === href || serviceSlugs.has(segment) : href === "/professional" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return <section className="entertainment-navigation professional-navigation" data-section-theme="lavender" aria-label="Explore Professional"><div className="shell entertainment-navigation__viewport"><nav className="entertainment-navigation__bar professional-navigation__bar" aria-label="Professional sections">{items.map((item) => <Link href={item.href} key={item.href} className="entertainment-navigation__item" data-theme="lavender" aria-current={active(item.href) ? "page" : undefined}><span className="entertainment-navigation__icon"><Icon name={item.icon}/></span><span className="entertainment-navigation__copy"><strong>{item.label}</strong><small>{item.description}</small></span></Link>)}</nav></div></section>;
}
