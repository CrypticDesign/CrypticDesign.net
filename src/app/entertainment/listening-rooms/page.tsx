import type { Metadata } from "next";
import EntertainmentDestinationPage from "@/components/EntertainmentDestinationPage";
import { publicReleases } from "@/lib/releases";
export const metadata: Metadata = { title: "Listening Rooms", alternates: { canonical: "/entertainment/listening-rooms" }, description: "Original scores, themes, and soundscapes." };
export default function ListeningRoomsPage() { return <EntertainmentDestinationPage eyebrow="Listen" title="Listening Rooms" description="Curated rooms for albums, episodes, performances, and focused listening through the shared player." releases={publicReleases().filter((r) => r.kind === "audio")} emptyMessage="The first listening session is coming soon." secondaryLink={{ href: "/audio", label: "Open Cryptic Signal" }} />; }
