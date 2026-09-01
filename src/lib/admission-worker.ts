import { timingSafeEqual } from "node:crypto";

export type AdmissionOutboxCommand =
  | "invite_auth_user"
  | "reconcile_auth_invite"
  | "disable_unaccepted_auth_user";

export type AdmissionOutboxJob = {
  outbox_id: string;
  invitation_id: string;
  command_type: AdmissionOutboxCommand;
  idempotency_key: string;
  attempt_count: number;
  normalized_email: string;
  auth_user_id: string | null;
  gates_open: boolean;
};

type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

type RpcResult<T> = { data: T; error: { message?: string } | null };

export type AdmissionWorkerDependencies = {
  claim(workerId: string, limit: number): Promise<RpcResult<unknown>>;
  completeInvite(outboxId: string, authUserId: string, resultCode: string): Promise<RpcResult<unknown>>;
  completeDisable(outboxId: string, resultCode: string): Promise<RpcResult<unknown>>;
  fail(outboxId: string, resultCode: string, retryable: boolean): Promise<RpcResult<unknown>>;
  listUsers(page: number, perPage: number): Promise<{
    users: AuthUser[];
    nextPage: number | null;
    error: unknown | null;
  }>;
  getUser(userId: string): Promise<{ user: AuthUser | null; error: unknown | null }>;
  invite(email: string, invitationId: string, redirectTo: string): Promise<{
    user: AuthUser | null;
    error: unknown | null;
  }>;
  disable(userId: string): Promise<{ error: unknown | null }>;
};

export type AdmissionWorkerSummary = {
  claimed: number;
  completed: number;
  retryScheduled: number;
  failed: number;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_AUTH_USER_PAGES = 100;
const AUTH_USERS_PER_PAGE = 1000;

export function admissionWorkerConfigured(): boolean {
  return (
    process.env.ACCOUNT_ADMISSION_MODE?.trim() === "invitation" &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) &&
    Boolean(process.env.ADMISSION_WORKER_SECRET?.trim()) &&
    Boolean(process.env.ADMISSION_INVITE_REDIRECT_URL?.trim())
  );
}

export function authorizeAdmissionWorker(authorization: string | null): boolean {
  const configured = process.env.ADMISSION_WORKER_SECRET?.trim();
  if (!configured || configured.length < 32 || !authorization?.startsWith("Bearer ")) return false;
  const supplied = authorization.slice("Bearer ".length);
  const expectedBuffer = Buffer.from(configured, "utf8");
  const suppliedBuffer = Buffer.from(supplied, "utf8");
  return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer);
}

function isJob(value: unknown): value is AdmissionOutboxJob {
  if (!value || typeof value !== "object") return false;
  const job = value as Partial<AdmissionOutboxJob>;
  return (
    typeof job.outbox_id === "string" && UUID.test(job.outbox_id) &&
    typeof job.invitation_id === "string" && UUID.test(job.invitation_id) &&
    ["invite_auth_user", "reconcile_auth_invite", "disable_unaccepted_auth_user"].includes(job.command_type ?? "") &&
    typeof job.idempotency_key === "string" && job.idempotency_key.length > 0 &&
    typeof job.attempt_count === "number" && Number.isInteger(job.attempt_count) &&
    typeof job.normalized_email === "string" && job.normalized_email === job.normalized_email.trim().toLowerCase() &&
    (job.auth_user_id === null || (typeof job.auth_user_id === "string" && UUID.test(job.auth_user_id))) &&
    typeof job.gates_open === "boolean"
  );
}

function ownsInvitation(user: AuthUser, invitationId: string): boolean {
  return user.user_metadata?.admission_invitation_id === invitationId;
}

async function findAuthUser(
  deps: AdmissionWorkerDependencies,
  email: string,
  invitationId: string,
): Promise<{ kind: "owned"; user: AuthUser } | { kind: "collision" } | { kind: "missing" } | { kind: "error" }> {
  for (let page = 1; page <= MAX_AUTH_USER_PAGES; page += 1) {
    const result = await deps.listUsers(page, AUTH_USERS_PER_PAGE);
    if (result.error) return { kind: "error" };
    const matching = result.users.find((user) => user.email?.trim().toLowerCase() === email);
    if (matching) return ownsInvitation(matching, invitationId) ? { kind: "owned", user: matching } : { kind: "collision" };
    if (!result.nextPage) return { kind: "missing" };
  }
  return { kind: "error" };
}

async function recordFailure(
  deps: AdmissionWorkerDependencies,
  job: AdmissionOutboxJob,
  resultCode: string,
  retryable: boolean,
  summary: AdmissionWorkerSummary,
) {
  const result = await deps.fail(job.outbox_id, resultCode, retryable);
  if (result.error || !retryable || job.attempt_count >= 5) summary.failed += 1;
  else summary.retryScheduled += 1;
}

async function finalizeInvite(
  deps: AdmissionWorkerDependencies,
  job: AdmissionOutboxJob,
  user: AuthUser,
  resultCode: string,
  summary: AdmissionWorkerSummary,
) {
  if (!UUID.test(user.id)) {
    await recordFailure(deps, job, "AUTH_INVITE_INVALID_USER", true, summary);
    return;
  }
  const finalized = await deps.completeInvite(job.outbox_id, user.id, resultCode);
  if (finalized.error) {
    await recordFailure(deps, job, "LOCAL_FINALIZE_FAILED", true, summary);
    return;
  }
  summary.completed += 1;
}

async function processInvite(
  deps: AdmissionWorkerDependencies,
  job: AdmissionOutboxJob,
  redirectTo: string,
  summary: AdmissionWorkerSummary,
) {
  const existing = await findAuthUser(deps, job.normalized_email, job.invitation_id);
  if (existing.kind === "error") {
    await recordFailure(deps, job, "AUTH_RECONCILE_FAILED", true, summary);
    return;
  }
  if (existing.kind === "collision") {
    await recordFailure(deps, job, "AUTH_EMAIL_COLLISION", false, summary);
    return;
  }
  if (existing.kind === "owned") {
    await finalizeInvite(deps, job, existing.user, "AUTH_USER_RECONCILED", summary);
    return;
  }

  const invited = await deps.invite(job.normalized_email, job.invitation_id, redirectTo);
  if (!invited.error && invited.user) {
    await finalizeInvite(deps, job, invited.user, "AUTH_USER_INVITED", summary);
    return;
  }

  // A network timeout can hide a successful Auth write. Reconcile once before
  // scheduling a retry so a second email is never sent blindly.
  const afterFailure = await findAuthUser(deps, job.normalized_email, job.invitation_id);
  if (afterFailure.kind === "owned") {
    await finalizeInvite(deps, job, afterFailure.user, "AUTH_USER_RECONCILED_AFTER_ERROR", summary);
  } else if (afterFailure.kind === "collision") {
    await recordFailure(deps, job, "AUTH_EMAIL_COLLISION", false, summary);
  } else {
    await recordFailure(deps, job, "AUTH_INVITE_FAILED", true, summary);
  }
}

async function processDisable(
  deps: AdmissionWorkerDependencies,
  job: AdmissionOutboxJob,
  summary: AdmissionWorkerSummary,
) {
  if (!job.auth_user_id) {
    await recordFailure(deps, job, "AUTH_USER_ID_MISSING", false, summary);
    return;
  }
  const lookup = await deps.getUser(job.auth_user_id);
  if (lookup.error) {
    await recordFailure(deps, job, "AUTH_USER_LOOKUP_FAILED", true, summary);
    return;
  }
  if (!lookup.user || !ownsInvitation(lookup.user, job.invitation_id)) {
    await recordFailure(deps, job, "AUTH_USER_OWNERSHIP_MISMATCH", false, summary);
    return;
  }
  const disabled = await deps.disable(job.auth_user_id);
  if (disabled.error) {
    await recordFailure(deps, job, "AUTH_DISABLE_FAILED", true, summary);
    return;
  }
  const completed = await deps.completeDisable(job.outbox_id, "AUTH_USER_BANNED");
  if (completed.error) {
    await recordFailure(deps, job, "LOCAL_DISABLE_FINALIZE_FAILED", true, summary);
    return;
  }
  summary.completed += 1;
}

export async function processAdmissionOutboxBatch(
  deps: AdmissionWorkerDependencies,
  options: { workerId: string; limit: number; redirectTo: string },
): Promise<AdmissionWorkerSummary> {
  const limit = Math.max(1, Math.min(10, Math.trunc(options.limit)));
  const summary: AdmissionWorkerSummary = { claimed: 0, completed: 0, retryScheduled: 0, failed: 0 };
  const claimed = await deps.claim(options.workerId, limit);
  if (claimed.error) throw new Error("Admission outbox claim failed");
  if (!Array.isArray(claimed.data) || !claimed.data.every(isJob)) throw new Error("Admission outbox returned invalid data");
  summary.claimed = claimed.data.length;
  for (const job of claimed.data) {
    if (!job.gates_open) await recordFailure(deps, job, "ELIGIBILITY_GATE_CLOSED", false, summary);
    else if (job.command_type === "disable_unaccepted_auth_user") await processDisable(deps, job, summary);
    else await processInvite(deps, job, options.redirectTo, summary);
  }
  return summary;
}
