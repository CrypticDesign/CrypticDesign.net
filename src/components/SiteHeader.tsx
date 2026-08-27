"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { MEMBERSHIP_SESSION_CHANGED_EVENT } from "@/lib/membership-session-events";
import { getPrimaryNavigationIdentity, isPrimaryNavigationActive } from "@/lib/site-navigation";
import EcosystemPortalIcon from "@/components/EcosystemPortalIcon";

const NAV = [
  { href: "/", label: "Home", tone: "blue" },
  { href: "/entertainment", label: "Play", tone: "cyan" },
  { href: "/community", label: "Community", tone: "indigo" },
  { href: "/professional", label: "Professional", tone: "violet" },
] as const;

export default function SiteHeader({ initialAuthenticated = false }: { initialAuthenticated?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const entertainmentMenuRef = useRef<HTMLDetailsElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [entertainmentMenuOpen, setEntertainmentMenuOpen] = useState(() => isPrimaryNavigationActive(pathname, "/entertainment"));
  const accountSectionActive = pathname === "/account" || pathname.startsWith("/account/") || pathname === "/library";
  const accountLabel = authenticated ? "Account" : "Sign In";
  const accountHref = authenticated ? "/account" : "/account/sign-in";
  const activeIdentity = getPrimaryNavigationIdentity(pathname, authenticated);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const compactViewport = window.matchMedia("(max-width: 1100px)");
    const closeOnResize = () => setMobileMenuOpen(false);
    compactViewport.addEventListener("change", closeOnResize);
    return () => compactViewport.removeEventListener("change", closeOnResize);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setMobileMenuOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [mobileMenuOpen]);

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
      <header ref={headerRef} className="site-header sticky top-0 z-50 border-b border-[#173049]/70 bg-[#05070df5] backdrop-blur-xl" onKeyDown={(event) => {
        if (event.key === "Escape" && mobileMenuOpen) {
          event.preventDefault();
          setMobileMenuOpen(false);
          menuToggleRef.current?.focus();
        }
      }}>
        <div className="shell site-header__inner flex items-center justify-between">
          <Link href="/" className="site-brand flex items-center gap-3 text-[12px] font-bold uppercase tracking-[.18em]">
            <Image src="/brand/cryptic-design-logo.svg" alt="" width={44} height={44} className="size-8 shrink-0 object-contain sm:size-11" priority />
            <span className="site-brand__copy"><strong>Cryptic Design</strong><small>Worlds to explore. Stories to live.</small></span>
          </Link>
          <button ref={menuToggleRef} type="button" className="site-primary-link site-menu-toggle" data-tone={activeIdentity.tone} aria-label={`${mobileMenuOpen ? "Close" : "Open"} main menu — ${activeIdentity.label}`} aria-expanded={mobileMenuOpen} aria-controls="primary-navigation" onClick={() => setMobileMenuOpen((open) => !open)}>
            <span>{activeIdentity.label}</span>
            <EcosystemPortalIcon name={mobileMenuOpen ? "close" : "menu"} />
          </button>
          <nav id="primary-navigation" aria-label="Primary" className="primary-nav" data-mobile-open={mobileMenuOpen} onClick={(event) => {
            if (event.target instanceof Element && event.target.closest("a")) setMobileMenuOpen(false);
          }} onBlur={(event) => {
            if (!headerRef.current?.contains(event.relatedTarget)) setMobileMenuOpen(false);
          }}>
            {NAV.map((item) => {
              const active = isPrimaryNavigationActive(pathname, item.href);
              const hasSubmenu = item.href === "/entertainment";
              if (hasSubmenu) return <Fragment key={item.href}>
                <details ref={entertainmentMenuRef} className="site-primary-drawer" open={entertainmentMenuOpen}><summary data-tone={item.tone} aria-current={active ? "page" : undefined} aria-expanded={entertainmentMenuOpen} aria-controls="entertainment-category-drawer" className="site-primary-link" onClick={(event) => { event.preventDefault(); const changingSection = pathname !== item.href; const open = changingSection || !entertainmentMenuOpen; setEntertainmentMenuOpen(open); window.dispatchEvent(new CustomEvent("cryptic:entertainment-drawer", { detail: { open } })); if (changingSection) router.push(item.href); }}><span>{item.label}</span></summary></details>
                <Link href={item.href} data-tone={item.tone} aria-current={active ? "page" : undefined} className="site-primary-link site-primary-link--compact"><span>{item.label}</span></Link>
              </Fragment>;
              return <Link key={item.href} href={item.href} data-tone={item.tone} aria-current={active ? "page" : undefined} className="site-primary-link"><span>{item.label}</span></Link>;
            })}
            <Link href="/search" aria-label="Search" aria-current={pathname === "/search" ? "page" : undefined} className="site-header__search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg><span className="site-header__search-label">Search</span></Link>
            <div className="account-menu">
              <Link href={accountHref} data-tone="blue" aria-current={accountSectionActive ? "page" : undefined} className="utility-nav site-utility-link account-menu__trigger">{accountLabel}</Link>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
