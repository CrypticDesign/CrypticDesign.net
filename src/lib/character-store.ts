import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { canManageCharacter, validateCharacterInput, type CharacterHistoryEvent, type CharacterIdentity } from "./characters.ts";

interface CharacterData { characters: CharacterIdentity[]; history: CharacterHistoryEvent[]; processedRequestIds: string[] }
const EMPTY_DATA: CharacterData = { characters: [], history: [], processedRequestIds: [] };

export class CharacterStore {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async read(): Promise<CharacterData> {
    try { return JSON.parse(await readFile(this.filePath, "utf8")) as CharacterData; }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      await this.write(EMPTY_DATA);
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

  async create(input: { id: string; accountId: string; name: string; archetype: string; bio?: string; affiliation?: string | null; requestId: string; occurredAt: string }) {
    const data = await this.read();
    const existing = data.characters.find((item) => item.ownerAccountId === input.accountId && item.kind === "member");
    if (existing && data.processedRequestIds.includes(input.requestId)) return existing;
    if (existing) throw new Error("Account already has a character");
    const profile = validateCharacterInput(input);
    const character: CharacterIdentity = { id: input.id, ownerAccountId: input.accountId, kind: "member", ...profile, status: "active", createdAt: input.occurredAt, updatedAt: input.occurredAt };
    data.characters.push(character);
    data.history.push({ id: `history_${input.requestId}`, characterId: character.id, actorAccountId: input.accountId, type: "created", occurredAt: input.occurredAt, changedFields: ["name", "archetype", "bio", "affiliation"] });
    data.processedRequestIds.push(input.requestId);
    await this.write(data);
    return character;
  }

  async update(input: { characterId: string; accountId: string; name: string; archetype: string; bio?: string; affiliation?: string | null; requestId: string; occurredAt: string }) {
    const data = await this.read();
    const index = data.characters.findIndex(({ id }) => id === input.characterId);
    const existing = data.characters[index];
    if (!existing || !canManageCharacter(input.accountId, existing)) throw new Error("Character not found");
    if (data.processedRequestIds.includes(input.requestId)) return existing;
    const profile = validateCharacterInput(input);
    const changedFields = (Object.keys(profile) as Array<keyof typeof profile>).filter((field) => existing[field] !== profile[field]);
    const updated = { ...existing, ...profile, updatedAt: input.occurredAt };
    data.characters[index] = updated;
    data.history.push({ id: `history_${input.requestId}`, characterId: existing.id, actorAccountId: input.accountId, type: "profile_updated", occurredAt: input.occurredAt, changedFields });
    data.processedRequestIds.push(input.requestId);
    await this.write(data);
    return updated;
  }

  private async write(data: CharacterData) {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(data, null, 2), "utf8");
    await rename(temporaryPath, this.filePath);
  }
}

export function getCharacterStore() { return new CharacterStore(path.join(process.cwd(), ".data", "characters-sandbox.json")); }
