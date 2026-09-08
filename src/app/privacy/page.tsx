import type { Metadata } from "next";
import { AnalyticsPreferencesButton } from "@/components/AnalyticsProvider";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
  openGraph: { images: ["/share/privacy.png"] },
  twitter: { card: "summary_large_image", images: ["/share/privacy.png"] },
  description: "How Cryptic Design handles information, aggregate analytics, and the choices available to visitors.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Privacy Policy</h1>
      <p className="text-sm text-neutral-500">Last updated: September 8, 2026</p>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">Introduction</h2>
        <p>This policy describes how Cryptic Design handles information when you browse CrypticDesign.net, contact us, request future access, or use public experiences.</p>
      </section>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">Information you provide</h2>
        <p>When you contact Cryptic Design directly, the information you choose to provide may include your name, email address, organization, project details, or message.</p>
        <p>The current Request Access form prepares an email in your own email application. The site does not submit or store those form fields. You review and send the email yourself, and your email provider then handles it under its own terms.</p>
      </section>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">Aggregate website measurement</h2>
        <p>With your permission, Cryptic Design uses Google Analytics 4 (GA4) to understand aggregate website and public-product activity. This helps us assess which public routes and releases are useful, whether visitors intentionally activate an experience, how people enter Community or Request Access, and which approved external destinations are used.</p>
        <p>Measurement may include a sanitized page path, broad browser or device information processed by Google, referral source, non-personal campaign attribution, and the bounded public interaction events described above. Arbitrary URL query strings are not used as page identifiers.</p>
        <p>Cryptic Design does not intentionally send names, email addresses, account or member IDs, Character IDs, Request Access form contents, invitation or authentication tokens, payment or order details, or private member state to GA4.</p>
        <p>GA4 is provided by Google. Google may process technical information, including IP-address and device/network information, according to its own privacy terms. See <a className="underline hover:text-white" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.</p>
      </section>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">Your analytics preference</h2>
        <p>GA4 does not load until you choose “Allow analytics.” If you decline, analytics collection remains off. The site stores only your analytics choice in this browser so it can honor that preference.</p>
        <p>You can change or revoke that choice at any time with the Analytics preferences control in the site footer. Revoking consent disables further GA4 collection in this browser; it does not retroactively delete aggregate events already sent.</p>
        <AnalyticsPreferencesButton className="button secondary w-fit" />
      </section>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">How we use information</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Respond to inquiries and access requests you send.</li>
          <li>Provide and improve public pages, releases, and experiences.</li>
          <li>Understand aggregate acquisition and public feature use when analytics is allowed.</li>
          <li>Protect the site, investigate problems, and meet applicable operational or legal obligations.</li>
        </ul>
        <p>Cryptic Design does not use this GA4 implementation for advertising audiences, remarketing, cross-site profiling, heatmaps, mouse tracking, or session replay.</p>
      </section>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">Your choices</h2>
        <p>You may request access to, correction of, or deletion of information you sent directly to Cryptic Design by contacting <a className="underline hover:text-white" href="mailto:robert.croft@crypticdesign.net">robert.croft@crypticdesign.net</a>. Whether and how a request applies can depend on the information and applicable law.</p>
        <p>You may also use browser controls to remove stored site data or limit cookies. Removing local site data may reset your remembered analytics preference.</p>
      </section>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">Third-party links and services</h2>
        <p>Public pages may link to third-party sites and services. Their privacy practices are governed by their own policies.</p>
      </section>

      <section className="flex flex-col gap-3 text-neutral-400">
        <h2 className="text-xl font-semibold text-white">Policy updates</h2>
        <p>We may update this policy when the site or its providers change. The date on this page identifies the current version.</p>
      </section>
    </main>
  );
}
