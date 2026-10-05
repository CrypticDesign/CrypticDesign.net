import {
  AccountAdministrationError,
  authorizeAccountInspection,
  type OperatorCapability,
} from "./account-administration.ts";

export type AccountInspectionOperator = {
  accountId: string;
  status: "active" | "disabled";
  capabilities: readonly OperatorCapability[];
};

export type AccountInspectionAccount = {
  id: string;
  email: string | null;
  emailVerified: boolean;
  status: "active" | "suspended";
  createdAt: string;
  lastSignInAt: string | null;
};

export type AccountInspectionCharacter = {
  id: string;
  name: string;
  handle: string;
  status: "active" | "suspended" | "retired";
  presence: "offline" | "available" | "away";
  discoverable: boolean;
  visibility: "private" | "public";
  publicationConsent: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AccountAdministrationInspection = {
  inspectionId: string;
  inspectedAt: string;
  protectedTarget: boolean;
  account: AccountInspectionAccount;
  character: AccountInspectionCharacter | null;
};

export type AccountInspectionAuditEvent = {
  inspectionId: string;
  operatorAccountId: string;
  targetAccountId: string;
  targetCharacterId: string | null;
};

export type AccountAdministrationInspectionDependencies = {
  loadOperator(accountId: string): Promise<AccountInspectionOperator | null>;
  loadAccount(accountId: string, now: string): Promise<AccountInspectionAccount | null>;
  isProtectedTarget(accountId: string): Promise<boolean>;
  loadCharacter(accountId: string): Promise<AccountInspectionCharacter | null>;
  recordInspection(event: AccountInspectionAuditEvent): Promise<{ inspectionId: string; occurredAt: string }>;
};

export async function inspectAccountAdministrationTarget(
  input: { inspectionId: string; operatorAccountId: string; targetAccountId: string; now: string },
  dependencies: AccountAdministrationInspectionDependencies,
): Promise<AccountAdministrationInspection> {
  const operator = await dependencies.loadOperator(input.operatorAccountId);
  if (!operator || operator.accountId !== input.operatorAccountId) {
    throw new AccountAdministrationError("Operator authorization denied", "forbidden");
  }
  authorizeAccountInspection({
    principal: { ...operator, authenticatedAt: input.now },
    targetAccountId: input.targetAccountId,
    now: input.now,
  });

  const account = await dependencies.loadAccount(input.targetAccountId, input.now);
  if (!account || account.id !== input.targetAccountId) {
    throw new AccountAdministrationError("Target account was not found", "invalid");
  }
  const [protectedTarget, character] = await Promise.all([
    dependencies.isProtectedTarget(input.targetAccountId),
    dependencies.loadCharacter(input.targetAccountId),
  ]);
  try {
    const audit = await dependencies.recordInspection({
      inspectionId: input.inspectionId,
      operatorAccountId: input.operatorAccountId,
      targetAccountId: input.targetAccountId,
      targetCharacterId: character?.id ?? null,
    });
    if (
      audit.inspectionId !== input.inspectionId ||
      !Number.isFinite(Date.parse(audit.occurredAt))
    ) throw new Error("Inspection audit returned invalid data");
    return {
      inspectionId: audit.inspectionId,
      inspectedAt: audit.occurredAt,
      protectedTarget,
      account,
      character,
    };
  } catch {
    throw new AccountAdministrationError(
      "Account inspection was blocked because durable audit recording failed",
      "audit_incomplete",
    );
  }
}
