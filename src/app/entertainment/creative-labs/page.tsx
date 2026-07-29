import type { Metadata } from "next";
import EntertainmentDestinationPage from "@/components/EntertainmentDestinationPage";
import { publicReleases } from "@/lib/releases";
export const metadata: Metadata = { title: "Creative Labs", alternates: { canonical: "/entertainment/creative-labs" }, description: "Visual Studies and experiments from Cryptic Design's Creative Labs." };
export default function CreativeLabsPage() { return <EntertainmentDestinationPage eyebrow="Create" title="Creative Labs" description="Experiments, prototypes, tools, research, and selected works in progress from Cryptic Design." releases={publicReleases().filter((r) => r.kind === "lab")} emptyMessage="The first study is being prepared for release." secondaryLink={{ href: "/entertainment/visual-studies", label: "View Visual Studies" }} />; }
