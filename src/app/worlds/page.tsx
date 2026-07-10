import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Worlds",
  description: "Cryptic Design worlds and their connected works and releases.",
  alternates: { canonical: "/worlds" },
};

export default function WorldsPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Worlds</h1>
      <p className="max-w-2xl text-neutral-400">
        Worlds connect original works, releases, and future member experiences.
        The first rights-safe world entries arrive with the V1 object model.
      </p>
    </main>
  );
}
