"use client";

import Image from "next/image";
import { useEffect, useReducer, useRef, useState } from "react";
import { useExperienceRuntime } from "@/components/ExperienceRuntime";
import SingularisUniverseViewport from "@/components/SingularisUniverseViewport";
import { createSingularisGamespaceState, singularisGamespaceReducer, type GamespacePhase, type SingularisSimpleActionType } from "@/lib/singularis-gamespace";
import { recordSingularisEvent, type SingularisEventName } from "@/lib/singularis-instrumentation";

const actionCards = [
  ["Pilot", "Fly a Leviathan-class spacecraft", "Master responsive arcade flight and combat."],
  ["Operate", "Enter music-driven Operations", "Fight missions structured around score, rhythm, and escalation."],
  ["Grow", "Upgrade your pilot", "Earn progression, unlock technology, and expand capability."],
  ["Discover", "Open new sectors", "Reveal new locations, threats, and world events."],
  ["Influence", "Shape the living universe", "Your progress changes what becomes visible and available."],
  ["Return", "Continue where the world moved", "The universe evolves between sessions and Operations."],
] as const;

const pathSteps = ["Create Pilot", "Training Simulation", "Accept Operations", "Complete Canonical Missions", "Grow Your Pilot", "Unlock New Operations", "Influence the Living Universe"];

const demoPhases: Array<[GamespacePhase, string]> = [
  ["arrival", "01 · First Contact"],
  ["preparation", "02 · Pilot Preparation"],
  ["entering", "03 · Entering Training"],
  ["training", "04 · Active Gameplay"],
  ["interrupted", "05 · Interruption"],
  ["complete", "06 · Training Complete"],
  ["updated", "07 · Preparation Updated"],
  ["synchronized", "08 · World Synchronized"],
  ["operation", "Operation · Transit Escort"],
];

interface EmbeddedRuntimeState {
  ready: boolean;
  lifecycle: string;
  score: number;
  checkpoint: number;
  wave: number;
  waveCount: number;
  coreIntegrity: number;
  outcome: string | null;
}

const initialEmbeddedRuntime: EmbeddedRuntimeState = { ready: false, lifecycle: "loading", score: 0, checkpoint: 0, wave: 1, waveCount: 106, coreIntegrity: 100, outcome: null };

const singularisWorkspaceSections = [
  { id: "mission-control", label: "Mission Control", icon: "⌁" },
  { id: "hangar", label: "Hangar", icon: "◇" },
  { id: "pilot", label: "Pilot", icon: "◎" },
  { id: "arsenal", label: "Arsenal", icon: "✦" },
  { id: "codex", label: "Codex", icon: "▤" },
  { id: "war-effort", label: "War Effort", icon: "⬡" },
] as const;
type SingularisWorkspaceSection = typeof singularisWorkspaceSections[number]["id"];

export default function SingularisGamespace() {
  const runtime = useExperienceRuntime();
  const [state, dispatch] = useReducer(singularisGamespaceReducer, undefined, () => createSingularisGamespaceState());
  const previousPhaseRef = useRef(state.phase);
  const [franchiseDrawerOpen, setFranchiseDrawerOpen] = useState(true);
  const [workspaceSection, setWorkspaceSection] = useState<SingularisWorkspaceSection>("mission-control");
  const [embeddedRuntime, setEmbeddedRuntime] = useState<EmbeddedRuntimeState>(initialEmbeddedRuntime);
  const immersive = ["entering", "training", "interrupted", "complete", "operation"].includes(state.phase);
  const fullscreen = runtime.state.phase === "active-fullscreen";
  const expanded = runtime.isExpanded;
  const { reportReady } = runtime;

  const act = (type: SingularisSimpleActionType, event?: SingularisEventName) => {
    if (event) recordSingularisEvent(event);
    dispatch({ type });
  };

  useEffect(() => {
    reportReady();
  }, [reportReady]);
  useEffect(() => {
    if (immersive && (runtime.state.phase === "ready" || runtime.state.phase === "updated")) runtime.activate();
    else if (!immersive && runtime.isActive) void runtime.deactivate();
  }, [immersive, runtime]);
  useEffect(() => {
    if (window.localStorage.getItem("cryptic:singularis-pilot-active") === "true") dispatch({ type: "HYDRATE_RETURNING_PILOT" });
    else recordSingularisEvent("singularis_arrival_viewed");
  }, []);
  useEffect(() => {
    if (state.player.pilotStatus === "active") window.localStorage.setItem("cryptic:singularis-pilot-active", "true");
  }, [state.player.pilotStatus]);
  useEffect(() => {
    if (previousPhaseRef.current === state.phase) return;
    previousPhaseRef.current = state.phase;
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  }, [state.phase]);
  useEffect(() => {
    const receiveRuntimeMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.source !== "singularis-v05" || event.data?.contractVersion !== 1) return;
      const payload = event.data.payload;
      if (!payload || typeof payload !== "object") return;
      setEmbeddedRuntime({
        ready: true,
        lifecycle: typeof payload.lifecycle === "string" ? payload.lifecycle : "ready",
        score: Number.isFinite(payload.score) ? payload.score : 0,
        checkpoint: Number.isFinite(payload.checkpoint) ? payload.checkpoint : 0,
        wave: Number.isFinite(payload.wave) ? payload.wave : 1,
        waveCount: Number.isFinite(payload.waveCount) ? payload.waveCount : 106,
        coreIntegrity: Number.isFinite(payload.coreIntegrity) ? payload.coreIntegrity : 100,
        outcome: typeof payload.outcome === "string" ? payload.outcome : null,
      });
    };
    window.addEventListener("message", receiveRuntimeMessage);
    return () => window.removeEventListener("message", receiveRuntimeMessage);
  }, []);
  useEffect(() => { if (state.phase !== "operation") setEmbeddedRuntime(initialEmbeddedRuntime); }, [state.phase]);
  useEffect(() => { const timer = window.setInterval(() => dispatch({ type: "WORLD_TICK" }), 15_000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    if (state.phase !== "entering") return;
    const timer = window.setTimeout(() => dispatch({ type: "RUNTIME_READY" }), 1100);
    return () => window.clearTimeout(timer);
  }, [state.phase]);
  useEffect(() => {
    const interrupt = () => { if (state.phase === "training") dispatch({ type: "INTERRUPT" }); };
    window.addEventListener("blur", interrupt);
    return () => window.removeEventListener("blur", interrupt);
  }, [state.phase]);
  useEffect(() => {
    const interruptOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (expanded && !fullscreen) {
        void runtime.requestFullscreen();
        return;
      }
      if (state.phase === "training" && !fullscreen) dispatch({ type: "INTERRUPT" });
    };
    window.addEventListener("keydown", interruptOnEscape);
    return () => window.removeEventListener("keydown", interruptOnEscape);
  }, [expanded, fullscreen, runtime, state.phase]);
  const toggleFullscreen = () => runtime.requestFullscreen();

  const resetExperience = () => {
    window.localStorage.removeItem("cryptic:singularis-pilot-active");
    dispatch({ type: "RESET_EXPERIENCE" });
  };

  const loadDemoPhase = (phase: GamespacePhase) => dispatch({ type: "LOAD_DEMO_PHASE", phase });

  const title = state.phase === "arrival" ? "Enter the Singularis universe."
    : state.phase === "preparation" ? (state.player.pilotStatus === "active" ? "Ready for your first Operation" : "Prepare to Enter Singularis")
    : state.phase === "entering" ? "Entering Training Simulation"
    : state.phase === "training" || state.phase === "operation" ? "Active Gameplay"
    : state.phase === "interrupted" ? "Flight Interrupted"
    : state.phase === "complete" ? "Training Simulation Complete"
    : state.phase === "updated" ? "Pilot Preparation Updated" : "Persistent World Synchronized";

  const subtitle = state.phase === "arrival" ? "A persistent science-fiction action experience combining arcade combat, music-driven Operations, and an evolving world. Watch the universe in motion, understand your place within it, then choose how to begin."
    : state.phase === "preparation" ? "Your Pilot identity, assigned Leviathan, and first safe activity are ready. Nothing begins until you choose Play."
    : state.phase === "training" || state.phase === "operation" ? "The vertical-scrolling, music-structured run is active. The world is on the grid; the player remains free."
    : state.phase === "interrupted" ? "Control has been suspended, but your Pilot, Leviathan, simulation state, and persistent universe remain intact."
    : state.phase === "complete" ? "Your first flight is complete. Your Pilot identity is active, your Leviathan bond is established, and introductory Operations are now available."
    : state.phase === "updated" ? "Training is complete. Your Pilot identity, Leviathan bond, progression, and available activities have been updated without leaving the Singularis page."
    : state.phase === "synchronized" ? "Your training record is now part of Singularis. The universe continued while you trained, and your next activity reflects the current world state."
    : "The runtime is expanding into Training Simulation 01 without leaving the Singularis page.";

  const fullscreenButton = <button type="button" className="sin-cgs__fullscreen" onClick={() => void toggleFullscreen()} aria-expanded={fullscreen || expanded} aria-label={fullscreen || expanded ? "Exit fullscreen universe view" : "Open universe view fullscreen"}>{fullscreen || expanded ? "Exit fullscreen" : "Fullscreen"}</button>;
  const audioButton = <button type="button" className="sin-cgs__audio" aria-pressed={!runtime.state.audio.muted} onClick={runtime.state.audio.muted ? runtime.enableAudio : runtime.muteAudio}>{runtime.state.audio.muted ? "Enable audio" : "Mute audio"}</button>;

  // Keep the iframe in this component's stable render tree. Defining and mounting a
  // nested React component here would give it a new component identity whenever
  // runtime telemetry updates, causing React to reload the embedded game.
  const renderUniverse = (active = false) => (
    <div className={`sin-cgs__runtime ${active ? "sin-cgs__runtime--active" : ""}`} data-experience-phase={runtime.state.phase}>
      <div className="sin-cgs__runtime-head"><span>{active ? state.session.simulationId : "Live universe"}</span><span>{active ? "Runtime active" : "World status"} <i /></span>{audioButton}{fullscreenButton}</div>
      <div className="sin-cgs__viewport">{state.phase === "operation" ? <iframe className="sin-cgs__game-frame" src="/games/singularis/v05/index.html" title="Singularis Leviathan Protocol v05 game runtime" allow="autoplay; fullscreen; gamepad" onLoad={() => setEmbeddedRuntime((current) => ({ ...current, ready: true, lifecycle: current.lifecycle === "loading" ? "ready" : current.lifecycle }))} /> : workspaceSection !== "mission-control" ? <iframe className="sin-cgs__game-frame" src={`/games/singularis/workspaces/${workspaceSection}/index.html`} title={`Singularis ${singularisWorkspaceSections.find((section) => section.id === workspaceSection)?.label} workspace`} /> : <SingularisUniverseViewport session={state.session} onCheckpoint={() => dispatch({ type: "ADVANCE_CHECKPOINT" })} />}
        {active && state.phase !== "operation" && <div className="sin-cgs__score"><strong>Score {state.session.score.toLocaleString()}</strong><strong>Wave {String(state.session.wave).padStart(2, "0")} / {String(state.session.waveCount).padStart(2, "0")}</strong></div>}
        {state.phase === "entering" && <div className="sin-cgs__center-card"><span>Training Simulation 01</span><h2>Synchronizing controls</h2><p>Input remains locked until runtime readiness is confirmed.</p></div>}
        {state.phase === "interrupted" && <div className="sin-cgs__center-card"><span>Flight control</span><h2>Your flight is paused</h2><p>Return when ready, or end the simulation. The living universe continues outside this training instance.</p><div><button onClick={() => act("RESUME", "training_simulation_resumed")}>Return to flight</button><button className="secondary" onClick={() => act("END_SIMULATION", "training_simulation_ended")}>End simulation</button></div></div>}
        {state.phase === "complete" && <div className="sin-cgs__center-card sin-cgs__center-card--wide"><span>Flight certification</span><h2>Pilot status: Active</h2><p>Training objectives achieved. Movement, targeting, recovery, and control transfer have been verified.</p><button onClick={() => act("CONTINUE_TO_PREPARATION", "pilot_preparation_returned")}>Continue to Pilot Preparation</button></div>}
      </div>
      <div className="sin-cgs__status"><span>{state.phase === "operation" ? `v05 · ${embeddedRuntime.ready ? embeddedRuntime.lifecycle : "loading runtime"}` : "Persistent world"}</span><span>{state.phase === "operation" ? `Score ${embeddedRuntime.score.toLocaleString()} · Hull ${embeddedRuntime.coreIntegrity}% · Bar ${embeddedRuntime.wave}/${embeddedRuntime.waveCount}` : active ? `Core integrity ${state.session.coreIntegrity}% · Checkpoint ${state.session.checkpoint + 1}` : "The universe continues whether you are flying, training, or away."}</span><strong>{embeddedRuntime.outcome || `${state.world.activeEventCount} events active`}</strong></div>
    </div>
  );

  const renderSidePanel = () => {
    if (state.phase === "arrival") return <aside className="sin-cgs__panel"><span>First Contact</span><h2>Understand it in 30 seconds.</h2><p>Singularis is a living action universe. You create a pilot, learn to fly, accept Operations, and shape what becomes available next.</p><hr/><h3>What you’ll do</h3><ul><li>Pilot a Leviathan-class spacecraft</li><li>Fight through music-driven Operations</li><li>Upgrade your pilot and unlock technology</li><li>Discover sectors and influence the world</li></ul><hr/><h3>Your identity begins here</h3><div className="sin-cgs__identity">CrypticDesign.net Member <b>↓</b> Singularis Pilot <b>↓</b> Leviathan Craft</div></aside>;
    if (state.phase === "training" || state.phase === "operation") return <aside className="sin-cgs__panel"><span>State</span><h2>Active Gameplay</h2><hr/><h3>Continuity checks</h3><ul className="checks"><li>Track never stops</li><li>Input is unquantized</li><li>Runtime owns immediate play state</li><li>Platform owns durable state</li></ul>{state.phase === "training" ? <button onClick={() => { window.localStorage.setItem("cryptic:singularis-pilot-active", "true"); act("COMPLETE_TRAINING", "training_simulation_completed"); }}>Complete training</button> : <button className="secondary" onClick={() => act("END_OPERATION")}>Return to Pilot Preparation</button>}</aside>;
    if (state.phase === "interrupted") return <aside className="sin-cgs__panel"><span>Interruption state</span><h2>Nothing has been lost</h2><p>Your current session is safely held while you decide what happens next.</p><hr/><h3>Held state</h3><ul className="checks"><li>Pilot identity — retained</li><li>Leviathan — {state.player.leviathan}</li><li>Simulation — Training 01</li><li>Checkpoint — {state.session.checkpoint + 1}</li><li>World connection — active</li></ul><hr/><h3>Ending the simulation</h3><p>No result, reward, or penalty is recorded.</p></aside>;
    if (state.phase === "complete") return <aside className="sin-cgs__panel"><span>Training outcome</span><h2>Your Pilot is ready</h2><p>This completion changes your standing in Singularis without creating a combat result or affecting the shared war effort.</p><hr/><h3>Unlocked</h3><ul className="checks"><li>Pilot identity — Active</li><li>Leviathan assignment — Bond established</li><li>Introductory Operations — Available</li><li>Pilot progression — Cadet initiated</li></ul><hr/><h3>Recommended next activity</h3><article><strong>Transit Escort</strong><p>A low-risk introductory Operation focused on navigation and formation support.</p></article></aside>;
    if (state.phase === "synchronized") return <aside className="sin-cgs__panel"><span>Synchronization complete</span><h2>Your standing has changed</h2><p>Training updates your Pilot record and available activities without altering the shared war effort.</p><hr/><h3>Pilot state updated</h3><ul className="checks"><li>Pilot identity — Active</li><li>Leviathan bond — Established</li><li>Progression — Cadet initiated</li><li>Operations — Transit Escort available</li></ul><hr/><h3>Shared world state</h3><article><strong>Continuous and unaffected</strong><p>No combat score, rewards, territory change, or war-effort contribution was created by training.</p></article><button onClick={() => act("BEGIN_TRANSIT_ESCORT", "transit_escort_selected")}>Begin Transit Escort</button></aside>;
    const activePilot = state.player.pilotStatus === "active" || state.phase === "updated";
    return <aside className="sin-cgs__panel"><span>Pilot Preparation</span><h2>{activePilot ? "Ready for your first Operation" : "Ready to become active"}</h2><p>{activePilot ? "Training is now part of your Pilot record. The page has returned with your next approved activity ready." : "Your member account becomes a Singularis Pilot identity when you begin."}</p><hr/><div className="sin-cgs__two"><div><h3>Pilot</h3><strong>{activePilot ? "Robert K. Croft" : "Pilot Candidate"}</strong><p>{activePilot ? "Active · Cadet" : "Flight clearance pending"}</p></div><div><h3>Leviathan</h3><strong>{state.player.leviathan}</strong><p>Bond {state.player.leviathanBond}</p></div></div><article><span>Recommended {activePilot ? "next" : "first"} activity</span><strong>{activePilot ? "Transit Escort" : "Training Simulation 01"}</strong><p>{activePilot ? "A low-risk introductory Operation focused on navigation and live-world awareness." : "Learn movement, targeting, and recovery in a risk-free simulation."}</p></article><h3>Pilot progression</h3><div className="sin-cgs__progress"><i /></div>{activePilot ? <button onClick={() => state.phase === "updated" ? act("SYNCHRONIZE_WORLD", "persistent_world_synchronized") : act("BEGIN_TRANSIT_ESCORT", "transit_escort_selected")}>Begin Transit Escort</button> : <button onClick={() => act("ENTER_TRAINING", "training_simulation_entered")}>Play Training Simulation</button>}</aside>;
  };

  const workspaceNavigation = singularisWorkspaceSections.map((section) => <button type="button" key={section.id} aria-current={workspaceSection === section.id ? "page" : undefined} data-runtime-file={`/games/singularis/workspaces/${section.id}/index.html`} onClick={() => setWorkspaceSection(section.id)}><i aria-hidden="true">{section.icon}</i><span>{section.label}</span></button>);

  return <section className={`sin-cgs sin-cgs--${state.phase} ${immersive ? "sin-cgs--immersive" : ""}`} aria-labelledby="singularis-title">
    {state.phase === "arrival" && <div className="sin-cgs__hero-art"><Image src="/images/singularis-marketing-02.jpg" alt="Singularis above the horizon of Earth" fill priority sizes="100vw" /></div>}
    <div className="sin-cgs__wrap">
      <details className="sin-cgs__prototype-controls">
        <summary>Prototype controls</summary>
        <div>
          <label>Review state<select value={state.phase} onChange={(event) => loadDemoPhase(event.target.value as GamespacePhase)}>{demoPhases.map(([phase, label]) => <option key={phase} value={phase}>{label}</option>)}</select></label>
          <button type="button" className="secondary" onClick={() => dispatch({ type: "REPLAY_TRAINING" })}>Replay training</button>
          <button type="button" className="secondary" onClick={resetExperience}>Reset to First Contact</button>
        </div>
      </details>
      <header className="sin-cgs__heading">
        <div className="sin-cgs__heading-copy"><span>{state.phase === "arrival" ? "First-time arrival" : state.phase === "training" ? "State 04" : "Working draft"}</span><h1 id="singularis-title">{title}</h1><p>{subtitle}</p>{state.phase === "arrival" && <div className="sin-cgs__tags"><b>Persistent world</b><b>Arcade action</b><b>Music-driven</b></div>}</div>
      </header>
      <details className="sin-cgs__nav-menu">
        <summary><strong>Singularis workspace</strong><span>{singularisWorkspaceSections.find((section) => section.id === workspaceSection)?.label}</span></summary>
        <nav aria-label="Compact Singularis workspace">{workspaceNavigation}</nav>
      </details>
      <div className="sin-cgs__workspace" data-nav-open={franchiseDrawerOpen}>
        <nav id="singularis-franchise-drawer" className="sin-cgs__nav-rail" aria-label="Singularis workspace">
          <button type="button" className="sin-cgs__nav-toggle" aria-expanded={franchiseDrawerOpen} aria-label={franchiseDrawerOpen ? "Collapse Singularis navigation" : "Expand Singularis navigation"} onClick={() => setFranchiseDrawerOpen((open) => !open)}><b aria-hidden="true">{franchiseDrawerOpen ? "‹" : "›"}</b></button>
          <div>{workspaceNavigation}</div>
        </nav>
        {renderUniverse(immersive)}{renderSidePanel()}
      </div>
      {state.phase === "arrival" && <div className="sin-cgs__arrival-body"><section><span>Discover the experience</span><h2>What is Singularis?</h2><p>Singularis is a persistent science-fiction action experience where arcade gameplay, original music, and an evolving world operate as one continuous system.</p></section><aside><span>The promise</span><p>Every Operation advances your pilot and reveals more of a universe that continues moving before, during, and after you play.</p></aside><section className="wide"><h2>What you’ll do</h2><div className="sin-cgs__actions">{actionCards.map(([k,t,d])=><article key={k}><span>{k}</span><strong>{t}</strong><p>{d}</p></article>)}</div></section><section className="wide"><span>Your path into the world</span><h2>How Singularis works</h2><ol className="sin-cgs__path">{pathSteps.map((step,index)=><li key={step}><b>{index+1}</b><span>{step}</span></li>)}</ol></section><section className="sin-cgs__help"><span>Learn before you fly</span><h2>Help is visible from the start.</h2><p>Getting Started · Controls · HUD Guide · Accessibility · Supported Devices · Controller Setup · Operations vs Simulations · FAQ</p></section><section className="sin-cgs__choices"><span>Choose how to enter</span><p>All three paths are valid. None implies that you are already flying.</p><div><button onClick={() => act("PREPARE", "pilot_preparation_viewed")}>Begin Pilot Initialization</button><button className="secondary" onClick={() => { act("PREPARE"); window.setTimeout(() => act("ENTER_TRAINING", "training_simulation_entered"), 0); }}>Play Training Simulation</button><button className="secondary" onClick={() => recordSingularisEvent("singularis_arrival_viewed")}>Explore the Singularis Universe</button></div></section></div>}
      {state.phase !== "arrival" && <footer className="sin-cgs__continuity"><span>Continuity</span><p>{state.phase === "interrupted" ? "Interruption never discards identity, craft assignment, training state, or the persistent-world connection." : "Player identity, progression, available Operations, and live-world context form one continuous state."}</p><strong>Next · {state.phase === "training" ? "Complete training" : state.phase === "complete" ? "Pilot Preparation" : "First introductory Operation"}</strong></footer>}
    </div>
  </section>;
}
