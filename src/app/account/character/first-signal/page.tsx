"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CharacterProfile } from "@/lib/characters";
import type { ContextVector } from "@/lib/rpg-experience";
import type { RpgContentSnapshot } from "@/lib/rpg-content-store";
import type { RpgProjection } from "@/lib/rpg-experience-store";

interface FirstSignalState {
  content: RpgContentSnapshot;
  rpg: RpgProjection;
  firstSignal: RpgContentSnapshot["quests"][number];
  openDoor: RpgContentSnapshot["quests"][number];
  resolution?: { outcome: "success" | "failure"; timeAwarded: number; context: ContextVector; condition: { explanation: string } | null; questCompleted: boolean; practice?: boolean };
}

export default function FirstSignalPage() {
  const [character, setCharacter] = useState<CharacterProfile | null>(null);
  const [state, setState] = useState<FirstSignalState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const characterResponse = await fetch("/api/characters"); const characterPayload = await characterResponse.json();
    if (!characterResponse.ok) throw new Error(characterPayload.error); setCharacter(characterPayload.character);
    if (characterPayload.character) { const response = await fetch(`/api/characters/${characterPayload.character.id}/first-signal`); const payload = await response.json(); if (!response.ok) throw new Error(payload.error); setState(payload); }
  }, []);

  useEffect(() => { load().catch((caught) => setError((caught as Error).message)); }, [load]);

  async function act(action: "start" | "meet" | "discover" | "resolve" | "practice", choice?: "trace" | "force") {
    if (!character) return; setBusy(true); setError(null);
    try {
      const response = await fetch(`/api/characters/${character.id}/first-signal`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ action, choice, sessionId: action === "resolve" ? crypto.randomUUID() : undefined }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error); setState(payload);
    } catch (caught) { setError((caught as Error).message); } finally { setBusy(false); }
  }

  if (!character || !state) return <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6"><p aria-busy="true">{error ?? "Tuning the signal…"}</p></main>;
  const metGuide = Boolean(state.firstSignal.run?.progress.find(({ objectiveId }) => objectiveId === "meet-character")?.count);
  const discovered = state.openDoor.run?.status === "completed";
  const completed = state.firstSignal.run?.status === "completed";

  return <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
    <header><span className="kicker">First playable quest</span><h1 className="mt-2 text-4xl font-semibold">First Signal</h1><p className="mt-3 max-w-2xl text-muted-foreground">A fractured transmission has reached {character.name}. Follow it carefully, or force your way through the noise. Your actions become part of this character&rsquo;s history.</p></header>
    {error ? <p role="alert" className="rounded-control border border-red-400/50 p-4 text-red-200">{error}</p> : null}
    <section className="panel p-5"><h2 className="section-title">Objectives</h2><ol className="mt-4 grid gap-3">
      <li className="rounded-control border border-border p-4"><strong>{state.firstSignal.run ? "✓" : "1"} Accept the signal</strong>{!state.firstSignal.run ? <button className="button secondary ml-4" disabled={busy} onClick={() => act("start")}>Begin quest</button> : null}</li>
      <li className="rounded-control border border-border p-4"><strong>{metGuide ? "✓" : "2"} Meet the system guide</strong>{state.firstSignal.run && !metGuide ? <button className="button secondary ml-4" disabled={busy} onClick={() => act("meet")}>Answer the guide</button> : null}</li>
      <li className="rounded-control border border-border p-4"><strong>{discovered ? "✓" : "3"} Discover the source release</strong>{metGuide && !discovered ? <button className="button secondary ml-4" disabled={busy} onClick={() => act("discover")}>Inspect Visual Study 01</button> : null}</li>
      <li className="rounded-control border border-border p-4"><strong>{completed ? "✓" : "4"} Resolve Signal Run</strong>{discovered && !completed ? <div className="mt-3 flex flex-wrap gap-3"><button className="button" disabled={busy} onClick={() => act("resolve", "trace")}>Trace the pattern</button><button className="button secondary" disabled={busy} onClick={() => act("resolve", "force")}>Force the signal</button></div> : completed ? <div className="mt-3"><p className="text-sm text-muted-foreground">Practice replay grants no Time, growth, conditions, or rewards.</p><div className="mt-2 flex flex-wrap gap-3"><button className="button secondary" disabled={busy} onClick={() => act("practice", "trace")}>Replay: trace</button><button className="button secondary" disabled={busy} onClick={() => act("practice", "force")}>Replay: force</button></div></div> : null}</li>
    </ol></section>
    {state.resolution ? <section className="panel p-5" aria-live="polite"><span className="kicker">{state.resolution.practice ? "Practice resolved" : "Run resolved"}</span><h2 className="mt-2 text-2xl font-semibold">{state.resolution.outcome === "success" ? "Signal stabilized" : "Signal lost"}</h2><p className="mt-3">{state.resolution.practice ? "Practice replay: no persistent changes." : `+${state.resolution.timeAwarded} Time. ${state.resolution.questCompleted ? "First Signal is complete." : "The experience remains, but completion rewards are withheld. You may try again."}`}</p>{state.resolution.condition && !state.resolution.practice ? <p className="mt-2 text-amber-200">{state.resolution.condition.explanation}</p> : null}<p className="mt-4 text-sm text-muted-foreground">Context: {Object.entries(state.resolution.context).filter(([, weight]) => weight > 0).map(([name, weight]) => `${name} ${Math.round(weight * 100)}%`).join(" · ")}</p></section> : null}
    <div className="flex gap-4"><Link className="button secondary" href="/account/character">View character evidence</Link><Link className="button secondary" href="/releases/visual-study-01">View the release</Link></div>
  </main>;
}
