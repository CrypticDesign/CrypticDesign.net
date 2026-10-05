export type OperatorFixtureAccount = {
  id: string;
  email: string;
  emailVerified: boolean;
  status: "active" | "suspended";
  protectedTarget: boolean;
  createdAt: string;
  lastSignInAt: string | null;
  character: {
    id: string;
    name: string;
    handle: string;
    status: "active" | "suspended" | "retired";
    presence: "offline" | "available" | "away";
    visibility: "private" | "public";
  } | null;
};

export type OperatorFixtureCommand = {
  requestId: string;
  targetAccountId: string;
  action: "suspend_account" | "restore_account" | "suspend_character";
  status: "pending" | "succeeded" | "failed";
  resultCode: string | null;
  requestedAt: string;
  nextStep: "retry_same_request" | "completed" | "manual_review";
  events: Array<{ label: string; resultCode: string; occurredAt: string }>;
};

export type OperatorFixtureInspection = {
  inspectionId: string;
  targetAccountId: string;
  targetCharacterId: string | null;
  projection: "account_administration_summary_v1";
  occurredAt: string;
};

export const OPERATOR_FIXTURE_ACCOUNTS: readonly OperatorFixtureAccount[] = [
  {
    id: "20000000-0000-4000-8000-000000000002",
    email: "nova.member@example.test",
    emailVerified: true,
    status: "active",
    protectedTarget: false,
    createdAt: "2026-05-12T14:20:00.000Z",
    lastSignInAt: "2026-09-29T13:48:00.000Z",
    character: {
      id: "30000000-0000-4000-8000-000000000003",
      name: "Nova Vale",
      handle: "nova-vale",
      status: "active",
      presence: "away",
      visibility: "private",
    },
  },
  {
    id: "21000000-0000-4000-8000-000000000012",
    email: "orion.suspended@example.test",
    emailVerified: true,
    status: "suspended",
    protectedTarget: true,
    createdAt: "2026-04-03T09:15:00.000Z",
    lastSignInAt: "2026-09-27T22:11:00.000Z",
    character: {
      id: "31000000-0000-4000-8000-000000000013",
      name: "Orion Kade",
      handle: "orion-kade",
      status: "suspended",
      presence: "offline",
      visibility: "private",
    },
  },
  {
    id: "22000000-0000-4000-8000-000000000022",
    email: "new.member@example.test",
    emailVerified: false,
    status: "active",
    protectedTarget: false,
    createdAt: "2026-09-28T17:05:00.000Z",
    lastSignInAt: null,
    character: null,
  },
] as const;

export const OPERATOR_FIXTURE_COMMANDS: readonly OperatorFixtureCommand[] = [
  {
    requestId: "fixture-command-0001",
    targetAccountId: "20000000-0000-4000-8000-000000000002",
    action: "suspend_account",
    status: "pending",
    resultCode: null,
    requestedAt: "2026-09-29T13:54:00.000Z",
    nextStep: "retry_same_request",
    events: [
      { label: "Claimed", resultCode: "OPERATOR_ACTION_CLAIMED", occurredAt: "2026-09-29T13:54:00.000Z" },
      { label: "Reconciliation started", resultCode: "ACCOUNT_ACTION_RECONCILIATION_STARTED", occurredAt: "2026-09-29T13:57:00.000Z" },
    ],
  },
  {
    requestId: "fixture-command-0002",
    targetAccountId: "21000000-0000-4000-8000-000000000012",
    action: "suspend_character",
    status: "succeeded",
    resultCode: "CHARACTER_SUSPENDED",
    requestedAt: "2026-09-28T19:10:00.000Z",
    nextStep: "completed",
    events: [
      { label: "Claimed", resultCode: "OPERATOR_ACTION_CLAIMED", occurredAt: "2026-09-28T19:10:00.000Z" },
      { label: "Succeeded", resultCode: "CHARACTER_SUSPENDED", occurredAt: "2026-09-28T19:10:02.000Z" },
    ],
  },
] as const;

export const OPERATOR_FIXTURE_INSPECTIONS: readonly OperatorFixtureInspection[] = [
  {
    inspectionId: "40000000-0000-4000-8000-000000000004",
    targetAccountId: "20000000-0000-4000-8000-000000000002",
    targetCharacterId: "30000000-0000-4000-8000-000000000003",
    projection: "account_administration_summary_v1",
    occurredAt: "2026-09-29T14:02:00.000Z",
  },
  {
    inspectionId: "41000000-0000-4000-8000-000000000014",
    targetAccountId: "21000000-0000-4000-8000-000000000012",
    targetCharacterId: "31000000-0000-4000-8000-000000000013",
    projection: "account_administration_summary_v1",
    occurredAt: "2026-09-29T13:42:00.000Z",
  },
  {
    inspectionId: "42000000-0000-4000-8000-000000000024",
    targetAccountId: "22000000-0000-4000-8000-000000000022",
    targetCharacterId: null,
    projection: "account_administration_summary_v1",
    occurredAt: "2026-09-28T18:08:00.000Z",
  },
] as const;
