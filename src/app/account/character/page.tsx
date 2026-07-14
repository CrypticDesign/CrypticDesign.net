"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CHARACTER_ARCHETYPES, type CharacterHistoryEvent, type CharacterProfile } from "@/lib/characters";
import type { ProgressionSnapshot } from "@/lib/progression";
import type { RpgProjection } from "@/lib/rpg-experience-store";
import { CORE_ATTRIBUTES } from "@/lib/rpg-experience";
import type { RpgContentSnapshot } from "@/lib/rpg-content-store";

export default function CharacterProfilePage() {
  const [character, setCharacter] = useState<CharacterProfile | null>(null);
  const [history, setHistory] = useState<CharacterHistoryEvent[]>([]);
  const [progression, setProgression] = useState<ProgressionSnapshot | null>(null);
  const [rpg, setRpg] = useState<RpgProjection | null>(null);
  const [rpgContent, setRpgContent] = useState<RpgContentSnapshot | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/characters");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setCharacter(payload.character);
      if (payload.character) {
        const historyResponse = await fetch(`/api/characters/${payload.character.id}/history`);
        const historyPayload = await historyResponse.json();
        if (historyResponse.ok) setHistory(historyPayload.history);
        const progressionResponse = await fetch(`/api/characters/${payload.character.id}/progression`);
        const progressionPayload = await progressionResponse.json();
        if (progressionResponse.ok) setProgression(progressionPayload.progression);
        const rpgResponse = await fetch(`/api/characters/${payload.character.id}/rpg`);
        const rpgPayload = await rpgResponse.json();
        if (rpgResponse.ok) setRpg(rpgPayload.rpg);
        const contentResponse = await fetch(`/api/characters/${payload.character.id}/rpg-content`);
        const contentPayload = await contentResponse.json();
        if (contentResponse.ok) setRpgContent(contentPayload.content);
      }
    } catch (caught) { setError((caught as Error).message); }
    finally { setLoaded(true); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!character) return;
    setSaving(true); setError(null);
    const form = new FormData(event.currentTarget);
    const visibility = String(form.get("visibility"));
    const body = {
      name: form.get("name"), handle: form.get("handle"), archetype: form.get("archetype"),
      bio: form.get("bio"), portraitUrl: form.get("portraitUrl"), affiliation: form.get("affiliation"),
      presence: form.get("presence"), discoverable: form.get("discoverable") === "on", visibility,
      publicationConsent: visibility === "public" && form.get("publicationConsent") === "on",
    };
    try {
      const response = await fetch(`/api/characters/${character.id}`, { method: "PATCH", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify(body) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setCharacter(payload.character); await load();
    } catch (caught) { setError((caught as Error).message); }
    finally { setSaving(false); }
  }

  async function changeStatus(status: "active" | "retired") {
    if (!character) return;
    setSaving(true); setError(null);
    try {
      const response = await fetch(`/api/characters/${character.id}`, { method: "PATCH", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ status }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setCharacter(payload.character); await load();
    } catch (caught) { setError((caught as Error).message); }
    finally { setSaving(false); }
  }

  async function recordTestActivity() {
    if (!character) return;
    setSaving(true); setError(null);
    try {
      const response = await fetch(`/api/characters/${character.id}/progression`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ type: "release_discovered" }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setProgression(payload.progression);
    } catch (caught) { setError((caught as Error).message); }
    finally { setSaving(false); }
  }

  if (!loaded) return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><p className="ui-loading" aria-busy="true">Loading character…</p></main>;
  if (!character) return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><h1 className="text-3xl font-semibold">Character Profile</h1><p className="ui-empty mt-6">{error === "Authentication required" ? <><Link href="/account/sign-in" className="text-accent-cyan hover:underline">Sign in</Link> to view your character.</> : <>No character belongs to this account. <Link href="/account/create-character" className="text-accent-cyan hover:underline">Create one</Link>.</>}</p></main>;

  const unavailable = character.status === "suspended";
  const progressionEvidence = [
    ...(progression?.ledger.map((entry) => ({ id: entry.id, occurredAt: entry.recordedAt, content: <><strong>{entry.delta > 0 ? `+${entry.delta}` : entry.delta} units</strong><span className="ml-2 text-muted-foreground">{entry.reason.replaceAll("_", " ")} · rule {entry.ruleId} v{entry.ruleVersion} · {new Date(entry.recordedAt).toLocaleString()}</span></> })) ?? []),
    ...(rpgContent?.evidence.map((entry) => ({ id: entry.id, occurredAt: entry.occurredAt, content: <><strong>{entry.title}</strong><span className="ml-2 text-muted-foreground">{entry.detail} · {new Date(entry.occurredAt).toLocaleString()}</span></> })) ?? []),
    ...(rpg?.events.map((entry) => ({ id: entry.id, occurredAt: entry.recordedAt, content: <><strong>+{entry.verifiedActiveMinutes} Time</strong><span className="ml-2 text-muted-foreground">{entry.experienceId.replaceAll("-", " ")} · {entry.outcome ?? "recorded"} · experience v{entry.experienceVersion} · {Object.entries(entry.context).filter(([, weight]) => weight > 0).map(([name, weight]) => `${name} ${Math.round(weight * 100)}%`).join(", ")} · {new Date(entry.recordedAt).toLocaleString()}</span></> })) ?? []),
  ].sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt));
  return <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
    <header><span className="kicker">Account-private identity</span><h1 className="mt-2 text-3xl font-semibold">{character.name}</h1><p className="mt-2 text-muted-foreground">@{character.handle} · {character.archetype} · {character.status}</p></header>
    {character.status === "retired" ? <p role="status" className="rounded-card border border-amber-400/40 p-4 text-amber-100">This character is retired and hidden from presence and discovery. You can restore it at any time.</p> : null}
    {unavailable ? <p role="alert" className="rounded-card border border-red-400/40 p-4 text-red-200">This character is suspended. Profile and lifecycle changes require operator review.</p> : null}
    {error ? <p role="alert" className="text-red-300">{error}</p> : null}
    <form onSubmit={submit} className="grid gap-5 panel p-5 sm:grid-cols-2" aria-label="Edit character profile">
      <label className="flex flex-col gap-1">Display name<input name="name" required maxLength={32} defaultValue={character.name} disabled={unavailable} className="rounded-control border border-border bg-surface px-3 py-2" /></label>
      <label className="flex flex-col gap-1">Handle<input name="handle" required minLength={3} maxLength={32} pattern="[a-z0-9][a-z0-9-]{1,30}[a-z0-9]" defaultValue={character.handle} disabled={unavailable} className="rounded-control border border-border bg-surface px-3 py-2" /></label>
      <label className="flex flex-col gap-1">Archetype<select name="archetype" defaultValue={character.archetype} disabled={unavailable} className="rounded-control border border-border bg-surface px-3 py-2">{CHARACTER_ARCHETYPES.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="flex flex-col gap-1">Affiliation<input name="affiliation" maxLength={80} defaultValue={character.affiliation ?? ""} disabled={unavailable} className="rounded-control border border-border bg-surface px-3 py-2" /></label>
      <label className="flex flex-col gap-1 sm:col-span-2">Biography<textarea name="bio" maxLength={280} defaultValue={character.bio} disabled={unavailable} className="min-h-24 rounded-control border border-border bg-surface px-3 py-2" /></label>
      <label className="flex flex-col gap-1">Portrait path<input name="portraitUrl" placeholder="/images/portrait.png" defaultValue={character.portraitUrl ?? ""} disabled={unavailable} className="rounded-control border border-border bg-surface px-3 py-2" /><span className="text-xs text-muted-foreground">Approved local images only.</span></label>
      <label className="flex flex-col gap-1">Presence<select name="presence" defaultValue={character.presence} disabled={unavailable || character.status === "retired"} className="rounded-control border border-border bg-surface px-3 py-2"><option value="offline">Offline</option><option value="available">Available</option><option value="away">Away</option></select></label>
      <label className="flex items-center gap-2"><input type="checkbox" name="discoverable" defaultChecked={character.discoverable} disabled={unavailable} /> Allow discovery when published</label>
      <label className="flex flex-col gap-1">Visibility<select name="visibility" defaultValue={character.visibility} disabled={unavailable} className="rounded-control border border-border bg-surface px-3 py-2"><option value="private">Account private</option><option value="public">Request public visibility</option></select></label>
      <label className="flex items-center gap-2 sm:col-span-2"><input type="checkbox" name="publicationConsent" defaultChecked={character.publicationConsent} disabled={unavailable} /> I explicitly consent to publishing the selected profile fields.</label>
      <div className="flex flex-wrap gap-3 sm:col-span-2"><button className="button" disabled={saving || unavailable}>{saving ? "Saving…" : "Save profile"}</button>{character.status === "active" ? <button type="button" className="button secondary" disabled={saving || unavailable} onClick={() => changeStatus("retired")}>Retire character</button> : character.status === "retired" ? <button type="button" className="button secondary" disabled={saving} onClick={() => changeStatus("active")}>Restore character</button> : null}</div>
    </form>
    <section className="panel p-5" aria-labelledby="progression-title">
      <span className="kicker">Internal sandbox</span><h2 id="progression-title" className="section-title mt-2">Progression evidence</h2>
      <p className="mt-2 text-sm text-muted-foreground">Chronological activity, quest, achievement, and collectible evidence. Internal units are test-only and do not grant access, purchases, rewards, or public status.</p>
      <p className="mt-4 text-2xl font-semibold">{progression?.internalBalance ?? 0} internal units</p>
      <button type="button" className="button secondary mt-4" disabled={saving || character.status !== "active"} onClick={recordTestActivity}>Record test discovery</button>
      <ol className="mt-4 flex flex-col gap-2">{progressionEvidence.map((entry) => <li key={entry.id} className="rounded-control border border-border p-3 text-sm">{entry.content}</li>)}</ol>
    </section>
    <section className="panel p-5" aria-labelledby="quests-title">
      <span className="kicker">Persistent experiences</span><h2 id="quests-title" className="section-title mt-2">Quests and achievements</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{rpgContent?.quests.map(({ definition, run }) => <article key={`${definition.id}:${definition.version}`} className="rounded-control border border-border p-4"><h3 className="font-semibold">{definition.title}</h3><p className="mt-1 text-sm text-muted-foreground">{run?.status ?? "available"} · version {definition.version}</p></article>)}</div>
      <Link className="button mt-4" href="/account/character/first-signal">Enter First Signal</Link>
      <div className="mt-5"><h3 className="font-semibold">Achievements</h3><ul className="mt-2 text-sm text-muted-foreground">{rpgContent?.achievements.length ? rpgContent.achievements.map((award) => <li key={award.id}>{award.explanation} · {award.status} · definition v{award.definitionVersion}</li>) : <li>No achievements earned yet.</li>}</ul></div>
      <div className="mt-5"><h3 className="font-semibold">Collectibles</h3><ul className="mt-2 text-sm text-muted-foreground">{rpgContent?.collectibles.length ? rpgContent.collectibles.map((grant) => <li key={grant.id}>{grant.collectibleId.replaceAll("-", " ")} · nontransferable · no commercial value</li>) : <li>No collectibles earned yet.</li>}</ul></div>
    </section>
    <section className="panel p-5" aria-labelledby="rpg-title">
      <span className="kicker">Owner-private RPG sandbox</span><h2 id="rpg-title" className="section-title mt-2">Level {rpg?.level.level ?? 1}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{rpg?.totalTime ?? 0} Time from verified active minutes. RPG state cannot grant account authority or purchased access.</p>
      <div className="mt-4 h-2 overflow-hidden bg-surface"><div className="h-full bg-accent-cyan" style={{ width: `${rpg ? Math.min(100, (rpg.level.levelTime / rpg.level.requiredForNextLevel) * 100) : 0}%` }} /></div>
      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{CORE_ATTRIBUTES.map((attribute) => <div key={attribute} className="rounded-control border border-border p-3"><dt className="text-xs uppercase tracking-wide text-muted-foreground">{attribute}</dt><dd className="mt-1 text-xl font-semibold">{rpg?.attributes[attribute] ?? 10}</dd></div>)}</dl>
      <dl className="mt-5 grid grid-cols-3 gap-3"><div><dt className="text-xs text-muted-foreground">Health</dt><dd className="text-lg font-semibold">{rpg?.resources.health ?? 70}</dd></div><div><dt className="text-xs text-muted-foreground">Focus</dt><dd className="text-lg font-semibold">{rpg?.resources.focus ?? 70}</dd></div><div><dt className="text-xs text-muted-foreground">Resolve</dt><dd className="text-lg font-semibold">{rpg?.resources.resolve ?? 70}</dd></div></dl>
      <p className="mt-5 text-xs text-muted-foreground">Playable experiences award Time through trusted server validation. RPG state remains separate from commercial access and account authority.</p>
    </section>
    <section><h2 className="section-title">History</h2><ol className="mt-4 flex flex-col gap-2">{history.map((event) => <li key={event.id} className="panel p-4 text-sm"><strong>{event.type.replaceAll("_", " ")}</strong><span className="ml-2 text-muted-foreground">{new Date(event.occurredAt).toLocaleString()} · {event.changedFields.join(", ")}</span></li>)}</ol></section>
  </main>;
}
