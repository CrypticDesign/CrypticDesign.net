import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Professional",
  alternates: { canonical: "/professional" },
  description:
    "Cryptic Design's professional practice — holistic UX, game UX, and creative technology, from strategy to craft.",
};

const CAPABILITIES = [
  {
    title: "Holistic UX",
    body: "User experience designed as a whole system — research, strategy, interaction, and craft treated as one continuous discipline.",
  },
  {
    title: "Game UX",
    body: "Interface, onboarding, and systems design for games — grounded in two decades across major studios and live products.",
  },
  {
    title: "Creative Technology",
    body: "Where science, art, and technology meet: real-time pipelines, generative tools, and new forms of interactive media.",
  },
] as const;

export default function ProfessionalHub() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">
          The studio side.
        </h1>
        <p className="max-w-xl text-neutral-400">
          Cryptic Design is a UX and creative technology studio in Austin, TX.
          The same platform that publishes our original work carries our
          professional practice.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {CAPABILITIES.map((cap) => (
          <div
            key={cap.title}
            className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-950 p-5"
          >
            <h2 className="font-medium text-neutral-100">{cap.title}</h2>
            <p className="text-sm text-neutral-400">{cap.body}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Start a conversation</h2>
        <p className="max-w-xl text-sm text-neutral-400">
          Case studies and a full inquiry workflow are on the way. Until then,
          reach the studio directly.
        </p>
        <div>
          <a
            href="mailto:robertkcroft@outlook.com?subject=Project%20inquiry%20via%20CrypticDesign.net"
            className="inline-block rounded bg-accent-blue px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Email the studio
          </a>
        </div>
      </section>
    </main>
  );
}
