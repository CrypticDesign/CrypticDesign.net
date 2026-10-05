import {
  AccountAdministrationError,
  authorizeAccountAdministrationDiagnostics,
  authorizeAccountInspection,
  type OperatorAction,
  type OperatorCapability,
} from "./account-administration.ts";

export type AccountAdministrationDiagnosticOperator = {
  accountId: string;
  status: "active" | "disabled";
  capabilities: readonly OperatorCapability[];
};

export type AccountAdministrationDiagnosticCommand = {
  requestId: string;
  action: OperatorAction;
  operatorAccountId: string;
  targetAccountId: string;
  targetCharacterId: string | null;
  status: "pending" | "succeeded" | "failed";
  resultCode: string | null;
  requestedAt: string;
  reconciliationStartedAt: string | null;
  reconciliationAttemptCount: number;
  completedAt: string | null;
};

export type AccountAdministrationDiagnosticEvent = {
  eventType: "claimed" | "reconciliation_started" | "succeeded" | "failed";
  resultCode: string;
  attemptNumber: number;
  occurredAt: string;
};

export type AccountAdministrationDiagnosticNextStep =
  | "completed"
  | "waiting_initial_lease"
  | "waiting_reconciliation_lease"
  | "retry_same_request"
  | "waiting_for_completion"
  | "manual_review";

export type AccountAdministrationCommandDiagnostics = {
  inspectedAt: string;
  command: Omit<AccountAdministrationDiagnosticCommand, "operatorAccountId">;
  reconciliation: {
    attemptCount: number;
    leaseExpiresAt: string | null;
    nextStep: AccountAdministrationDiagnosticNextStep;
  };
  events: AccountAdministrationDiagnosticEvent[];
};

export type AccountAdministrationDiagnosticDependencies = {
  loadOperator(accountId: string): Promise<AccountAdministrationDiagnosticOperator | null>;
  loadCommand(requestId: string): Promise<AccountAdministrationDiagnosticCommand | null>;
  loadEvents(requestId: string): Promise<AccountAdministrationDiagnosticEvent[]>;
};

const RECONCILIATION_LEASE_MILLISECONDS = 2 * 60 * 1000;

function leaseExpiresAt(command: AccountAdministrationDiagnosticCommand): string | null {
  if (command.status !== "pending") return null;
  const basis = command.reconciliationStartedAt ?? command.requestedAt;
  const timestamp = Date.parse(basis);
  return Number.isFinite(timestamp) ? new Date(timestamp + RECONCILIATION_LEASE_MILLISECONDS).toISOString() : null;
}

function nextStep(command: AccountAdministrationDiagnosticCommand, now: string): AccountAdministrationDiagnosticNextStep {
  if (command.status !== "pending") return "completed";
  const accountAction = command.action === "suspend_account" || command.action === "restore_account";
  const expiresAt = leaseExpiresAt(command);
  if (!accountAction) {
    const requestedAt = Date.parse(command.requestedAt);
    return Number.isFinite(requestedAt) && Date.parse(now) < requestedAt + RECONCILIATION_LEASE_MILLISECONDS
      ? "waiting_for_completion"
      : "manual_review";
  }
  if (!expiresAt || Date.parse(now) >= Date.parse(expiresAt)) return "retry_same_request";
  return command.reconciliationStartedAt ? "waiting_reconciliation_lease" : "waiting_initial_lease";
}

export async function inspectAccountAdministrationCommandDiagnostics(
  input: { operatorAccountId: string; requestId: string; now: string },
  dependencies: AccountAdministrationDiagnosticDependencies,
): Promise<AccountAdministrationCommandDiagnostics> {
  const operator = await dependencies.loadOperator(input.operatorAccountId);
  if (!operator || operator.accountId !== input.operatorAccountId) {
    throw new AccountAdministrationError("Operator authorization denied", "forbidden");
  }
  const principal = { ...operator, authenticatedAt: input.now };
  authorizeAccountAdministrationDiagnostics({ principal, requestId: input.requestId, now: input.now });

  const command = await dependencies.loadCommand(input.requestId);
  if (!command || command.requestId !== input.requestId || command.operatorAccountId !== input.operatorAccountId) {
    throw new AccountAdministrationError("Account administration command was not found", "invalid");
  }
  authorizeAccountInspection({ principal, targetAccountId: command.targetAccountId, now: input.now });

  const events = await dependencies.loadEvents(input.requestId);
  const expiresAt = leaseExpiresAt(command);
  const safeCommand: AccountAdministrationCommandDiagnostics["command"] = {
    requestId: command.requestId,
    action: command.action,
    targetAccountId: command.targetAccountId,
    targetCharacterId: command.targetCharacterId,
    status: command.status,
    resultCode: command.resultCode,
    requestedAt: command.requestedAt,
    reconciliationStartedAt: command.reconciliationStartedAt,
    reconciliationAttemptCount: command.reconciliationAttemptCount,
    completedAt: command.completedAt,
  };
  return {
    inspectedAt: input.now,
    command: safeCommand,
    reconciliation: {
      attemptCount: command.reconciliationAttemptCount,
      leaseExpiresAt: expiresAt,
      nextStep: nextStep(command, input.now),
    },
    events,
  };
}
