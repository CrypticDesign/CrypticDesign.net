import Image from "next/image";
import Link from "next/link";
import type { VideoEntry } from "@/lib/media-catalog";

function VideoCard({ entry }: { entry: VideoEntry }) {
  return (
    <article className="video-card">
      <div className="video-card__heading">
        <span>{entry.franchise}</span>
        <strong>{entry.delivery.availability}</strong>
      </div>
      <h3>{entry.title}</h3>
      <p>{entry.premise}</p>
      <dl>
        <div><dt>Playback</dt><dd>{entry.delivery.playback}</dd></div>
        <div><dt>Poster</dt><dd>{entry.delivery.poster}</dd></div>
        <div><dt>Captions</dt><dd>{entry.delivery.captions}</dd></div>
        <div><dt>Transcript</dt><dd>{entry.delivery.transcript}</dd></div>
        <div><dt>Rights</dt><dd>{entry.delivery.rights}</dd></div>
        <div><dt>Age guidance</dt><dd>{entry.delivery.ageGuidance}</dd></div>
      </dl>
      <p className="video-card__fallback">If media cannot load: {entry.delivery.fallback.toLowerCase()}.</p>
      <div className="video-card__actions">
        {entry.href ? <Link className="text-link" href={entry.href}>View release details →</Link> : null}
        <Link className="text-link" href={entry.delivery.contextHref}>{entry.delivery.contextLabel} →</Link>
      </div>
    </article>
  );
}

export default function VideoDestination({ selectedLabel, rootView, entries }: { selectedLabel: string; rootView: boolean; entries: readonly VideoEntry[] }) {
  const featured = entries.find((entry) => entry.slug === "singularis-overture");
  return (
    <main className="video-destination">
      <header className="video-destination__hero" aria-labelledby="video-title">
        <Image src="/images/entertainment-hero.png" alt="" fill priority sizes="100vw" />
        <div className="video-destination__wash" />
        <div className="shell video-destination__hero-content">
          <span className="eyebrow">Entertainment / Video</span>
          <h1 id="video-title" className="display-title">{rootView ? "Watch the worlds of Cryptic Design." : selectedLabel}</h1>
          <p>{rootView ? "Films, trailers, transmissions, production stories, and visual experiences—each with its public availability stated before you open it." : `Explore ${selectedLabel} video from Cryptic Design.`}</p>
          <div className="hero-actions"><a className="button" href="#video-catalog">Browse video</a><Link className="button secondary" href="/entertainment">Entertainment home</Link></div>
        </div>
      </header>

      <div className="shell page-stack" id="video-catalog">
        {rootView && featured ? (
          <section className="video-feature" aria-labelledby="video-feature-title">
            <div className="video-feature__poster">
              <Image src="/images/singularis.png" alt="Singularis: Overture preview artwork" fill sizes="(max-width: 900px) 100vw, 56vw" />
              <span>Poster preview</span>
            </div>
            <div className="video-feature__content">
              <span className="kicker">Featured / Coming soon</span>
              <h2 id="video-feature-title">Singularis: Overture</h2>
              <p>A cinematic introduction to Singularis. The approved release record is public; the film itself is not yet published.</p>
              <p className="video-playback-status" role="status" aria-live="polite"><strong>Playback unavailable</strong><span>No public video source has been approved. The poster and release context remain available.</span></p>
              <div className="hero-actions"><Link className="button" href="/releases/singularis-overture">View release details</Link><Link className="button secondary" href="/products/singularis">Explore Singularis</Link></div>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="video-catalog-title">
          <div className="section-heading"><div><span className="kicker">{rootView ? "Video catalog" : selectedLabel}</span><h2 id="video-catalog-title" className="section-title">{rootView ? "Announced and developing video" : `${selectedLabel} video`}</h2></div><p>No title displays a play control until approved media is actually published.</p></div>
          <div className="video-grid">{entries.map((entry) => <VideoCard entry={entry} key={entry.slug} />)}</div>
        </section>

        <section className="video-behavior" aria-labelledby="video-behavior-title">
          <div className="section-heading"><div><span className="kicker">Playback behavior</span><h2 id="video-behavior-title" className="section-title">What to expect when video arrives</h2></div></div>
          <div className="video-behavior__grid">
            <article><strong>Before playback</strong><p>An approved poster, publication status, rights state, and age guidance appear first.</p></article>
            <article><strong>While loading</strong><p>Status is announced to assistive technology and controls remain unavailable until the media is ready.</p></article>
            <article><strong>If playback fails</strong><p>The poster stays visible, an error is announced, and release and franchise links remain usable.</p></article>
            <article><strong>Captions and transcript</strong><p>Both publish with playable media. Neither is claimed before an approved video source exists.</p></article>
          </div>
        </section>
      </div>
    </main>
  );
}
