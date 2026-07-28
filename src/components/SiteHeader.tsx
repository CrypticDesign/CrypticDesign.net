"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MEMBERSHIP_SESSION_CHANGED_EVENT, announceMembershipSession } from "@/lib/membership-session-events";

const NAV = [
  { href: "/", label: "My Home", tone: "gold" },
  { href: "/entertainment", label: "Entertainment", tone: "cyan" },
  { href: "/professional", label: "Professional", tone: "magenta" },
] as const;

const ACCOUNT_ITEMS = [
  { href: "/account/character", icon: "♙", label: "View Profile" },
  { href: "/account/settings", icon: "⚙", label: "Settings & privacy" },
  { href: "/professional/contact", icon: "?", label: "Help & support" },
  { href: "/professional/contact?topic=problem", icon: "!", label: "Report a problem" },
  { href: "/account/settings#display-accessibility", icon: "◐", label: "Display & accessibility" },
] as const;

export default function SiteHeader({ initialAuthenticated = false }: { initialAuthenticated?: boolean }) {
  const pathname = usePathname();
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

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
    if (new URLSearchParams(window.location.search).get("signedOut") === "1") {
      setStatusMessage("You are signed out.");
      window.history.replaceState({}, "", window.location.pathname + window.location.hash);
    }
  }, []);

  useEffect(() => {
    if (!accountMenuOpen) return;
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) setAccountMenuOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setAccountMenuOpen(false);
      accountButtonRef.current?.focus();
    }
    window.addEventListener("pointerdown", closeOnOutsidePointer);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutsidePointer);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountMenuOpen]);

  async function signOut() {
    setSigningOut(true);
    setStatusMessage("Signing you out…");
    try {
      const response = await fetch("/api/membership/session", { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) {
        setStatusMessage(payload.error ?? "Sign-out could not be completed. Please try again.");
        setSigningOut(false);
        return;
      }
      setAuthenticated(false);
      setAccountMenuOpen(false);
      announceMembershipSession(false);
      setStatusMessage(payload.message ?? "You are signed out.");
      window.location.assign("/?signedOut=1");
    } catch {
      setStatusMessage("Sign-out could not be completed. Please try again.");
      setSigningOut(false);
    }
  }

  return (
    <>
      <header className="site-header sticky top-0 z-50 h-16 border-b border-[#173049]/70 bg-[#05070df5] backdrop-blur-xl">
        <div className="shell flex h-full items-center justify-between">
          <Link href="/" className="site-brand flex items-center gap-3 font-['IBM_Plex_Sans'] text-[12px] font-bold uppercase tracking-[.18em]">
            <Image src="/brand/cryptic-design-logo.svg" alt="" width={44} height={44} className="size-8 shrink-0 object-contain sm:size-11" priority />
            <span>Cryptic Design</span>
          </Link>
          <nav aria-label="Primary" className="primary-nav flex items-center gap-5 sm:gap-8">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`relative py-6 text-[9px] font-semibold uppercase tracking-[.08em] text-[#9cb0c4] hover:text-white ${active ? `nav-${item.tone}` : ""}`}>{item.label}</Link>;
            })}
            <span className="nav-divider hidden h-5 w-px bg-[#173049] sm:block" />
            <Link href="/search" className="utility-nav text-[9px] uppercase text-[#9cb0c4]">⌕ Search</Link>
            {authenticated ? (
              <div className="account-menu" ref={accountMenuRef}>
                <button ref={accountButtonRef} type="button" className="utility-nav account-menu__trigger" aria-expanded={accountMenuOpen} aria-controls="account-menu-panel" aria-haspopup="menu" onClick={() => setAccountMenuOpen((open) => !open)}>◇ Account</button>
                {accountMenuOpen ? (
                  <div id="account-menu-panel" className="account-menu__panel" role="menu" aria-label="Account options">
                    {ACCOUNT_ITEMS.map((item) => <Link key={item.label} href={item.href} role="menuitem" className="account-menu__item" onClick={() => setAccountMenuOpen(false)}><span className="account-menu__icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span><span className="account-menu__chevron" aria-hidden="true">›</span></Link>)}
                    <button type="button" role="menuitem" className="account-menu__item account-menu__sign-out" disabled={signingOut} onClick={signOut}><span className="account-menu__icon" aria-hidden="true">↪</span><span>{signingOut ? "Signing out…" : "Sign out"}</span></button>
                    {statusMessage ? <p className="account-menu__status" role="status" aria-live="polite">{statusMessage}</p> : null}
                  </div>
                ) : null}
              </div>
            ) : <Link href="/account/create" className="utility-nav text-[9px] uppercase text-[#9cb0c4]">◇ Create account</Link>}
          </nav>
        </div>
        <style jsx>{`.nav-gold{color:#ffd400}.nav-cyan{color:#00e5ff}.nav-magenta{color:#ed00a8}.nav-gold:after,.nav-cyan:after,.nav-magenta:after{content:'';position:absolute;left:0;right:0;bottom:0;height:2px;background:currentColor}`}</style>
      </header>
      {statusMessage && !accountMenuOpen ? <p className="account-session-status" role="status" aria-live="polite">{statusMessage}</p> : null}
    </>
  );
}
