import type { Metadata } from "next";
import ProfessionalInquiryForm from "@/components/ProfessionalInquiryForm";

export const metadata: Metadata = { title: "Start a Project", description: "Start a professional services conversation with Cryptic Design about product strategy, UX, interface systems, or creative technology.", alternates: { canonical: "/professional/inquiry" }, openGraph: { title: "Start a Project with Cryptic Design", description: "Tell us what you are building, where the friction is, and what decision needs to become clearer.", url: "/professional/inquiry", images: ["/share/professional.png"] }, twitter: { card: "summary_large_image", images: ["/share/professional.png"] }, robots: { index: true, follow: true } };

export default function ProfessionalInquiryPage() {
  return (
    <main className="shell page-stack">
      <header className="grid gap-6 border-b border-[var(--border)] pb-10 pt-6 lg:grid-cols-[1fr_.7fr] lg:items-end">
        <div><span className="kicker !text-[var(--cry-accent-magenta)]">Professional inquiry</span><h1 className="display-title !text-[clamp(2.5rem,7vw,5.5rem)]">Start with the problem.</h1></div>
        <p className="m-0 text-lg leading-relaxed text-[var(--muted)]">Tell us what you are building, where the friction is, and what decision needs to become clearer.</p>
      </header>
      <section className="grid gap-8 lg:grid-cols-[1fr_.55fr]">
        <div className="panel p-6 sm:p-8"><ProfessionalInquiryForm /></div>
        <aside className="flex flex-col gap-6">
          <div className="panel p-6"><span className="kicker !text-[var(--cry-accent-cyan)]">What helps</span><h2 className="mt-2 text-xl font-semibold">Useful context for a first conversation</h2><ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-relaxed text-[var(--muted)]"><li>The product, audience, and current stage.</li><li>The decision or workflow creating friction.</li><li>Important technical, schedule, or organizational constraints.</li><li>What a useful outcome would look like.</li></ul></div>
          <div className="border-l-2 border-[var(--cry-accent-magenta)] px-6 py-3"><h2 className="text-base font-semibold">What happens next</h2><p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">Your email application opens with a structured draft. After you send it, Cryptic Design can respond with fit, questions, and a recommended next step.</p></div>
        </aside>
      </section>
    </main>
  );
}
