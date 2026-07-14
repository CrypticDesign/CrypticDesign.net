"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CHARACTER_ARCHETYPES, type PublicCharacterIdentity } from "@/lib/characters";

export default function CharacterCreator() {
  const [name, setName] = useState("");
  const [archetype, setArchetype] = useState<string>(CHARACTER_ARCHETYPES[0]);
  const [bio, setBio] = useState("");
  const [created, setCreated] = useState<PublicCharacterIdentity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(null);
    try {
      const response = await fetch("/api/characters", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ name, archetype, bio }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Character could not be created");
      setCreated(payload.character);
    } catch (caught) { setError((caught as Error).message); }
    finally { setSaving(false); }
  }

  if (created) return <section className="flex max-w-xl flex-col gap-3 rounded-card border border-success/40 bg-surface p-6"><h2 className="font-medium text-foreground">{created.name} — {created.archetype}</h2><p className="text-sm text-muted-foreground">Character saved to your signed-in sandbox account with a stable identity and audit history.</p><Link href="/account/character" className="text-sm text-accent-cyan hover:underline">View character profile →</Link></section>;

  return <form onSubmit={submit} className="flex max-w-xl flex-col gap-4">
    <label className="flex flex-col gap-1 text-sm text-foreground">Character name<input required maxLength={32} value={name} onChange={(e) => setName(e.target.value)} className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground" /></label>
    <fieldset className="flex flex-col gap-2"><legend className="text-sm text-foreground">Origin archetype</legend><div className="flex flex-wrap gap-2">{CHARACTER_ARCHETYPES.map((item) => <button key={item} type="button" onClick={() => setArchetype(item)} className={`rounded-control border px-4 py-2 text-sm ${archetype === item ? "border-accent-gold text-accent-gold" : "border-border text-muted-foreground"}`}>{item}</button>)}</div></fieldset>
    <label className="flex flex-col gap-1 text-sm text-foreground">Public bio <span className="text-xs text-muted-foreground">Optional · 280 characters</span><textarea maxLength={280} value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-24 rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground" /></label>
    <p className="rounded-card border border-dashed border-border p-4 text-sm text-muted-foreground">This creates identity only. Progression, permissions, membership, and purchased access remain separate account systems.</p>
    {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
    <button disabled={saving} type="submit" className="w-fit rounded-control bg-accent-gold px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50">{saving ? "Creating…" : "Create character"}</button>
  </form>;
}
