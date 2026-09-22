import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ExperienceRuntime from "@/components/ExperienceRuntime";
import ExperienceComingSoon from "@/components/ExperienceComingSoon";
import ReleaseCard from "@/components/ReleaseCard";
import SingularisGamespace from "@/components/SingularisGamespace";
import { AnalyticsAnchor } from "@/components/AnalyticsLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics";
import { getProduct } from "@/lib/products";
import { publicReleases } from "@/lib/releases";
import { resolvePageExperienceAccess } from "@/lib/server-experience-access";
import { socialMetadata } from "@/lib/social-metadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const url = `/products/${product.slug}`;
  return {
    title: product.title,
    description: product.summary,
    alternates: { canonical: url },
    ...socialMetadata({
      title: `${product.title} | Cryptic Design`,
      description: product.summary,
      url,
      image: product.shareImage || "/share/products.png",
    }),
  };
}

export default async function ProductHome({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ release?: string }>;
}) {
  const { slug } = await params;
  const { release: selectedReleaseSlug } = await searchParams;
  const product = getProduct(slug);
  if (!product) notFound();
  const experienceAccess = product.experience
    ? await resolvePageExperienceAccess(product.experience)
    : null;

  const releases = publicReleases().filter((release) =>
    product.releaseSlugs.includes(release.slug),
  );
  const selectedRelease = releases.find(
    (release) => release.slug === selectedReleaseSlug,
  );
  const remainingReleases = selectedRelease
    ? releases.filter((release) => release.slug !== selectedRelease.slug)
    : releases;

  if (product.slug === "singularis") {
    if (!experienceAccess) notFound();
    const transmissions = releases.filter(
      (release) => release.slug !== "singularis-vertical-slice",
    );

    return (
      <main className="singularis-page">
        <section className="singularis-page__hero" aria-label="Singularis franchise artwork">
          <Image src="/images/singularis/SIN_IMG_OrbitalCarrierAndEscort_v01.webp" alt="A Singularis orbital carrier traveling with escort craft above a planet" fill priority sizes="100vw" />
        </section>
        <div className="shell singularis-page__content">
          <header className="singularis-page__heading">
            <span className="kicker">{product.status.replace("-", " ")}</span>
            <h1 className="display-title">{product.title}</h1>
            <p>{product.description}</p>
          </header>
          <section className="panel singularis-page__introduction">
            <span className="kicker">Universe introduction</span>
            <h2 className="section-title">A civilization in acceleration.</h2>
            <p>{product.summary}</p>
            <p>Singularis connects games, animation, music, and worldbuilding across humanity&apos;s transition toward a multi-planetary future.</p>
          </section>
          <section className="singularis-page__world" aria-labelledby="singularis-world-title">
            <div className="singularis-page__section-heading">
              <span className="kicker">Inside the universe</span>
              <h2 id="singularis-world-title" className="section-title">The future opened. Coordination did not keep pace.</h2>
              <p>Singularis begins as technological acceleration turns expansion beyond Earth from an ambition into infrastructure—and forces people and institutions to make consequential decisions faster than certainty can arrive.</p>
            </div>
            <div className="singularis-page__world-grid">
              <article>
                <div className="singularis-page__world-image"><Image src="/images/singularis/SIN_IMG_OrbitalRingConstruction_v01.webp" alt="Industrial orbital ring and vessel under construction above a planet" fill sizes="(max-width: 800px) 100vw, 33vw" /></div>
                <div className="singularis-page__world-copy">
                <span>01</span>
                <h3>The acceleration</h3>
                <p>Energy, automation, construction, and travel advance together. Old limits recede, but dependence, conflict, and miscalculation accelerate with them.</p>
                </div>
              </article>
              <article>
                <div className="singularis-page__world-image"><Image src="/images/singularis/SIN_IMG_CommandHallBriefing_v01.webp" alt="Uniformed officer addressing a futuristic command hall" fill sizes="(max-width: 800px) 100vw, 33vw" /></div>
                <div className="singularis-page__world-copy">
                <span>02</span>
                <h3>Human oversight</h3>
                <p>Singularis is a human institution working inside the tension between speed and restraint. Its authority is real, necessary, and constantly contested.</p>
                </div>
              </article>
              <article>
                <div className="singularis-page__world-image"><Image src="/images/singularis/SIN_IMG_CityLaunchSpectators_v01.webp" alt="Spectators watching a spacecraft launch from a future city" fill sizes="(max-width: 800px) 100vw, 33vw" /></div>
                <div className="singularis-page__world-copy">
                <span>03</span>
                <h3>Life under pressure</h3>
                <p>The stakes are systemic, but the experience stays human: competent people improvise, argue, adapt, and carry their culture into the space age.</p>
                </div>
              </article>
            </div>
          </section>
          <section className="singularis-page__media" aria-labelledby="singularis-media-title">
            <div className="singularis-page__section-heading">
              <span className="kicker">One universe · multiple forms</span>
              <h2 id="singularis-media-title" className="section-title">A continuous story across media.</h2>
              <p>Each form offers a different point of contact with the same evolving world. No medium is treated as an appendix.</p>
            </div>
            <div className="singularis-page__media-grid">
              <article>
                <strong>Game</strong>
                <h3>Move with the signal.</h3>
                <p>A cinematic, narrative-driven arcade shooter built around motion, pressure, rhythm, and decisions made in the moment.</p>
              </article>
              <article>
                <strong>Animation</strong>
                <h3>See the system from every level.</h3>
                <p>A multi-perspective story moving from human lives on the ground to institutions and consequences at planetary scale.</p>
              </article>
              <article>
                <strong>Music</strong>
                <h3>Hear civilization change tempo.</h3>
                <p>Electronic, cinematic, and rock-driven music designed to work both as narrative score and as standalone releases.</p>
              </article>
            </div>
          </section>
        </div>
        {experienceAccess?.executable ? (
          <ExperienceRuntime
            runtimeId="singularis:continuous-gamespace:v1"
            accessibleLabel="Singularis interactive experience"
            controls="consumer"
            capabilities={{ controller: true }}
          >
            <SingularisGamespace />
          </ExperienceRuntime>
        ) : (
          <ExperienceComingSoon
            title={product.title}
            summary="Explore the Singularis universe and its released music while the playable browser experience remains under development."
            access={experienceAccess}
          />
        )}
        {transmissions.length > 0 && (
          <div className="shell singularis-page__releases">
            <span className="kicker">From the Singularis universe</span>
            <h2 className="section-title">Releases and transmissions</h2>
            <div className="flex flex-wrap gap-4">{transmissions.map((release) => <ReleaseCard key={release.slug} release={release} />)}</div>
          </div>
        )}
        <div className="shell singularis-page__links flex flex-wrap gap-4 text-sm">
          {product.franchiseUrl && <AnalyticsAnchor href={product.franchiseUrl} className="text-accent-violet hover:underline" analyticsEvent={{ name: ANALYTICS_EVENTS.OUTBOUND_LINK, payload: { destination_domain: new URL(product.franchiseUrl).hostname, destination_category: "franchise" } }}>Visit {product.title} franchise home ↗</AnalyticsAnchor>}
          <Link href="/products" className="text-accent-cyan hover:underline">← All products</Link>
        </div>
      </main>
    );
  }

  if (product.slug === "lifa") {
    return (
      <main className="lifa-page">
        <section className="lifa-page__hero" aria-label="Lifa franchise artwork">
          <Image src="/images/lifa-marketing-intro-01.png" alt="Lifa above a forming planetary world" fill priority sizes="100vw" />
        </section>
        <div className="shell lifa-page__content">
          <header className="lifa-page__heading">
            <span className="kicker">{product.status.replace("-", " ")}</span>
            <h1 className="display-title">{product.title}</h1>
            <p>{product.description}</p>
          </header>
          <section className="panel lifa-page__introduction">
            <span className="kicker">World introduction</span>
            <h2 className="section-title">Shape systems toward life.</h2>
            <p>{product.summary}</p>
            <p>Lifa combines simulation, strategy, discovery, and planetary-scale experimentation in one evolving universe.</p>
          </section>
          {experienceAccess && (
            <ExperienceComingSoon
              title={product.title}
              summary="Lifa remains publicly discoverable while its playable development builds stay closed until a public release is approved."
              access={experienceAccess}
            />
          )}
          <div className="flex flex-wrap gap-4 text-sm">
            {product.franchiseUrl && <AnalyticsAnchor href={product.franchiseUrl} className="text-accent-violet hover:underline" analyticsEvent={{ name: ANALYTICS_EVENTS.OUTBOUND_LINK, payload: { destination_domain: new URL(product.franchiseUrl).hostname, destination_category: "franchise" } }}>Visit {product.title} franchise home ↗</AnalyticsAnchor>}
            <Link href="/products" className="text-accent-cyan hover:underline">← All products</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="shell page-stack">
      <header className="art-field grid min-h-[28rem] items-end border border-border p-6 sm:p-10 lg:grid-cols-[1fr_.8fr]">
        <div className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {product.status.replace("-", " ")}
        </span>
        <h1 className="display-title text-white">{product.title}</h1>
        <p className="max-w-2xl text-muted-foreground">{product.description}</p>
        </div><div />
      </header>

      {selectedRelease && (
        <section className="panel flex flex-col gap-4 border-accent-violet p-6 sm:p-8">
          <span className="text-xs uppercase tracking-widest text-accent-violet">
            Selected release · {selectedRelease.kind}
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-white">{selectedRelease.title}</h2>
            <p className="max-w-2xl text-muted-foreground">{selectedRelease.tagline}</p>
            <p className="max-w-2xl text-sm text-neutral-300">{selectedRelease.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/releases/${selectedRelease.slug}`} className="rounded-control bg-accent-violet px-4 py-2 text-sm font-medium text-black hover:opacity-90">
              Open release page
            </Link>
            <Link href={`/products/${product.slug}`} className="rounded-control border border-border px-4 py-2 text-sm text-foreground hover:border-accent-cyan">
              View {product.title} product overview
            </Link>
          </div>
        </section>
      )}

      {remainingReleases.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            {selectedRelease ? `More from ${product.title}` : "Releases"}
          </h2>
          <div className="flex flex-wrap gap-4">
            {remainingReleases.map((release) => (
              <ReleaseCard key={release.slug} release={release} />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-4 text-sm">
        {product.franchiseUrl && (
          <AnalyticsAnchor href={product.franchiseUrl} className="text-accent-violet hover:underline" analyticsEvent={{ name: ANALYTICS_EVENTS.OUTBOUND_LINK, payload: { destination_domain: new URL(product.franchiseUrl).hostname, destination_category: "franchise" } }}>
            Visit {product.title} franchise home ↗
          </AnalyticsAnchor>
        )}
        <Link href="/products" className="text-accent-cyan hover:underline">← All products</Link>
      </div>
    </main>
  );
}
