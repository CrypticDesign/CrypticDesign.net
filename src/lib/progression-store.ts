import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { progressionBalance, ruleFor, type ActivityEvent, type ProgressionLedgerEntry, type ProgressionSnapshot, type QualifyingActivityType } from "./progression.ts";

interface IdempotencyRecord { scope: string; requestId: string; payloadHash: string; ledgerEntryId: string }
interface ProgressionData { events: ActivityEvent[]; ledger: ProgressionLedgerEntry[]; idempotency: IdempotencyRecord[] }
const EMPTY_DATA: ProgressionData = { events: [], ledger: [], idempotency: [] };
const queues = new Map<string, Promise<void>>();
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export class ProgressionStore {
  private readonly filePath: string;
  constructor(filePath: string) { this.filePath = path.resolve(filePath); }

  async snapshot(characterId: string): Promise<ProgressionSnapshot> {
    return this.withLock(async () => {
      const data = await this.readUnlocked();
      const events = data.events.filter((event) => event.characterId === characterId);
      const ledger = data.ledger.filter((entry) => entry.characterId === characterId);
      return { characterId, internalBalance: progressionBalance(ledger), events, ledger };
    });
  }

  async recordActivity(input: { characterId: string; accountId: string; type: QualifyingActivityType; requestId: string; occurredAt: string; recordedAt: string }) {
    return this.withLock(async () => {
      const data = await this.readUnlocked();
      const rule = ruleFor(input.type);
      const scope = `activity:${input.accountId}:${input.characterId}`;
      const payloadHash = hash({ type: input.type, occurredAt: input.occurredAt });
      const replay = data.idempotency.find((record) => record.scope === scope && record.requestId === input.requestId);
      if (replay) {
        if (replay.payloadHash !== payloadHash) throw new Error("Idempotency key was reused with different activity data");
        return data.ledger.find(({ id }) => id === replay.ledgerEntryId)!;
      }
      const event: ActivityEvent = { id: randomUUID(), characterId: input.characterId, accountId: input.accountId, type: input.type, occurredAt: input.occurredAt, recordedAt: input.recordedAt };
      const entry: ProgressionLedgerEntry = { id: randomUUID(), characterId: input.characterId, sourceEventId: event.id, delta: rule.internalUnits, ruleId: rule.id, ruleVersion: rule.version, reason: "activity_award", reversesEntryId: null, recordedAt: input.recordedAt };
      data.events.push(event); data.ledger.push(entry); data.idempotency.push({ scope, requestId: input.requestId, payloadHash, ledgerEntryId: entry.id });
      await this.writeUnlocked(data); return entry;
    });
  }

  async reverse(input: { characterId: string; accountId: string; entryId: string; requestId: string; recordedAt: string }) {
    return this.withLock(async () => {
      const data = await this.readUnlocked();
      const original = data.ledger.find((entry) => entry.id === input.entryId && entry.characterId === input.characterId && entry.reason === "activity_award");
      if (!original) throw new Error("Progression entry not found");
      const scope = `correction:${input.accountId}:${input.characterId}`;
      const payloadHash = hash({ entryId: input.entryId });
      const replay = data.idempotency.find((record) => record.scope === scope && record.requestId === input.requestId);
      if (replay) {
        if (replay.payloadHash !== payloadHash) throw new Error("Idempotency key was reused with a different correction");
        return data.ledger.find(({ id }) => id === replay.ledgerEntryId)!;
      }
      if (data.ledger.some((entry) => entry.reversesEntryId === original.id)) throw new Error("Progression entry is already reversed");
      const correction: ProgressionLedgerEntry = { id: randomUUID(), characterId: input.characterId, sourceEventId: original.sourceEventId, delta: -original.delta, ruleId: original.ruleId, ruleVersion: original.ruleVersion, reason: "correction", reversesEntryId: original.id, recordedAt: input.recordedAt };
      data.ledger.push(correction); data.idempotency.push({ scope, requestId: input.requestId, payloadHash, ledgerEntryId: correction.id });
      await this.writeUnlocked(data); return correction;
    });
  }

  private async readUnlocked(): Promise<ProgressionData> {
    try { return JSON.parse(await readFile(this.filePath, "utf8")) as ProgressionData; }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; await this.writeUnlocked(EMPTY_DATA); return structuredClone(EMPTY_DATA); }
  }
  private async writeUnlocked(data: ProgressionData) { await mkdir(path.dirname(this.filePath), { recursive: true }); const temporary = `${this.filePath}.${process.pid}.${randomUUID()}.tmp`; await writeFile(temporary, JSON.stringify(data, null, 2), "utf8"); await rename(temporary, this.filePath); }
  private async withLock<T>(operation: () => Promise<T>): Promise<T> { const previous = queues.get(this.filePath) ?? Promise.resolve(); let release!: () => void; const current = new Promise<void>((resolve) => { release = resolve; }); const queued = previous.then(() => current); queues.set(this.filePath, queued); await previous; try { return await operation(); } finally { release(); if (queues.get(this.filePath) === queued) queues.delete(this.filePath); } }
}

export function getProgressionStore() { return new ProgressionStore(path.join(process.cwd(), ".data", "progression-sandbox.json")); }
