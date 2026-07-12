"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CHARACTER_KEY } from "@/components/CharacterCreator";
import ReleaseCard from "@/components/ReleaseCard";
import { getSavedSlugs } from "@/lib/library";
import { publicReleases, type Release } from "@/lib/releases";

type Character = {
  name: string;
  archetype: string;
  level: number;
  xp: number;
};

export default function MyHomeDashboard() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [saved, setSaved] = useState<Release[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const rawCharacter = localStorage.getItem(CHARACTER_KEY);
      if (rawCharacter) setCharacter(JSON.parse(rawCharacter) as Character);
    } catch {
      // Device preview data is optional.
    }
    const savedSlugs = getSavedSlugs();
    setSaved(publicReleases().filter((release) => savedSlugs.includes(release.slug)));
    setLoaded(true);
  }, []);

  const interests = Array.from(
    new Set(saved.flatMap((release) => release.lanes)),
  ).slice(0, 4);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-widest text-accent-gold">Personal dashboard</span>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">My Home</h1>
        <p className="max-w-2xl text-muted-foreground">
          Your character, activity, library, interests, and place within the Cryptic Design ecosystem.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-card border border-accent-gold/40 bg-gradient-to-br from-neutral-950 to-neutral-900 p-6">
          {loaded && character ? (
            <>
              <span className="text-xs uppercase tracking-widest text-accent-gold">Your character</span>
              <h2 className="mt-3 text-2xl font-semibold text-white">{character.name}</h2>
              <p className="mt-1 text-muted-foreground">
                Level {character.level} {character.archetype} · {character.xp} XP
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/account/character" className="rounded-control bg-accent-gold px-4 py-2 text-sm font-medium text-black">View full profile</Link>
                <Link href="/account/settings" className="rounded-control border border-border px-4 py-2 text-sm text-foreground">Settings</Link>
              </div>
            </>
          ) : loaded ? (
            <>
              <span className="text-xs uppercase tracking-widest text-accent-gold">Character required</span>
              <h2 className="mt-3 text-xl font-semibold text-white">Create your platform identity</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">Your character carries progression, presence, history, and identity across the ecosystem.</p>
              <Link href="/account/create-character" className="mt-5 inline-block rounded-control bg-accent-gold px-4 py-2 text-sm font-medium text-black">Create character</Link>
            </>
          ) : null}
        </div>

        <div className="rounded-card border border-border bg-surface p-6">
          <h2 className="font-semibold text-foreground">Your ecosystem</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4">
            <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Saved</dt><dd className="mt-1 text-2xl text-white">{saved.length}</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Interests</dt><dd className="mt-1 text-2xl text-white">{interests.length}</dd></div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            {interests.length ? interests.map((interest) => (
              <span key={interest} className="rounded-full border border-border px-3 py-1 text-xs capitalize text-muted-foreground">{interest.replace("-", " ")}</span>
            )) : <span className="text-sm text-muted-foreground">Save releases to shape your interests.</span>}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/library" className="rounded-card border border-border bg-surface p-5 hover:border-accent-cyan"><h2 className="font-medium text-foreground">My Library</h2><p className="mt-2 text-sm text-muted-foreground">Saved releases and history.</p></Link>
        <Link href="/account/notifications" className="rounded-card border border-border bg-surface p-5 hover:border-accent-cyan"><h2 className="font-medium text-foreground">Notifications</h2><p className="mt-2 text-sm text-muted-foreground">Platform activity and announcements.</p></Link>
        <Link href="/entertainment" className="rounded-card border border-border bg-surface p-5 hover:border-accent-magenta"><h2 className="font-medium text-foreground">Explore Entertainment</h2><p className="mt-2 text-sm text-muted-foreground">Discover more across the complete content hub.</p></Link>
      </section>

      {saved.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-white">Saved for you</h2><Link href="/library" className="text-sm text-accent-cyan hover:underline">Open library</Link></div>
          <div className="flex flex-wrap gap-4">{saved.slice(0, 4).map((release) => <ReleaseCard key={release.slug} release={release} />)}</div>
        </section>
      )}
    </main>
  );
}
