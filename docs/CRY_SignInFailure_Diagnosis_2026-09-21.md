# CrypticDesign.net sign-in failure — diagnostic findings

Date: 2026-09-21 (America/Chicago)
Context: CRY-522 real-account verification under CRY-242
Code inspected: baseline `c0cbe5d` on local `agent/cry-522-manifest-hardening` with the previously verified manifest correction. No authentication code was changed in this investigation.

## Conclusion

**Update after approved dashboard access, 2026-09-21:** Supabase's project overview initially reported **`Project "CrypticDesign.net Development" is paused`** for `befirywgilwrfgwkhhrn`. Robert then explicitly approved resuming the existing project without a plan change. The dashboard accepted the request and subsequently reported **`Restoration complete! Your project has been successfully restored and is now back online.`** Robert then completed a user-performed production sign-in. The site redirected to My Home and displayed **`Welcome back, Robert Croft.`**, confirming that the account and credentials work after service restoration.

A separately approved read-only production query then matched the existing member through the `@robertkcroft` member character and returned **0 exact Singularis development grants total** and **0 active exact grants** for `experience:singularis` / `execute-development` from the permitted `role` or `administration` sources. This explains why the authenticated account correctly remained in Coming Soon mode. The query returned counts only, remained unsaved, and made no database or project-setting changes.

A follow-up read-only Table Editor inspection initially found **0 records** in the entire production `entitlement_grants` table. Robert then explicitly approved a 30-minute exact Singularis administration grant for CRY-522 acceptance. The production experience unlocked and all six protected runtime files loaded. Robert separately confirmed revocation; the retained audit row is revoked, 0 active exact grants remain, and the authenticated product page returned to Coming Soon.

This is the authentication project documented in `CRY_335_ProductionAuthCharacterSlice_2026-07-18.md`. A read of the live sign-in HTML and its 13 public Next.js scripts found no public Supabase hostname, so the active server-side deployment's project mapping was not independently confirmed in this pass. The paused documented backend is the first concrete service blocker to resolve; it is not proof that Robert's password is incorrect.

The displayed message does not establish that Robert's credentials are incorrect. The sign-in endpoint maps every returned Supabase authentication error to HTTP 401 and `Email or password was not accepted`. The actual provider reason is discarded from the public response and is not logged by this route.

A separate browser observation shows a Turnstile challenge failure. It is a plausible contributor, not proven to be the cause of the earlier credential-rejection message. Do not change or reset credentials solely on the strength of this message.

## Evidence

1. `src/app/api/membership/session/route.ts:77` uses one error branch for every error returned by `signInWithPassword`.
2. A local in-memory reproduction executed that actual route with simulated provider responses. Each of `invalid_credentials` (400), `captcha_failed` (400), `over_request_rate_limit` (429), and `unexpected_failure` (500) produced the identical public 401 credential-rejection response. No real credentials or external authentication requests were used in the reproduction.
3. Browser console: `[Cloudflare Turnstile] Error: 300010.` at `2026-09-21T14:55:46.657Z` (09:55:46 America/Chicago). Cloudflare classifies the `300*` family as a generic challenge failure. This is browser/challenge evidence, not password validation evidence.
4. A subsequent DOM observation showed Sign in enabled. The challenge failure may have been transient; an enabled button does not prove that the provider will accept the challenge token.
5. `AccountAccessForm` forwards the challenge token and resets the widget after each submission. `TurnstileWidget` clears its token on challenge errors/expiry but has no specific visible challenge-failure message.
6. The account-admission rejection path has a different message and HTTP 403. It does not produce the reported credential-rejection wording.

## Limits

- The actual Supabase error code for Robert's failed attempt has not been observed.
- No evidence establishes that the password changed or the account disappeared. The documented provider project was confirmed paused and has now been restored; the exact date and cause of the pause were not established.
- Robert explicitly approved read-only authentication-log inspection and completed Supabase MFA. The Auth Logs view returned no results for the last hour or last 24 hours while the project was paused. No individual authentication event, secret, password value, or account record was retrieved. A successful post-restoration browser sign-in now establishes that the earlier failure was not reliable evidence of incorrect credentials.
- The earlier automatic approval-review rejection was resolved by Robert's explicit permission. That permission covers inspection, not resuming the service, changing configuration, or upgrading a plan.

## Proposed next check

The repeat sign-in succeeded after restoration. No credential reset or authentication-log inspection is needed for this incident unless the failure recurs. If it does recur, inspect only the relevant recent event and collect its timestamp, error code, and non-sensitive failure category. Do not copy tokens, passwords, full request bodies, unrelated users' details, or credentials into the report.

A user-performed sign-in in a normal Chrome/Edge window can also distinguish an embedded-browser challenge issue from a failure that occurs across browsers. This does not require changing the account or bypassing CAPTCHA.

## Proposed code correction

Classify provider failures into safe public categories: credentials rejected, human verification failed, too many attempts, and temporary service failure. Preserve generic account-related wording to avoid disclosing whether an account exists; never return raw provider messages or request data. Add behavior tests for each category. Surface challenge failure/expiry in the widget without weakening the required CAPTCHA gate. This is a proposal, not an implemented or deployed authentication change.

## Sources

- Supabase authentication error codes: https://supabase.com/docs/guides/auth/debugging/error-codes
- Cloudflare Turnstile client error codes: https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/error-codes/

The existing CRY-522 manifest fix, tests, and acceptance draft remain intact. No deployment, Jira mutation, password recovery message, account change, or provider-setting change was performed during this diagnostic investigation.
