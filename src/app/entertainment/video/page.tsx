import type { Metadata } from "next";
import VideoDestination from "@/components/VideoDestination";
import { VIDEO_ENTRIES, mediaEntriesFor } from "@/lib/media-catalog";
import { videoCategory } from "@/lib/entertainment-navigation";
import { socialMetadata } from "@/lib/social-metadata";

const description = "Films, trailers, transmissions, production stories, and visual experiences from Cryptic Design, with clear public availability.";

export const metadata: Metadata = {
  title: "Video",
  description,
  alternates: { canonical: "/entertainment/video" },
  ...socialMetadata({ title: "Video | Cryptic Design", description, url: "/entertainment/video", image: "/share/entertainment.png" }),
};

export default async function VideoPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const selected = videoCategory((await searchParams).filter) ?? videoCategory("all")!;
  return <VideoDestination selectedLabel={selected.label} rootView={selected.slug === "all"} entries={mediaEntriesFor(VIDEO_ENTRIES, selected.slug)} />;
}
