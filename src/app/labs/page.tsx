import type { Metadata } from "next";
import ReleaseIndex from "@/components/ReleaseIndex";
import { publicReleases } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Labs",
  description: "Rights-safe experiments, studies, and prototypes.",
  alternates: { canonical: "/labs" },
};

export default function LabsPage() {
  return (
    <ReleaseIndex
      title="Labs"
      description="Curated experiments, research, and Visual Studies."
      releases={publicReleases().filter((release) => release.kind === "lab")}
    />
  );
}
