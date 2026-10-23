import type { ReactNode } from "react";

import ExperienceRuntime from "@/components/ExperienceRuntime";
import type { PageSceneId, PageSceneQuality } from "@/lib/page-scene";
import styles from "./RootPageHero.module.css";

type RootPageHeroProps = {
  sceneId: PageSceneId;
  fallbackPoster: string;
  accent: "blue" | "cyan" | "indigo" | "violet";
  labelledBy: string;
  accessibleLabel: string;
  children: ReactNode;
  status?: ReactNode;
  className?: string;
  contentClassName?: string;
  quality?: PageSceneQuality;
};

/** Shared geometry and runtime for the four public platform entry points. */
export default function RootPageHero({
  sceneId,
  fallbackPoster,
  accent,
  labelledBy,
  accessibleLabel,
  children,
  status,
  className = "",
  contentClassName = "",
  quality = "auto",
}: RootPageHeroProps) {
  return (
    <section
      className={["visual-hero", "root-page-hero", styles.hero, className].filter(Boolean).join(" ")}
      data-root-hero={sceneId}
      data-section-accent={accent}
      aria-labelledby={labelledBy}
    >
      <ExperienceRuntime
        runtimeId={`cryptic-design:${sceneId}:v1`}
        sceneId={sceneId}
        fallbackPoster={fallbackPoster}
        accessibleLabel={accessibleLabel}
        launchMode="fullscreen"
        quality={quality}
      />
      <div className={["visual-hero__wash", styles.wash].join(" ")} aria-hidden="true" />
      <div className={styles.layout} data-has-status={status ? "true" : "false"}>
        <div
          className={["visual-hero__content", styles.content, contentClassName].filter(Boolean).join(" ")}
          data-hero-copy
        >
          {children}
        </div>
        {status ? <div className={styles.status} data-hero-status>{status}</div> : null}
      </div>
    </section>
  );
}
