import { isPubliclyRenderable } from "./releases.ts";

export const CHARACTER_ARCHETYPES = ["Signal Seeker", "Archivist", "Composer", "Navigator", "Builder"] as const;
export type CharacterArchetype = (typeof CHARACTER_ARCHETYPES)[number];
export type CharacterStatus = "active" | "suspended" | "retired";
export type CharacterVisibility = "private" | "public";
export type CharacterPresence = "offline" | "available" | "away";

export interface CharacterIdentity {
  id: string;
  ownerAccountId: string | null;
  kind: "member" | "system";
  name: string;
  handle: string;
  archetype: CharacterArchetype;
  bio: string;
  portraitUrl: string | null;
  affiliation: string | null;
  presence: CharacterPresence;
  discoverable: boolean;
  visibility: CharacterVisibility;
  publicationConsent: boolean;
  stewardOperatorId: string | null;
  provenance: string | null;
  status: CharacterStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterProfile {
  id: string;
  kind: CharacterIdentity["kind"];
  name: string;
  handle: string;
  archetype: CharacterArchetype;
  bio: string;
  portraitUrl: string | null;
  affiliation: string | null;
  presence: CharacterPresence;
  discoverable: boolean;
  visibility: CharacterVisibility;
  publicationConsent: boolean;
  status: CharacterStatus;
}

export type PublicCharacterIdentity = CharacterProfile;

export interface CharacterHistoryEvent {
  id: string;
  characterId: string;
  actorAccountId: string;
  type: "created" | "profile_updated" | "status_changed";
  occurredAt: string;
  changedFields: string[];
}

export function characterProfile(identity: CharacterIdentity): CharacterProfile {
  const { id, kind, name, handle, archetype, bio, portraitUrl, affiliation, presence, discoverable, visibility, publicationConsent, status } = identity;
  return { id, kind, name, handle, archetype, bio, portraitUrl, affiliation, presence, discoverable, visibility, publicationConsent, status };
}

export function isCharacterPubliclyRenderable(identity: CharacterIdentity): boolean {
  return identity.publicationConsent && identity.discoverable && identity.status === "active" && isPubliclyRenderable({
    rights_status: "owned", visibility_status: identity.visibility === "public" ? "public" : "hidden", publication_status: identity.visibility === "public" ? "published" : "draft",
    owner: identity.kind === "system" ? identity.stewardOperatorId ?? "" : identity.ownerAccountId ?? "", approval_notes: identity.provenance ?? "", last_reviewed: identity.updatedAt,
  });
}

export function publicCharacter(identity: CharacterIdentity): CharacterProfile | null {
  return isCharacterPubliclyRenderable(identity) ? characterProfile(identity) : null;
}

export function canManageCharacter(accountId: string | null, identity: CharacterIdentity): boolean {
  return Boolean(accountId && identity.kind === "member" && identity.ownerAccountId === accountId);
}

export function validateCharacterInput(input: { name: string; handle?: string; archetype: string; bio?: string; portraitUrl?: string | null; affiliation?: string | null; presence?: string; discoverable?: boolean; visibility?: string; publicationConsent?: boolean }) {
  const name = input.name.trim();
  const handle = (input.handle?.trim().toLowerCase() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).slice(0, 32);
  const bio = input.bio?.trim() ?? "";
  const portraitUrl = input.portraitUrl?.trim() || null;
  const affiliation = input.affiliation?.trim() || null;
  if (name.length < 1 || name.length > 32) throw new Error("Character name must be between 1 and 32 characters");
  if (!CHARACTER_ARCHETYPES.includes(input.archetype as CharacterArchetype)) throw new Error("Unknown character archetype");
  if (!/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(handle)) throw new Error("Handle must use 3-32 lowercase letters, numbers, or hyphens");
  if (bio.length > 280) throw new Error("Character bio must be 280 characters or fewer");
  if (affiliation && affiliation.length > 80) throw new Error("Character affiliation must be 80 characters or fewer");
  if (portraitUrl && (!portraitUrl.startsWith("/images/") || portraitUrl.includes(".."))) throw new Error("Portrait must use an approved local image path");
  const presence = input.presence ?? "offline";
  if (!["offline", "available", "away"].includes(presence)) throw new Error("Unknown presence state");
  const visibility = input.visibility ?? "private";
  if (!["private", "public"].includes(visibility)) throw new Error("Unknown visibility state");
  const publicationConsent = Boolean(input.publicationConsent);
  const discoverable = Boolean(input.discoverable);
  if (visibility === "public" && !publicationConsent) throw new Error("Public visibility requires explicit publication consent");
  return { name, handle, archetype: input.archetype as CharacterArchetype, bio, portraitUrl, affiliation, presence: presence as CharacterPresence, discoverable, visibility: visibility as CharacterVisibility, publicationConsent };
}
