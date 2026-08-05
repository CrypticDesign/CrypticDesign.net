import type { Metadata } from "next";
import Link from "next/link";
import { ARCADE_ENTRIES, arcadeEntriesFor, type ArcadeEntry } from "@/lib/arcade";
import { arcadeCategory } from "@/lib/entertainment-navigation";

export const metadata: Metadata = {
  title: "Arcade",
  alternates: { canonical: "/entertainment/arcade" },
  description: "Playable Cryptic Design releases, missions, and experiments.",
};

function ArcadeCard({ entry }: { entry: ArcadeEntry }) {
  const content = (
    <>
      <div className="arcade-card__heading"><span>{entry.franchise}</span><strong>{entry.status}</strong></div>
      <h3>{entry.title}</h3>
      <p>{entry.premise}</p>
      <dl>
        <div><dt>Platform</dt><dd>{entry.platform}</dd></div>
        <div><dt>Access</dt><dd>{entry.access}</dd></div>
        <div><dt>Genres</dt><dd>{entry.genres.join(" · ")}</dd></div>
      </dl>
      <span className="arcade-card__action">{entry.href ? "Open experience →" : "Follow / notify — coming later"}</span>
    </>
  );
  return entry.href ? <Link className="arcade-card" href={entry.href}>{content}</Link> : <article className="arcade-card arcade-card--construction">{content}</article>;
}

function ArcadeSection({ eyebrow, title, entries }: { eyebrow: string; title: string; entries: readonly ArcadeEntry[] }) {
  return <section className="arcade-section" aria-labelledby={`arcade-${eyebrow.toLowerCase().replaceAll(" ", "-")}`}>
    <div className="section-heading"><div><span className="kicker">{eyebrow}</span><h2 id={`arcade-${eyebrow.toLowerCase().replaceAll(" ", "-")}`} className="section-title">{title}</h2></div></div>
    <div className="arcade-grid">{entries.map((entry) => <ArcadeCard entry={entry} key={entry.slug} />)}</div>
  </section>;
}

export default async function ArcadePage({ searchParams }: { searchParams: Promise<{ genre?: string }> }) {
  const selected = arcadeCategory((await searchParams).genre) ?? arcadeCategory("all")!;
  const filtered = arcadeEntriesFor(selected.slug);
  const rootView = selected.slug === "all";

  return <main className="arcade-page">
    <header className="destination-hero">
      <div className="shell destination-hero__content">
        <span className="eyebrow">Arcade / MVP</span>
        <h1 className="display-title">{rootView ? "Play across Cryptic Design." : selected.label}</h1>
        <p>{rootView ? "Playable releases, connected missions, and transparent looks at what is being built next." : `Explore ${selected.label} across the Cryptic Design Arcade.`}</p>
        <div className="hero-actions"><a className="button" href="#arcade-catalog">Explore Arcade</a><Link className="button secondary" href="/entertainment">Entertainment home</Link></div>
      </div>
    </header>

    <div className="shell page-stack" id="arcade-catalog">
      {rootView ? <>
        <ArcadeSection eyebrow="Featured" title="Featured in Arcade" entries={ARCADE_ENTRIES.filter((entry) => entry.featured)} />
        <ArcadeSection eyebrow="All games" title="The complete Arcade catalog" entries={ARCADE_ENTRIES} />
        <section className="arcade-continue panel" aria-labelledby="continue-playing-heading" hidden>
          <span className="kicker">Continue playing</span><h2 id="continue-playing-heading" className="section-title">Return to your activity</h2><p>Shown only when the signed-in player has saved or recent Arcade activity.</p>
        </section>
        <ArcadeSection eyebrow="Coming soon" title="Known future games and prototypes" entries={arcadeEntriesFor("coming-soon")} />
      </> : <ArcadeSection eyebrow={selected.label} title={`${selected.label} in Arcade`} entries={filtered} />}
    </div>
  </main>;
}
