import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  alternates: { canonical: "/terms" },
  description:
    "Terms of use and intellectual property notice for CrypticDesign.net.",
};

// Seeded from the legacy site's rights statement per CRY-344 ruling #3
// (2026-07-20); expand with full terms during a future legal review.
export default function TermsPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Terms of Use</h1>
      <p className="text-sm text-neutral-500">Last updated: July 20, 2026</p>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">
          Intellectual Property
        </h2>
        <p>
          All original content, designs, and intellectual property on this
          site are the property of Cryptic Design LLC and are protected by
          applicable law. The rights of respective owners for contracted
          works are acknowledged and respected. Unauthorized use or
          reproduction is strictly prohibited.
        </p>
      </section>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">Use of This Site</h2>
        <p>
          This site presents Cryptic Design entertainment experiences,
          professional services, and original releases. Some features shown
          are previews of capabilities still in development and are labeled
          accordingly; they do not represent live services.
        </p>
      </section>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">Contact</h2>
        <p>
          Questions about these terms:{" "}
          <a
            className="underline hover:text-white"
            href="mailto:robert.croft@crypticdesign.net"
          >
            robert.croft@crypticdesign.net
          </a>
        </p>
      </section>
    </main>
  );
}
