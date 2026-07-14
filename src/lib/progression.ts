export const QUALIFYING_ACTIVITY_TYPES = ["release_discovered", "media_completed", "test_event_participated"] as const;
export type QualifyingActivityType = (typeof QUALIFYING_ACTIVITY_TYPES)[number];

export interface ProgressionRule {
  id: string;
  version: number;
  activityType: QualifyingActivityType;
  internalUnits: number;
}

export const INTERNAL_PROGRESSION_RULES: readonly ProgressionRule[] = [
  { id: "sandbox-release-discovery", version: 1, activityType: "release_discovered", internalUnits: 1 },
  { id: "sandbox-media-completion", version: 1, activityType: "media_completed", internalUnits: 2 },
  { id: "sandbox-test-event", version: 1, activityType: "test_event_participated", internalUnits: 3 },
];

export interface ActivityEvent {
  id: string;
  characterId: string;
  accountId: string;
  type: QualifyingActivityType;
  occurredAt: string;
  recordedAt: string;
}

export interface ProgressionLedgerEntry {
  id: string;
  characterId: string;
  sourceEventId: string;
  delta: number;
  ruleId: string;
  ruleVersion: number;
  reason: "activity_award" | "correction";
  reversesEntryId: string | null;
  recordedAt: string;
}

export interface ProgressionSnapshot {
  characterId: string;
  internalBalance: number;
  events: ActivityEvent[];
  ledger: ProgressionLedgerEntry[];
}

export function ruleFor(type: string): ProgressionRule {
  const rule = INTERNAL_PROGRESSION_RULES.find((candidate) => candidate.activityType === type);
  if (!rule) throw new Error("Activity type is not approved for sandbox progression");
  return rule;
}

export function progressionBalance(entries: ProgressionLedgerEntry[]): number {
  return entries.reduce((total, entry) => total + entry.delta, 0);
}
