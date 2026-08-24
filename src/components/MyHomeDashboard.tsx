"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AccountEcosystemStatus from "@/components/AccountEcosystemStatus";
import MissionControlSummary from "@/components/my-home/MissionControlSummary";
import PersonalSpacePanel from "@/components/my-home/PersonalSpacePanel";
import type { AccountAdmissionMode } from "@/lib/account-admission";
import type { PublicCharacterIdentity } from "@/lib/characters";
import { getSavedSlugs } from "@/lib/library";
import type { ProgressionSnapshot } from "@/lib/progression";
import {
  publicReleases,
  releaseDestination,
  releaseImage,
  type Release,
} from "@/lib/releases";
import type { RpgContentSnapshot } from "@/lib/rpg-content-store";
import type { RpgProjection } from "@/lib/rpg-experience-store";

type DashboardState = {
  character: PublicCharacterIdentity | null;
  progression: ProgressionSnapshot | null;
  rpg: RpgProjection | null;
  rpgContent: RpgContentSnapshot | null;
};

const EMPTY_DASHBOARD_STATE: DashboardState = {
  character: null,
  progression: null,
  rpg: null,
  rpgContent: null,
};

const CONTINUE_LABEL: Record<Release["kind"], string> = {
  game: "Play",
  video: "Watch",
  audio: "Listen",
  article: "Read",
  lab: "Explore",
};

async function optionalJson<T>(url: string, signal: AbortSignal): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: "no-store", signal });
    return response.ok ? await response.json() as T : null;
  } catch {
    return null;
  }
}

function formatActivityDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Recorded activity";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export default function MyHomeDashboard({ initialAuthenticated = true, accountAdmissionMode = "closed" }: { initialAuthenticated?: boolean; accountAdmissionMode?: AccountAdmissionMode }) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [sessionLoaded, setSessionLoaded] = useState(initialAuthenticated);
  const [dashboard, setDashboard] = useState<DashboardState>(EMPTY_DASHBOARD_STATE);
  const [savedReleases, setSavedReleases] = useState<Release[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const savedSlugs = getSavedSlugs();
    setSavedReleases(publicReleases().filter((release) => savedSlugs.includes(release.slug)));

    async function loadDashboard() {
      const sessionPayload = await optionalJson<{ authenticated?: boolean }>("/api/membership/session", controller.signal);
      if (controller.signal.aborted) return;
      const isAuthenticated = Boolean(sessionPayload?.authenticated);
      setAuthenticated(isAuthenticated);
      if (!isAuthenticated) {
        setDashboard(EMPTY_DASHBOARD_STATE);
        setSessionLoaded(true);
        return;
      }

      const characterPayload = await optionalJson<{ character?: PublicCharacterIdentity | null }>("/api/characters", controller.signal);
      const character = characterPayload?.character ?? null;
      if (!character || controller.signal.aborted) {
        setDashboard({ ...EMPTY_DASHBOARD_STATE, character });
        setSessionLoaded(true);
        return;
      }

      const [progressionPayload, rpgPayload, contentPayload] = await Promise.all([
        optionalJson<{ progression?: ProgressionSnapshot }>(`/api/characters/${character.id}/progression`, controller.signal),
        optionalJson<{ rpg?: RpgProjection }>(`/api/characters/${character.id}/rpg`, controller.signal),
        optionalJson<{ content?: RpgContentSnapshot }>(`/api/characters/${character.id}/rpg-content`, controller.signal),
      ]);
      if (controller.signal.aborted) return;
      setDashboard({
        character,
        progression: progressionPayload?.progression ?? null,
        rpg: rpgPayload?.rpg ?? null,
        rpgContent: contentPayload?.content ?? null,
      });
      setSessionLoaded(true);
    }

    void loadDashboard();
    return () => controller.abort();
  }, []);

  const activity = useMemo(() => {
    const progressionEvents = dashboard.progression?.events.map((event) => ({
      id: event.id,
      title: event.type.replaceAll("_", " "),
      detail: "Recorded in the current progression sandbox.",
      occurredAt: event.occurredAt,
    })) ?? [];
    const contentEvents = dashboard.rpgContent?.evidence.map((event) => ({
      id: event.id,
      title: event.title,
      detail: event.detail,
      occurredAt: event.occurredAt,
    })) ?? [];
    return [...progressionEvents, ...contentEvents]
      .sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt))
      .slice(0, 4);
  }, [dashboard.progression, dashboard.rpgContent]);

  const character = dashboard.character;
  const greeting = !sessionLoaded
    ? "Preparing My Home..."
    : authenticated
      ? `Welcome back${character ? `, ${character.name}` : ""}.`
      : "Your place in Cryptic Design.";

  return (
    <main className="my-home">
      <section className="visual-hero home-hero" data-section-accent="blue" aria-labelledby="my-home-title">
        <PersonalSpacePanel
          status={authenticated && character ? "ready" : "unavailable"}
          character={authenticated && character ? { label: character.name, recipe: character.avatarRecipe } : null}
        />
        <div className="visual-hero__wash" />
        <div className="visual-hero__content home-hero__content">
          <div className="home-hero__copy">
            <div className="signal-rail" />
            <span className="kicker">My Home</span>
            <h1 id="my-home-title" className="display-title">{greeting}</h1>
            <p>{authenticated
              ? "See your identity, what you can continue, and what needs your attention right now."
              : "My Home is the private dashboard for your Character, Library, activity, and future personal space."}</p>
            <div className="hero-actions">
              {authenticated ? (
                <>
                  <Link href={character ? "/account/character" : "/account/create-character"} className="button home-primary-cta">
                    {character ? "View Character" : "Create Character"}
                  </Link>
                  <Link href="/library" className="button secondary">Open My Library</Link>
                </>
              ) : (
                <>
                  <Link href="/account/sign-in" className="button home-primary-cta">Sign in to My Home</Link>
                  <Link href="/account/create" className="button home-secondary-cta">Check account availability</Link>
                </>
              )}
            </div>
          </div>
          {sessionLoaded && !authenticated ? (
            <AccountEcosystemStatus admissionMode={accountAdmissionMode} showAvailabilityAction={false} />
          ) : (
            !sessionLoaded ? <aside className="my-home-loading panel" aria-live="polite" aria-busy="true">Loading private dashboard status...</aside> : null
          )}
        </div>
      </section>

      {authenticated ? (
        <div className="shell my-home-stack">
          <section className="my-home-priority-grid" data-section-accent="cyan" aria-label="Identity and next actions">
            <article className="my-home-module my-home-identity" aria-labelledby="identity-summary-title">
              <span className="kicker">Persistent identity</span>
              {character ? (
                <>
                  <div className="my-home-identity__header">
                    <div className="my-home-identity__mark" aria-hidden="true">{character.name.slice(0, 1).toUpperCase()}</div>
                    <div><h2 id="identity-summary-title">{character.name}</h2><p>@{character.handle} · {character.archetype}</p></div>
                  </div>
                  <dl className="my-home-inline-facts">
                    <div><dt>Status</dt><dd>{character.status}</dd></div>
                    <div><dt>Privacy</dt><dd>{character.visibility === "private" ? "Private" : "Visibility managed in Character"}</dd></div>
                    <div><dt>Journey</dt><dd>{dashboard.rpg?.journey.eraTitle ?? "No current journey data"}</dd></div>
                  </dl>
                  <Link href="/account/character" className="text-link">Open Character</Link>
                </>
              ) : (
                <div className="my-home-empty">
                  <h2 id="identity-summary-title">Create your persistent Character</h2>
                  <p>Your account is active, but no Character is connected yet. Character details remain private unless you explicitly change their visibility.</p>
                  <Link href="/account/create-character" className="button">Create Character</Link>
                </div>
              )}
            </article>
            <MissionControlSummary mission={null} />
          </section>

          <section data-section-accent="green" aria-labelledby="continue-title">
            <div className="section-heading"><div><span className="kicker">Continue</span><h2 id="continue-title" className="section-title">Pick up what matters.</h2></div><p>Until cross-device history is available, this uses releases saved to My Library on this device.</p></div>
            {savedReleases.length ? (
              <div className="my-home-continue-grid">
                {savedReleases.slice(0, 4).map((release) => (
                  <Link key={release.slug} href={releaseDestination(release)} className="my-home-continue-card panel-interactive">
                    <div className="my-home-continue-card__image"><Image src={releaseImage(release)} alt="" fill sizes="(max-width: 640px) 100vw, 25vw" /></div>
                    <div><span className="kicker">{CONTINUE_LABEL[release.kind]} · Saved on this device</span><h3>{release.title}</h3><p>{release.tagline}</p></div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="my-home-empty panel"><h3>Nothing is waiting yet.</h3><p>Save a public release and it will appear here. Viewing history and cross-device continuation are not active.</p><Link href="/entertainment" className="button secondary">Explore Entertainment</Link></div>
            )}
          </section>

          <section className="my-home-detail-grid" data-section-accent="yellow" aria-label="Library and progress">
            <article className="my-home-module" aria-labelledby="library-summary-title">
              <span className="kicker">My Library</span>
              <h2 id="library-summary-title">{savedReleases.length ? `${savedReleases.length} saved on this device` : "Your saved releases"}</h2>
              <p>My Home only summarizes your Library. Saving remains browser-local and does not imply account, subscription, or content access.</p>
              {savedReleases.length ? <ul className="my-home-compact-list">{savedReleases.slice(0, 3).map((release) => <li key={release.slug}><Link href={releaseDestination(release)}>{release.title}<span>{CONTINUE_LABEL[release.kind]}</span></Link></li>)}</ul> : null}
              <Link href="/library" className="text-link">Open My Library</Link>
            </article>
            <article className="my-home-module" aria-labelledby="activity-summary-title">
              <span className="kicker">Activity and progress</span>
              <h2 id="activity-summary-title">What changed</h2>
              {activity.length ? (
                <ol className="my-home-activity-list">{activity.map((event) => <li key={event.id}><span aria-hidden="true" /><div><strong>{event.title}</strong><p>{event.detail}</p><time dateTime={event.occurredAt}>{formatActivityDate(event.occurredAt)}</time></div></li>)}</ol>
              ) : <div className="my-home-empty"><p>No governed activity is available for this account yet. My Home will not manufacture usage history.</p></div>}
              {dashboard.progression ? <p className="my-home-boundary-note">Sandbox balance: {dashboard.progression.internalBalance} internal units. This does not grant access, rewards, purchases, or public status.</p> : null}
            </article>
          </section>

          <section className="my-home-detail-grid" data-section-accent="magenta" aria-label="Collections and participation">
            <article className="my-home-module" aria-labelledby="collection-summary-title">
              <span className="kicker">Achievements and collections</span>
              <h2 id="collection-summary-title">What you have discovered</h2>
              {dashboard.rpgContent?.achievements.length || dashboard.rpgContent?.collectibles.length ? (
                <dl className="my-home-counts"><div><dt>Achievements</dt><dd>{dashboard.rpgContent.achievements.length}</dd></div><div><dt>Collectibles</dt><dd>{dashboard.rpgContent.collectibles.length}</dd></div></dl>
              ) : <div className="my-home-empty"><p>No governed achievements or collectibles are connected yet.</p></div>}
              <Link href="/account/character" className="text-link">View Character progress</Link>
            </article>
            <article className="my-home-module" aria-labelledby="participation-summary-title">
              <span className="kicker">Connections and participation</span>
              <h2 id="participation-summary-title">No participation updates</h2>
              <p>Connections, invitations, groups, and messages are not active platform capabilities. Connecting will never grant access to another member&apos;s Home or private work.</p>
            </article>
          </section>

          <section data-section-accent="violet" aria-labelledby="account-utilities-title">
            <div className="section-heading"><div><span className="kicker">Account utilities</span><h2 id="account-utilities-title" className="section-title">Manage the practical details.</h2></div><p>Routine account tasks stay in conventional, accessible web interfaces.</p></div>
            <nav className="my-home-utility-grid" aria-label="Account utilities">
              <Link href="/account"><strong>Profile and account</strong><span>Overview, session, and sign out</span></Link>
              <Link href="/library"><strong>My Library</strong><span>Saved releases on this device</span></Link>
              <Link href="/account/notifications"><strong>Notifications</strong><span>Preview preferences and availability</span></Link>
              <Link href="/account/subscription"><strong>Subscription</strong><span>Membership status and access</span></Link>
              <Link href="/account/settings"><strong>Settings</strong><span>Security and privacy controls</span></Link>
            </nav>
          </section>
        </div>
      ) : sessionLoaded ? (
        <section className="shell my-home-signed-out" data-section-accent="blue" aria-labelledby="signed-out-title">
          <span className="kicker">Private by default</span>
          <h2 id="signed-out-title" className="section-title">Sign in to see personal state.</h2>
          <p>Public browsing remains available without an account. My Home only requests private Character and account data after an authenticated session is confirmed.</p>
          <div className="hero-actions"><Link href="/entertainment" className="button secondary">Browse the public site</Link><Link href="/account/sign-in" className="button">Sign in</Link></div>
        </section>
      ) : null}
    </main>
  );
}
