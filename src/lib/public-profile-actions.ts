import { createHash } from "node:crypto";

export const PUBLIC_PROFILE_ACTIONS = ["follow", "appreciate", "save", "share"] as const;
export type PublicProfileAction = (typeof PUBLIC_PROFILE_ACTIONS)[number];

export type PublicActionDenialCode =
  | "feature_disabled"
  | "authentication_required"
  | "target_not_public"
  | "target_inactive"
  | "blocked"
  | "self_action_not_allowed"
  | "policy_restricted"
  | "share_restricted"
  | "rate_limited";

export interface ExternalInteractionPolicyDecision {
  policyVersion: string;
  mayInteract: boolean;
  mayShare: boolean;
  reasonCode: string | null;
}

export interface PublicActionContext {
  featureEnabled: boolean;
  actorAccountId: string | null;
  targetCharacterId: string;
  targetOwnerAccountId: string;
  targetPubliclyRenderable: boolean;
  targetActive: boolean;
  blockedAccountPairs: ReadonlyArray<readonly [string, string]>;
  externalPolicy: ExternalInteractionPolicyDecision;
  rateLimitRemaining: number;
}

export interface PublicActionDecision {
  allowed: boolean;
  action: PublicProfileAction;
  denialCode: PublicActionDenialCode | null;
  explanation: string;
  policyVersion: string;
}

export interface PublicActionEvidence {
  id: string;
  action: PublicProfileAction;
  actorAccountId: string;
  targetCharacterId: string;
  requestId: string;
  policyVersion: string;
  occurredAt: string;
  status: "accepted" | "corrected";
  correctsEvidenceId: string | null;
}

function denied(action: PublicProfileAction, context: PublicActionContext, denialCode: PublicActionDenialCode, explanation: string): PublicActionDecision {
  return { allowed: false, action, denialCode, explanation, policyVersion: context.externalPolicy.policyVersion };
}

export function authorizePublicProfileAction(action: PublicProfileAction, context: PublicActionContext): PublicActionDecision {
  if (!context.featureEnabled) return denied(action, context, "feature_disabled", "Public profile actions are not enabled");
  if (!context.actorAccountId) return denied(action, context, "authentication_required", "Authentication is required");
  if (!context.targetActive) return denied(action, context, "target_inactive", "The character is not active");
  if (!context.targetPubliclyRenderable) return denied(action, context, "target_not_public", "The character is not publicly renderable");
  const blocked = context.blockedAccountPairs.some(([left, right]) =>
    (left === context.actorAccountId && right === context.targetOwnerAccountId)
    || (right === context.actorAccountId && left === context.targetOwnerAccountId));
  if (blocked) return denied(action, context, "blocked", "Interaction is blocked");
  if (!context.externalPolicy.mayInteract) return denied(action, context, "policy_restricted", context.externalPolicy.reasonCode ?? "Interaction is restricted by policy");
  if (action === "share" && !context.externalPolicy.mayShare) return denied(action, context, "share_restricted", context.externalPolicy.reasonCode ?? "Sharing is restricted by policy");
  if ((action === "follow" || action === "appreciate") && context.actorAccountId === context.targetOwnerAccountId) return denied(action, context, "self_action_not_allowed", `A character owner cannot ${action} their own profile`);
  if (!Number.isSafeInteger(context.rateLimitRemaining) || context.rateLimitRemaining <= 0) return denied(action, context, "rate_limited", "The action rate limit has been reached");
  return { allowed: true, action, denialCode: null, explanation: "Action is permitted by the supplied policy decision", policyVersion: context.externalPolicy.policyVersion };
}

export class PublicActionEvidenceLedger {
  private readonly evidence: PublicActionEvidence[] = [];
  private readonly requests = new Map<string, PublicActionEvidence>();

  record(input: { decision: PublicActionDecision; actorAccountId: string; targetCharacterId: string; requestId: string; occurredAt: string }): PublicActionEvidence {
    if (!input.decision.allowed) throw new Error("Denied public actions cannot be recorded as accepted");
    const scope = `${input.actorAccountId}:${input.targetCharacterId}:${input.decision.action}:${input.requestId}`;
    const replay = this.requests.get(scope);
    if (replay) return structuredClone(replay);
    const id = `public_action_${createHash("sha256").update(scope).digest("hex").slice(0, 32)}`;
    const evidence: PublicActionEvidence = { id, action: input.decision.action, actorAccountId: input.actorAccountId, targetCharacterId: input.targetCharacterId, requestId: input.requestId, policyVersion: input.decision.policyVersion, occurredAt: input.occurredAt, status: "accepted", correctsEvidenceId: null };
    this.evidence.push(evidence);
    this.requests.set(scope, evidence);
    return structuredClone(evidence);
  }

  correct(input: { evidenceId: string; operatorId: string; requestId: string; occurredAt: string }): PublicActionEvidence {
    if (!input.operatorId.trim()) throw new Error("Operator identity is required");
    const original = this.evidence.find(({ id, status }) => id === input.evidenceId && status === "accepted");
    if (!original) throw new Error("Accepted evidence was not found");
    const scope = `correction:${original.id}:${input.requestId}`;
    const replay = this.requests.get(scope);
    if (replay) return structuredClone(replay);
    if (this.evidence.some(({ correctsEvidenceId }) => correctsEvidenceId === original.id)) throw new Error("Evidence was already corrected");
    const correction: PublicActionEvidence = { ...original, id: `public_action_${createHash("sha256").update(scope).digest("hex").slice(0, 32)}`, requestId: input.requestId, occurredAt: input.occurredAt, status: "corrected", correctsEvidenceId: original.id };
    this.evidence.push(correction);
    this.requests.set(scope, correction);
    return structuredClone(correction);
  }

  historyFor(targetCharacterId: string): PublicActionEvidence[] {
    return this.evidence.filter((entry) => entry.targetCharacterId === targetCharacterId).map((entry) => structuredClone(entry));
  }
}
