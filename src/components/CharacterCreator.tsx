"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { CHARACTER_ARCHETYPES, type PublicCharacterIdentity } from "@/lib/characters";

export default function CharacterCreator() {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [archetype, setArchetype] = useState<string>(CHARACTER_ARCHETYPES[0]);
  const [bio, setBio] = useState("");
  const [created, setCreated] = useState<PublicCharacterIdentity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/membership/session")
      .then((response) => response.json())
      .then((payload) => setAuthenticated(Boolean(payload.authenticated)))
      .catch(() => setAuthenticated(false))
      .finally(() => setSessionLoaded(true));
  }, []);

  async function startPreviewSession() {
    setError(null);
    const response = await fetch("/api/membership/session", { method: "POST" });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Local preview session could not be started");
      return;
    }
    setAuthenticated(Boolean(payload.authenticated));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(null);
    try {
      const response = await fetch("/api/characters", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ name, handle, archetype, bio }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Character could not be created");
      setCreated(payload.character);
    } catch (caught) { setError((caught as Error).message); }
    finally { setSaving(false); }
  }

  if (created) return <section className="flex max-w-xl flex-col gap-3 rounded-card border border-success/40 bg-surface p-6"><h2 className="font-medium text-foreground">{created.name} — {created.archetype}</h2><p className="text-sm text-muted-foreground">Character saved to your signed-in sandbox account with a stable identity and audit history.</p><Link href="/account/character" className="text-sm text-accent-cyan hover:underline">View character profile →</Link></section>;

  if (!sessionLoaded) return <p className="text-sm text-muted-foreground">Checking local preview session…</p>;

  if (!authenticated) return <section className="panel flex max-w-xl flex-col items-start gap-4 p-5"><h2 className="font-medium text-foreground">Sign in before creating a character</h2><p className="text-sm text-muted-foreground">Characters belong to an authenticated account. Start a local preview session to test this flow; it creates no real account and sends no personal data.</p>{error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}<button type="button" className="button" onClick={startPreviewSession}>Start local preview session</button></section>;

  return <form onSubmit={submit} className="flex max-w-xl flex-col gap-4">
    <label className="flex flex-col gap-1 text-sm text-foreground">Character name<input required maxLength={32} value={name} onChange={(e) => setName(e.target.value)} className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground" /></label>
    <label className="flex flex-col gap-1 text-sm text-foreground">Handle<input required minLength={3} maxLength={32} pattern="[a-z0-9][a-z0-9-]{1,30}[a-z0-9]" value={handle} onChange={(e) => setHandle(e.target.value.toLowerCase())} className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground" /><span className="text-xs text-muted-foreground">3–32 lowercase letters, numbers, or hyphens.</span></label>
    <fieldset className="flex flex-col gap-2"><legend className="text-sm text-foreground">Origin archetype</legend><div className="flex flex-wrap gap-2">{CHARACTER_ARCHETYPES.map((item) => <button key={item} type="button" aria-pressed={archetype === item} onClick={() => setArchetype(item)} className={`button ${archetype === item ? "" : "secondary"}`}>{item}</button>)}</div><p className="text-xs text-muted-foreground">Selected: <span className="text-foreground">{archetype}</span></p></fieldset>
    <label className="flex flex-col gap-1 text-sm text-foreground">Biography <span className="text-xs text-muted-foreground">Account-private by default · Optional · 280 characters</span><textarea maxLength={280} value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-24 rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground" /></label>
    <p className="rounded-card border border-dashed border-border p-4 text-sm text-muted-foreground">This creates identity only. Progression, permissions, membership, and purchased access remain separate account systems.</p>
    {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
    <button disabled={saving} type="submit" className="button w-fit disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Creating…" : "Create character"}</button>
  </form>;
}
