"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

const ARCHETYPES = ["Signal Seeker", "Archivist", "Composer", "Navigator", "Builder"] as const;

type Character = {
  name: string;
  archetype: string;
  createdAt: string;
  level: number;
  xp: number;
};

export const CHARACTER_KEY = "crypticdesign.character.v1";

export default function CharacterCreator() {
  const [name, setName] = useState("");
  const [archetype, setArchetype] = useState<string>(ARCHETYPES[0]);
  const [created, setCreated] = useState<Character | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const character: Character = {
      name,
      archetype,
      createdAt: new Date().toISOString(),
      level: 1,
      xp: 0,
    };
    localStorage.setItem(CHARACTER_KEY, JSON.stringify(character));
    setCreated(character);
  }

  if (created) {
    return (
      <section className="flex max-w-xl flex-col gap-3 rounded-card border border-success/40 bg-surface p-6">
        <h2 className="font-medium text-foreground">
          {created.name} — Level 1 {created.archetype}
        </h2>
        <p className="text-sm text-muted-foreground">
          Character saved on this device (preview only — it binds to your
          account when the backend ships).
        </p>
        <Link href="/account/character" className="text-sm text-accent-cyan hover:underline">
          View character profile →
        </Link>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-foreground">
        Character name
        <input
          required
          maxLength={32}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground"
        />
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm text-foreground">Origin archetype</legend>
        <div className="flex flex-wrap gap-2">
          {ARCHETYPES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setArchetype(a)}
              className={`rounded-control border px-4 py-2 text-sm transition-colors ${
                archetype === a
                  ? "border-accent-gold text-accent-gold"
                  : "border-border text-muted-foreground hover:border-neutral-500"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="rounded-card border border-dashed border-border p-4 text-sm text-muted-foreground">
        Choose your starting identity. Portrait and presence options are coming
        later. Starter stats: Level 1 · 0 XP.
      </div>
      <button
        type="submit"
        className="w-fit rounded-control bg-accent-gold px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
      >
        Create character
      </button>
    </form>
  );
}
