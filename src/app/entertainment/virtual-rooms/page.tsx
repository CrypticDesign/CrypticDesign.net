import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Virtual Rooms",
  alternates: { canonical: "/entertainment/virtual-rooms" },
  description: "Lightweight shared spaces wrapped around selected releases.",
};

export default function VirtualRoomsPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Virtual Rooms</h1>
        <p className="max-w-xl text-muted-foreground">
          Lightweight web rooms that wrap selected releases — a media surface,
          character presence, and a participant count. Desktop gets a light 3D
          treatment; mobile gets a simplified view.
        </p>
      </header>
      <p className="rounded-card border border-dashed border-border p-8 text-sm text-muted-foreground">
        The first room opens around a Singularis release. Rooms require the
        account and character foundation, so this surface is a preview shell.
      </p>
      <Link href="/entertainment" className="text-sm text-accent-cyan hover:underline">← Entertainment Channel</Link>
    </main>
  );
}
