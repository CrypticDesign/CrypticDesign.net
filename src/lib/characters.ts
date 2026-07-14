export const CHARACTER_ARCHETYPES = ["Signal Seeker", "Archivist", "Composer", "Navigator", "Builder"] as const;
export type CharacterArchetype = (typeof CHARACTER_ARCHETYPES)[number];
export type CharacterStatus = "active" | "suspended" | "retired";

export interface CharacterIdentity {
  id: string;
  ownerAccountId: string | null;
  kind: "member" | "system";
  name: string;
  archetype: CharacterArchetype;
  bio: string;
  affiliation: string | null;
  status: CharacterStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PublicCharacterIdentity {
  id: string;
  kind: CharacterIdentity["kind"];
  name: string;
  archetype: CharacterArchetype;
  bio: string;
  affiliation: string | null;
  status: CharacterStatus;
}

export interface CharacterHistoryEvent {
  id: string;
  characterId: string;
  actorAccountId: string;
  type: "created" | "profile_updated";
  occurredAt: string;
  changedFields: string[];
}

export function publicCharacter(identity: CharacterIdentity): PublicCharacterIdentity {
  const { id, kind, name, archetype, bio, affiliation, status } = identity;
  return { id, kind, name, archetype, bio, affiliation, status };
}

export function canManageCharacter(accountId: string | null, identity: CharacterIdentity): boolean {
  return Boolean(accountId && identity.kind === "member" && identity.ownerAccountId === accountId);
}

export function validateCharacterInput(input: { name: string; archetype: string; bio?: string; affiliation?: string | null }) {
  const name = input.name.trim();
  const bio = input.bio?.trim() ?? "";
  const affiliation = input.affiliation?.trim() || null;
  if (name.length < 1 || name.length > 32) throw new Error("Character name must be between 1 and 32 characters");
  if (!CHARACTER_ARCHETYPES.includes(input.archetype as CharacterArchetype)) throw new Error("Unknown character archetype");
  if (bio.length > 280) throw new Error("Character bio must be 280 characters or fewer");
  if (affiliation && affiliation.length > 80) throw new Error("Character affiliation must be 80 characters or fewer");
  return { name, archetype: input.archetype as CharacterArchetype, bio, affiliation };
}

