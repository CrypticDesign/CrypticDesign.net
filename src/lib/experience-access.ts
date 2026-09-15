import {
  resolveEntitlement,
  type EntitlementDecision,
  type EntitlementGrant,
} from "./entitlements.ts";

export const EXPERIENCE_DECLARATIONS = [
  "PUBLIC_RELEASE",
  "PUBLIC_COMING_SOON",
  "INTERNAL_ONLY",
] as const;

export type ExperienceDeclaration = (typeof EXPERIENCE_DECLARATIONS)[number];
export type ExperienceAccessState =
  | ExperienceDeclaration
  | "DEVELOPMENT_UNLOCKED";

export interface ExperienceAccessDefinition {
  declaration: ExperienceDeclaration;
  resource: `experience:${string}`;
  action: "execute-development";
}

export interface ExperienceAccessDecision {
  state: ExperienceAccessState;
  discoverable: boolean;
  executable: boolean;
  developmentAuthorized: boolean;
}

export const DEVELOPMENT_ENTITLEMENT_SOURCES = [
  "role",
  "administration",
] as const satisfies readonly EntitlementGrant["source"][];

export function resolveExperienceAccess(
  declaration: ExperienceDeclaration,
  developmentAuthorized: boolean,
): ExperienceAccessDecision {
  if (declaration === "PUBLIC_RELEASE") {
    return {
      state: "PUBLIC_RELEASE",
      discoverable: true,
      executable: true,
      developmentAuthorized: false,
    };
  }

  if (developmentAuthorized) {
    return {
      state: "DEVELOPMENT_UNLOCKED",
      discoverable: true,
      executable: true,
      developmentAuthorized: true,
    };
  }

  return {
    state: declaration,
    discoverable: declaration === "PUBLIC_COMING_SOON",
    executable: false,
    developmentAuthorized: false,
  };
}

/**
 * Development execution deliberately narrows the general entitlement model:
 * only exact role/administration grants may authorize this action. Tier,
 * purchase, event, promotion, and wildcard grants remain valid for their own
 * domains but cannot accidentally become developer credentials.
 */
export function resolveDevelopmentEntitlement(
  definition: ExperienceAccessDefinition,
  memberId: string | null | undefined,
  grants: readonly EntitlementGrant[],
  evaluatedAt: string,
): EntitlementDecision {
  const exactDevelopmentGrants = grants.filter((grant) =>
    DEVELOPMENT_ENTITLEMENT_SOURCES.includes(
      grant.source as (typeof DEVELOPMENT_ENTITLEMENT_SOURCES)[number],
    )
    && grant.resource === definition.resource
    && grant.action === definition.action,
  );

  return resolveEntitlement({
    memberId,
    resource: definition.resource,
    action: definition.action,
    evaluatedAt,
  }, exactDevelopmentGrants);
}

export function isPubliclyDiscoverableExperience(
  definition: ExperienceAccessDefinition | undefined,
): boolean {
  return definition?.declaration !== "INTERNAL_ONLY";
}
