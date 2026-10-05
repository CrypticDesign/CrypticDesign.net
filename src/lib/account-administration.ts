import { createHash } from "node:crypto";

export const OPERATOR_ACTIONS = [
  "suspend_account",
  "restore_account",
  "revoke_sessions",
  "suspend_character",
  "restore_character",
] as const;

export type OperatorAction = (typeof OPERATOR_ACTIONS)[number];
export type OperatorCapability =
  | "account:inspect"
  | "account:suspend"
  | "account:restore"
  | "account:revoke_sessions"
  | "character:suspend"
  | "character:restore"
  | "protected_targets:mutate";

export interface OperatorPrincipal {
  accountId: string;
  status: "active" | "disabled";
  capabilities: readonly OperatorCapability[];
  authenticatedAt: string;
}

export interface AdministrationTarget {
  accountId: string;
  protected: boolean;
  accountStatus: "active" | "suspended";
  character: {
    id: string;
    status: "active" | "suspended" | "retired";
  } | null;
}

export interface OperatorCommand {
  requestId: string;
  action: OperatorAction;
  targetAccountId: string;
  targetCharacterId?: string;
  reason: string;
  confirmation: string;
}

export interface AuthorizedOperatorCommand {
  requestId: string;
  fingerprint: string;
  action: OperatorAction;
  operatorAccountId: string;
  targetAccountId: string;
  targetCharacterId: string | null;
  reason: string;
  requestedAt: string;
}

export type OperatorCommandOutcome =
  | { status: "pending"; resultCode: string }
  | { status: "succeeded" | "failed"; resultCode: string };

export type OperatorCommandClaim =
  | { kind: "claimed" }
  | { kind: "reconcile" }
  | { kind: "in_progress" }
  | { kind: "replay"; fingerprint: string; outcome: OperatorCommandOutcome }
  | { kind: "collision" }
  | { kind: "target_busy" };

export interface AccountAdministrationDependencies {
  claim(plan: AuthorizedOperatorCommand): Promise<OperatorCommandClaim>;
  apply(plan: AuthorizedOperatorCommand): Promise<{ resultCode: string }>;
  complete(plan: AuthorizedOperatorCommand, outcome: Exclude<OperatorCommandOutcome, { status: "pending" }>): Promise<void>;
}

export class AccountAdministrationError extends Error {
  readonly code: "forbidden" | "invalid" | "conflict" | "audit_incomplete";

  constructor(
    message: string,
    code: "forbidden" | "invalid" | "conflict" | "audit_incomplete",
  ) {
    super(message);
    this.code = code;
  }
}

export class AccountAdministrationEffectError extends Error {
  readonly resultCode: string;
  readonly retryable: boolean;

  constructor(message: string, resultCode: string, retryable = false) {
    super(message);
    this.resultCode = resultCode;
    this.retryable = retryable;
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REQUEST_ID = /^[A-Za-z0-9][A-Za-z0-9:_-]{15,127}$/;
const RECENT_AUTHENTICATION_MILLISECONDS = 15 * 60 * 1000;

const requiredCapability: Record<OperatorAction, OperatorCapability> = {
  suspend_account: "account:suspend",
  restore_account: "account:restore",
  revoke_sessions: "account:revoke_sessions",
  suspend_character: "character:suspend",
  restore_character: "character:restore",
};

function requireUuid(value: string, field: string) {
  if (!UUID.test(value)) throw new AccountAdministrationError(`${field} must be a UUID`, "invalid");
}

function requireActiveOperator(principal: OperatorPrincipal, capability: OperatorCapability, now: string) {
  requireUuid(principal.accountId, "Operator account");
  if (principal.status !== "active" || !principal.capabilities.includes(capability)) {
    throw new AccountAdministrationError("Operator authorization denied", "forbidden");
  }
  const authenticatedAt = Date.parse(principal.authenticatedAt);
  const currentTime = Date.parse(now);
  if (!Number.isFinite(authenticatedAt) || !Number.isFinite(currentTime) || authenticatedAt > currentTime + 60_000 || currentTime - authenticatedAt > RECENT_AUTHENTICATION_MILLISECONDS) {
    throw new AccountAdministrationError("Recent operator authentication is required", "forbidden");
  }
}

export function authorizeAccountInspection(input: { principal: OperatorPrincipal; targetAccountId: string; now: string }) {
  requireActiveOperator(input.principal, "account:inspect", input.now);
  requireUuid(input.targetAccountId, "Target account");
  return { operatorAccountId: input.principal.accountId, targetAccountId: input.targetAccountId };
}

export function authorizeAccountAdministrationDiagnostics(input: {
  principal: OperatorPrincipal;
  requestId: string;
  now: string;
}) {
  requireActiveOperator(input.principal, "account:inspect", input.now);
  if (!REQUEST_ID.test(input.requestId)) {
    throw new AccountAdministrationError("A bounded command request ID is required", "invalid");
  }
  return { operatorAccountId: input.principal.accountId, requestId: input.requestId };
}

export function authorizeAccountAdministrationInspectionHistory(input: {
  principal: OperatorPrincipal;
  now: string;
}) {
  requireActiveOperator(input.principal, "account:inspect", input.now);
  return { operatorAccountId: input.principal.accountId };
}

function fingerprint(command: Omit<AuthorizedOperatorCommand, "fingerprint" | "requestedAt">) {
  return createHash("sha256").update(JSON.stringify(command)).digest("hex");
}

function isCharacterAction(action: OperatorAction) {
  return action === "suspend_character" || action === "restore_character";
}

export function planAccountAdministrationCommand(input: {
  principal: OperatorPrincipal;
  command: OperatorCommand;
  target: AdministrationTarget;
  now: string;
  allowIdempotentAccountState?: boolean;
}): AuthorizedOperatorCommand {
  const { principal, command, target, now } = input;
  if (!OPERATOR_ACTIONS.includes(command.action)) throw new AccountAdministrationError("Unknown operator action", "invalid");
  requireActiveOperator(principal, requiredCapability[command.action], now);
  requireUuid(command.targetAccountId, "Target account");
  requireUuid(target.accountId, "Loaded target account");
  if (target.accountId !== command.targetAccountId) throw new AccountAdministrationError("Loaded target does not match the command", "forbidden");
  if (principal.accountId === target.accountId) throw new AccountAdministrationError("Operators cannot mutate their own account", "forbidden");
  if (target.protected && !principal.capabilities.includes("protected_targets:mutate")) {
    throw new AccountAdministrationError("Protected target authorization denied", "forbidden");
  }
  if (!REQUEST_ID.test(command.requestId)) throw new AccountAdministrationError("A bounded idempotency request ID is required", "invalid");
  const reason = command.reason.trim();
  if (reason.length < 12 || reason.length > 500) throw new AccountAdministrationError("A specific operator reason between 12 and 500 characters is required", "invalid");

  const characterAction = isCharacterAction(command.action);
  let targetCharacterId: string | null = null;
  if (characterAction) {
    if (!command.targetCharacterId) throw new AccountAdministrationError("Character target is required", "invalid");
    requireUuid(command.targetCharacterId, "Target character");
    if (!target.character || target.character.id !== command.targetCharacterId) {
      throw new AccountAdministrationError("Character does not belong to the target account", "forbidden");
    }
    targetCharacterId = command.targetCharacterId;
  } else if (command.targetCharacterId) {
    throw new AccountAdministrationError("Account actions cannot include a Character target", "invalid");
  }

  const confirmationTarget = targetCharacterId ?? target.accountId;
  if (command.confirmation !== `${command.action}:${confirmationTarget}`) {
    throw new AccountAdministrationError("Exact action confirmation is required", "invalid");
  }
  if (command.action === "suspend_account" && target.accountStatus !== "active" && !input.allowIdempotentAccountState) throw new AccountAdministrationError("Account is not active", "conflict");
  if (command.action === "restore_account" && target.accountStatus !== "suspended" && !input.allowIdempotentAccountState) throw new AccountAdministrationError("Account is not suspended", "conflict");
  if (command.action === "suspend_character" && target.character?.status !== "active") throw new AccountAdministrationError("Character is not active", "conflict");
  if (command.action === "restore_character" && target.character?.status !== "suspended") throw new AccountAdministrationError("Character is not suspended", "conflict");

  const fingerprintInput = {
    requestId: command.requestId,
    action: command.action,
    operatorAccountId: principal.accountId,
    targetAccountId: target.accountId,
    targetCharacterId,
    reason,
  };
  const unsigned = {
    ...fingerprintInput,
    requestedAt: now,
  };
  return { ...unsigned, fingerprint: fingerprint(fingerprintInput) };
}

export async function executeAccountAdministrationCommand(
  plan: AuthorizedOperatorCommand,
  dependencies: AccountAdministrationDependencies,
): Promise<OperatorCommandOutcome> {
  const claim = await dependencies.claim(plan);
  if (claim.kind === "collision" || (claim.kind === "replay" && claim.fingerprint !== plan.fingerprint)) {
    throw new AccountAdministrationError("Idempotency key was reused for another operator command", "conflict");
  }
  if (claim.kind === "target_busy") {
    throw new AccountAdministrationError("Another account administration command is pending for this target", "conflict");
  }
  if (claim.kind === "in_progress") return { status: "pending", resultCode: "OPERATOR_ACTION_IN_PROGRESS" };
  if (claim.kind === "replay") return claim.outcome;

  let outcome: Exclude<OperatorCommandOutcome, { status: "pending" }>;
  try {
    const result = await dependencies.apply(plan);
    outcome = { status: "succeeded", resultCode: result.resultCode };
  } catch (error) {
    if (claim.kind === "reconcile" || (error instanceof AccountAdministrationEffectError && error.retryable)) {
      return {
        status: "pending",
        resultCode: claim.kind === "reconcile"
          ? "OPERATOR_ACTION_RECONCILIATION_RETRY_REQUIRED"
          : "OPERATOR_ACTION_RECONCILIATION_REQUIRED",
      };
    }
    outcome = {
      status: "failed",
      resultCode: error instanceof AccountAdministrationEffectError
        ? error.resultCode
        : "OPERATOR_ACTION_FAILED",
    };
  }
  try {
    await dependencies.complete(plan, outcome);
  } catch {
    throw new AccountAdministrationError("Operator action completed without durable audit finalization", "audit_incomplete");
  }
  return outcome;
}
