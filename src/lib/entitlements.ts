export const ENTITLEMENT_SOURCES = [
  "tier",
  "purchase",
  "role",
  "event",
  "promotion",
  "administration",
] as const;

export type EntitlementSource = (typeof ENTITLEMENT_SOURCES)[number];

export interface EntitlementGrant {
  id: string;
  memberId: string;
  resource: string;
  action: string;
  source: EntitlementSource;
  sourceId: string;
  effectiveAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  revocationReason: string | null;
  createdAt: string;
}

export type EntitlementDecisionReason =
  | "valid_grant"
  | "no_matching_grant"
  | "invalid_request";

export interface EntitlementDecision {
  allowed: boolean;
  reason: EntitlementDecisionReason;
  memberId: string | null;
  resource: string;
  action: string;
  evaluatedAt: string;
  grantIds: string[];
  evidence: Array<{
    grantId: string;
    source: EntitlementSource;
    sourceId: string;
    resource: string;
    action: string;
  }>;
}

export interface EntitlementRequest {
  memberId: string | null | undefined;
  resource: string;
  action: string;
  evaluatedAt: string;
}

function validDate(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function matches(pattern: string, value: string): boolean {
  return pattern === "*" || pattern === value;
}

function isGrantActive(grant: EntitlementGrant, evaluatedAt: number): boolean {
  const effectiveAt = Date.parse(grant.effectiveAt);
  const expiresAt = grant.expiresAt === null ? null : Date.parse(grant.expiresAt);
  return Number.isFinite(effectiveAt)
    && effectiveAt <= evaluatedAt
    && grant.revokedAt === null
    && (expiresAt === null || (Number.isFinite(expiresAt) && evaluatedAt < expiresAt));
}

/**
 * Resolves access from independent grants. Revoking or expiring one grant never
 * suppresses another valid grant, which keeps purchased access independent from
 * role, event, promotion, and progression changes.
 */
export function resolveEntitlement(
  request: EntitlementRequest,
  grants: readonly EntitlementGrant[],
): EntitlementDecision {
  const base = {
    memberId: request.memberId?.trim() || null,
    resource: request.resource,
    action: request.action,
    evaluatedAt: request.evaluatedAt,
  };
  if (!base.memberId || !request.resource.trim() || !request.action.trim() || !validDate(request.evaluatedAt)) {
    return { ...base, allowed: false, reason: "invalid_request", grantIds: [], evidence: [] };
  }

  const evaluatedAt = Date.parse(request.evaluatedAt);
  const matching = grants.filter((grant) =>
    grant.memberId === base.memberId
    && matches(grant.resource, request.resource)
    && matches(grant.action, request.action)
    && isGrantActive(grant, evaluatedAt),
  ).sort((left, right) => left.id.localeCompare(right.id));

  if (matching.length === 0) {
    return { ...base, allowed: false, reason: "no_matching_grant", grantIds: [], evidence: [] };
  }

  return {
    ...base,
    allowed: true,
    reason: "valid_grant",
    grantIds: matching.map(({ id }) => id),
    evidence: matching.map(({ id, source, sourceId, resource, action }) => ({
      grantId: id,
      source,
      sourceId,
      resource,
      action,
    })),
  };
}

