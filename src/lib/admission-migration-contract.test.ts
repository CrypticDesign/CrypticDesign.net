import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL("../../supabase/migrations/202608190001_invitation_admission_foundation.sql", import.meta.url);
const routeUrl = new URL("../app/api/admission/exchange/route.ts", import.meta.url);
const serviceUrl = new URL("./supabase/service.ts", import.meta.url);

test("admission schema keeps authority-bearing tables server-only", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  for (const table of ["launch_waves", "invitations", "admission_payment_evidence", "admission_events", "admission_outbox"]) {
    assert.match(sql, new RegExp(`create table public\\.${table}`));
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`));
  }
  assert.match(sql, /revoke all on public\.launch_waves, public\.invitations/);
  assert.match(sql, /from public, anon, authenticated/);
  assert.match(sql, /to service_role/);
  assert.doesNotMatch(sql, /grant .* to anon/i);
  assert.doesNotMatch(sql, /grant .* to authenticated/i);
});

test("token exchange is atomic, idempotent, wave-bound, and single-use", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /create function public\.exchange_admission_token/);
  assert.match(sql, /where e\.idempotency_key = p_idempotency_key/);
  assert.match(sql, /join public\.invitations i on i\.id = e\.invitation_id/);
  assert.match(sql, /and i\.token_hash = p_token_digest\s+for update of i/);
  assert.match(sql, /v_invitation\.status <> 'checkout_pending'/);
  assert.match(sql, /A key already bound to another request is a collision/);
  assert.match(sql, /where token_hash = p_token_digest\s+for update/);
  assert.match(sql, /v_invitation\.status <> 'sent'/);
  assert.match(sql, /w\.status = 'open'/);
  assert.match(sql, /set status = 'checkout_pending', token_consumed_at = statement_timestamp\(\)/);
  assert.match(sql, /grant execute on function public\.exchange_admission_token\(text, text\) to service_role/);
});

test("public exchange route fails closed and never exposes the service key", async () => {
  const [route, service] = await Promise.all([readFile(routeUrl, "utf8"), readFile(serviceUrl, "utf8")]);
  assert.match(route, /if \(!admissionBackendConfigured\(\)\)/);
  assert.match(route, /request\.headers\.get\("idempotency-key"\)/);
  assert.match(route, /digestAdmissionToken\(token\)/);
  assert.match(route, /httpOnly: true/);
  assert.match(route, /sameSite: "strict"/);
  assert.match(route, /secure: true/);
  assert.match(service, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(service, /NEXT_PUBLIC_SUPABASE_SERVICE/);
});
