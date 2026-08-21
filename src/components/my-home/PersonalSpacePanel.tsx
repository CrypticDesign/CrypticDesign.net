"use client";

import dynamic from "next/dynamic";
import type { AvatarRecipe } from "@/lib/avatar";

const AvatarStudio = dynamic(() => import("@/components/AvatarStudio"), {
  ssr: false,
  loading: () => <div className="personal-space-panel__loading" aria-live="polite">Loading Character view...</div>,
});

export type PersonalSpaceRuntimeStatus = "loading" | "ready" | "unavailable" | "error";

type CharacterRuntimeInput = {
  label: string;
  recipe: AvatarRecipe;
};

export default function PersonalSpacePanel({ status, character }: { status: PersonalSpaceRuntimeStatus; character: CharacterRuntimeInput | null }) {
  const characterReady = status === "ready" && character;

  return (
    <div className="personal-space-panel" aria-label="Embedded Personal Space preview" data-runtime-status={status}>
      {characterReady ? (
        <div className="personal-space-panel__runtime">
          <AvatarStudio recipe={character.recipe} label={character.label} />
        </div>
      ) : (
        <div className="personal-space-panel__empty" aria-hidden="true"><span /><span /><span /></div>
      )}
      <aside className="personal-space-panel__status" aria-live="polite">
        <span className="kicker !text-[#ffd400]">Interim Home runtime</span>
        <h2>{characterReady ? "Character view active" : status === "loading" ? "Loading Character view" : "Character required"}</h2>
        <p>{characterReady
          ? "This embedded Three.js Character instance temporarily holds the place of the future personal Home environment. Drag the Character to rotate."
          : "Sign in and create a Character to load the interim Three.js view. A purpose-built personal Home environment remains future work."}</p>
        <strong><i aria-hidden="true" /> {characterReady ? "Live Three.js instance" : "Web dashboard active"}</strong>
      </aside>
    </div>
  );
}
