import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";

import { DEFAULT_AVATAR_RECIPE } from "./avatar.ts";
import { SupabaseCharacterStore } from "./supabase-character-store.ts";

const characterRow = {
  id: "00000000-0000-0000-0000-000000000001",
  owner_account_id: "00000000-0000-0000-0000-000000000002",
  kind: "member",
  name: "Nova",
  handle: "nova-one",
  archetype: "Navigator",
  bio: "",
  portrait_url: null,
  avatar_recipe: DEFAULT_AVATAR_RECIPE,
  affiliation: null,
  presence: "offline",
  discoverable: false,
  visibility: "private",
  publication_consent: false,
  steward_operator_id: null,
  provenance: "account-created",
  status: "active",
  created_at: "2026-07-22T00:00:00Z",
  updated_at: "2026-07-22T00:00:00Z",
};

test("never sends caller-controlled persistence timestamps to character RPCs", async () => {
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const client = {
    rpc: async (name: string, args: Record<string, unknown>) => {
      calls.push({ name, args });
      return { data: characterRow, error: null };
    },
  } as unknown as SupabaseClient;
  const store = new SupabaseCharacterStore(client);
  const common = {
    accountId: characterRow.owner_account_id,
    requestId: "request-1",
    occurredAt: "1900-01-01T00:00:00Z",
  };

  await store.create({ ...common, id: characterRow.id, name: "Nova", handle: "nova-one", archetype: "Navigator" });
  await store.update({ ...common, characterId: characterRow.id, name: "Nova", handle: "nova-one", archetype: "Navigator" });
  await store.setStatus({ ...common, characterId: characterRow.id, status: "retired" });

  assert.deepEqual(calls.map(({ name }) => name), ["create_member_character", "update_member_character", "set_member_character_status"]);
  for (const { args } of calls) assert.equal(Object.hasOwn(args, "p_occurred_at"), false);
});
