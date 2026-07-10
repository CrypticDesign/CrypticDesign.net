import type { Metadata } from "next";
import ProfessionalInquiryForm from "@/components/ProfessionalInquiryForm";

export const metadata: Metadata = {
  title: "Professional Inquiry",
  description: "Start a professional services inquiry with Cryptic Design.",
  alternates: { canonical: "/professional/inquiry" },
};

export default function ProfessionalInquiryPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Start an inquiry</h1>
        <p className="max-w-2xl text-neutral-400">Tell Cryptic Design what you are working on. This V1 route records a local review-queue placeholder only.</p>
      </header>
      <ProfessionalInquiryForm />
    </main>
  );
}
