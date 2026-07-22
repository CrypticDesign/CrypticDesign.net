import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { collections, itemsIn } from "@/lib/store";

export const metadata: Metadata = {
  title: "Store — Preview",
  alternates: { canonical: "/entertainment/store" },
  description:
    "A preview of the Cryptic Design store: Lifa cosmic canvas prints and studio merchandise. Not yet available for purchase.",
};

// CRY-344 item 5: catalog preview only. No pricing, cart, or checkout —
// commerce remains a deferred backend per the CRY-320 launch constraints.
export default function StorePreviewPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[.1em] text-accent-gold">
          Store / preview
        </span>
        <h1 className="text-3xl font-semibold text-white sm:text-[40px]">
          Prints &amp; studio goods
        </h1>
        <p className="m-0 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
          Artwork from the Lifa universe and merchandise carrying the studio
          mark. This is a preview of what the rebuilt store will carry.
        </p>
        <p className="m-0 inline-flex w-fit border border-dashed border-[#173049] px-4 py-2.5 text-[12px] text-neutral-400">
          Ordering is not available yet — the store is being rebuilt on the new
          platform. Pricing and availability will be published when it opens.
        </p>
      </header>

      {collections.map((collection) => (
        <section key={collection.id} className="flex flex-col gap-5">
          <div className="section-heading">
            <div>
              <span className="kicker" style={{ color: collection.accent }}>
                Collection
              </span>
              <h2 className="section-title">{collection.title}</h2>
            </div>
            <p>{collection.blurb}</p>
          </div>

          <div className="media-grid four">
            {itemsIn(collection.id).map((item) => (
              <figure
                key={item.slug}
                className={`media-card ${collection.accentClass} m-0`}
              >
                <div className="media-card__image !aspect-square">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width:640px) 100vw, (max-width:900px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="media-card__body">
                  <span className="kicker" style={{ color: collection.accent }}>
                    {item.format}
                  </span>
                  <h3>{item.name}</h3>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}

      <section className="panel flex flex-col gap-4 p-7 sm:p-10">
        <span className="kicker !text-[#ffd400]">Want to be told when it opens?</span>
        <h2 className="section-title !mb-0">
          The store reopens with the new platform.
        </h2>
        <p className="m-0 max-w-xl text-[13px] leading-relaxed text-[var(--muted)]">
          Prints are produced from original Lifa artwork. Reach out if you want
          a specific piece or size held when ordering returns.
        </p>
        <div className="hero-actions">
          <Link href="/professional/contact" className="button">
            Contact the studio
          </Link>
          <Link
            href="/products/lifa"
            className="button secondary !border-[#ffd400]"
          >
            Explore Lifa
          </Link>
        </div>
      </section>

      <Link
        href="/entertainment"
        className="text-sm text-accent-cyan hover:underline"
      >
        ← Entertainment Hub
      </Link>
    </main>
  );
}
