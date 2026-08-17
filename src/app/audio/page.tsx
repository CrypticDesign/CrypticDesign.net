import type { Metadata } from "next";
import MediaMvpPage from "@/components/MediaMvpPage";
import { MUSIC_ENTRIES, mediaEntriesFor } from "@/lib/media-catalog";
import { musicCategory } from "@/lib/entertainment-navigation";
export const metadata: Metadata = {
  title: "Music",
  description:
    "Explore Cryptic Signal songs, scores, themes, soundscapes, collections, and listening experiences from across original Cryptic Design worlds and releases.",
  alternates: { canonical: "/audio" },
  openGraph: { images: ["/share/audio.png"] },
  twitter: { card: "summary_large_image", images: ["/share/audio.png"] },
};
export default async function MusicPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) { const selected=musicCategory((await searchParams).filter)??musicCategory("all")!; return <MediaMvpPage kind="Music" selectedLabel={selected.label} rootView={selected.slug==="all"} entries={MUSIC_ENTRIES} filtered={mediaEntriesFor(MUSIC_ENTRIES,selected.slug)} />; }
