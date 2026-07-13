import type { Metadata } from "next";
import CreatorAccessRequestForm from "@/components/CreatorAccessRequestForm";

export const metadata: Metadata = {
  title: "Creator Access Request",
  description: "Request review-based creator or collaborator access.",
  alternates: { canonical: "/creator-tools/request" },
};

export default function CreatorAccessRequestPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">
          Creator access request
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Tell us who you are and what you&apos;d like to make or collaborate
          on. This preview saves your application in this browser; nothing is
          published, shared, or sent automatically.
        </p>
      </header>
      <CreatorAccessRequestForm />
    </main>
  );
}
