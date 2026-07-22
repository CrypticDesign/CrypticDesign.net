import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL("../../supabase/migrations/202607220001_harden_production_auth_character_slice.sql", import.meta.url);

test("replaces timestamp-bearing RPC overloads with database-timestamped functions", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.doesNotMatch(sql, /p_occurred_at/);
  assert.equal((sql.match(/statement_timestamp\(\)/g) ?? []).length, 3);
  assert.match(sql, /drop function public\.create_member_character\([^;]+timestamptz\);/);
  assert.match(sql, /drop function public\.update_member_character\([^;]+timestamptz\);/);
  assert.match(sql, /drop function public\.set_member_character_status\([^;]+timestamptz\);/);
});

test("enforces the canonical member archetype vocabulary in PostgreSQL", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /valid_member_character_archetype/);
  for (const archetype of ["Signal Seeker", "Archivist", "Composer", "Navigator", "Builder"]) {
    assert.match(sql, new RegExp(`'${archetype}'`));
  }
});
