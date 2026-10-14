/**
 * CRY-250 frontend presentation contract.
 *
 * This module deliberately keeps account identity, Character identity,
 * membership, subscription, progression, roles, and entitlements separate.
 * It describes what the frontend may present; it is not an authorization
 * service and it never turns local fixture data into production authority.
 */

export const FRONTEND_AUDIENCES = [
  "public",
  "account",
  "member",
  "creator",
  "client",
  "operator",
  "administrator",
] as const;

export type FrontendAudience = (typeof FRONTEND_AUDIENCES)[number];

export const FRONTEND_ACCESS_STATES = [
  "allowed",
  "denied",
  "unavailable",
  "preview",
  "expired",
  "deferred",
] as const;

export type FrontendAccessState = (typeof FRONTEND_ACCESS_STATES)[number];

export type FrontendRole = "creator" | "client" | "operator" | "administrator";
export type EvidenceAuthority = "authoritative" | "fixture";

export interface FrontendRoleGrant {
  role: FrontendRole;
  authority: EvidenceAuthority;
  expiresAt: string | null;
}

export interface FrontendEntitlementGrant {
  code: string;
  authority: EvidenceAuthority;
  expiresAt: string | null;
}

export interface FrontendAccessSubject {
  account: {
    state: "anonymous" | "authenticated" | "suspended";
    accountId: string | null;
  };
  character: {
    state: "none" | "draft" | "active" | "suspended" | "retired";
    characterId: string | null;
  };
  membership: {
    state: "none" | "requested" | "admitted" | "active" | "expired";
    memberId: string | null;
  };
  subscription: {
    state: "none" | "preview" | "pending" | "trialing" | "active" | "past_due" | "canceled" | "expired";
    subscriptionId: string | null;
  };
  progression: {
    level: number;
    achievementIds: readonly string[];
  };
  roles: readonly FrontendRoleGrant[];
  entitlements: readonly FrontendEntitlementGrant[];
}

export type FrontendAccessRequirement =
  | { kind: "public" }
  | { kind: "account" }
  | { kind: "role"; role: FrontendRole }
  | { kind: "entitlement"; code: string };

export interface FrontendCapability {
  id: string;
  availability: "active" | "preview" | "unavailable" | "deferred";
  requirement: FrontendAccessRequirement;
}

export interface FrontendAccessDecision {
  state: FrontendAccessState;
  productionAuthorized: boolean;
  reason:
    | "public"
    | "authenticated_account"
    | "authoritative_role"
    | "authoritative_entitlement"
    | "anonymous"
    | "account_suspended"
    | "missing_role"
    | "missing_entitlement"
    | "fixture_only"
    | "expired_evidence"
    | "invalid_evaluation_time"
    | "capability_unavailable"
    | "capability_preview"
    | "capability_deferred";
  copy: string;
}

const COPY: Record<FrontendAccessState, string> = {
  allowed: "Access is available for this account.",
  denied: "This account does not currently have access.",
  unavailable: "This capability is unavailable.",
  preview: "Preview only. This state is local and does not grant production access.",
  expired: "This access has expired.",
  deferred: "This capability is planned, but it is not active yet.",
};

function decision(
  state: FrontendAccessState,
  productionAuthorized: boolean,
  reason: FrontendAccessDecision["reason"],
): FrontendAccessDecision {
  return { state, productionAuthorized, reason, copy: COPY[state] };
}

function parsedExpiry(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function evidenceState(
  evidence: readonly { authority: EvidenceAuthority; expiresAt: string | null }[],
  evaluatedAt: number,
  authoritativeReason: "authoritative_role" | "authoritative_entitlement",
  missingReason: "missing_role" | "missing_entitlement",
): FrontendAccessDecision {
  if (evidence.length === 0) return decision("denied", false, missingReason);
  const active = evidence.filter((item) => {
    const expiresAt = parsedExpiry(item.expiresAt);
    return expiresAt === null || expiresAt > evaluatedAt;
  });
  if (active.some(({ authority }) => authority === "authoritative")) {
    return decision("allowed", true, authoritativeReason);
  }
  if (active.some(({ authority }) => authority === "fixture")) {
    return decision("preview", false, "fixture_only");
  }
  return decision("expired", false, "expired_evidence");
}

/**
 * Resolves a frontend presentation state from explicit account, role, or
 * entitlement evidence. Character, membership, subscription, purchase, and
 * progression state are intentionally not consulted as authority.
 */
export function resolveFrontendAccess(
  subject: FrontendAccessSubject,
  capability: FrontendCapability,
  evaluatedAt: string,
): FrontendAccessDecision {
  if (capability.availability === "unavailable") {
    return decision("unavailable", false, "capability_unavailable");
  }
  if (capability.availability === "preview") {
    return decision("preview", false, "capability_preview");
  }
  if (capability.availability === "deferred") {
    return decision("deferred", false, "capability_deferred");
  }

  if (capability.requirement.kind === "public") {
    return decision("allowed", true, "public");
  }
  if (subject.account.state === "suspended") {
    return decision("denied", false, "account_suspended");
  }
  if (subject.account.state !== "authenticated" || !subject.account.accountId?.trim()) {
    return decision("denied", false, "anonymous");
  }
  if (capability.requirement.kind === "account") {
    return decision("allowed", true, "authenticated_account");
  }

  const evaluatedAtMs = Date.parse(evaluatedAt);
  if (!Number.isFinite(evaluatedAtMs)) {
    return decision("denied", false, "invalid_evaluation_time");
  }

  if (capability.requirement.kind === "role") {
    const requiredRole = capability.requirement.role;
    return evidenceState(
      subject.roles.filter(({ role }) => role === requiredRole),
      evaluatedAtMs,
      "authoritative_role",
      "missing_role",
    );
  }

  const requiredEntitlement = capability.requirement.code;
  return evidenceState(
    subject.entitlements.filter(({ code }) => code === requiredEntitlement),
    evaluatedAtMs,
    "authoritative_entitlement",
    "missing_entitlement",
  );
}

const EMPTY_SUBJECT: FrontendAccessSubject = {
  account: { state: "anonymous", accountId: null },
  character: { state: "none", characterId: null },
  membership: { state: "none", memberId: null },
  subscription: { state: "none", subscriptionId: null },
  progression: { level: 0, achievementIds: [] },
  roles: [],
  entitlements: [],
};

function authenticatedSubject(accountId: string): FrontendAccessSubject {
  return {
    ...EMPTY_SUBJECT,
    account: { state: "authenticated", accountId },
  };
}

export interface FrontendAccessFixture {
  id: string;
  audience: FrontendAudience;
  label: string;
  subject: FrontendAccessSubject;
  capability: FrontendCapability;
  evaluatedAt: string;
  expectedState: FrontendAccessState;
}

/** Representative presentation fixtures. They contain no production IDs. */
export const FRONTEND_ACCESS_FIXTURES = [
  {
    id: "public-release",
    audience: "public",
    label: "Public release",
    subject: EMPTY_SUBJECT,
    capability: { id: "release:public", availability: "active", requirement: { kind: "public" } },
    evaluatedAt: "2026-10-14T00:00:00.000Z",
    expectedState: "allowed",
  },
  {
    id: "signed-in-account",
    audience: "account",
    label: "Signed-in account utility",
    subject: authenticatedSubject("fixture-account"),
    capability: { id: "account:home", availability: "active", requirement: { kind: "account" } },
    evaluatedAt: "2026-10-14T00:00:00.000Z",
    expectedState: "allowed",
  },
  {
    id: "member-without-benefit",
    audience: "member",
    label: "Member without required benefit",
    subject: {
      ...authenticatedSubject("fixture-member-account"),
      membership: { state: "active", memberId: "fixture-member" },
      subscription: { state: "active", subscriptionId: "fixture-subscription" },
      progression: { level: 18, achievementIds: ["fixture-achievement"] },
    },
    capability: { id: "release:member", availability: "active", requirement: { kind: "entitlement", code: "benefit:member-release" } },
    evaluatedAt: "2026-10-14T00:00:00.000Z",
    expectedState: "denied",
  },
  {
    id: "creator-preview",
    audience: "creator",
    label: "Creator preview",
    subject: {
      ...authenticatedSubject("fixture-creator-account"),
      roles: [{ role: "creator", authority: "fixture", expiresAt: null }],
    },
    capability: { id: "creator:studio", availability: "active", requirement: { kind: "role", role: "creator" } },
    evaluatedAt: "2026-10-14T00:00:00.000Z",
    expectedState: "preview",
  },
  {
    id: "client-unavailable",
    audience: "client",
    label: "Client workspace unavailable",
    subject: {
      ...authenticatedSubject("fixture-client-account"),
      roles: [{ role: "client", authority: "fixture", expiresAt: null }],
    },
    capability: { id: "client:workspace", availability: "unavailable", requirement: { kind: "role", role: "client" } },
    evaluatedAt: "2026-10-14T00:00:00.000Z",
    expectedState: "unavailable",
  },
  {
    id: "operator-deferred",
    audience: "operator",
    label: "Operator workflow deferred",
    subject: {
      ...authenticatedSubject("fixture-operator-account"),
      roles: [{ role: "operator", authority: "fixture", expiresAt: null }],
    },
    capability: { id: "operator:governance", availability: "deferred", requirement: { kind: "role", role: "operator" } },
    evaluatedAt: "2026-10-14T00:00:00.000Z",
    expectedState: "deferred",
  },
  {
    id: "administrator-expired",
    audience: "administrator",
    label: "Expired administrator grant",
    subject: {
      ...authenticatedSubject("fixture-administrator-account"),
      roles: [{ role: "administrator", authority: "authoritative", expiresAt: "2026-10-13T23:59:59.000Z" }],
    },
    capability: { id: "administrator:settings", availability: "active", requirement: { kind: "role", role: "administrator" } },
    evaluatedAt: "2026-10-14T00:00:00.000Z",
    expectedState: "expired",
  },
] as const satisfies readonly FrontendAccessFixture[];
