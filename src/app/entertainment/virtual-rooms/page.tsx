import type { Metadata } from "next";
import EntertainmentDestinationPage from "@/components/EntertainmentDestinationPage";
export const metadata: Metadata = { title: "Virtual Rooms", alternates: { canonical: "/entertainment/virtual-rooms" }, description: "Lightweight shared spaces wrapped around selected releases." };
export default function VirtualRoomsPage() { return <EntertainmentDestinationPage eyebrow="Explore" title="Virtual Rooms" description="Immersive spaces, live gatherings, and persistent digital environments built around releases and creative worlds." releases={[]} emptyMessage="The first room will open around a Singularis release. Shared-room features are coming later." />; }
