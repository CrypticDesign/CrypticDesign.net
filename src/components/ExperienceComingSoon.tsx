import Link from "next/link";

import type { ExperienceAccessDecision } from "@/lib/experience-access";

export default function ExperienceComingSoon({
  title,
  summary,
  access,
  headingLevel = "h2",
}: {
  title: string;
  summary: string;
  access: ExperienceAccessDecision;
  headingLevel?: "h1" | "h2";
}) {
  const unlocked = access.state === "DEVELOPMENT_UNLOCKED";
  const Heading = headingLevel;

  return (
    <section className="panel mx-auto my-8 max-w-4xl p-6 sm:p-8" aria-labelledby="experience-availability-title">
      <span className="kicker">{unlocked ? "Development access" : "Coming soon"}</span>
      <Heading id="experience-availability-title" className={headingLevel === "h1" ? "display-title mt-2" : "section-title mt-2"}>
        {unlocked ? `${title} development access is unlocked.` : `${title} is still in development.`}
      </Heading>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {unlocked
          ? "Your account is authorized for development experiences. No browser build is connected to this page yet."
          : summary}
      </p>
      {!unlocked && (
        <>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Public browsing and released media remain available. Signing in does not by itself unlock unfinished builds; development execution requires separate authorization.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="button secondary" href="/account/sign-in">Sign in</Link>
            <Link className="button secondary" href="/releases">Browse public releases</Link>
          </div>
        </>
      )}
    </section>
  );
}
