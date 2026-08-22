import type { Metadata } from "next";
import Link from "next/link";

import CommunityDestinationHero from "@/components/CommunityDestinationHero";

export const metadata: Metadata = {
  title: "Community Groups",
  description: "Discover the governed group architecture planned for CrypticDesign.net participation.",
  alternates: { canonical: "/community/groups" },
};

const groupForms = [
  ["Communities & clubs", "Shared-interest groups with explicit membership."],
  ["Teams & squadrons", "Participation groups for games, sessions, and coordinated work."],
  ["Creator collectives", "Groups organized around approved projects, media, and collaboration."],
  ["Campaign groups", "Scoped participation for future governed campaign experiences."],
];

export default function CommunityGroupsPage() {
  return (
    <main className="community-destination">
      <CommunityDestinationHero eyebrow="Community / Groups" title="Groups with governed membership." body="Groups will provide reusable participation structures without turning social connections into membership, roles, permissions, or access rights." icon="crew" status="Group discovery is not available yet" />
      <div className="shell community-destination__stack">
        <section aria-labelledby="group-forms-title">
          <div className="public-home-portal__section-label"><h2 id="group-forms-title">Supported group forms</h2><span>Architecture ready</span></div>
          <div className="community-architecture-grid">
            {groupForms.map(([title, body]) => <article key={title} className="community-architecture-card"><span className="community-capability__state">Planned object</span><h3>{title}</h3><p>{body}</p></article>)}
          </div>
        </section>
        <section className="community-empty-state" aria-labelledby="groups-empty-title">
          <span className="kicker">Intentional empty state</span><h2 id="groups-empty-title">No discoverable groups are published.</h2><p>The platform does not yet have approved group records, membership workflows, role governance, or scoped permissions. This destination will remain read-only until those systems exist.</p>
          <dl><div><dt>Connection</dt><dd>Member relationship</dd></div><div><dt>Membership</dt><dd>Explicit group state</dd></div><div><dt>Role</dt><dd>Group responsibility</dd></div><div><dt>Permission</dt><dd>Scoped authority</dd></div></dl>
          <Link href="/community" className="button secondary">Return to Community Explore</Link>
        </section>
      </div>
    </main>
  );
}
