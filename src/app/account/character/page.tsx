"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CHARACTER_KEY } from "@/components/CharacterCreator";

type Character = {
  name: string;
  archetype: string;
  createdAt: string;
  level: number;
  xp: number;
};

const PANELS = [
  { title: "Stats & Progression", body: "Level, XP, and unlocks earned across releases." },
  { title: "Presence", body: "Rooms, Arcade, and Listening Room identity." },
  { title: "History", body: "Play, listen, watch, and lab activity." },
] as const;

export default function CharacterProfilePage() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHARACTER_KEY);
      if (raw) setCharacter(JSON.parse(raw) as Character);
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Character Profile</h1>
        {loaded && character ? (
          <p className="max-w-xl text-muted-foreground">
            <span className="text-accent-gold">{character.name}</span> — Level{" "}
            {character.level} {character.archetype} · {character.xp} XP
          </p>
        ) : loaded ? (
          <p className="max-w-xl text-muted-foreground">
            No character on this device yet.{" "}
            <Link href="/account/create-character" className="text-accent-cyan hover:underline">
              Create one
            </Link>{" "}
            — it&apos;s the first step of every account.
          </p>
        ) : null}
      </header>
      <section className="grid gap-4 sm:grid-cols-3">
        {PANELS.map((p) => (
          <div key={p.title} className="rounded-card border border-border bg-surface p-5">
            <h2 className="font-medium text-foreground">{p.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
              Arrives with the account backend
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
