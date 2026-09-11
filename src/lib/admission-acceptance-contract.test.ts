import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL("../../supabase/migrations/202609010002_admission_acceptance.sql", import.meta.url);
const routeUrl = new URL("../app/api/admission/accept/route.ts", import.meta.url);
const confirmUrl = new URL("../app/auth/confirm/complete/route.ts", import.meta.url);

test("acceptance transaction binds Auth identity, email, invitation, payment, wave, tier, and price", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /join auth\.users u on u\.id = i\.auth_user_id/);
  assert.match(sql, /i\.auth_user_id = p_account_id/);
  assert.match(sql, /i\.normalized_email = lower\(trim\(p_normalized_email\)\)/);
  assert.match(sql, /i\.status = 'auth_invited'/);
  assert.match(sql, /i\.expires_at > statement_timestamp\(\)/);
  assert.match(sql, /w\.status = 'open'/);
  assert.match(sql, /p\.eligibility = 'eligible'/);
  assert.match(sql, /id = v_payment\.price_id and tier_id = v_payment\.tier_id/);
  assert.match(sql, /provider = v_payment\.provider and active for share/);
});

test("acceptance creates member, subscription, entitlement, and audit projections atomically", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /insert into public\.member_profiles/);
  assert.match(sql, /insert into public\.subscriptions/);
  assert.match(sql, /insert into public\.subscription_events/);
  assert.match(sql, /insert into public\.entitlement_grants/);
  assert.match(sql, /set status = 'accepted', accepted_member_id = v_member\.id/);
  assert.match(sql, /event_type, prior_status, next_status/);
  assert.match(sql, /'admission_accepted'/);
  assert.match(sql, /revoke all on function public\.accept_admission_invitation.*public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.accept_admission_invitation.*service_role/);
});

test("acceptance API trusts the verified session and never accepts identity authority from the body", async () => {
  const [route, confirmation] = await Promise.all([readFile(routeUrl, "utf8"), readFile(confirmUrl, "utf8")]);
  assert.match(route, /session\.client\.auth\.getUser\(\)/);
  assert.match(route, /p_account_id: data\.user\.id/);
  assert.match(route, /normalizeAdmissionEmail\(data\.user\.email\)/);
  assert.match(route, /request\.headers\.get\("idempotency-key"\)/);
  assert.match(route, /createServiceRoleSupabaseClient\(\)/);
  assert.doesNotMatch(route, /request\.json\(\)/);
  assert.doesNotMatch(route, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(confirmation, /!admissionAcceptanceConfigured\(\)/);
  assert.match(confirmation, /admission_invite_ready/);
  assert.match(confirmation, /readiness\.data === true/);
  assert.match(confirmation, /catch \{/);
});
