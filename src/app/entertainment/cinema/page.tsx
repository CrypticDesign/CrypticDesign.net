import type { Metadata } from "next";
import MediaMvpPage from "@/components/MediaMvpPage";
import { VIDEO_ENTRIES, mediaEntriesFor } from "@/lib/media-catalog";
import { videoCategory } from "@/lib/entertainment-navigation";
import { socialMetadata } from "@/lib/social-metadata";

const description = "Narrative video, transmissions, trailers, production stories, and visualizers from Cryptic Design.";

export const metadata: Metadata = {
  title: "Video",
  description,
  alternates: { canonical: "/entertainment/cinema" },
  ...socialMetadata({
    title: "Video | Cryptic Design",
    description,
    url: "/entertainment/cinema",
    image: "/share.png",
  }),
};
export default async function VideoPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) { const selected=videoCategory((await searchParams).filter)??videoCategory("all")!; return <MediaMvpPage kind="Video" selectedLabel={selected.label} rootView={selected.slug==="all"} entries={VIDEO_ENTRIES} filtered={mediaEntriesFor(VIDEO_ENTRIES,selected.slug)} />; }
