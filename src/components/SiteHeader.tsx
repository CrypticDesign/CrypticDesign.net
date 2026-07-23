"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MEMBERSHIP_SESSION_CHANGED_EVENT } from "@/lib/membership-session-events";
const NAV=[{href:"/",label:"My Home",tone:"gold"},{href:"/entertainment",label:"Entertainment",tone:"cyan"},{href:"/professional",label:"Professional",tone:"magenta"}] as const;
export default function SiteHeader({ initialAuthenticated = false }: { initialAuthenticated?: boolean }) {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);

  useEffect(() => {
    let active = true;
    async function syncSession() {
      try {
        const response = await fetch("/api/membership/session", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        if (active) setAuthenticated(Boolean(payload.authenticated));
      } catch {
        // Preserve the server-rendered state when the status endpoint is unavailable.
      }
    }
    function handleSessionChange(event: Event) {
      const detail = (event as CustomEvent<{ authenticated?: boolean }>).detail;
      if (typeof detail?.authenticated === "boolean") {
        setAuthenticated(detail.authenticated);
        return;
      }
      void syncSession();
    }
    void syncSession();
    window.addEventListener(MEMBERSHIP_SESSION_CHANGED_EVENT, handleSessionChange);
    return () => {
      active = false;
      window.removeEventListener(MEMBERSHIP_SESSION_CHANGED_EVENT, handleSessionChange);
    };
  }, [pathname]);

  const accountHref = authenticated ? "/account" : "/account/create";
  const accountLabel = authenticated ? "Account" : "Create account";

  return <header className="site-header sticky top-0 z-50 h-16 border-b border-[#173049]/70 bg-[#05070df5] backdrop-blur-xl"><div className="shell flex h-full items-center justify-between"><Link href="/" className="site-brand flex items-center gap-3 font-['IBM_Plex_Sans'] text-[12px] font-bold uppercase tracking-[.18em]"><Image src="/brand/cryptic-design-logo.svg" alt="" width={44} height={44} className="size-8 shrink-0 object-contain sm:size-11" priority/><span>Cryptic Design</span></Link><nav aria-label="Primary" className="primary-nav flex items-center gap-5 sm:gap-8">{NAV.map(item=>{const active=item.href==="/"?pathname==="/":pathname.startsWith(item.href);return <Link key={item.href} href={item.href} aria-current={active?"page":undefined} className={`relative py-6 text-[9px] font-semibold uppercase tracking-[.08em] text-[#9cb0c4] hover:text-white ${active?`nav-${item.tone}`:""}`}>{item.label}</Link>})}<span className="nav-divider hidden h-5 w-px bg-[#173049] sm:block"/><Link href="/search" className="utility-nav text-[9px] uppercase text-[#9cb0c4]">⌕ Search</Link><Link href={accountHref} className="utility-nav text-[9px] uppercase text-[#9cb0c4]">◇ {accountLabel}</Link></nav></div><style jsx>{`.nav-gold{color:#ffd400}.nav-cyan{color:#00e5ff}.nav-magenta{color:#ed00a8}.nav-gold:after,.nav-cyan:after,.nav-magenta:after{content:'';position:absolute;left:0;right:0;bottom:0;height:2px;background:currentColor}`}</style></header>;
}
