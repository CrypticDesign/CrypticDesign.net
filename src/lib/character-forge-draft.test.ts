import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_AVATAR_RECIPE } from "./avatar.ts";
import { CharacterForgeDraftStore, ForgeConflictError, ForgeValidationError } from "./character-forge-draft.ts";

const now = "2026-07-14T00:00:00Z";

test("keeps up to three recoverable variants without creating a character", () => {
  const store = new CharacterForgeDraftStore();
  let draft = store.createDraft({ ownerAccountId: "account_1", recipe: DEFAULT_AVATAR_RECIPE, occurredAt: now });
  draft = store.addVariant({ draftId: draft.id, ownerAccountId: "account_1", expectedRevision: draft.revision, label: "Variant 2", recipe: { ...DEFAULT_AVATAR_RECIPE, accent: "gold" }, occurredAt: now });
  draft = store.addVariant({ draftId: draft.id, ownerAccountId: "account_1", expectedRevision: draft.revision, label: "Variant 3", recipe: { ...DEFAULT_AVATAR_RECIPE, accent: "green" }, occurredAt: now });
  assert.equal(draft.variants.length, 3);
  assert.equal(store.findCharacterByOwner("account_1"), null);
  assert.throws(() => store.addVariant({ draftId: draft.id, ownerAccountId: "account_1", expectedRevision: draft.revision, label: "Variant 4", recipe: DEFAULT_AVATAR_RECIPE, occurredAt: now }), ForgeValidationError);
});

test("rejects stale autosave revisions and preserves the latest checkpoint", () => {
  const store = new CharacterForgeDraftStore();
  const draft = store.createDraft({ ownerAccountId: "account_1", recipe: DEFAULT_AVATAR_RECIPE, occurredAt: now });
  const saved = store.updateDraft({ draftId: draft.id, ownerAccountId: "account_1", expectedRevision: draft.revision, workingName: "Astra", currentStage: "features", completedStages: ["foundation"], occurredAt: now });
  assert.throws(() => store.updateDraft({ draftId: draft.id, ownerAccountId: "account_1", expectedRevision: draft.revision, workingName: "Stale", occurredAt: now }), ForgeConflictError);
  assert.equal(store.getDraft(draft.id)?.workingName, "Astra");
  assert.equal(saved.revision, 2);
});

test("confirms once, consumes the draft, and replays idempotently", async () => {
  const store = new CharacterForgeDraftStore();
  const draft = store.createDraft({ ownerAccountId: "account_1", recipe: DEFAULT_AVATAR_RECIPE, occurredAt: now });
  const input = { draftId: draft.id, ownerAccountId: "account_1", selectedVariantId: draft.activeVariantId, displayName: "Astra Vale", handle: "astra-vale", expectedRevision: draft.revision, requestId: "confirm_1", occurredAt: now, compatibilityValid: true };
  const created = await store.confirm(input);
  const replay = await store.confirm(input);
  assert.deepEqual(replay, created);
  assert.equal(store.getDraft(draft.id)?.status, "consumed");
  assert.equal(store.findCharacterByOwner("account_1")?.id, created.id);
});

test("serializes confirmation and enforces one owner and one handle", async () => {
  const store = new CharacterForgeDraftStore();
  const first = store.createDraft({ ownerAccountId: "account_1", recipe: DEFAULT_AVATAR_RECIPE, occurredAt: now });
  const second = store.createDraft({ ownerAccountId: "account_2", recipe: DEFAULT_AVATAR_RECIPE, occurredAt: now });
  const results = await Promise.allSettled([
    store.confirm({ draftId: first.id, ownerAccountId: "account_1", selectedVariantId: first.activeVariantId, displayName: "One", handle: "shared-handle", expectedRevision: first.revision, requestId: "one", occurredAt: now, compatibilityValid: true }),
    store.confirm({ draftId: second.id, ownerAccountId: "account_2", selectedVariantId: second.activeVariantId, displayName: "Two", handle: "shared-handle", expectedRevision: second.revision, requestId: "two", occurredAt: now, compatibilityValid: true }),
  ]);
  assert.equal(results.filter(({ status }) => status === "fulfilled").length, 1);
  assert.equal(results.filter(({ status }) => status === "rejected").length, 1);
});

test("failed compatibility leaves the draft recoverable and discard needs confirmation", async () => {
  const store = new CharacterForgeDraftStore();
  const draft = store.createDraft({ ownerAccountId: "account_1", recipe: DEFAULT_AVATAR_RECIPE, occurredAt: now });
  await assert.rejects(() => store.confirm({ draftId: draft.id, ownerAccountId: "account_1", selectedVariantId: draft.activeVariantId, displayName: "Astra", handle: "astra", expectedRevision: draft.revision, requestId: "bad", occurredAt: now, compatibilityValid: false }), ForgeValidationError);
  assert.equal(store.getDraft(draft.id)?.status, "active");
  assert.throws(() => store.discard({ draftId: draft.id, ownerAccountId: "account_1", expectedRevision: draft.revision, occurredAt: now, confirmed: false }), ForgeValidationError);
});
