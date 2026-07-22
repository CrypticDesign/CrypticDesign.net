import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
  description:
    "How Cryptic Design collects, uses, and protects your personal data.",
};

// Carried over from the legacy crypticdesign.net privacy policy per CRY-344
// ruling #3 (2026-07-20). Review analytics-tool references during editorial QA.
export default function PrivacyPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Privacy Policy</h1>
      <p className="text-sm text-neutral-500">Last updated: July 20, 2026</p>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">Introduction</h2>
        <p>
          Welcome to Cryptic Design. Your privacy is important to us. This
          Privacy Policy explains how we collect, use, and protect your
          personal data when you visit our website, interact with our
          services, or engage with us through inquiry forms, analytics, and
          marketing channels.
        </p>
      </section>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">
          Information We Collect
        </h2>
        <h3 className="text-lg font-medium text-white">
          Information you provide to us
        </h3>
        <p>We collect personal data when you:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            Fill out a contact or inquiry form (on this site or connected
            platforms such as LinkedIn)
          </li>
          <li>Subscribe to our mailing list or newsletter</li>
          <li>
            Engage with us through social media or direct communication
          </li>
        </ul>
        <p>
          This may include your name, email address, company or project name,
          and message or inquiry details.
        </p>
        <h3 className="text-lg font-medium text-white">
          Automatically collected information
        </h3>
        <p>
          When you visit our website, analytics tools may collect your IP
          address and device information, browsing behavior on our website
          (pages visited, time spent, interactions), and referral sources
          such as search engines, social media, or direct links.
        </p>
        <h3 className="text-lg font-medium text-white">
          Information from third parties
        </h3>
        <p>
          If you interact with third-party services (for example, LinkedIn
          lead forms or email marketing platforms), we may receive data from
          those platforms in accordance with their privacy policies.
        </p>
      </section>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">
          How We Use Your Information
        </h2>
        <p>We collect and process your data to:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            Respond to inquiries and provide services related to UX design,
            game development, and digital innovation
          </li>
          <li>
            Send updates, newsletters, and marketing emails (only if you
            opt in)
          </li>
          <li>
            Improve our website, services, and customer experience through
            analytics
          </li>
          <li>
            Personalize user interactions based on browsing behavior and
            preferences
          </li>
          <li>Ensure compliance with legal and security requirements</li>
        </ul>
        <p className="font-medium text-neutral-300">
          We do not sell or share your data with third parties for
          advertising purposes.
        </p>
      </section>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">
          How We Protect Your Data
        </h2>
        <p>
          We implement security measures to prevent unauthorized access,
          disclosure, or misuse of your information. We use secure data
          storage and encryption protocols where applicable, and access to
          personal data is restricted to authorized personnel only.
        </p>
      </section>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">
          Your Rights &amp; Choices
        </h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            Opt out of marketing emails — every email contains an
            unsubscribe link
          </li>
          <li>
            Request access, modification, or deletion of your data by
            contacting{" "}
            <a
              className="underline hover:text-white"
              href="mailto:robert.croft@crypticdesign.net"
            >
              robert.croft@crypticdesign.net
            </a>
          </li>
          <li>
            Disable cookies and tracking by adjusting your browser settings
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">
          Third-Party Links &amp; Services
        </h2>
        <p>
          Our website may contain links to third-party sites. We are not
          responsible for their privacy practices — please review their
          policies separately.
        </p>
      </section>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">
          Updates to This Policy
        </h2>
        <p>
          We may update this Privacy Policy as needed to reflect changes in
          our services or legal requirements. Updates will be posted on this
          page, with the effective date revised accordingly.
        </p>
      </section>
    </main>
  );
}
