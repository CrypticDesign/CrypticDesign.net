import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sql = readFileSync(new URL("../../supabase/migrations/202609270001_account_administration_foundation.sql", import.meta.url), "utf8");

test("operator identities default disabled and use an explicit capability allowlist", () => {
  assert.match(sql, /status public\.operator_principal_status not null default 'disabled'/);
  assert.match(sql, /capabilities <@ array\[/);
  assert.match(sql, /'account:inspect'/);
  assert.match(sql, /'protected_targets:mutate'/);
});

test("ordinary accounts have no operator-table or command access", () => {
  assert.match(sql, /enable row level security/g);
  assert.match(sql, /revoke all on public\.operator_principals[\s\S]*from public, anon, authenticated, service_role/);
  assert.doesNotMatch(sql, /grant .* to authenticated/);
});

test("claiming rechecks authorization, recent authentication, target ownership, confirmation, and idempotency", () => {
  assert.match(sql, /o\.status = 'active'/);
  assert.match(sql, /interval '15 minutes'/);
  assert.match(sql, /c\.owner_account_id = p_target_account_id/);
  assert.match(sql, /p_confirmation <> p_action::text \|\| ':' \|\| v_confirmation_target::text/);
  assert.match(sql, /on conflict \(request_id\) do nothing/);
  assert.match(sql, /select 'collision'/);
  assert.match(sql, /select 'in_progress'/);
  assert.match(sql, /select 'replay'/);
});

test("audit events are immutable and command RPCs remain service-role-only", () => {
  assert.match(sql, /Account administration audit events are immutable/);
  assert.match(sql, /before update or delete on public\.account_administration_events/);
  assert.match(sql, /grant execute on function public\.claim_account_administration_command[\s\S]*to service_role/);
  assert.match(sql, /grant execute on function public\.complete_account_administration_command[\s\S]*to service_role/);
});

test("successful sensitive inspections require an immutable, service-role-only audit event", () => {
  assert.match(sql, /create table public\.account_administration_inspection_events/);
  assert.match(sql, /projection text not null default 'account_administration_summary_v1'/);
  assert.match(sql, /Account administration inspection audit events are immutable/);
  assert.match(sql, /before update or delete on public\.account_administration_inspection_events/);
  assert.match(sql, /create function public\.record_account_administration_inspection/);
  assert.match(sql, /o\.status = 'active'[\s\S]*'account:inspect' = any\(o\.capabilities\)/);
  assert.match(sql, /c\.owner_account_id = p_target_account_id[\s\S]*c\.kind = 'member'/);
  assert.match(sql, /grant execute on function public\.record_account_administration_inspection\(uuid, uuid, uuid, uuid\)[\s\S]*to service_role/);
  assert.doesNotMatch(sql, /grant insert on public\.account_administration_inspection_events/);
});

test("Character effects and their success audit finalize atomically", () => {
  assert.match(sql, /create function public\.apply_character_administration_command/);
  assert.match(sql, /for update/);
  assert.match(sql, /actor_kind, event_type[\s\S]*'operator', 'status_changed'/);
  assert.match(sql, /set status = 'succeeded', result_code = v_result_code/);
  assert.match(sql, /grant execute on function public\.apply_character_administration_command\(text, text\)[\s\S]*to service_role/);
});

test("ambiguous account effects are serialized and leased for reconciliation", () => {
  assert.match(sql, /pg_advisory_xact_lock\(hashtextextended\('account-administration:' \|\| p_target_account_id::text, 0\)\)/);
  assert.match(sql, /c\.target_account_id = p_target_account_id and c\.status = 'pending'/);
  assert.match(sql, /select 'target_busy'/);
  assert.match(sql, /reconciliation_started_at <= statement_timestamp\(\) - interval '2 minutes'/);
  assert.match(sql, /reconciliation_attempt_count = reconciliation_attempt_count \+ 1/);
  assert.match(sql, /returning reconciliation_attempt_count into v_reconciliation_attempt/);
  assert.match(sql, /'reconciliation_started', 'ACCOUNT_ACTION_RECONCILIATION_STARTED', v_reconciliation_attempt/);
  assert.match(sql, /select 'reconcile'/);
  assert.match(sql, /ACCOUNT_ACTION_RECONCILIATION_STARTED/);
});
