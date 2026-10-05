import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../../supabase/migrations/202609290001_operator_access_sessions.sql", import.meta.url),
  "utf8",
);
const adapter = readFileSync(
  new URL("./account-administration-operator-session-supabase.ts", import.meta.url),
  "utf8",
);

test("Gate 2 stores only digests in fixed, revocable session records", () => {
  assert.match(migration, /create table public\.operator_access_sessions/);
  assert.match(migration, /token_digest text not null unique/);
  assert.match(migration, /auth_session_reference_digest text not null/);
  assert.match(migration, /expires_at <= issued_at \+ interval '15 minutes'/);
  assert.match(migration, /reauthenticated_at >= issued_at - interval '5 minutes'/);
  assert.match(migration, /revoked_at is null or revoked_at >= issued_at/);
  assert.doesNotMatch(migration, /\braw_token\b|\baccess_token\b|\brefresh_token\b/);
});

test("ordinary roles cannot read, create, mutate, or execute operator-session storage", () => {
  assert.match(migration, /alter table public\.operator_access_sessions enable row level security/);
  assert.match(migration, /alter table public\.operator_access_session_events enable row level security/);
  assert.match(migration, /revoke all on public\.operator_access_sessions, public\.operator_access_session_events[\s\S]*from public, anon, authenticated, service_role/);
  assert.match(migration, /revoke all on function public\.create_operator_access_session[\s\S]*from public, anon, authenticated, service_role/);
  assert.match(migration, /revoke all on function public\.revoke_operator_access_session[\s\S]*from public, anon, authenticated, service_role/);
  assert.doesNotMatch(migration, /grant [^;]* to (anon|authenticated)/);
});

test("session creation and revocation atomically append immutable evidence", () => {
  assert.match(migration, /Operator access session events are immutable/);
  assert.match(migration, /before update or delete on public\.operator_access_session_events/);
  assert.match(migration, /'issued', 'OPERATOR_SESSION_ISSUED'/);
  assert.match(migration, /'revoked', 'OPERATOR_SESSION_REVOKED'/);
  assert.match(migration, /for update/);
  assert.match(migration, /unique \(session_id, event_type\)/);
  assert.doesNotMatch(migration, /grant insert on public\.operator_access_session_events/);
});

test("server-only adapter exposes bounded reads and RPC-only writes", () => {
  assert.match(adapter, /import "server-only"/);
  assert.match(adapter, /createServiceRoleSupabaseClient/);
  assert.match(adapter, /select\("id,token_digest,operator_account_id,auth_session_reference_digest,reauthenticated_at,issued_at,expires_at,revoked_at"\)/);
  assert.match(adapter, /rpc\("create_operator_access_session"/);
  assert.match(adapter, /rpc\("revoke_operator_access_session"/);
  assert.doesNotMatch(adapter, /\.insert\(|\.update\(|\.delete\(/);
  assert.doesNotMatch(adapter, /service_role|SUPABASE_SERVICE_ROLE_KEY/);
});
