import type { Metadata } from "next";
import MediaMvpPage from "@/components/MediaMvpPage";
import { MUSIC_ENTRIES, mediaEntriesFor } from "@/lib/media-catalog";
import { musicCategory } from "@/lib/entertainment-navigation";
export const metadata: Metadata = { title:"Music",alternates:{canonical:"/audio"},description:"Songs, scores, soundscapes, collections, and listening experiences from Cryptic Design." };
export default async function MusicPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) { const selected=musicCategory((await searchParams).filter)??musicCategory("all")!; return <MediaMvpPage kind="Music" selectedLabel={selected.label} rootView={selected.slug==="all"} entries={MUSIC_ENTRIES} filtered={mediaEntriesFor(MUSIC_ENTRIES,selected.slug)} />; }
