"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CHARACTER_KEY } from "@/components/CharacterCreator";
import MediaCard from "@/components/MediaCard";
import PlayerDock from "@/components/PlayerDock";
import { getSavedSlugs } from "@/lib/library";

type Character = { name: string; archetype: string; level: number; xp: number };

export default function MyHomeDashboard() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHARACTER_KEY);
      if (raw) setCharacter(JSON.parse(raw));
    } catch {}
    setSavedCount(getSavedSlugs().length);
  }, []);

  const name = character?.name || "Robert";

  return (
    <main>
      <section className="visual-hero">
        <div className="visual-hero__image"><Image src="/images/my-home-hero.png" alt="" fill priority sizes="100vw" /></div>
        <div className="visual-hero__wash" />
        <div className="visual-hero__content"><div className="signal-rail text-[#ffd400]" /><span className="kicker !text-[#ffd400]">Your space</span><h1 className="display-title">Welcome back, {name}.</h1><p>Your character, activity, saved releases, interests, and progress are all here.</p><div className="hero-actions"><Link href="/account/character" className="button">♙ &nbsp; View profile</Link><Link href="/account/settings" className="button secondary">⚙ &nbsp; Account settings</Link></div></div>
      </section>
      <div className="shell page-stack">
        <section>
          <div className="section-heading"><div><span className="kicker !text-[#ffd400]">Your activity</span><h2 className="section-title">Everything you are exploring, in one place.</h2></div><p>Continue where you left off and return to saved experiences.</p></div>
          <div className="feature-split"><div className="feature-split__image"><Image src="/images/current-focus.png" alt="Abstract blue system visualization" fill sizes="(max-width:900px) 100vw, 65vw" /></div><div className="feature-split__content"><span className="kicker !text-[#ffd400]">Current focus</span><h2>Cryptic Design website production</h2><p>Continue translating the visual foundation into production-ready screens and interaction patterns.</p><Link href="/professional" className="button self-start">Resume work</Link></div></div>
          <div className="mini-stats mt-4"><div className="mini-stat"><span>Today</span><strong>03</strong><span>Items awaiting review across active projects.</span></div><div className="mini-stat cyan"><span>This week</span><strong>68%</strong><span>Website production direction completed.</span></div></div>
        </section>
        <section>
          <div className="section-heading"><div><span className="kicker !text-[#ffd400]">Your account</span><h2 className="section-title">Your activity and interests</h2></div><p>See what you saved, what changed, and what needs your attention.</p></div>
          <div className="metric-grid"><Link href="/library" className="metric-card gold"><span className="kicker !text-[#ffd400]">Library</span><strong>{savedCount || 47}</strong><p>Saved releases, articles, projects, and references.</p></Link><Link href="/account/notifications" className="metric-card"><span className="kicker">Activity</span><strong>12</strong><p>Recent sessions, decisions, comments, and changes.</p></Link><div className="metric-card green"><span className="kicker !text-[#00f0a8]">Interests</span><strong>09</strong><p>Topics and creative signals shaping recommendations.</p></div><Link href="/account/notifications" className="metric-card magenta"><span className="kicker !text-[#ed00a8]">Notifications</span><strong>03</strong><p>Reviews, messages, and account events needing attention.</p></Link></div>
        </section>
        <section><div className="section-heading"><div><span className="kicker !text-[#ffd400]">Saved &amp; recent</span><h2 className="section-title">Return to what matters</h2></div><p>Recently viewed and personally saved experiences.</p></div><div className="media-grid"><MediaCard href="/audio" image="/images/signal-systems.png" eyebrow="Night release" title="Signal & Systems" body="Viewed 2 hours ago" accent="gold" /><MediaCard href="/professional/articles" image="/images/human-machine.png" eyebrow="Human capability" title="Human & Machine" body="Saved to research library" /><MediaCard href="/products/singularis" image="/images/singularis.png" eyebrow="Franchise development" title="Singularis" body="Episode 01 production notes" accent="magenta" /></div></section>
        <PlayerDock />
      </div>
    </main>
  );
}
