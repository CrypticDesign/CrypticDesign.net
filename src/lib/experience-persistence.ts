import type { ExperienceRuntimeAuthoritativeContextV1 } from "./experience-runtime";

export const EXPERIENCE_SAVE_CONTRACT_VERSION = 1 as const;
export const DEVELOPMENT_SAVE_RETENTION_LIMIT = 12;

export type ExperienceCheckpointLifecycle =
  | "checkpoint"
  | "interrupted"
  | "completed"
  | "ended";

export interface ExperienceCheckpointV1<TPayload = unknown> {
  contractVersion: typeof EXPERIENCE_SAVE_CONTRACT_VERSION;
  experienceId: string;
  subjectId: string;
  checkpointId: string;
  schemaVersion: string;
  revision: number;
  sequence: number;
  lifecycle: ExperienceCheckpointLifecycle;
  savedAt: string;
  idempotencyKey: string;
  payload: TPayload;
}

export interface ExperienceCheckpointDraft<TPayload> {
  experienceId: string;
  subjectId: string;
  schemaVersion: string;
  sequence: number;
  lifecycle: ExperienceCheckpointLifecycle;
  idempotencyKey: string;
  payload: TPayload;
}

export interface ExperienceSaveQuery {
  experienceId: string;
  subjectId: string;
  acceptedSchemaVersions: readonly string[];
}

export interface RejectedExperienceCheckpoint {
  checkpointId?: string;
  reason: "malformed" | "identity-mismatch" | "unsupported-contract" | "unsupported-schema";
}

export type ExperienceSaveResolution<TPayload> =
  | { status: "none"; rejected: readonly RejectedExperienceCheckpoint[] }
  | {
      status: "available";
      checkpoint: ExperienceCheckpointV1<TPayload>;
      rejected: readonly RejectedExperienceCheckpoint[];
    }
  | { status: "incompatible"; reason: string; rejected: readonly RejectedExperienceCheckpoint[] };

export type ExperienceCheckpointWriteResult<TPayload> =
  | { status: "accepted" | "duplicate"; checkpoint: ExperienceCheckpointV1<TPayload> }
  | { status: "rejected"; reason: string };

export interface ExperiencePreviewStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface DevelopmentExperienceSaveStore {
  resolve<TPayload>(
    query: ExperienceSaveQuery,
    validatePayload: (value: unknown) => value is TPayload,
  ): ExperienceSaveResolution<TPayload>;
  write<TPayload>(draft: ExperienceCheckpointDraft<TPayload>): ExperienceCheckpointWriteResult<TPayload>;
  clear(query: Pick<ExperienceSaveQuery, "experienceId" | "subjectId">): void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function checkpointId(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;
  return nonEmptyString(value.checkpointId) ? value.checkpointId : undefined;
}

function validateCheckpoint<TPayload>(
  value: unknown,
  query: ExperienceSaveQuery,
  validatePayload: (value: unknown) => value is TPayload,
): { checkpoint?: ExperienceCheckpointV1<TPayload>; rejection?: RejectedExperienceCheckpoint } {
  if (!isRecord(value)) return { rejection: { reason: "malformed" } };
  const id = checkpointId(value);
  if (value.experienceId !== query.experienceId || value.subjectId !== query.subjectId) {
    return { rejection: { checkpointId: id, reason: "identity-mismatch" } };
  }
  if (value.contractVersion !== EXPERIENCE_SAVE_CONTRACT_VERSION) {
    return { rejection: { checkpointId: id, reason: "unsupported-contract" } };
  }
  if (!nonEmptyString(value.schemaVersion) || !query.acceptedSchemaVersions.includes(value.schemaVersion)) {
    return { rejection: { checkpointId: id, reason: "unsupported-schema" } };
  }
  const lifecycle = value.lifecycle;
  if (
    !nonEmptyString(value.checkpointId)
    || !Number.isSafeInteger(value.revision as number)
    || Number(value.revision) < 1
    || !Number.isSafeInteger(value.sequence as number)
    || Number(value.sequence) < 0
    || !["checkpoint", "interrupted", "completed", "ended"].includes(String(lifecycle))
    || !nonEmptyString(value.savedAt)
    || Number.isNaN(Date.parse(value.savedAt))
    || !nonEmptyString(value.idempotencyKey)
    || !validatePayload(value.payload)
  ) {
    return { rejection: { checkpointId: id, reason: "malformed" } };
  }
  return { checkpoint: value as unknown as ExperienceCheckpointV1<TPayload> };
}

function newestFirst<TPayload>(
  left: ExperienceCheckpointV1<TPayload>,
  right: ExperienceCheckpointV1<TPayload>,
): number {
  return right.revision - left.revision
    || Date.parse(right.savedAt) - Date.parse(left.savedAt)
    || right.sequence - left.sequence;
}

export function resolveLatestValidExperienceSave<TPayload>(
  candidates: readonly unknown[],
  query: ExperienceSaveQuery,
  validatePayload: (value: unknown) => value is TPayload,
): ExperienceSaveResolution<TPayload> {
  if (candidates.length === 0) return { status: "none", rejected: [] };

  const valid: ExperienceCheckpointV1<TPayload>[] = [];
  const rejected: RejectedExperienceCheckpoint[] = [];
  for (const candidate of candidates) {
    const result = validateCheckpoint(candidate, query, validatePayload);
    if (result.checkpoint) valid.push(result.checkpoint);
    if (result.rejection) rejected.push(result.rejection);
  }

  valid.sort(newestFirst);
  if (valid[0]) return { status: "available", checkpoint: valid[0], rejected };

  return {
    status: "incompatible",
    reason: rejected.some((item) => item.reason === "unsupported-contract" || item.reason === "unsupported-schema")
      ? "Saved progress uses an unsupported version. The prior data was preserved."
      : "Saved progress could not be validated. The prior data was preserved.",
    rejected,
  };
}

function storageKey(experienceId: string, subjectId: string): string {
  return `cryptic:experience-save-preview:${encodeURIComponent(experienceId)}:${encodeURIComponent(subjectId)}`;
}

function parseStoredCandidates(storage: ExperiencePreviewStorage, key: string): { candidates: unknown[]; error?: string } {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return { candidates: [] };
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? { candidates: parsed }
      : { candidates: [], error: "Saved progress storage is not a checkpoint list." };
  } catch {
    return { candidates: [], error: "Saved progress storage could not be read." };
  }
}

function isDuplicateCheckpoint<TPayload>(
  candidate: unknown,
  draft: ExperienceCheckpointDraft<TPayload>,
): candidate is ExperienceCheckpointV1<TPayload> {
  if (!isRecord(candidate)) return false;
  return candidate.contractVersion === EXPERIENCE_SAVE_CONTRACT_VERSION
    && candidate.experienceId === draft.experienceId
    && candidate.subjectId === draft.subjectId
    && candidate.schemaVersion === draft.schemaVersion
    && candidate.idempotencyKey === draft.idempotencyKey
    && nonEmptyString(candidate.checkpointId)
    && Number.isSafeInteger(candidate.revision as number)
    && Number(candidate.revision) >= 1
    && Number.isSafeInteger(candidate.sequence as number)
    && Number(candidate.sequence) >= 0
    && ["checkpoint", "interrupted", "completed", "ended"].includes(String(candidate.lifecycle))
    && nonEmptyString(candidate.savedAt)
    && !Number.isNaN(Date.parse(candidate.savedAt))
    && "payload" in candidate;
}

export function createDevelopmentExperienceSaveStore(
  storage: ExperiencePreviewStorage,
  options: { now?: () => Date; createId?: () => string } = {},
): DevelopmentExperienceSaveStore {
  const now = options.now ?? (() => new Date());
  const createId = options.createId ?? (() => globalThis.crypto.randomUUID());

  return {
    resolve(query, validatePayload) {
      const stored = parseStoredCandidates(storage, storageKey(query.experienceId, query.subjectId));
      if (stored.error) return { status: "incompatible", reason: stored.error, rejected: [{ reason: "malformed" }] };
      return resolveLatestValidExperienceSave(stored.candidates, query, validatePayload);
    },
    write(draft) {
      if (!nonEmptyString(draft.experienceId) || !nonEmptyString(draft.subjectId) || !nonEmptyString(draft.idempotencyKey)) {
        return { status: "rejected", reason: "Checkpoint identity is incomplete." };
      }
      const key = storageKey(draft.experienceId, draft.subjectId);
      const stored = parseStoredCandidates(storage, key);
      if (stored.error) return { status: "rejected", reason: stored.error };

      const duplicate = stored.candidates.find((candidate) => isDuplicateCheckpoint(candidate, draft));
      if (duplicate && isDuplicateCheckpoint(duplicate, draft)) return { status: "duplicate", checkpoint: duplicate };

      const revision = stored.candidates.reduce<number>((highest, candidate) =>
        isRecord(candidate) && Number.isSafeInteger(candidate.revision as number)
          ? Math.max(highest, Number(candidate.revision))
          : highest,
      0) + 1;
      const checkpoint: ExperienceCheckpointV1<typeof draft.payload> = {
        contractVersion: EXPERIENCE_SAVE_CONTRACT_VERSION,
        ...draft,
        checkpointId: createId(),
        revision,
        savedAt: now().toISOString(),
      };
      const retained = [...stored.candidates, checkpoint].slice(-DEVELOPMENT_SAVE_RETENTION_LIMIT);
      try {
        storage.setItem(key, JSON.stringify(retained));
        return { status: "accepted", checkpoint };
      } catch {
        return { status: "rejected", reason: "Saved progress could not be written; the previous checkpoint remains intact." };
      }
    },
    clear(query) {
      storage.removeItem(storageKey(query.experienceId, query.subjectId));
    },
  };
}

export function canPersistExperiencePreview(context: ExperienceRuntimeAuthoritativeContextV1): boolean {
  return context.access.status === "authorized" && nonEmptyString(context.access.subjectId);
}

export function withExperienceSaveResolution<TPayload>(
  context: ExperienceRuntimeAuthoritativeContextV1,
  resolution: ExperienceSaveResolution<TPayload>,
): ExperienceRuntimeAuthoritativeContextV1 {
  if (resolution.status === "available") {
    return {
      ...context,
      resume: {
        status: "available",
        checkpointId: resolution.checkpoint.checkpointId,
        schemaVersion: resolution.checkpoint.schemaVersion,
        savedAt: resolution.checkpoint.savedAt,
        source: "development-preview",
        payload: resolution.checkpoint.payload,
      },
    };
  }
  if (resolution.status === "incompatible") {
    return {
      ...context,
      resume: { status: "incompatible", reason: resolution.reason, source: "development-preview" },
    };
  }
  return { ...context, resume: { status: "none" } };
}
