import assert from "node:assert/strict";
import test from "node:test";

import { PROVISIONAL_JOURNEY_ERAS_V1, projectCharacterJourney, timeLivedLabel, type JourneyChapter } from "./character-journey.ts";

const chapters: JourneyChapter[] = [
  { id: "active", title: "Signals Across Worlds", summary: "Current journey", startedAt: "2026-07-14T00:00:00Z", completedAt: null },
  { id: "recent", title: "First Shared System", summary: "Completed journey", startedAt: "2026-07-13T00:00:00Z", completedAt: "2026-07-13T12:00:00Z" },
];

test("presents verified Time as human-readable days without exposing levels or points", () => {
  const presentation = projectCharacterJourney({ totalTimeMinutes: 142 * 1_440, definitionVersion: 1, definitions: PROVISIONAL_JOURNEY_ERAS_V1, chapters, milestones: [] });
  assert.equal(presentation.timeLivedLabel, "142 Days Lived");
  assert.equal(presentation.eraTitle, "Convergence");
  assert.equal(presentation.nextEraLabel, "Continuum");
  assert.equal("level" in presentation, false);
  assert.equal("points" in presentation, false);
  assert.equal("totalTimeMinutes" in presentation, false);
});

test("uses exact versioned era boundaries", () => {
  const before = projectCharacterJourney({ totalTimeMinutes: 1_439, definitionVersion: 1, definitions: PROVISIONAL_JOURNEY_ERAS_V1, chapters: [], milestones: [] });
  const at = projectCharacterJourney({ totalTimeMinutes: 1_440, definitionVersion: 1, definitions: PROVISIONAL_JOURNEY_ERAS_V1, chapters: [], milestones: [] });
  assert.equal(before.era, "origin");
  assert.equal(before.progressPercent, 99);
  assert.equal(at.era, "awakening");
  assert.equal(at.progressPercent, 0);
});

test("returns named chapters after Legacy without prestige or higher ranks", () => {
  const presentation = projectCharacterJourney({ totalTimeMinutes: 2_000_000, definitionVersion: 1, definitions: PROVISIONAL_JOURNEY_ERAS_V1, chapters, milestones: [] });
  assert.equal(presentation.era, "legacy");
  assert.equal(presentation.nextEraLabel, null);
  assert.equal(presentation.progressPercent, null);
  assert.equal(presentation.activeChapter?.title, "Signals Across Worlds");
  assert.equal(presentation.recentChapters[0].title, "First Shared System");
});

test("formats the first day without displaying a zero-day counter", () => {
  assert.equal(timeLivedLabel(0), "First Day");
  assert.equal(timeLivedLabel(1_440), "1 Day Lived");
  assert.throws(() => timeLivedLabel(-1), /non-negative/);
});

test("rejects malformed or reordered era definitions", () => {
  const reordered = [...PROVISIONAL_JOURNEY_ERAS_V1];
  [reordered[0], reordered[1]] = [reordered[1], reordered[0]];
  assert.throws(() => projectCharacterJourney({ totalTimeMinutes: 0, definitionVersion: 1, definitions: reordered, chapters: [], milestones: [] }), /approved order/);
});
