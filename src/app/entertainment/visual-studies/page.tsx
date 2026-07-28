import type { Metadata } from "next";
import ReleaseIndex from "@/components/ReleaseIndex";
import { publicReleases } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Visual Studies & Experiments",
  description: "Rights-safe visual studies, experiments, and process work from Cryptic Design — an Entertainment-owned space for imagery, research, and creative technology.",
  alternates: { canonical: "/entertainment/visual-studies" }, openGraph: { images: ["/share/visual-studies.png"] }, twitter: { card: "summary_large_image", images: ["/share/visual-studies.png"] }, 
};

export default function VisualStudiesPage() {
  return (
    <ReleaseIndex
      title="Visual Studies & Experiments"
      description="Curated, rights-safe visual studies, experiments, and process work. Final imagery, copy, and rights clearance are completed separately."
      releases={publicReleases().filter((release) => release.kind === "lab")}
    />
  );
}
