"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { CharacterHistoryEvent, CharacterProfile } from "@/lib/characters";
import type { RpgProjection } from "@/lib/rpg-experience-store";
import type { RpgContentSnapshot, RpgEvidenceEntry } from "@/lib/rpg-content-store";
import { AVATAR_OUTFITS, AVATAR_SKIN_TONES, AVATAR_TRAITS, type AvatarRecipe } from "@/lib/avatar";
import AvatarStudio from "@/components/AvatarStudio";
import AccountFeatureIntro from "@/components/AccountFeatureIntro";

function titleCase(value: string) {
  return value.replaceAll("_", " ").replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function evidenceLabel(entry: RpgEvidenceEntry) {
  switch (entry.type) {
    case "quest_started": return "Journey started";
    case "quest_completed": return "Journey completed";
    case "quest_failed": return "Journey ended";
    case "quest_abandoned": return "Journey set aside";
    case "quest_expired": return "Journey window closed";
    case "achievement_earned": return "Achievement earned";
    case "collectible_granted": return "Discovery added";
  }
}

export default function CharacterProfilePage() {
  const [character, setCharacter] = useState<CharacterProfile | null>(null);
  const [history, setHistory] = useState<CharacterHistoryEvent[]>([]);
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
        const [historyResponse, rpgResponse, contentResponse] = await Promise.all([
          fetch(`/api/characters/${payload.character.id}/history`),
          fetch(`/api/characters/${payload.character.id}/rpg`),
          fetch(`/api/characters/${payload.character.id}/rpg-content`),
        ]);
        const [historyPayload, rpgPayload, contentPayload] = await Promise.all([
          historyResponse.json(),
          rpgResponse.json(),
          contentResponse.json(),
        ]);
        if (historyResponse.ok) setHistory(historyPayload.history);
        if (rpgResponse.ok) setRpg(rpgPayload.rpg);
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
      name: form.get("name"), handle: form.get("handle"), archetype: character.archetype,
      bio: form.get("bio"), portraitUrl: form.get("portraitUrl"), affiliation: form.get("affiliation"),
      avatarRecipe: character.avatarRecipe,
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

  function patchAvatar(patch: Partial<AvatarRecipe>) {
    setCharacter((current) => current ? { ...current, avatarRecipe: { ...current.avatarRecipe, ...patch } } : current);
  }

  if (!loaded) return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><p className="ui-loading" aria-busy="true">Loading character…</p></main>;
  if (!character) {
    const signedOut = error === "Authentication required";
    return <main className="account-page account-feature-page"><AccountFeatureIntro
      accent="violet"
      eyebrow="Your character"
      title="Make it yours."
      description="Create one character to use across Cryptic Design. It keeps your name, progress, and discoveries together wherever you go."
      image="/images/my-home-hero.png"
      imageAlt="A luminous geometric identity structure"
      benefits={[
        { title: "Your character, everywhere", body: "Use the same name and look across games, releases, rooms, and future community spaces." },
        { title: "Your progress, saved", body: "Keep your quests, achievements, and discoveries so you can pick up where you left off." },
        { title: "You decide what others see", body: "Your character starts private. You choose if and when other people can find it." },
      ]}
      steps={[
        { title: "Create your character", body: "Choose a name and style, then review privacy settings." },
        { title: "Use it as you explore", body: "Bring the same character into supported games, releases, and worlds." },
        { title: "Come back anytime", body: "Find what you explored, completed, and discovered in one place." },
      ]}
      primaryAction={signedOut ? { href: "/account/sign-in", label: "Sign in" } : { href: "/account/create-character", label: "Create Character" }}
      secondaryAction={{ href: "/account/subscription", label: "Explore membership" }}
      note="Saved characters are still being tested and are not available as a paid feature yet. You can browse the public site without an account."
    /></main>;
  }

  const unavailable = character.status === "suspended";
  const journey = rpg?.journey;
  const quests = rpgContent?.quests ?? [];
  const discoveries = rpgContent?.evidence.slice(0, 6) ?? [];
  const achievements = rpgContent?.achievements.filter(({ status }) => status === "earned") ?? [];
  const collections = rpgContent?.collectibles.filter(({ revokedAt }) => !revokedAt) ?? [];
  const activeQuest = quests.find(({ run }) => run?.status === "active") ?? quests.find(({ run }) => !run || run.status === "available") ?? null;

  return <main className="character-home-page">
    <header className="character-home-hero panel">
      <AvatarStudio recipe={character.avatarRecipe} label={character.name} />
      <div className="character-home-hero__copy">
        <span className="kicker">Your persistent persona</span>
        <h1 className="display-title">{character.name}</h1>
        <p>@{character.handle} · <span className="presence-dot">{character.status}</span></p>
        <div className="character-home-metrics">
          <div><strong>{journey?.eraTitle ?? "Origin"}</strong><span>Current era</span></div>
          <div><strong>{journey?.timeLivedLabel ?? "First Day"}</strong><span>Time lived</span></div>
          <div><strong>{discoveries.length}</strong><span>Recent discoveries</span></div>
        </div>
        <div className="character-home-hero__actions"><Link href="/account/character/first-signal" className="button">Continue journey</Link><a href="#identity-settings" className="button secondary">Identity &amp; settings</a></div>
      </div>
    </header>

    <nav className="character-home-nav" aria-label="Character Home sections">
      <a href="#journey">Journey</a><a href="#discoveries">Discoveries</a><a href="#achievements">Achievements</a><a href="#collections">Collections</a><a href="#history">History</a>
    </nav>

    <div className="character-home-content">
      {character.status === "retired" ? <p role="status" className="rounded-card border border-amber-400/40 p-4 text-amber-100">This character is retired and hidden from presence and discovery. You can restore it at any time.</p> : null}
      {unavailable ? <p role="alert" className="rounded-card border border-red-400/40 p-4 text-red-200">This character is suspended. Profile and lifecycle changes require operator review.</p> : null}
      {error ? <p role="alert" className="text-red-300">{error}</p> : null}

      <section id="journey" className="character-home-section character-home-journey" aria-labelledby="journey-title">
        <header><span className="kicker">Your journey</span><h2 id="journey-title" className="section-title">{journey?.activeChapter?.title ?? activeQuest?.definition.title ?? "A new chapter is waiting"}</h2><p>{journey?.activeChapter?.summary ?? "Continue from where you left off, or begin the next available experience."}</p></header>
        <div className="character-home-journey__summary panel">
          <div><span>Current era</span><strong>{journey?.eraTitle ?? "Origin"}</strong><small>{journey?.timeLivedLabel ?? "First Day"}</small></div>
          <div><span>Next era</span><strong>{journey?.nextEraLabel ?? "Legacy continues"}</strong><small>{journey?.progressPercent === null || journey?.progressPercent === undefined ? "Named chapters continue your story" : `${journey.progressPercent}% of this era lived`}</small></div>
        </div>
        {journey?.progressPercent !== null && journey?.progressPercent !== undefined ? <div className="character-home-progress" role="progressbar" aria-label={`Progress toward ${journey.nextEraLabel ?? "the next era"}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={journey.progressPercent}><span style={{ width: `${journey.progressPercent}%` }} /></div> : null}
        <div className="character-home-card-grid">{quests.map(({ definition, run }) => <article key={`${definition.id}:${definition.version}`} className="character-home-card panel"><span>{run?.status ? titleCase(run.status) : "Available"}</span><h3>{definition.title}</h3><p>{run?.status === "completed" ? "This chapter is complete and preserved in your history." : run?.status === "active" ? "Your active chapter is ready when you are." : "A new path is available to begin."}</p></article>)}</div>
        <Link className="button" href="/account/character/first-signal">{activeQuest?.run?.status === "active" ? "Resume First Signal" : "Open First Signal"}</Link>
      </section>

      <section id="discoveries" className="character-home-section" aria-labelledby="discoveries-title">
        <header><span className="kicker">What you found</span><h2 id="discoveries-title" className="section-title">Discoveries</h2><p>Recent moments from your journey, presented without internal scoring or system ledgers.</p></header>
        {discoveries.length ? <ol className="character-home-timeline">{discoveries.map((entry) => <li key={entry.id} className="panel"><span>{evidenceLabel(entry)}</span><strong>{entry.title}</strong><time dateTime={entry.occurredAt}>{new Date(entry.occurredAt).toLocaleDateString()}</time></li>)}</ol> : <p className="character-home-empty panel">Your discoveries will appear here as you explore Cryptic experiences.</p>}
      </section>

      <section id="achievements" className="character-home-section" aria-labelledby="achievements-title">
        <header><span className="kicker">Milestones</span><h2 id="achievements-title" className="section-title">Achievements</h2><p>Moments you have earned and the stories behind them.</p></header>
        {achievements.length ? <div className="character-home-card-grid">{achievements.map((award) => <article key={award.id} className="character-home-card panel"><span>Earned</span><h3>{titleCase(award.definitionId)}</h3><p>{award.explanation}</p></article>)}</div> : <p className="character-home-empty panel">Your first achievement is still ahead.</p>}
      </section>

      <section id="collections" className="character-home-section" aria-labelledby="collections-title">
        <header><span className="kicker">Kept along the way</span><h2 id="collections-title" className="section-title">Collections</h2><p>Personal, nontransferable discoveries connected to your character.</p></header>
        {collections.length ? <div className="character-home-card-grid">{collections.map((grant) => <article key={grant.id} className="character-home-card panel"><span>Collected</span><h3>{titleCase(grant.collectibleId)}</h3><p>Part of your private character collection. It has no commercial value.</p></article>)}</div> : <p className="character-home-empty panel">Collected discoveries will gather here.</p>}
      </section>

      <section id="history" className="character-home-section" aria-labelledby="history-title">
        <header><span className="kicker">Durable identity</span><h2 id="history-title" className="section-title">History</h2><p>Major changes to your persistent character identity.</p></header>
        {history.length ? <ol className="character-home-timeline">{history.map((event) => <li key={event.id} className="panel"><span>{titleCase(event.type)}</span><strong>{event.changedFields.length ? event.changedFields.map(titleCase).join(" · ") : "Character established"}</strong><time dateTime={event.occurredAt}>{new Date(event.occurredAt).toLocaleDateString()}</time></li>)}</ol> : <p className="character-home-empty panel">Character history begins when your persona is established.</p>}
      </section>

      <details id="identity-settings" className="panel identity-settings"><summary><span><span className="kicker">Identity &amp; privacy</span><strong>Manage character settings</strong></span><span aria-hidden="true">＋</span></summary><form onSubmit={submit} className="grid gap-5 p-5 sm:grid-cols-2" aria-label="Edit character profile">
        <fieldset className="character-settings-appearance sm:col-span-2"><legend>Appearance</legend><p>Update the supported appearance recipe. Body, face, and hair expansions remain deferred until owned production assets pass intake.</p>
          <div className="character-settings-appearance__group"><strong>Skin material</strong><div className="choice-grid">{AVATAR_SKIN_TONES.map((value) => <button type="button" key={value} disabled={unavailable} aria-pressed={character.avatarRecipe.skinTone === value} onClick={() => patchAvatar({ skinTone: value })}>{value}</button>)}</div></div>
          <div className="character-settings-appearance__group"><strong>Wardrobe</strong><div className="choice-grid">{AVATAR_OUTFITS.map((value) => <button type="button" key={value} disabled={unavailable} aria-pressed={character.avatarRecipe.outfit === value} onClick={() => patchAvatar({ outfit: value })}>{value}</button>)}</div></div>
          <div className="character-settings-appearance__group"><strong>Optional trait</strong><div className="choice-grid">{AVATAR_TRAITS.map((value) => <button type="button" key={value} disabled={unavailable} aria-pressed={character.avatarRecipe.trait === value} onClick={() => patchAvatar({ trait: value })}>{value}</button>)}</div></div>
          <div className="character-settings-appearance__group"><strong>Signal color</strong><div className="choice-grid">{(["cyan", "violet", "magenta", "indigo"] as const).map((value) => <button type="button" key={value} disabled={unavailable} aria-pressed={character.avatarRecipe.accent === value} onClick={() => patchAvatar({ accent: value })}>{value}</button>)}</div></div>
        </fieldset>
        <label className="flex flex-col gap-1">Display name<input name="name" required maxLength={32} defaultValue={character.name} disabled={unavailable} className="rounded-control border border-border bg-surface px-3 py-2" /></label>
        <label className="flex flex-col gap-1">Handle<input name="handle" required minLength={3} maxLength={32} pattern="[a-z0-9][a-z0-9-]{1,30}[a-z0-9]" defaultValue={character.handle} disabled={unavailable} className="rounded-control border border-border bg-surface px-3 py-2" /></label>
        <label className="flex flex-col gap-1">Affiliation<input name="affiliation" maxLength={80} defaultValue={character.affiliation ?? ""} disabled={unavailable} className="rounded-control border border-border bg-surface px-3 py-2" /></label>
        <label className="flex flex-col gap-1 sm:col-span-2">Biography<textarea name="bio" maxLength={280} defaultValue={character.bio} disabled={unavailable} className="min-h-24 rounded-control border border-border bg-surface px-3 py-2" /></label>
        <label className="flex flex-col gap-1">Portrait path<input name="portraitUrl" placeholder="/images/portrait.png" defaultValue={character.portraitUrl ?? ""} disabled={unavailable} className="rounded-control border border-border bg-surface px-3 py-2" /><span className="text-xs text-muted-foreground">Approved local images only.</span></label>
        <label className="flex flex-col gap-1">Presence<select name="presence" defaultValue={character.presence} disabled={unavailable || character.status === "retired"} className="rounded-control border border-border bg-surface px-3 py-2"><option value="offline">Offline</option><option value="available">Available</option><option value="away">Away</option></select></label>
        <label className="flex flex-col gap-1">Visibility<select name="visibility" defaultValue={character.visibility} disabled={unavailable} className="rounded-control border border-border bg-surface px-3 py-2"><option value="private">Account private</option><option value="public">Request public visibility</option></select></label>
        <fieldset className="identity-settings__privacy-options sm:col-span-2">
          <legend>Publishing preferences</legend>
          <label className="identity-settings__checkbox"><input type="checkbox" name="discoverable" defaultChecked={character.discoverable} disabled={unavailable} /><span><strong>Allow discovery</strong><small>Let people find this character after the profile is published.</small></span></label>
          <label className="identity-settings__checkbox"><input type="checkbox" name="publicationConsent" defaultChecked={character.publicationConsent} disabled={unavailable} /><span><strong>Publication consent</strong><small>Allow the selected profile fields to be published when visibility is public.</small></span></label>
        </fieldset>
        <div className="flex flex-wrap gap-3 sm:col-span-2"><button className="button" disabled={saving || unavailable}>{saving ? "Saving…" : "Save profile"}</button>{character.status === "active" ? <button type="button" className="button secondary" disabled={saving || unavailable} onClick={() => changeStatus("retired")}>Retire character</button> : character.status === "retired" ? <button type="button" className="button secondary" disabled={saving} onClick={() => changeStatus("active")}>Restore character</button> : null}</div>
      </form></details>
    </div>
  </main>;
}
