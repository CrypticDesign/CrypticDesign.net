import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  ATTRIBUTE_RULE,
  CORE_ATTRIBUTES,
  LEVEL_RULE,
  TIME_RULE,
  attributeScoreForUsage,
  contextualAttributeUsage,
  levelProgress,
  maximumResources,
  type AttributeScores,
  type ContextVector,
} from "./rpg-experience.ts";

export interface ExperienceActivityEvent {
  id: string;
  characterId: string;
  accountId: string;
  experienceId: string;
  experienceVersion: number;
  sessionId: string;
  source: "sandbox-server" | "approved-fixture";
  verifiedActiveMinutes: number;
  context: ContextVector;
  challengeFactor: number;
  noveltyFactor: number;
  valueFactor: number;
  outcome?: "success" | "partial" | "failure" | "abandoned";
  evidenceIds?: string[];
  occurredAt: string;
  recordedAt: string;
}

export interface TimeLedgerEntry {
  id: string;
  characterId: string;
  sourceEventId: string;
  delta: number;
  reason: "verified_activity" | "correction";
  reversesEntryId: string | null;
  ruleId: typeof TIME_RULE.id;
  ruleVersion: typeof TIME_RULE.version;
  levelRuleId: typeof LEVEL_RULE.id;
  levelRuleVersion: typeof LEVEL_RULE.version;
  recordedAt: string;
}

export interface AttributeUsageEntry {
  id: string;
  characterId: string;
  sourceEventId: string;
  usage: AttributeScores;
  reason: "verified_activity" | "correction";
  reversesEntryId: string | null;
  ruleId: typeof ATTRIBUTE_RULE.id;
  ruleVersion: typeof ATTRIBUTE_RULE.version;
  recordedAt: string;
}

interface IdempotencyRecord { scope: string; requestId: string; payloadHash: string; timeEntryId: string }
interface ExperienceData { events: ExperienceActivityEvent[]; timeLedger: TimeLedgerEntry[]; attributeLedger: AttributeUsageEntry[]; idempotency: IdempotencyRecord[] }
const EMPTY_DATA: ExperienceData = { events: [], timeLedger: [], attributeLedger: [], idempotency: [] };
const queues = new Map<string, Promise<void>>();
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export interface RpgProjection {
  characterId: string;
  totalTime: number;
  level: ReturnType<typeof levelProgress>;
  attributes: AttributeScores;
  attributeUsage: AttributeScores;
  resources: ReturnType<typeof maximumResources>;
  events: ExperienceActivityEvent[];
  timeLedger: TimeLedgerEntry[];
  attributeLedger: AttributeUsageEntry[];
}

const addScores = (entries: readonly AttributeUsageEntry[]): AttributeScores => Object.fromEntries(CORE_ATTRIBUTES.map((attribute) => [
  attribute,
  entries.reduce((total, entry) => total + entry.usage[attribute], 0),
])) as AttributeScores;

export class RpgExperienceStore {
  private readonly filePath: string;
  constructor(filePath: string) { this.filePath = path.resolve(filePath); }

  async projection(characterId: string): Promise<RpgProjection> {
    return this.withLock(async () => {
      const data = await this.readUnlocked();
      const events = data.events.filter((event) => event.characterId === characterId);
      const timeLedger = data.timeLedger.filter((entry) => entry.characterId === characterId);
      const attributeLedger = data.attributeLedger.filter((entry) => entry.characterId === characterId);
      const totalTime = Math.max(0, timeLedger.reduce((total, entry) => total + entry.delta, 0));
      const attributeUsage = addScores(attributeLedger);
      const attributes = Object.fromEntries(CORE_ATTRIBUTES.map((attribute) => [attribute, attributeScoreForUsage(Math.max(0, attributeUsage[attribute])).score])) as AttributeScores;
      const level = levelProgress(totalTime);
      return { characterId, totalTime, level, attributes, attributeUsage, resources: maximumResources(attributes, level.level), events, timeLedger, attributeLedger };
    });
  }

  async record(input: Omit<ExperienceActivityEvent, "id" | "recordedAt"> & { requestId: string; recordedAt: string }) {
    return this.withLock(async () => {
      const data = await this.readUnlocked();
      const scope = `rpg-session:${input.accountId}:${input.characterId}`;
      const payload = { experienceId: input.experienceId, experienceVersion: input.experienceVersion, sessionId: input.sessionId, source: input.source, verifiedActiveMinutes: input.verifiedActiveMinutes, context: input.context, challengeFactor: input.challengeFactor, noveltyFactor: input.noveltyFactor, valueFactor: input.valueFactor, outcome: input.outcome, evidenceIds: input.evidenceIds, occurredAt: input.occurredAt };
      const payloadHash = hash(payload);
      const replay = data.idempotency.find((item) => item.scope === scope && item.requestId === input.requestId);
      if (replay) {
        if (replay.payloadHash !== payloadHash) throw new Error("Idempotency key was reused with different experience data");
        return data.timeLedger.find(({ id }) => id === replay.timeEntryId)!;
      }
      if (data.events.some((event) => event.experienceId === input.experienceId && event.sessionId === input.sessionId)) throw new Error("Experience session was already recorded");
      const usage = contextualAttributeUsage(input);
      const event: ExperienceActivityEvent = { id: randomUUID(), characterId: input.characterId, accountId: input.accountId, experienceId: input.experienceId, experienceVersion: input.experienceVersion, sessionId: input.sessionId, source: input.source, verifiedActiveMinutes: input.verifiedActiveMinutes, context: input.context, challengeFactor: input.challengeFactor, noveltyFactor: input.noveltyFactor, valueFactor: input.valueFactor, outcome: input.outcome, evidenceIds: input.evidenceIds, occurredAt: input.occurredAt, recordedAt: input.recordedAt };
      const timeEntry: TimeLedgerEntry = { id: randomUUID(), characterId: input.characterId, sourceEventId: event.id, delta: input.verifiedActiveMinutes, reason: "verified_activity", reversesEntryId: null, ruleId: TIME_RULE.id, ruleVersion: TIME_RULE.version, levelRuleId: LEVEL_RULE.id, levelRuleVersion: LEVEL_RULE.version, recordedAt: input.recordedAt };
      const attributeEntry: AttributeUsageEntry = { id: randomUUID(), characterId: input.characterId, sourceEventId: event.id, usage, reason: "verified_activity", reversesEntryId: null, ruleId: ATTRIBUTE_RULE.id, ruleVersion: ATTRIBUTE_RULE.version, recordedAt: input.recordedAt };
      data.events.push(event); data.timeLedger.push(timeEntry); data.attributeLedger.push(attributeEntry); data.idempotency.push({ scope, requestId: input.requestId, payloadHash, timeEntryId: timeEntry.id });
      await this.writeUnlocked(data); return timeEntry;
    });
  }

  async reverse(input: { characterId: string; accountId: string; timeEntryId: string; requestId: string; recordedAt: string }) {
    return this.withLock(async () => {
      const data = await this.readUnlocked();
      const original = data.timeLedger.find((entry) => entry.id === input.timeEntryId && entry.characterId === input.characterId && entry.reason === "verified_activity");
      if (!original) throw new Error("Time entry not found");
      const originalUsage = data.attributeLedger.find((entry) => entry.sourceEventId === original.sourceEventId && entry.reason === "verified_activity");
      if (!originalUsage) throw new Error("Attribute evidence not found");
      const scope = `rpg-correction:${input.accountId}:${input.characterId}`;
      const payloadHash = hash({ timeEntryId: input.timeEntryId });
      const replay = data.idempotency.find((item) => item.scope === scope && item.requestId === input.requestId);
      if (replay) {
        if (replay.payloadHash !== payloadHash) throw new Error("Idempotency key was reused with a different correction");
        return data.timeLedger.find(({ id }) => id === replay.timeEntryId)!;
      }
      if (data.timeLedger.some((entry) => entry.reversesEntryId === original.id)) throw new Error("Time entry is already reversed");
      const timeEntry: TimeLedgerEntry = { ...original, id: randomUUID(), delta: -original.delta, reason: "correction", reversesEntryId: original.id, recordedAt: input.recordedAt };
      const attributeEntry: AttributeUsageEntry = { ...originalUsage, id: randomUUID(), usage: Object.fromEntries(CORE_ATTRIBUTES.map((attribute) => [attribute, -originalUsage.usage[attribute]])) as AttributeScores, reason: "correction", reversesEntryId: originalUsage.id, recordedAt: input.recordedAt };
      data.timeLedger.push(timeEntry); data.attributeLedger.push(attributeEntry); data.idempotency.push({ scope, requestId: input.requestId, payloadHash, timeEntryId: timeEntry.id });
      await this.writeUnlocked(data); return timeEntry;
    });
  }

  private async readUnlocked(): Promise<ExperienceData> {
    try { return JSON.parse(await readFile(this.filePath, "utf8")) as ExperienceData; }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; await this.writeUnlocked(EMPTY_DATA); return structuredClone(EMPTY_DATA); }
  }
  private async writeUnlocked(data: ExperienceData) { await mkdir(path.dirname(this.filePath), { recursive: true }); const temporary = `${this.filePath}.${process.pid}.${randomUUID()}.tmp`; await writeFile(temporary, JSON.stringify(data, null, 2), "utf8"); await rename(temporary, this.filePath); }
  private async withLock<T>(operation: () => Promise<T>): Promise<T> { const previous = queues.get(this.filePath) ?? Promise.resolve(); let release!: () => void; const current = new Promise<void>((resolve) => { release = resolve; }); const queued = previous.then(() => current); queues.set(this.filePath, queued); await previous; try { return await operation(); } finally { release(); if (queues.get(this.filePath) === queued) queues.delete(this.filePath); } }
}

export function getRpgExperienceStore() { return new RpgExperienceStore(path.join(process.cwd(), ".data", "rpg-experience-sandbox.json")); }
