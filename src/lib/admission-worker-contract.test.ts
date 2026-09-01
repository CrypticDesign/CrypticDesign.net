import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL("../../supabase/migrations/202609010001_invitation_outbox_worker.sql", import.meta.url);
const routeUrl = new URL("../app/api/internal/admission/outbox/route.ts", import.meta.url);
const workerUrl = new URL("./admission-worker.ts", import.meta.url);

test("outbox claims are bounded, leased, concurrent-safe, and service-role-only", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /create function public\.claim_admission_outbox/);
  assert.match(sql, /p_limit < 1 or p_limit > 10/);
  assert.match(sql, /for update skip locked/);
  assert.match(sql, /claimed_at < statement_timestamp\(\) - interval '5 minutes'/);
  assert.match(sql, /attempt_count < 5/);
  assert.match(sql, /revoke all on function public\.claim_admission_outbox\(text, integer\) from public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.claim_admission_outbox\(text, integer\) to service_role/);
});

test("invite finalization rechecks every authority gate and queues compensation", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /v_invitation\.status = 'paid_eligible'/);
  assert.match(sql, /v_invitation\.expires_at > statement_timestamp\(\)/);
  assert.match(sql, /w\.status = 'open'/);
  assert.match(sql, /p\.eligibility = 'eligible'/);
  assert.match(sql, /where id = v_invitation\.launch_wave_id for update/);
  assert.match(sql, /admitted\.status in \('auth_invited', 'accepted'\)\) < v_wave\.maximum_admissions/);
  assert.match(sql, /'disable_unaccepted_auth_user'/);
  assert.match(sql, /'ELIGIBILITY_CLOSED_AFTER_AUTH'/);
  assert.match(sql, /v_invitation\.status = 'accepted'/);
});

test("internal worker route is bearer-protected, activation-gated, and bounded", async () => {
  const [route, worker] = await Promise.all([readFile(routeUrl, "utf8"), readFile(workerUrl, "utf8")]);
  assert.match(worker, /ACCOUNT_ADMISSION_MODE\?\.trim\(\) === "invitation"/);
  assert.match(worker, /timingSafeEqual/);
  assert.match(route, /request\.headers\.get\("authorization"\)/);
  assert.match(route, /Math\.max\(1, Math\.min\(10/);
  assert.match(route, /cache-control": "no-store"/);
  assert.doesNotMatch(route, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(route, /ADMISSION_WORKER_SECRET/);
});
