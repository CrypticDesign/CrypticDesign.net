export const JOURNEY_ERAS = ["origin", "awakening", "emergence", "connection", "convergence", "continuum", "legacy"] as const;
export type JourneyEra = (typeof JOURNEY_ERAS)[number];

export interface JourneyEraDefinition {
  id: JourneyEra;
  title: string;
  startsAtMinutes: number;
}

export interface JourneyChapter {
  id: string;
  title: string;
  summary: string;
  startedAt: string;
  completedAt: string | null;
}

export interface JourneyMilestone {
  id: string;
  title: string;
  occurredAt: string;
}

export interface CharacterJourneyPresentation {
  definitionVersion: number;
  era: JourneyEra;
  eraTitle: string;
  timeLivedLabel: string;
  activeChapter: JourneyChapter | null;
  nextEraLabel: string | null;
  progressPercent: number | null;
  milestones: JourneyMilestone[];
  recentChapters: JourneyChapter[];
}

export const PROVISIONAL_JOURNEY_ERAS_V1: JourneyEraDefinition[] = [
  { id: "origin", title: "Origin", startsAtMinutes: 0 },
  { id: "awakening", title: "Awakening", startsAtMinutes: 1_440 },
  { id: "emergence", title: "Emergence", startsAtMinutes: 10_080 },
  { id: "connection", title: "Connection", startsAtMinutes: 43_200 },
  { id: "convergence", title: "Convergence", startsAtMinutes: 129_600 },
  { id: "continuum", title: "Continuum", startsAtMinutes: 288_000 },
  { id: "legacy", title: "Legacy", startsAtMinutes: 525_600 },
];

function validateDefinitions(definitions: readonly JourneyEraDefinition[]): void {
  if (definitions.length !== JOURNEY_ERAS.length) throw new Error("Every journey era must be defined");
  definitions.forEach((definition, index) => {
    if (definition.id !== JOURNEY_ERAS[index]) throw new Error("Journey eras must use the approved order");
    if (!Number.isSafeInteger(definition.startsAtMinutes) || definition.startsAtMinutes < 0) throw new Error("Era thresholds must be non-negative whole minutes");
    if (index === 0 && definition.startsAtMinutes !== 0) throw new Error("Origin must begin at zero Time");
    if (index > 0 && definition.startsAtMinutes <= definitions[index - 1].startsAtMinutes) throw new Error("Era thresholds must increase");
  });
}

export function timeLivedLabel(totalTimeMinutes: number): string {
  if (!Number.isSafeInteger(totalTimeMinutes) || totalTimeMinutes < 0) throw new Error("Time must be a non-negative whole number of verified minutes");
  const days = Math.floor(totalTimeMinutes / 1_440);
  if (days === 0) return "First Day";
  if (days === 1) return "1 Day Lived";
  return `${days.toLocaleString("en-US")} Days Lived`;
}

export function projectCharacterJourney(input: {
  totalTimeMinutes: number;
  definitionVersion: number;
  definitions: readonly JourneyEraDefinition[];
  chapters: readonly JourneyChapter[];
  milestones: readonly JourneyMilestone[];
}): CharacterJourneyPresentation {
  if (!Number.isSafeInteger(input.definitionVersion) || input.definitionVersion < 1) throw new Error("Journey definition version must be a positive integer");
  validateDefinitions(input.definitions);
  timeLivedLabel(input.totalTimeMinutes);
  let eraIndex = 0;
  for (let index = 1; index < input.definitions.length; index += 1) {
    if (input.totalTimeMinutes < input.definitions[index].startsAtMinutes) break;
    eraIndex = index;
  }
  const era = input.definitions[eraIndex];
  const nextEra = input.definitions[eraIndex + 1] ?? null;
  const progressPercent = nextEra
    ? Math.min(100, Math.max(0, Math.floor(((input.totalTimeMinutes - era.startsAtMinutes) / (nextEra.startsAtMinutes - era.startsAtMinutes)) * 100)))
    : null;
  const chapters = [...input.chapters].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const activeChapter = chapters.find(({ completedAt }) => completedAt === null) ?? null;
  const recentChapters = chapters.filter(({ completedAt }) => completedAt !== null).slice(0, 3);
  const milestones = [...input.milestones].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  return {
    definitionVersion: input.definitionVersion,
    era: era.id,
    eraTitle: era.title,
    timeLivedLabel: timeLivedLabel(input.totalTimeMinutes),
    activeChapter,
    nextEraLabel: nextEra?.title ?? null,
    progressPercent,
    milestones,
    recentChapters,
  };
}
