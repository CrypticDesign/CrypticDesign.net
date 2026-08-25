"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import AvatarStudio from "@/components/AvatarStudio";
import type { CharacterProfile } from "@/lib/characters";
import type { ServerAccountIdentity } from "@/lib/server-account-state";

type CharacterState =
  | { status: "loading" }
  | { status: "ready"; character: CharacterProfile | null }
  | { status: "session-expired" }
  | { status: "permission-denied" }
  | { status: "error" };

const UTILITIES = [
  { href: "/library", eyebrow: "Collection", title: "My Library", body: "Open saved releases and continue states available on this device." },
  { href: "/account/notifications", eyebrow: "Updates", title: "Notifications", body: "Review account notices and the status of optional notification controls." },
  { href: "/account/subscription", eyebrow: "Access", title: "Subscription & Access", body: "Review the distinct state of your account, membership, subscription, and entitlements." },
  { href: "/account/settings", eyebrow: "Controls", title: "Settings & Privacy", body: "Manage supported privacy controls and see which lifecycle actions remain unavailable." },
] as const;

function formatDate(value: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

function CharacterSummary({ state }: { state: CharacterState }) {
  if (state.status === "loading") return <p className="account-state-message" aria-busy="true">Loading your character…</p>;
  if (state.status === "session-expired") return <div className="account-state-message" role="alert"><strong>Your session expired.</strong><p>Sign in again to view your private character.</p><Link href="/account/sign-in" className="button">Sign in again</Link></div>;
  if (state.status === "permission-denied") return <div className="account-state-message" role="alert"><strong>Character access was denied.</strong><p>Your private character was not displayed. Return after confirming the correct account.</p><Link href="/account/sign-in" className="button secondary">Review sign-in</Link></div>;
  if (state.status === "error") return <div className="account-state-message" role="alert"><strong>Character services are temporarily unavailable.</strong><p>Your account remains signed in. Try this section again later.</p></div>;
  if (!state.character) return (
    <div className="account-character-empty">
      <div className="account-character-empty__mark" aria-hidden="true">+</div>
      <div>
        <span className="eyebrow">Incomplete character onboarding</span>
        <h3>Create your persistent character</h3>
        <p>Your account does not have a character yet. A character starts private and remains separate from your account identity.</p>
        <Link href="/account/create-character" className="button">Open Character Forge</Link>
      </div>
    </div>
  );

  const character = state.character;
  const privacy = character.visibility === "public" && character.publicationConsent && character.discoverable
    ? "Public by consent"
    : "Private";
  return (
    <div className="account-character-summary">
      <div className="account-character-summary__avatar">
        <AvatarStudio recipe={character.avatarRecipe} label={character.name} compact />
      </div>
      <div className="account-character-summary__identity">
        <span className="eyebrow">Persistent character</span>
        <h3>{character.name}</h3>
        <p>@{character.handle} · {character.archetype}</p>
        <dl className="account-inline-facts">
          <div><dt>Character state</dt><dd>{character.status}</dd></div>
          <div><dt>Profile visibility</dt><dd>{privacy}</dd></div>
          <div><dt>Discoverability</dt><dd>{character.discoverable ? "Enabled by owner" : "Off"}</dd></div>
        </dl>
        <div className="account-action-row">
          <Link href="/account/character" className="button">View character</Link>
          <Link href="/account/character#identity-settings" className="button secondary">Edit character</Link>
        </div>
      </div>
    </div>
  );
}

export default function AccountOverview({ identity }: { identity: ServerAccountIdentity }) {
  const [characterState, setCharacterState] = useState<CharacterState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    fetch("/api/characters", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) return { status: "session-expired" } as CharacterState;
        if (response.status === 403) return { status: "permission-denied" } as CharacterState;
        if (!response.ok) return { status: "error" } as CharacterState;
        const payload = await response.json() as { character?: CharacterProfile | null };
        return { status: "ready", character: payload.character ?? null } as CharacterState;
      })
      .then((state) => { if (active) setCharacterState(state); })
      .catch(() => { if (active) setCharacterState({ status: "error" }); });
    return () => { active = false; };
  }, []);

  const character = characterState.status === "ready" ? characterState.character : null;
  const privacyState = character
    ? character.visibility === "public" && character.publicationConsent && character.discoverable ? "Public by consent" : "Private"
    : "Private by default";

  return (
    <main className="account-control-center">
      <header className="visual-hero account-overview-hero">
        <div className="visual-hero__image"><Image src="/images/my-home-hero.png" alt="" fill priority sizes="100vw" /></div>
        <div className="visual-hero__wash" />
        <div className="visual-hero__content account-overview-hero__content">
          <div className="account-overview-hero__copy">
            <div className="signal-rail text-[var(--cry-accent-blue)]" />
            <span className="kicker !text-[var(--cry-accent-blue)]">Account / identity / access</span>
            <h1 className="display-title">Your account, clearly connected.</h1>
            <p>Manage identity, security, privacy, access, and account utilities. Activity and personal recommendations remain in My Home.</p>
          </div>
          <dl className="account-control-header__status" aria-label="Account summary">
            <div><dt>Account</dt><dd data-state="open">Active</dd></div>
            <div><dt>Email</dt><dd data-state={identity.emailVerified ? "open" : "attention"}>{identity.emailVerified === null ? "Local test" : identity.emailVerified ? "Verified" : "Verification needed"}</dd></div>
            <div><dt>Access</dt><dd>Site account</dd></div>
          </dl>
        </div>
      </header>

      <div className="shell page-stack account-control-center__body">

      <section id="profile-identity" className="account-control-section" aria-labelledby="profile-identity-title">
        <header className="account-section-heading"><div><span className="eyebrow">Profile &amp; Identity</span><h2 id="profile-identity-title">Account identity</h2></div><p>Your private account identity and persistent character are separate trust domains.</p></header>
        <dl className="account-identity-grid">
          <div><dt>Display name</dt><dd>{identity.displayName ?? "Not set"}</dd></div>
          <div><dt>Email</dt><dd>{identity.email ?? "Local test account — no email"}</dd></div>
          <div><dt>Account status</dt><dd><span className="account-status-label" data-state="open">Active</span></dd></div>
          <div><dt>Membership / access</dt><dd>Site account</dd></div>
          <div><dt>Joined</dt><dd>{formatDate(identity.joinedAt)}</dd></div>
          <div><dt>Age-policy state</dt><dd>Not displayed</dd></div>
        </dl>
        <div className="account-subsection" aria-labelledby="persistent-character-title">
          <h3 id="persistent-character-title" className="sr-only">Persistent character</h3>
          <CharacterSummary state={characterState} />
        </div>
      </section>

      <div className="account-control-columns">
        <section id="access" className="account-control-section" aria-labelledby="access-title">
          <header className="account-section-heading"><div><span className="eyebrow">Access</span><h2 id="access-title">Subscription &amp; access</h2></div></header>
          <dl className="account-setting-list">
            <div><dt>Site account</dt><dd><span className="account-status-label" data-state="open">Active</span></dd></div>
            <div><dt>Membership</dt><dd>No separate membership state is available</dd></div>
            <div><dt>Paid subscription</dt><dd>Not available</dd></div>
            <div><dt>Email subscription</dt><dd>Not reported by account services</dd></div>
            <div><dt>Entitlements</dt><dd>Authenticated account features</dd></div>
          </dl>
          <Link href="/account/subscription" className="button secondary">View access details</Link>
        </section>

        <section id="privacy" className="account-control-section" aria-labelledby="privacy-title">
          <header className="account-section-heading"><div><span className="eyebrow">Privacy</span><h2 id="privacy-title">Privacy state</h2></div></header>
          <dl className="account-setting-list">
            <div><dt>Character profile</dt><dd>{privacyState}</dd></div>
            <div><dt>Discoverability</dt><dd>{character?.discoverable ? "Enabled by owner" : "Off"}</dd></div>
            <div><dt>Activity visibility</dt><dd>Not published</dd></div>
            <div><dt>Mission history</dt><dd>Not implemented</dd></div>
          </dl>
          <Link href="/account/settings#privacy" className="button secondary">Manage privacy</Link>
        </section>

        <section id="messages" className="account-control-section account-control-section--gated" aria-labelledby="messages-title">
          <header className="account-section-heading"><div><span className="eyebrow">Messages</span><h2 id="messages-title">Not available yet</h2></div></header>
          <p>Direct messaging remains disabled until privacy, blocking, reporting, moderation, teen-safety, rate-limiting, and audit requirements are approved.</p>
          <span className="account-status-label" data-state="closed">Feature gated</span>
        </section>
      </div>

      <section className="account-control-section" aria-labelledby="account-utilities-title">
        <header className="account-section-heading"><div><span className="eyebrow">Account utilities</span><h2 id="account-utilities-title">Manage your account</h2></div><p>Open supported utilities without duplicating the My Home dashboard.</p></header>
        <div className="account-utility-grid">
          {UTILITIES.map((utility) => <Link key={utility.href} href={utility.href}><span className="eyebrow">{utility.eyebrow}</span><h3>{utility.title}</h3><p>{utility.body}</p><strong>Open utility →</strong></Link>)}
          <article><span className="eyebrow">Gated</span><h3>Messages</h3><p>Messaging is not authorized for production.</p><strong>Not available</strong></article>
        </div>
      </section>
      </div>
    </main>
  );
}
