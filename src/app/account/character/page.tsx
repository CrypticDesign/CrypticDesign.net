"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PublicCharacterIdentity } from "@/lib/characters";

export default function CharacterProfilePage() {
  const [character, setCharacter] = useState<PublicCharacterIdentity | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { fetch("/api/characters").then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload.error); setCharacter(payload.character); }).catch((caught) => setError((caught as Error).message)).finally(() => setLoaded(true)); }, []);
  return <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
    <header className="flex flex-col gap-2"><h1 className="text-3xl font-semibold text-white">Character Profile</h1>
      {!loaded ? <p className="text-muted-foreground">Loading character…</p> : character ? <><p className="max-w-xl text-muted-foreground"><span className="text-accent-gold">{character.name}</span> — {character.archetype}</p>{character.bio ? <p className="max-w-xl text-sm text-muted-foreground">{character.bio}</p> : null}</> : error === "Authentication required" ? <p className="text-muted-foreground"><Link href="/account/sign-in" className="text-accent-cyan hover:underline">Sign in</Link> to view your account-owned character.</p> : <p className="text-muted-foreground">No character belongs to this account yet. <Link href="/account/create-character" className="text-accent-cyan hover:underline">Create one</Link>.</p>}
    </header>
    <section className="grid gap-4 sm:grid-cols-3"><div className="rounded-card border border-border bg-surface p-5"><h2 className="font-medium text-foreground">Identity</h2><p className="mt-2 text-sm text-muted-foreground">Stable across Entertainment Hub surfaces.</p></div><div className="rounded-card border border-border bg-surface p-5"><h2 className="font-medium text-foreground">Account boundary</h2><p className="mt-2 text-sm text-muted-foreground">Character state never grants account permissions or purchased access.</p></div><div className="rounded-card border border-border bg-surface p-5"><h2 className="font-medium text-foreground">History</h2><p className="mt-2 text-sm text-muted-foreground">Creation and profile changes are recorded. Progression arrives separately.</p></div></section>
  </main>;
}
