import type { Metadata } from "next";
import Link from "next/link";

import CommunityDestinationHero from "@/components/CommunityDestinationHero";

export const metadata: Metadata = {
  title: "Community Events",
  description: "The governed destination for future scheduled participation across CrypticDesign.net.",
  alternates: { canonical: "/community/events" },
};

const eventForms = ["Community events", "Game sessions", "Campaign sessions", "Performances", "Tournaments", "Workshops", "Franchise events"];

export default function CommunityEventsPage() {
  return (
    <main className="community-destination">
      <CommunityDestinationHero eyebrow="Community / Events" title="Scheduled participation, clearly governed." body="Events will bring together discoverable sessions and gatherings while keeping registration, attendance, moderation, and access rules explicit." icon="events" status="No community events are currently published" image="/images/entertainment-feature.png" />
      <div className="shell community-destination__stack">
        <section aria-labelledby="event-forms-title">
          <div className="public-home-portal__section-label"><h2 id="event-forms-title">Future event coverage</h2><span>No live calendar connected</span></div>
          <div className="community-event-types">{eventForms.map((event) => <span key={event}>{event}</span>)}</div>
        </section>
        <section className="community-empty-state community-empty-state--events" aria-labelledby="events-empty-title">
          <span className="kicker">Intentional empty state</span><h2 id="events-empty-title">There are no approved upcoming events to display.</h2><p>No event records, dates, hosts, attendance counts, or registration actions have been invented. When governed event data exists, this page will become its discoverable calendar and entry surface.</p>
          <Link href="/entertainment" className="button secondary">Explore public releases</Link>
        </section>
      </div>
    </main>
  );
}
