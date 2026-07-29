import type { Metadata } from "next";
import EntertainmentDestinationPage from "@/components/EntertainmentDestinationPage";
import { publicReleases } from "@/lib/releases";
export const metadata: Metadata = { title: "Arcade", alternates: { canonical: "/entertainment/arcade" }, description: "Playable Cryptic Design releases and prototypes." };
export default function ArcadePage() { return <EntertainmentDestinationPage eyebrow="Play" title="Arcade" description="Playable experiences, interactive releases, and experimental systems." releases={publicReleases().filter((r) => r.kind === "game")} emptyMessage="The first playable release is coming soon." />; }
