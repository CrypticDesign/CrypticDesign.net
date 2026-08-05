import type { Metadata } from "next";
import MediaMvpPage from "@/components/MediaMvpPage";
import { VIDEO_ENTRIES, mediaEntriesFor } from "@/lib/media-catalog";
import { videoCategory } from "@/lib/entertainment-navigation";
export const metadata: Metadata = { title:"Video",alternates:{canonical:"/entertainment/cinema"},description:"Narrative video, transmissions, trailers, production stories, and visualizers from Cryptic Design." };
export default async function VideoPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) { const selected=videoCategory((await searchParams).filter)??videoCategory("all")!; return <MediaMvpPage kind="Video" selectedLabel={selected.label} rootView={selected.slug==="all"} entries={VIDEO_ENTRIES} filtered={mediaEntriesFor(VIDEO_ENTRIES,selected.slug)} />; }
