import type { Metadata } from "next";
import ReleaseIndex from "@/components/ReleaseIndex";
import { publicReleases } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Creative Works",
  description: "Original works and their published release context.",
  alternates: { canonical: "/creative-works" },
};

export default function CreativeWorksPage() {
  return (
    <ReleaseIndex
      title="Creative Works"
      description="Original work in progress and published form. Dedicated Work pages arrive with the V1 object model."
      releases={publicReleases()}
    />
  );
}
