"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import AvatarStudio from "@/components/AvatarStudio";
import { AVATAR_OUTFITS, AVATAR_SKIN_TONES, AVATAR_TRAITS, DEFAULT_AVATAR_RECIPE, type AvatarRecipe } from "@/lib/avatar";
import {
  CHARACTER_FORGE_STEPS,
  canOpenCharacterForgeStep,
  validateCharacterForgeIdentity,
  type CharacterForgeIdentityErrors,
} from "@/lib/character-forge-controls";
import { CHARACTER_ARCHETYPES, type PublicCharacterIdentity } from "@/lib/characters";

const lastStep = CHARACTER_FORGE_STEPS.length - 1;
const unsavedDraftMessage = "Leave Character Forge? Your unsaved draft is held only in this tab and will be lost.";

export default function CharacterCreator() {
  const [step, setStep] = useState(0);
  const [highestUnlockedStep, setHighestUnlockedStep] = useState(0);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<AvatarRecipe>(DEFAULT_AVATAR_RECIPE);
  const [created, setCreated] = useState<PublicCharacterIdentity | null>(null);
  const [existingCharacter, setExistingCharacter] = useState<PublicCharacterIdentity | null>(null);
  const [characterStatus, setCharacterStatus] = useState<"idle" | "checking" | "ready" | "error">("idle");
  const [identityErrors, setIdentityErrors] = useState<CharacterForgeIdentityErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [serviceMode, setServiceMode] = useState<"supabase" | "sandbox" | "disabled">("disabled");
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const handleRef = useRef<HTMLInputElement>(null);
  const keepEditingRef = useRef<HTMLButtonElement>(null);
  const discardTriggerRef = useRef<HTMLButtonElement>(null);
  const previousStep = useRef(0);
  const requestId = useRef<string | null>(null);

  const checkExistingCharacter = useCallback(async () => {
    setCharacterStatus("checking");
    setError(null);
    try {
      const response = await fetch("/api/characters");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Character status could not be checked");
      setExistingCharacter(payload.character ?? null);
      setCharacterStatus("ready");
    } catch (caught) {
      setExistingCharacter(null);
      setCharacterStatus("error");
      setError((caught as Error).message);
    }
  }, []);

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/membership/session");
        const payload = await response.json();
        const isAuthenticated = Boolean(payload.authenticated);
        setAuthenticated(isAuthenticated);
        setServiceMode(payload.mode ?? "disabled");
        if (isAuthenticated) await checkExistingCharacter();
        else setCharacterStatus("ready");
      } catch {
        setAuthenticated(false);
        setCharacterStatus("ready");
      } finally {
        setSessionLoaded(true);
      }
    }
    void loadSession();
  }, [checkExistingCharacter]);

  useEffect(() => {
    if (previousStep.current !== step) headingRef.current?.focus({ preventScroll: true });
    previousStep.current = step;
  }, [step]);

  useEffect(() => {
    if (confirmDiscard) keepEditingRef.current?.focus({ preventScroll: true });
  }, [confirmDiscard]);

  useEffect(() => {
    if (!dirty || saving) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const confirmLinkNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || !(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);
      const staysOnPage = destination.origin === current.origin
        && destination.pathname === current.pathname
        && destination.search === current.search;
      if (staysOnPage || window.confirm(unsavedDraftMessage)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", confirmLinkNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", confirmLinkNavigation, true);
    };
  }, [dirty, saving]);

  const markDirty = () => setDirty(true);
  const patchAvatar = (patch: Partial<AvatarRecipe>) => { setAvatar((current) => ({ ...current, ...patch })); markDirty(); };

  function validateIdentity() {
    const errors = validateCharacterForgeIdentity(name, handle);
    setIdentityErrors(errors);
    if (errors.name) nameRef.current?.focus();
    else if (errors.handle) handleRef.current?.focus();
    return Object.keys(errors).length === 0;
  }

  function openStep(nextStep: number) {
    if (!canOpenCharacterForgeStep(nextStep, highestUnlockedStep)) return;
    setError(null);
    setStep(nextStep);
  }

  function continueStep() {
    setError(null);
    if (step === 0 && !validateIdentity()) return;
    const nextStep = Math.min(lastStep, step + 1);
    setHighestUnlockedStep((current) => Math.max(current, nextStep));
    setStep(nextStep);
  }

  function discardDraft() {
    setName("");
    setHandle("");
    setBio("");
    setAvatar(DEFAULT_AVATAR_RECIPE);
    setIdentityErrors({});
    setError(null);
    setStep(0);
    setHighestUnlockedStep(0);
    setDirty(false);
    setConfirmDiscard(false);
    requestId.current = null;
    requestAnimationFrame(() => nameRef.current?.focus({ preventScroll: true }));
  }

  function keepEditing() {
    setConfirmDiscard(false);
    requestAnimationFrame(() => discardTriggerRef.current?.focus({ preventScroll: true }));
  }

  async function startPreviewSession() {
    setError(null);
    const response = await fetch("/api/membership/session", { method: "POST" });
    const payload = await response.json();
    if (!response.ok) return setError(payload.error ?? "Local preview session could not be started");
    const isAuthenticated = Boolean(payload.authenticated);
    setAuthenticated(isAuthenticated);
    if (isAuthenticated) await checkExistingCharacter();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < lastStep) return continueStep();
    if (!validateIdentity()) { setStep(0); return; }
    setSaving(true);
    setError(null);
    requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/characters", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": requestId.current },
        body: JSON.stringify({
          name: name.trim(),
          handle,
          // The storage schema still requires this legacy field. Character Forge is classless and does not expose it as a choice.
          archetype: CHARACTER_ARCHETYPES[0],
          bio,
          avatarRecipe: avatar,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Character could not be created");
      setCreated(payload.character);
      setDirty(false);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (created) return <section className="forge-complete panel"><AvatarStudio recipe={created.avatarRecipe} label={created.name} compact /><div><span className="kicker">Signal established</span><h2 className="section-title">{created.name}</h2><p className="muted">Your persistent Cryptic persona is ready.</p><Link href="/account/character" className="button">Enter Character Home</Link></div></section>;
  if (!sessionLoaded || characterStatus === "checking") return <p className="ui-loading" aria-busy="true">Checking character status…</p>;
  if (!authenticated && serviceMode === "sandbox") return <section className="panel flex max-w-xl flex-col items-start gap-4 p-5"><h2 className="font-medium">Enter the Character Forge</h2><p className="muted">Start a local preview session. It creates no real account and sends no personal or biometric data.</p>{error ? <p role="alert" className="text-red-300">{error}</p> : null}<button type="button" className="button" onClick={startPreviewSession}>Start local preview</button></section>;
  if (!authenticated) return <section className="panel flex max-w-xl flex-col items-start gap-4 p-5"><h2 className="font-medium">Sign in to enter the Character Forge</h2><p className="muted">A verified subscriber account is required before creating your persistent character. New accounts open through approved invitations.</p><div className="flex flex-wrap gap-3"><Link href="/account/create" className="button">Account availability</Link><Link href="/account/sign-in" className="button secondary">Sign in</Link></div></section>;
  if (characterStatus === "error") return <section className="panel flex max-w-xl flex-col items-start gap-4 p-5"><span className="kicker">Character status unavailable</span><h2 className="font-medium">The Forge is temporarily locked</h2><p role="alert" className="text-red-300">{error ?? "Character status could not be checked."}</p><p className="muted">Creation stays locked until the one-character boundary can be verified.</p><button type="button" className="button secondary" onClick={() => void checkExistingCharacter()}>Check again</button></section>;
  if (existingCharacter) return <section className="forge-complete panel"><AvatarStudio recipe={existingCharacter.avatarRecipe} label={existingCharacter.name} compact /><div><span className="kicker">Character already established</span><h2 className="section-title">{existingCharacter.name}</h2><p className="muted">You already have one persistent character. Continue to Character Home to view or manage it.</p><Link href="/account/character" className="button">Enter Character Home</Link></div></section>;

  return <form onSubmit={submit} className="character-forge" noValidate>
    <section className="character-forge__stage" aria-label="Persistent character preview">
      <AvatarStudio recipe={avatar} label={name || "Unnamed persona"} />
      <div className="forge-identity"><span className="kicker">Live persona</span><strong>{name || "Awaiting identity"}</strong><span>{handle ? `@${handle}` : "Private by default · classless"}</span></div>
    </section>
    <section className="character-forge__controls panel">
      <nav className="forge-steps" aria-label="Character Forge steps">
        {CHARACTER_FORGE_STEPS.map((label, index) => <button type="button" key={label} aria-current={step === index ? "step" : undefined} disabled={confirmDiscard || index > highestUnlockedStep} onClick={() => openStep(index)}><span>{index + 1}</span>{label}</button>)}
      </nav>
      <div className="forge-control-body">
        <div className="forge-progress"><span className="kicker">Step {step + 1} of {CHARACTER_FORGE_STEPS.length}</span><p aria-live="polite">{dirty ? "Unsaved draft · held in this tab only" : "Draft starts private"}</p></div>
        <h2 ref={headingRef} tabIndex={-1} className="section-title">{CHARACTER_FORGE_STEPS[step]}</h2>

        {confirmDiscard ? <section className="forge-discard-confirmation" role="alertdialog" aria-labelledby="forge-discard-title" aria-describedby="forge-discard-description">
          <strong id="forge-discard-title">Discard this draft?</strong>
          <p id="forge-discard-description">This clears the identity, appearance, and biography held in this tab. No character or history entry will be created.</p>
          <div><button ref={keepEditingRef} type="button" className="button secondary" onClick={keepEditing}>Keep editing</button><button type="button" className="button" onClick={discardDraft}>Discard draft</button></div>
        </section> : <>
        {step === 0 ? <div className="forge-fields">
          <label htmlFor="forge-name">Display name<input ref={nameRef} id="forge-name" required maxLength={32} value={name} aria-invalid={Boolean(identityErrors.name)} aria-describedby={identityErrors.name ? "forge-name-error" : undefined} onChange={(event) => { setName(event.target.value); setIdentityErrors((current) => ({ ...current, name: undefined })); markDirty(); }} /></label>
          {identityErrors.name ? <span id="forge-name-error" className="forge-field-error">{identityErrors.name}</span> : null}
          <label htmlFor="forge-handle">Handle <span>Lowercase letters, numbers, and hyphens</span><input ref={handleRef} id="forge-handle" required minLength={3} maxLength={32} value={handle} aria-invalid={Boolean(identityErrors.handle)} aria-describedby={identityErrors.handle ? "forge-handle-error" : undefined} onChange={(event) => { setHandle(event.target.value.toLowerCase().replace(/\s+/g, "-")); setIdentityErrors((current) => ({ ...current, handle: undefined })); markDirty(); }} /></label>
          {identityErrors.handle ? <span id="forge-handle-error" className="forge-field-error">{identityErrors.handle}</span> : null}
          <p className="forge-boundary">Your name and handle become the durable identity. Appearance can change later.</p>
        </div> : null}

        {step === 1 ? <div><fieldset><legend>Skin material</legend><div className="choice-grid">{AVATAR_SKIN_TONES.map((value) => <button type="button" key={value} aria-pressed={avatar.skinTone === value} onClick={() => patchAvatar({ skinTone: value })}>{value}</button>)}</div></fieldset><fieldset><legend>Optional traits</legend><div className="choice-grid">{AVATAR_TRAITS.map((value) => <button type="button" key={value} aria-pressed={avatar.trait === value} onClick={() => patchAvatar({ trait: value })}>{value}</button>)}</div></fieldset></div> : null}

        {step === 2 ? <div><fieldset><legend>Outfit</legend><div className="choice-grid">{AVATAR_OUTFITS.map((value) => <button type="button" key={value} aria-pressed={avatar.outfit === value} onClick={() => patchAvatar({ outfit: value })}>{value}</button>)}</div></fieldset><fieldset><legend>Signal color</legend><div className="choice-grid">{(["cyan", "violet", "magenta", "indigo"] as const).map((value) => <button type="button" key={value} aria-pressed={avatar.accent === value} onClick={() => patchAvatar({ accent: value })}>{value}</button>)}</div></fieldset><p className="forge-boundary">Appearance is cosmetic. It cannot grant abilities, progression, access, purchases, or authority.</p></div> : null}

        {step === 3 ? <div className="forge-fields"><label htmlFor="forge-bio">Biography <span>Optional · private by default · {bio.length}/280</span><textarea id="forge-bio" maxLength={280} value={bio} onChange={(event) => { setBio(event.target.value); markDirty(); }} /></label><p className="forge-boundary">Character Forge is classless. Your choices describe presentation, not capability or eligibility.</p></div> : null}

        {step === 4 ? <div className="forge-review" aria-label="Review character draft"><dl><div><dt>Name</dt><dd>{name.trim()}</dd></div><div><dt>Handle</dt><dd>@{handle}</dd></div><div><dt>Body</dt><dd>{avatar.skinTone} · {avatar.trait === "none" ? "no optional trait" : avatar.trait}</dd></div><div><dt>Style</dt><dd>{avatar.outfit} · {avatar.accent} signal</dd></div><div><dt>Biography</dt><dd>{bio.trim() || "No biography yet"}</dd></div><div><dt>Visibility</dt><dd>Private by default</dd></div></dl><p className="forge-boundary">Establishing this persona creates the durable character identity. Appearance remains editable afterward.</p></div> : null}

        {error ? <p role="alert" className="forge-submit-error">{error}</p> : null}
        <div className="forge-actions">
          <button type="button" className="button secondary" disabled={step === 0 || saving} onClick={() => openStep(Math.max(0, step - 1))}>Back</button>
          <div className="forge-actions__primary">
            {dirty ? <button ref={discardTriggerRef} type="button" className="button secondary" disabled={saving} onClick={() => setConfirmDiscard(true)}>Discard draft</button> : null}
            {step < lastStep ? <button type="button" className="button" disabled={saving} onClick={continueStep}>Continue</button> : <button type="submit" className="button" disabled={saving}>{saving ? "Establishing…" : "Establish persona"}</button>}
          </div>
        </div>
        </>}
      </div>
    </section>
  </form>;
}
