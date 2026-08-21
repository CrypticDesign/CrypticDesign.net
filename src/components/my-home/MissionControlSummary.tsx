import Link from "next/link";

export interface MissionControlPresentation {
  activeMission: string;
  currentObjective: string;
  progressLabel: string | null;
  progressPercent: number | null;
  nextAction: { label: string; href: string } | null;
  recentOutcome: string | null;
  historySummary: string | null;
}

export default function MissionControlSummary({ mission }: { mission: MissionControlPresentation | null }) {
  return (
    <article className="my-home-module my-home-mission" aria-labelledby="mission-control-title">
      <span className="kicker">Sitewide coordination</span>
      <h2 id="mission-control-title">Mission Control</h2>
      {mission ? (
        <>
          <p className="my-home-mission__name">{mission.activeMission}</p>
          <p>{mission.currentObjective}</p>
          {mission.progressPercent !== null ? <div className="my-home-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={mission.progressPercent} aria-label={mission.progressLabel ?? "Mission progress"}><span style={{ width: `${Math.min(100, Math.max(0, mission.progressPercent))}%` }} /></div> : null}
          {mission.progressLabel ? <p className="my-home-boundary-note">{mission.progressLabel}</p> : null}
          {mission.recentOutcome ? <p><strong>Recent outcome:</strong> {mission.recentOutcome}</p> : null}
          {mission.historySummary ? <p>{mission.historySummary}</p> : null}
          {mission.nextAction ? <Link href={mission.nextAction.href} className="button">{mission.nextAction.label}</Link> : null}
        </>
      ) : (
        <div className="my-home-empty">
          <h3>No active mission data is connected.</h3>
          <p>This presentation boundary is ready for the future governed, sitewide Mission Control service. It does not create missions, scores, rewards, or persistent state.</p>
        </div>
      )}
    </article>
  );
}
