import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL("../../supabase/migrations/202608310001_close_unapproved_auth_member_boundary.sql", import.meta.url);
const sessionRouteUrl = new URL("../app/api/membership/session/route.ts", import.meta.url);
const memberAdmissionUrl = new URL("./supabase/member-admission.ts", import.meta.url);
const callbackRouteUrl = new URL("../app/auth/callback/route.ts", import.meta.url);
const passwordRouteUrl = new URL("../app/api/membership/password/route.ts", import.meta.url);

test("a bare Auth insertion no longer provisions a member profile", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /drop trigger if exists create_member_profile_after_signup on auth\.users/);
  assert.match(sql, /drop function if exists public\.handle_new_member_account\(\)/);
  assert.doesNotMatch(sql, /after insert on auth\.users/);
  assert.doesNotMatch(sql, /insert into public\.member_profiles/);
});

test("member character creation requires a separately admitted profile", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /select 1 from public\.member_profiles where account_id = v_account_id/);
  assert.match(sql, /Approved member profile required/);
  assert.match(sql, /revoke insert, update, delete on public\.member_profiles from public, anon, authenticated/);
});

test("Supabase sessions require an admitted member profile", async () => {
  const [route, memberAdmission] = await Promise.all([
    readFile(sessionRouteUrl, "utf8"),
    readFile(memberAdmissionUrl, "utf8"),
  ]);
  assert.match(route, /findAdmittedMember\(session\.client, data\.user\.id\)/);
  assert.match(memberAdmission, /\.from\("member_profiles"\)/);
  assert.match(route, /ACCOUNT_ADMISSION_REQUIRED/);
  assert.match(route, /signOutSupabaseSession\(session\.client\)/);
});

test("PKCE callbacks and password changes reject identities without admission", async () => {
  const [callback, password] = await Promise.all([
    readFile(callbackRouteUrl, "utf8"),
    readFile(passwordRouteUrl, "utf8"),
  ]);
  assert.match(callback, /findAdmittedMember\(session\.client, data\.user\.id\)/);
  assert.match(callback, /signOutSupabaseSession\(session\.client\)/);
  assert.match(password, /findAdmittedMember\(session\.client, data\.user\.id\)/);
  assert.match(password, /ACCOUNT_ADMISSION_REQUIRED/);
});
