import type { Metadata } from "next";
import ReleaseIndex from "@/components/ReleaseIndex";
import { publicReleases } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Releases",
  description: "Published and scheduled Cryptic Design releases.",
  alternates: { canonical: "/releases" },
};

export default function ReleasesPage() {
  return (
    <ReleaseIndex
      title="Releases"
      description="Governed drops, versions, and experiences from across the Cryptic Design platform."
      releases={publicReleases()}
    />
  );
}
