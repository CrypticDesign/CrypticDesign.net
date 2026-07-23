import type { SupabaseClient } from "@supabase/supabase-js";
import { CharacterStoreError, type CharacterProfileInput, type CharacterStoreContract } from "./character-store.ts";
import { validateCharacterInput, type CharacterHistoryEvent, type CharacterIdentity } from "./characters.ts";

type CharacterRow = Record<string, unknown>;

function characterFromRow(row: CharacterRow): CharacterIdentity {
  return {
    id: String(row.id),
    ownerAccountId: row.owner_account_id ? String(row.owner_account_id) : null,
    kind: row.kind as CharacterIdentity["kind"],
    name: String(row.name),
    handle: String(row.handle),
    archetype: row.archetype as CharacterIdentity["archetype"],
    bio: String(row.bio ?? ""),
    portraitUrl: row.portrait_url ? String(row.portrait_url) : null,
    avatarRecipe: row.avatar_recipe as CharacterIdentity["avatarRecipe"],
    affiliation: row.affiliation ? String(row.affiliation) : null,
    presence: row.presence as CharacterIdentity["presence"],
    discoverable: Boolean(row.discoverable),
    visibility: row.visibility as CharacterIdentity["visibility"],
    publicationConsent: Boolean(row.publication_consent),
    stewardOperatorId: row.steward_operator_id ? String(row.steward_operator_id) : null,
    provenance: row.provenance ? String(row.provenance) : null,
    status: row.status as CharacterIdentity["status"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function rpcRow(data: unknown): CharacterRow {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") throw new Error("Character persistence returned no record");
  return row as CharacterRow;
}

function storeError(error: { message: string; code?: string }): never {
  const conflict = error.code === "23505" || /already has|Idempotency|duplicate|reused/i.test(error.message);
  const notFound = /not found/i.test(error.message);
  throw new CharacterStoreError(error.message, conflict ? "conflict" : notFound ? "not_found" : "invalid");
}

export class SupabaseCharacterStore implements CharacterStoreContract {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async findByOwner(accountId: string): Promise<CharacterIdentity | null> {
    const { data, error } = await this.client.from("characters").select("*").eq("owner_account_id", accountId).eq("kind", "member").maybeSingle();
    if (error) storeError(error);
    return data ? characterFromRow(data) : null;
  }

  async historyFor(characterId: string, accountId: string): Promise<CharacterHistoryEvent[]> {
    const owned = await this.findByOwner(accountId);
    if (!owned || owned.id !== characterId) throw new CharacterStoreError("Character not found", "not_found");
    const { data, error } = await this.client.from("character_history").select("*").eq("character_id", characterId).order("occurred_at", { ascending: true });
    if (error) storeError(error);
    return (data ?? []).map((row) => ({ id: row.id, characterId: row.character_id, actorAccountId: row.actor_account_id, type: row.event_type, occurredAt: row.occurred_at, changedFields: row.changed_fields }));
  }

  async create(input: CharacterProfileInput & { id: string; accountId: string; requestId: string; occurredAt: string }) {
    const profile = validateCharacterInput(input);
    const { data, error } = await this.client.rpc("create_member_character", {
      p_id: input.id, p_name: profile.name, p_handle: profile.handle, p_archetype: profile.archetype,
      p_bio: profile.bio, p_portrait_url: profile.portraitUrl, p_avatar_recipe: profile.avatarRecipe,
      p_affiliation: profile.affiliation, p_request_id: input.requestId,
    });
    if (error) storeError(error);
    return characterFromRow(rpcRow(data));
  }

  async update(input: CharacterProfileInput & { characterId: string; accountId: string; requestId: string; occurredAt: string }) {
    const profile = validateCharacterInput(input);
    const { data, error } = await this.client.rpc("update_member_character", {
      p_character_id: input.characterId, p_name: profile.name, p_handle: profile.handle, p_archetype: profile.archetype,
      p_bio: profile.bio, p_portrait_url: profile.portraitUrl, p_avatar_recipe: profile.avatarRecipe,
      p_affiliation: profile.affiliation, p_presence: profile.presence, p_discoverable: profile.discoverable,
      p_visibility: profile.visibility, p_publication_consent: profile.publicationConsent,
      p_request_id: input.requestId,
    });
    if (error) storeError(error);
    return characterFromRow(rpcRow(data));
  }

  async setStatus(input: { characterId: string; accountId: string; status: "active" | "retired"; requestId: string; occurredAt: string }) {
    const { data, error } = await this.client.rpc("set_member_character_status", {
      p_character_id: input.characterId, p_status: input.status, p_request_id: input.requestId,
    });
    if (error) storeError(error);
    return characterFromRow(rpcRow(data));
  }
}
