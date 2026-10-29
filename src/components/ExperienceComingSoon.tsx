import Link from "next/link";

import type { ExperienceAccessDecision } from "@/lib/experience-access";

export default function ExperienceComingSoon({
  title,
  summary,
  access,
  authenticated,
  headingLevel = "h2",
}: {
  title: string;
  summary: string;
  access: ExperienceAccessDecision;
  authenticated: boolean;
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
            {authenticated
              ? "Your account is signed in, but it does not currently have access to this unfinished build. Public browsing and released media remain available."
              : "Public browsing and released media remain available. Sign in to check whether your account has development access; unfinished builds require separate authorization."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="button secondary" href={authenticated ? "/account" : "/account/sign-in"}>
              {authenticated ? "Open account" : "Sign in"}
            </Link>
            <Link className="button secondary" href="/entertainment#public-releases">Browse public releases</Link>
          </div>
        </>
      )}
    </section>
  );
}
