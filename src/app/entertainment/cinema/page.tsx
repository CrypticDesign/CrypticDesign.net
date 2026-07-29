import type { Metadata } from "next";
import EntertainmentDestinationPage from "@/components/EntertainmentDestinationPage";
import { publicReleases } from "@/lib/releases";
export const metadata: Metadata = { title: "Cinema", alternates: { canonical: "/entertainment/cinema" }, description: "Video, episodes, and cinematics from Cryptic Design." };
export default function CinemaPage() { return <EntertainmentDestinationPage eyebrow="Watch" title="Cinema" description="Films, visual narratives, trailers, and moving-image work, beginning with the Singularis Overture." releases={publicReleases().filter((r) => r.kind === "video")} emptyMessage="The first screening is coming soon." />; }
