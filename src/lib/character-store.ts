import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { canManageCharacter, validateCharacterInput, type CharacterHistoryEvent, type CharacterIdentity } from "./characters.ts";

export class CharacterStoreError extends Error {
  readonly code: "conflict" | "invalid" | "not_found";
  constructor(message: string, code: "conflict" | "invalid" | "not_found") { super(message); this.code = code; }
}

interface CharacterProfileInput {
  name: string; handle?: string; archetype: string; bio?: string; portraitUrl?: string | null;
  avatarRecipe?: unknown;
  affiliation?: string | null; presence?: string; discoverable?: boolean; visibility?: string; publicationConsent?: boolean;
}

interface IdempotencyRecord {
  scope: string;
  requestId: string;
  payloadHash: string;
  characterId: string;
}

interface CharacterData {
  characters: CharacterIdentity[];
  history: CharacterHistoryEvent[];
  idempotencyRecords: IdempotencyRecord[];
  processedRequestIds?: string[];
}

const EMPTY_DATA: CharacterData = { characters: [], history: [], idempotencyRecords: [] };
const writeQueues = new Map<string, Promise<void>>();

function fingerprint(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export class CharacterStore {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = path.resolve(filePath);
  }

  async read(): Promise<CharacterData> {
    return this.withLock(() => this.readUnlocked());
  }

  private async readUnlocked(): Promise<CharacterData> {
    try {
      const data = JSON.parse(await readFile(this.filePath, "utf8")) as CharacterData;
      data.idempotencyRecords ??= [];
      data.characters = data.characters.map((character) => ({
        ...character,
        handle: character.handle || character.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `character-${character.id.slice(0, 8)}`,
        portraitUrl: character.portraitUrl ?? null,
        avatarRecipe: validateCharacterInput({ ...character, avatarRecipe: character.avatarRecipe }).avatarRecipe,
        presence: character.presence ?? "offline",
        discoverable: character.discoverable ?? false,
        visibility: character.visibility ?? "private",
        publicationConsent: character.publicationConsent ?? false,
        stewardOperatorId: character.stewardOperatorId ?? null,
        provenance: character.provenance ?? (character.kind === "system" ? "legacy-system-character" : "account-created"),
      }));
      return data;
    }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      await this.writeUnlocked(EMPTY_DATA);
      return structuredClone(EMPTY_DATA);
    }
  }

  async findByOwner(accountId: string): Promise<CharacterIdentity | null> {
    return (await this.read()).characters.find((item) => item.ownerAccountId === accountId && item.kind === "member") ?? null;
  }

  async historyFor(characterId: string, accountId: string): Promise<CharacterHistoryEvent[]> {
    const data = await this.read();
    const character = data.characters.find(({ id }) => id === characterId);
    if (!character || !canManageCharacter(accountId, character)) throw new Error("Character not found");
    return data.history.filter((event) => event.characterId === characterId);
  }

  async create(input: CharacterProfileInput & { id: string; accountId: string; requestId: string; occurredAt: string }) {
    return this.withLock(async () => {
      const data = await this.readUnlocked();
      data.idempotencyRecords ??= [];
      const profile = validateCharacterInput(input);
      const scope = `create:${input.accountId}`;
      const payloadHash = fingerprint(profile);
      const replay = data.idempotencyRecords.find((record) => record.scope === scope && record.requestId === input.requestId);
      if (replay) {
        if (replay.payloadHash !== payloadHash) throw new CharacterStoreError("Idempotency key was reused with different character data", "conflict");
        const replayedCharacter = data.characters.find(({ id }) => id === replay.characterId);
        if (!replayedCharacter) throw new Error("Idempotency record references a missing character");
        return replayedCharacter;
      }
      if (data.characters.some((item) => item.ownerAccountId === input.accountId && item.kind === "member")) throw new CharacterStoreError("Account already has a character", "conflict");
      const character: CharacterIdentity = { id: input.id, ownerAccountId: input.accountId, kind: "member", ...profile, stewardOperatorId: null, provenance: "account-created", status: "active", createdAt: input.occurredAt, updatedAt: input.occurredAt };
      data.characters.push(character);
      data.history.push({ id: `history_${fingerprint(`${scope}:${input.requestId}`).slice(0, 32)}`, characterId: character.id, actorAccountId: input.accountId, type: "created", occurredAt: input.occurredAt, changedFields: ["name", "archetype", "bio", "affiliation"] });
      data.idempotencyRecords.push({ scope, requestId: input.requestId, payloadHash, characterId: character.id });
      await this.writeUnlocked(data);
      return character;
    });
  }

  async update(input: CharacterProfileInput & { characterId: string; accountId: string; requestId: string; occurredAt: string }) {
    return this.withLock(async () => {
      const data = await this.readUnlocked();
      data.idempotencyRecords ??= [];
      const index = data.characters.findIndex(({ id }) => id === input.characterId);
      const existing = data.characters[index];
      if (!existing || !canManageCharacter(input.accountId, existing)) throw new CharacterStoreError("Character not found", "not_found");
      const profile = validateCharacterInput(input);
      const scope = `update:${input.accountId}:${input.characterId}`;
      const payloadHash = fingerprint(profile);
      const replay = data.idempotencyRecords.find((record) => record.scope === scope && record.requestId === input.requestId);
      if (replay) {
        if (replay.payloadHash !== payloadHash) throw new CharacterStoreError("Idempotency key was reused with different character data", "conflict");
        return existing;
      }
      const changedFields = (Object.keys(profile) as Array<keyof typeof profile>).filter((field) => existing[field] !== profile[field]);
      const updated = { ...existing, ...profile, updatedAt: input.occurredAt };
      data.characters[index] = updated;
      data.history.push({ id: `history_${fingerprint(`${scope}:${input.requestId}`).slice(0, 32)}`, characterId: existing.id, actorAccountId: input.accountId, type: "profile_updated", occurredAt: input.occurredAt, changedFields });
      data.idempotencyRecords.push({ scope, requestId: input.requestId, payloadHash, characterId: existing.id });
      await this.writeUnlocked(data);
      return updated;
    });
  }

  async setStatus(input: { characterId: string; accountId: string; status: "active" | "retired"; requestId: string; occurredAt: string }) {
    return this.withLock(async () => {
      const data = await this.readUnlocked();
      data.idempotencyRecords ??= [];
      const index = data.characters.findIndex(({ id }) => id === input.characterId);
      const existing = data.characters[index];
      if (!existing || !canManageCharacter(input.accountId, existing)) throw new CharacterStoreError("Character not found", "not_found");
      if (existing.status === "suspended") throw new CharacterStoreError("A suspended character can only be changed by an operator", "conflict");
      const scope = `status:${input.accountId}:${input.characterId}`;
      const payloadHash = fingerprint({ status: input.status });
      const replay = data.idempotencyRecords.find((record) => record.scope === scope && record.requestId === input.requestId);
      if (replay) {
        if (replay.payloadHash !== payloadHash) throw new CharacterStoreError("Idempotency key was reused with a different lifecycle action", "conflict");
        return existing;
      }
      const updated = { ...existing, status: input.status, ...(input.status === "retired" ? { presence: "offline" as const, discoverable: false } : {}), updatedAt: input.occurredAt };
      data.characters[index] = updated;
      data.history.push({ id: `history_${fingerprint(`${scope}:${input.requestId}`).slice(0, 32)}`, characterId: existing.id, actorAccountId: input.accountId, type: "status_changed", occurredAt: input.occurredAt, changedFields: input.status === "retired" ? ["status", "presence", "discoverable"] : ["status"] });
      data.idempotencyRecords.push({ scope, requestId: input.requestId, payloadHash, characterId: existing.id });
      await this.writeUnlocked(data);
      return updated;
    });
  }

  private async writeUnlocked(data: CharacterData) {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(data, null, 2), "utf8");
    await rename(temporaryPath, this.filePath);
  }

  private async withLock<T>(operation: () => Promise<T>): Promise<T> {
    const previous = writeQueues.get(this.filePath) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => { release = resolve; });
    const queued = previous.then(() => current);
    writeQueues.set(this.filePath, queued);
    await previous;
    try { return await operation(); }
    finally {
      release();
      if (writeQueues.get(this.filePath) === queued) writeQueues.delete(this.filePath);
    }
  }
}

export function getCharacterStore() { return new CharacterStore(path.join(process.cwd(), ".data", "characters-sandbox.json")); }
