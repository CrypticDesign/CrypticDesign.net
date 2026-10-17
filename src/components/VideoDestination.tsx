import Image from "next/image";
import Link from "next/link";
import type { VideoEntry } from "@/lib/media-catalog";

function VideoCard({ entry }: { entry: VideoEntry }) {
  return (
    <article className="video-card">
      <figure className="video-card__thumbnail">
        <Image src={entry.thumbnail} alt={entry.thumbnailAlt} fill sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw" />
        <figcaption>Preview image</figcaption>
      </figure>
      <div className="video-card__body">
        <div className="video-card__heading">
          <span>{entry.franchise}</span>
          <strong>{entry.delivery.availability}</strong>
        </div>
        <h3>{entry.title}</h3>
        <p>{entry.premise}</p>
        <dl>
          <div><dt>Playback</dt><dd>{entry.delivery.playback}</dd></div>
          <div><dt>Preview</dt><dd>{entry.delivery.poster}</dd></div>
          <div><dt>Captions</dt><dd>{entry.delivery.captions}</dd></div>
          <div><dt>Transcript</dt><dd>{entry.delivery.transcript}</dd></div>
          <div><dt>Age guidance</dt><dd>{entry.delivery.ageGuidance}</dd></div>
        </dl>
        <p className="video-card__fallback">{entry.delivery.fallback}.</p>
        <div className="video-card__actions">
          {entry.href ? <Link className="text-link" href={entry.href}>Explore this release →</Link> : null}
          <Link className="text-link" href={entry.delivery.contextHref}>{entry.delivery.contextLabel} →</Link>
        </div>
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
          <h1 id="video-title" className="display-title">{rootView ? "Watch Cryptic Design in motion." : selectedLabel}</h1>
          <p>{rootView ? "Explore trailers, episodes, transmissions, behind-the-work features, shorts, and visualizers. Every title shows whether it is ready to watch." : `Explore ${selectedLabel} from Cryptic Design. Every title shows whether it is ready to watch.`}</p>
          <div className="hero-actions"><a className="button" href="#video-catalog">Explore Video</a><Link className="button secondary" href="/entertainment">Return to Entertainment</Link></div>
        </div>
      </header>

      <div className="shell page-stack" id="video-catalog">
        {rootView && featured ? (
          <section className="video-feature" aria-labelledby="video-feature-title">
            <div className="video-feature__poster">
              <Image src="/images/singularis.png" alt="Singularis: Overture preview artwork" fill sizes="(max-width: 900px) 100vw, 56vw" />
              <span>Preview artwork</span>
            </div>
            <div className="video-feature__content">
              <span className="kicker">Featured / Coming soon</span>
              <h2 id="video-feature-title">Singularis: Overture</h2>
              <p>An opening transmission into the Singularis universe, connecting its worlds, signals, and stories.</p>
              <p className="video-playback-status" role="status" aria-live="polite"><strong>Coming soon</strong><span>Preview artwork and release details are available now. Playback will appear here when the video is published.</span></p>
              <div className="hero-actions"><Link className="button" href="/releases/singularis-overture">Explore Overture</Link><Link className="button secondary" href="/products/singularis">Explore Singularis</Link></div>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="video-catalog-title">
          <div className="section-heading"><div><span className="kicker">{rootView ? "Video" : selectedLabel}</span><h2 id="video-catalog-title" className="section-title">{rootView ? "Explore every announced title" : `${selectedLabel} video`}</h2></div><p>Browse what is coming next. Watch controls appear only when a video is ready to play.</p></div>
          <div className="video-grid">{entries.map((entry) => <VideoCard entry={entry} key={entry.slug} />)}</div>
        </section>

        <section className="video-behavior" aria-labelledby="video-behavior-title">
          <div className="section-heading"><div><span className="kicker">Viewing experience</span><h2 id="video-behavior-title" className="section-title">Clear, accessible playback</h2></div></div>
          <div className="video-behavior__grid">
            <article><strong>Before you watch</strong><p>Each title shows its availability and age guidance before playback begins.</p></article>
            <article><strong>While video loads</strong><p>Loading status is announced to assistive technology, and controls activate only when the video is ready.</p></article>
            <article><strong>If playback is interrupted</strong><p>Preview artwork and related links remain available, with the playback issue clearly announced.</p></article>
            <article><strong>Captions and transcripts</strong><p>Every playable video will include captions and a transcript.</p></article>
          </div>
        </section>
      </div>
    </main>
  );
}
