"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MEMBERSHIP_SESSION_CHANGED_EVENT } from "@/lib/membership-session-events";
import { isPrimaryNavigationActive } from "@/lib/site-navigation";

const NAV = [
  { href: "/", label: "Home", tone: "blue" },
  { href: "/entertainment", label: "Explore", tone: "cyan" },
  { href: "/community", label: "Community", tone: "magenta" },
  { href: "/professional", label: "Professional", tone: "violet" },
] as const;

export default function SiteHeader({ initialAuthenticated = false }: { initialAuthenticated?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const entertainmentMenuRef = useRef<HTMLDetailsElement>(null);
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [entertainmentMenuOpen, setEntertainmentMenuOpen] = useState(() => isPrimaryNavigationActive(pathname, "/entertainment"));
  const accountSectionActive = pathname === "/account" || pathname.startsWith("/account/") || pathname === "/library";
  const accountLabel = authenticated ? "Account" : "Sign In";
  const accountHref = authenticated ? "/account" : "/account/sign-in";

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

  useEffect(() => {
    const open = isPrimaryNavigationActive(pathname, "/entertainment");
    setEntertainmentMenuOpen(open);
    window.dispatchEvent(new CustomEvent("cryptic:entertainment-drawer", { detail: { open } }));
  }, [pathname]);

  return (
    <>
      <header className="site-header sticky top-0 z-50 border-b border-[#173049]/70 bg-[#05070df5] backdrop-blur-xl">
        <div className="shell site-header__inner flex items-center justify-between">
          <Link href="/" className="site-brand flex items-center gap-3 text-[12px] font-bold uppercase tracking-[.18em]">
            <Image src="/brand/cryptic-design-logo.svg" alt="" width={44} height={44} className="size-8 shrink-0 object-contain sm:size-11" priority />
            <span className="site-brand__copy"><strong>Cryptic Design</strong><small>Worlds to explore. Stories to live.</small></span>
          </Link>
          <nav aria-label="Primary" className="primary-nav">
            {NAV.map((item) => {
              const active = isPrimaryNavigationActive(pathname, item.href);
              const hasSubmenu = item.href === "/entertainment";
              if (hasSubmenu) return <details key={item.href} ref={entertainmentMenuRef} className="site-primary-drawer" open={entertainmentMenuOpen}><summary data-tone={item.tone} aria-current={active ? "page" : undefined} aria-expanded={entertainmentMenuOpen} aria-controls="entertainment-category-drawer" className="site-primary-link" onClick={(event) => { event.preventDefault(); const changingSection = pathname !== item.href; const open = changingSection || !entertainmentMenuOpen; setEntertainmentMenuOpen(open); window.dispatchEvent(new CustomEvent("cryptic:entertainment-drawer", { detail: { open } })); if (changingSection) router.push(item.href); }}><span>{item.label}</span></summary></details>;
              return <Link key={item.href} href={item.href} data-tone={item.tone} aria-current={active ? "page" : undefined} className="site-primary-link"><span>{item.label}</span></Link>;
            })}
            <Link href="/search" aria-label="Search" aria-current={pathname === "/search" ? "page" : undefined} className="site-header__search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg></Link>
            <div className="account-menu">
              <Link href={accountHref} data-tone="blue" aria-current={accountSectionActive ? "page" : undefined} className="utility-nav site-utility-link account-menu__trigger">{accountLabel}</Link>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
