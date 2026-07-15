import { randomUUID } from "node:crypto";

import type { AvatarRecipe } from "./avatar.ts";

export const FORGE_STAGES = ["foundation", "features", "style", "expression", "signal", "review"] as const;
export type ForgeStage = (typeof FORGE_STAGES)[number];
export type DraftStatus = "active" | "confirming" | "consumed" | "discarded";

export interface CharacterDraftVariant {
  id: string;
  label: string;
  recipe: AvatarRecipe;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterDraft {
  id: string;
  ownerAccountId: string;
  schemaVersion: 1;
  status: DraftStatus;
  workingName: string | null;
  activeVariantId: string;
  variants: CharacterDraftVariant[];
  currentStage: ForgeStage;
  completedStages: ForgeStage[];
  revision: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConfirmedCharacter {
  id: string;
  ownerAccountId: string;
  displayName: string;
  handle: string;
  recipe: AvatarRecipe;
  version: 1;
  sourceDraftId: string;
  createdAt: string;
}

export class ForgeConflictError extends Error {}
export class ForgeValidationError extends Error {}

interface ConfirmationRecord {
  requestId: string;
  draftId: string;
  character: ConfirmedCharacter;
}

const normalizeHandle = (value: string) => value.trim().toLowerCase();

export class CharacterForgeDraftStore {
  private readonly drafts = new Map<string, CharacterDraft>();
  private readonly characters = new Map<string, ConfirmedCharacter>();
  private readonly confirmations = new Map<string, ConfirmationRecord>();
  private queue: Promise<void> = Promise.resolve();

  createDraft(input: { ownerAccountId: string; recipe: AvatarRecipe; occurredAt: string }): CharacterDraft {
    const existing = [...this.drafts.values()].find((draft) => draft.ownerAccountId === input.ownerAccountId && draft.status === "active");
    if (existing) return structuredClone(existing);
    const variant: CharacterDraftVariant = { id: randomUUID(), label: "Variant 1", recipe: structuredClone(input.recipe), createdAt: input.occurredAt, updatedAt: input.occurredAt };
    const draft: CharacterDraft = { id: randomUUID(), ownerAccountId: input.ownerAccountId, schemaVersion: 1, status: "active", workingName: null, activeVariantId: variant.id, variants: [variant], currentStage: "foundation", completedStages: [], revision: 1, createdAt: input.occurredAt, updatedAt: input.occurredAt };
    this.drafts.set(draft.id, draft);
    return structuredClone(draft);
  }

  getDraft(draftId: string): CharacterDraft | null {
    const draft = this.drafts.get(draftId);
    return draft ? structuredClone(draft) : null;
  }

  updateDraft(input: { draftId: string; ownerAccountId: string; expectedRevision: number; occurredAt: string; workingName?: string | null; currentStage?: ForgeStage; completedStages?: ForgeStage[] }): CharacterDraft {
    const draft = this.requireActiveDraft(input.draftId, input.ownerAccountId);
    if (draft.revision !== input.expectedRevision) throw new ForgeConflictError("Draft revision is stale");
    if (input.workingName !== undefined) draft.workingName = input.workingName?.trim() || null;
    if (input.currentStage) draft.currentStage = input.currentStage;
    if (input.completedStages) draft.completedStages = [...new Set(input.completedStages)];
    draft.revision += 1;
    draft.updatedAt = input.occurredAt;
    return structuredClone(draft);
  }

  addVariant(input: { draftId: string; ownerAccountId: string; expectedRevision: number; label: string; recipe: AvatarRecipe; occurredAt: string }): CharacterDraft {
    const draft = this.requireActiveDraft(input.draftId, input.ownerAccountId);
    if (draft.revision !== input.expectedRevision) throw new ForgeConflictError("Draft revision is stale");
    if (draft.variants.length >= 3) throw new ForgeValidationError("A draft may contain at most three variants");
    const variant: CharacterDraftVariant = { id: randomUUID(), label: input.label.trim() || `Variant ${draft.variants.length + 1}`, recipe: structuredClone(input.recipe), createdAt: input.occurredAt, updatedAt: input.occurredAt };
    draft.variants.push(variant);
    draft.activeVariantId = variant.id;
    draft.revision += 1;
    draft.updatedAt = input.occurredAt;
    return structuredClone(draft);
  }

  discard(input: { draftId: string; ownerAccountId: string; expectedRevision: number; occurredAt: string; confirmed: boolean }): CharacterDraft {
    if (!input.confirmed) throw new ForgeValidationError("Draft discard requires confirmation");
    const draft = this.requireActiveDraft(input.draftId, input.ownerAccountId);
    if (draft.revision !== input.expectedRevision) throw new ForgeConflictError("Draft revision is stale");
    draft.status = "discarded";
    draft.revision += 1;
    draft.updatedAt = input.occurredAt;
    return structuredClone(draft);
  }

  async confirm(input: { draftId: string; ownerAccountId: string; selectedVariantId: string; displayName: string; handle: string; expectedRevision: number; requestId: string; occurredAt: string; compatibilityValid: boolean }): Promise<ConfirmedCharacter> {
    return this.withLock(async () => {
      const replay = this.confirmations.get(input.requestId);
      if (replay) {
        if (replay.draftId !== input.draftId) throw new ForgeConflictError("Confirmation key was reused for another draft");
        return structuredClone(replay.character);
      }
      const draft = this.requireActiveDraft(input.draftId, input.ownerAccountId);
      if (draft.revision !== input.expectedRevision) throw new ForgeConflictError("Draft revision is stale");
      if (!input.compatibilityValid) throw new ForgeValidationError("Selected variant is not compatible");
      if (this.findCharacterByOwner(input.ownerAccountId)) throw new ForgeConflictError("Account already has a character");
      const displayName = input.displayName.trim();
      const handle = normalizeHandle(input.handle);
      if (!displayName) throw new ForgeValidationError("Display name is required");
      if (!/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(handle)) throw new ForgeValidationError("Handle is invalid");
      if ([...this.characters.values()].some((character) => character.handle === handle)) throw new ForgeConflictError("Handle is unavailable");
      const variant = draft.variants.find(({ id }) => id === input.selectedVariantId);
      if (!variant) throw new ForgeValidationError("Selected variant does not exist");
      draft.status = "confirming";
      const character: ConfirmedCharacter = { id: randomUUID(), ownerAccountId: input.ownerAccountId, displayName, handle, recipe: structuredClone(variant.recipe), version: 1, sourceDraftId: draft.id, createdAt: input.occurredAt };
      this.characters.set(character.id, character);
      draft.status = "consumed";
      draft.revision += 1;
      draft.updatedAt = input.occurredAt;
      this.confirmations.set(input.requestId, { requestId: input.requestId, draftId: draft.id, character });
      return structuredClone(character);
    });
  }

  findCharacterByOwner(ownerAccountId: string): ConfirmedCharacter | null {
    const character = [...this.characters.values()].find((item) => item.ownerAccountId === ownerAccountId);
    return character ? structuredClone(character) : null;
  }

  private requireActiveDraft(draftId: string, ownerAccountId: string): CharacterDraft {
    const draft = this.drafts.get(draftId);
    if (!draft || draft.ownerAccountId !== ownerAccountId) throw new ForgeValidationError("Draft not found");
    if (draft.status !== "active") throw new ForgeConflictError("Draft is not active");
    return draft;
  }

  private async withLock<T>(operation: () => Promise<T>): Promise<T> {
    const previous = this.queue;
    let release!: () => void;
    this.queue = new Promise<void>((resolve) => { release = resolve; });
    await previous;
    try { return await operation(); }
    finally { release(); }
  }
}
