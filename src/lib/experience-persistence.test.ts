import assert from "node:assert/strict";
import test from "node:test";

import {
  EXPERIENCE_SAVE_CONTRACT_VERSION,
  canPersistExperiencePreview,
  createDevelopmentExperienceSaveStore,
  resolveLatestValidExperienceSave,
  withExperienceSaveResolution,
  type ExperienceCheckpointV1,
  type ExperiencePreviewStorage,
} from "./experience-persistence.ts";
import { EXPERIENCE_RUNTIME_CONTEXT_VERSION, type ExperienceRuntimeAuthoritativeContextV1 } from "./experience-runtime.ts";

const query = {
  experienceId: "singularis:continuous-gamespace:v1",
  subjectId: "member-1",
  acceptedSchemaVersions: ["singularis-gamespace:1"],
} as const;

const payload = { phase: "training", checkpoint: 2 };
const isPayload = (value: unknown): value is typeof payload =>
  typeof value === "object" && value !== null && "phase" in value && "checkpoint" in value;

function checkpoint(revision: number, overrides: Partial<ExperienceCheckpointV1<typeof payload>> = {}): ExperienceCheckpointV1<typeof payload> {
  return {
    contractVersion: EXPERIENCE_SAVE_CONTRACT_VERSION,
    experienceId: query.experienceId,
    subjectId: query.subjectId,
    checkpointId: `checkpoint-${revision}`,
    schemaVersion: "singularis-gamespace:1",
    revision,
    sequence: revision,
    lifecycle: "checkpoint",
    savedAt: `2026-10-24T00:00:0${revision}.000Z`,
    idempotencyKey: `write-${revision}`,
    payload,
    ...overrides,
  };
}

class MemoryStorage implements ExperiencePreviewStorage {
  readonly values = new Map<string, string>();
  failWrites = false;
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new Error("write failed");
    this.values.set(key, value);
  }
  removeItem(key: string) { this.values.delete(key); }
}

test("resolves the newest valid checkpoint while preserving newer incompatible evidence", () => {
  const resolution = resolveLatestValidExperienceSave([
    checkpoint(1),
    checkpoint(3, { contractVersion: 99 as 1 }),
    checkpoint(2),
  ], query, isPayload);
  assert.equal(resolution.status, "available");
  if (resolution.status !== "available") return;
  assert.equal(resolution.checkpoint.revision, 2);
  assert.deepEqual(resolution.rejected, [{ checkpointId: "checkpoint-3", reason: "unsupported-contract" }]);
});

test("returns a visible recovery state when no compatible checkpoint exists", () => {
  const resolution = resolveLatestValidExperienceSave([
    checkpoint(1, { schemaVersion: "singularis-gamespace:future" }),
  ], query, isPayload);
  assert.equal(resolution.status, "incompatible");
  if (resolution.status !== "incompatible") return;
  assert.match(resolution.reason, /unsupported version/i);
});

test("development store deduplicates lifecycle writes and keeps the previous checkpoint on failure", () => {
  const storage = new MemoryStorage();
  let id = 0;
  const store = createDevelopmentExperienceSaveStore(storage, {
    now: () => new Date("2026-10-24T12:00:00.000Z"),
    createId: () => `id-${++id}`,
  });
  const draft = {
    experienceId: query.experienceId,
    subjectId: query.subjectId,
    schemaVersion: "singularis-gamespace:1",
    sequence: 1,
    lifecycle: "interrupted" as const,
    idempotencyKey: "session-1:interrupted:1",
    payload,
  };
  assert.equal(store.write(draft).status, "accepted");
  assert.equal(store.write(draft).status, "duplicate");
  storage.failWrites = true;
  assert.equal(store.write({ ...draft, idempotencyKey: "session-1:completed:2", sequence: 2 }).status, "rejected");
  const resolution = store.resolve(query, isPayload);
  assert.equal(resolution.status, "available");
  if (resolution.status === "available") assert.equal(resolution.checkpoint.idempotencyKey, draft.idempotencyKey);
});

test("a malformed local record cannot impersonate an accepted idempotent write", () => {
  const storage = new MemoryStorage();
  const store = createDevelopmentExperienceSaveStore(storage, {
    now: () => new Date("2026-10-24T12:00:00.000Z"),
    createId: () => "accepted-id",
  });
  const seed = {
    experienceId: query.experienceId,
    subjectId: query.subjectId,
    schemaVersion: "singularis-gamespace:1",
    sequence: 1,
    lifecycle: "checkpoint" as const,
    idempotencyKey: "seed",
    payload,
  };
  assert.equal(store.write(seed).status, "accepted");
  const key = [...storage.values.keys()][0];
  assert.ok(key);
  const records = JSON.parse(storage.getItem(key) ?? "[]") as unknown[];
  records.push({ experienceId: query.experienceId, subjectId: query.subjectId, idempotencyKey: "forged" });
  storage.setItem(key, JSON.stringify(records));
  assert.equal(store.write({ ...seed, sequence: 2, idempotencyKey: "forged" }).status, "accepted");
});

test("only an explicitly authorized subject receives development-preview persistence", () => {
  const base: ExperienceRuntimeAuthoritativeContextV1 = {
    contractVersion: EXPERIENCE_RUNTIME_CONTEXT_VERSION,
    experienceId: query.experienceId,
    access: { status: "public" },
    resume: { status: "none" },
  };
  assert.equal(canPersistExperiencePreview(base), false);
  assert.equal(canPersistExperiencePreview({ ...base, access: { status: "authorized" } }), false);
  assert.equal(canPersistExperiencePreview({ ...base, access: { status: "authorized", subjectId: query.subjectId } }), true);
});

test("maps resolver output into the shared runtime without changing stable experience identity", () => {
  const base: ExperienceRuntimeAuthoritativeContextV1 = {
    contractVersion: EXPERIENCE_RUNTIME_CONTEXT_VERSION,
    experienceId: query.experienceId,
    access: { status: "authorized", subjectId: query.subjectId },
    resume: { status: "none" },
  };
  const resolution = resolveLatestValidExperienceSave([checkpoint(1)], query, isPayload);
  const hydrated = withExperienceSaveResolution(base, resolution);
  assert.equal(hydrated.experienceId, query.experienceId);
  assert.equal(hydrated.resume?.status, "available");
  assert.equal(hydrated.resume?.source, "development-preview");
});
