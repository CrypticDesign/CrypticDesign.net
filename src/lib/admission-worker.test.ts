import assert from "node:assert/strict";
import test from "node:test";
import {
  authorizeAdmissionWorker,
  processAdmissionOutboxBatch,
  type AdmissionOutboxJob,
  type AdmissionWorkerDependencies,
} from "./admission-worker.ts";

const invitationId = "11111111-1111-4111-8111-111111111111";
const outboxId = "22222222-2222-4222-8222-222222222222";
const authUserId = "33333333-3333-4333-8333-333333333333";

function job(command: AdmissionOutboxJob["command_type"] = "invite_auth_user"): AdmissionOutboxJob {
  return {
    outbox_id: outboxId,
    invitation_id: invitationId,
    command_type: command,
    idempotency_key: "test-command",
    attempt_count: 1,
    normalized_email: "person@example.com",
    auth_user_id: command === "disable_unaccepted_auth_user" ? authUserId : null,
    gates_open: true,
  };
}

function dependencies(overrides: Partial<AdmissionWorkerDependencies> = {}): AdmissionWorkerDependencies {
  return {
    claim: async () => ({ data: [job()], error: null }),
    completeInvite: async () => ({ data: "AUTH_INVITED", error: null }),
    completeDisable: async () => ({ data: "AUTH_USER_DISABLED", error: null }),
    fail: async () => ({ data: "RETRY_SCHEDULED", error: null }),
    listUsers: async () => ({ users: [], nextPage: null, error: null }),
    getUser: async () => ({ user: null, error: null }),
    invite: async () => ({
      user: { id: authUserId, email: "person@example.com", user_metadata: { admission_invitation_id: invitationId } },
      error: null,
    }),
    disable: async () => ({ error: null }),
    ...overrides,
  };
}

test("worker authorization is fail-closed and timing-safe compatible", () => {
  const prior = process.env.ADMISSION_WORKER_SECRET;
  process.env.ADMISSION_WORKER_SECRET = "a".repeat(32);
  try {
    assert.equal(authorizeAdmissionWorker(null), false);
    assert.equal(authorizeAdmissionWorker("Bearer short"), false);
    assert.equal(authorizeAdmissionWorker(`Bearer ${"a".repeat(32)}`), true);
  } finally {
    if (prior === undefined) delete process.env.ADMISSION_WORKER_SECRET;
    else process.env.ADMISSION_WORKER_SECRET = prior;
  }
});

test("worker invites an absent user with invitation ownership metadata", async () => {
  let invitationMetadata = "";
  const summary = await processAdmissionOutboxBatch(dependencies({
    invite: async (_email, metadata) => {
      invitationMetadata = metadata;
      return { user: { id: authUserId }, error: null };
    },
  }), { workerId: "worker-a", limit: 5, redirectTo: "https://crypticdesign.net/account/accept-invitation" });
  assert.equal(invitationMetadata, invitationId);
  assert.deepEqual(summary, { claimed: 1, completed: 1, retryScheduled: 0, failed: 0 });
});

test("worker reconciles an owned Auth user without sending another invitation", async () => {
  let inviteCalls = 0;
  let completionCode = "";
  const summary = await processAdmissionOutboxBatch(dependencies({
    listUsers: async () => ({
      users: [{ id: authUserId, email: "Person@Example.com", user_metadata: { admission_invitation_id: invitationId } }],
      nextPage: null,
      error: null,
    }),
    invite: async () => { inviteCalls += 1; return { user: null, error: new Error("must not run") }; },
    completeInvite: async (_outbox, _user, code) => { completionCode = code; return { data: null, error: null }; },
  }), { workerId: "worker-a", limit: 5, redirectTo: "https://crypticdesign.net/account/accept-invitation" });
  assert.equal(inviteCalls, 0);
  assert.equal(completionCode, "AUTH_USER_RECONCILED");
  assert.equal(summary.completed, 1);
});

test("worker treats an unrelated Auth user with the same email as a terminal collision", async () => {
  let failure: { code: string; retryable: boolean } | null = null;
  const summary = await processAdmissionOutboxBatch(dependencies({
    listUsers: async () => ({ users: [{ id: authUserId, email: "person@example.com", user_metadata: {} }], nextPage: null, error: null }),
    fail: async (_id, code, retryable) => { failure = { code, retryable }; return { data: "FAILED", error: null }; },
  }), { workerId: "worker-a", limit: 5, redirectTo: "https://crypticdesign.net/account/accept-invitation" });
  assert.deepEqual(failure, { code: "AUTH_EMAIL_COLLISION", retryable: false });
  assert.equal(summary.failed, 1);
});

test("worker never touches Auth when the claimed authority gate is closed", async () => {
  let authCalls = 0;
  let failure: { code: string; retryable: boolean } | null = null;
  const closedJob = { ...job(), gates_open: false };
  const summary = await processAdmissionOutboxBatch(dependencies({
    claim: async () => ({ data: [closedJob], error: null }),
    listUsers: async () => { authCalls += 1; return { users: [], nextPage: null, error: null }; },
    invite: async () => { authCalls += 1; return { user: null, error: null }; },
    fail: async (_id, code, retryable) => { failure = { code, retryable }; return { data: "FAILED", error: null }; },
  }), { workerId: "worker-a", limit: 5, redirectTo: "https://crypticdesign.net/account/accept-invitation" });
  assert.equal(authCalls, 0);
  assert.deepEqual(failure, { code: "ELIGIBILITY_GATE_CLOSED", retryable: false });
  assert.equal(summary.failed, 1);
});

test("worker reconciles after an ambiguous invite error before retrying", async () => {
  let listCalls = 0;
  const summary = await processAdmissionOutboxBatch(dependencies({
    listUsers: async () => {
      listCalls += 1;
      return listCalls === 1
        ? { users: [], nextPage: null, error: null }
        : { users: [{ id: authUserId, email: "person@example.com", user_metadata: { admission_invitation_id: invitationId } }], nextPage: null, error: null };
    },
    invite: async () => ({ user: null, error: new Error("timeout") }),
  }), { workerId: "worker-a", limit: 5, redirectTo: "https://crypticdesign.net/account/accept-invitation" });
  assert.equal(listCalls, 2);
  assert.equal(summary.completed, 1);
  assert.equal(summary.retryScheduled, 0);
});

test("disable command verifies ownership before recoverably banning a user", async () => {
  let banCalls = 0;
  const summary = await processAdmissionOutboxBatch(dependencies({
    claim: async () => ({ data: [job("disable_unaccepted_auth_user")], error: null }),
    getUser: async () => ({ user: { id: authUserId, user_metadata: { admission_invitation_id: invitationId } }, error: null }),
    disable: async () => { banCalls += 1; return { error: null }; },
  }), { workerId: "worker-a", limit: 5, redirectTo: "https://crypticdesign.net/account/accept-invitation" });
  assert.equal(banCalls, 1);
  assert.equal(summary.completed, 1);
});
