# CRY-489 — Single-Use Invitation Admission Contract

**Status:** Public application signup removed locally; provider controls and invitation/payment flow remain unimplemented and undeployed
**Decision date:** 2026-08-16
**Policy:** Public content stays accountless. Production accounts are invite-only and require verified payment eligibility. Open registration is disabled.

## 1. Review finding that controls this design

The CRY-489 application change removes the `auth.signUp()` path from `/api/membership/session`, but it is not a complete production boundary by itself. A caller can address the Supabase Auth signup endpoint directly with the public publishable key whenever provider-level signup remains enabled. The checked-in `create_member_profile_after_signup` trigger would then create a member profile for that Auth user.

Therefore, production readiness requires both controls:

1. **Provider control:** Supabase **Allow new users to sign up** is disabled; anonymous sign-ins are disabled; no OAuth or phone provider may create a new user outside the approved invite path.
2. **Application control:** the public application API remains fail-closed and never calls client `signUp()`.

The provider setting is the authoritative public-signup kill switch. The application flag is defense in depth and controls the product experience.

## 2. Recommended Wave 1 flow

Use Supabase's server-only admin invitation API after payment eligibility is verified. Do not re-enable client `signUp()` for invitation mode.

```text
Robert opens an approved wave
  -> operator prepares one email-bound invitation
  -> system sends a single-use checkout/admission link
  -> payment provider reports eligible payment state
  -> verified webhook records the event idempotently
  -> outbox worker calls Supabase admin inviteUserByEmail()
  -> Supabase creates the invited Auth user and sends its expiring invite link
  -> recipient accepts the provider invite
  -> application confirms Auth user ID, invitation, email, wave, and payment state
  -> invitation becomes accepted and subscriber entitlements become active
```

This is a two-stage invitation:

* the Cryptic Design admission link proves possession of the approved invitation and initiates checkout;
* the Supabase invite link proves control of the invited mailbox and establishes the Auth identity.

Neither token alone grants subscriber entitlement.

## 3. Required state model

```text
prepared -> sent -> checkout_pending -> paid_eligible -> auth_invited -> accepted
    |         |             |               |              |
    +-------> expired / revoked / failed <---+--------------+
```

Only `paid_eligible` may transition to `auth_invited`. Only an authenticated Supabase user whose ID equals `auth_user_id` may transition `auth_invited` to `accepted`.

Repeated requests with the same idempotency key return the prior result. Reuse with different input is rejected.

## 4. Data contract

### `launch_waves`

* `id uuid primary key`
* `status draft | approved | open | paused | closed`
* `maximum_admissions integer`
* `approved_by uuid`
* `approved_at timestamptz`
* `opened_at`, `paused_at`, `closed_at timestamptz null`

No automated process may change a wave to `open` or increase its ceiling.

### `invitations`

* `id uuid primary key`
* `launch_wave_id uuid not null`
* `normalized_email text not null`
* `token_hash text not null unique`
* `status invitation_status not null`
* `expires_at timestamptz not null`
* `auth_user_id uuid null unique`
* `accepted_member_id uuid null unique`
* `sent_at`, `paid_eligible_at`, `auth_invited_at`, `accepted_at`, `revoked_at timestamptz null`
* `created_by uuid not null`
* `created_at`, `updated_at timestamptz not null`

Enforce at most one nonterminal invitation for the same normalized email and launch wave. The browser receives no direct insert, update, or delete permission.

### `admission_payment_evidence`

This record exists before `member_profiles`, so it must be invitation-scoped rather than member-scoped.

* `id uuid primary key`
* `invitation_id uuid not null`
* `provider text not null`
* `provider_customer_id text null`
* `provider_checkout_id text null unique`
* `provider_subscription_id text null unique`
* `eligibility pending | eligible | ineligible | reversed`
* `last_provider_event_id text not null unique`
* `eligible_at`, `reversed_at timestamptz null`
* `recorded_at timestamptz not null`

Provider identifiers and financial-event records are server-only. No card data is stored.

### `admission_events`

Append-only redacted audit records:

* invitation and wave IDs;
* event type and prior/next state;
* actor class (`operator`, `payment_webhook`, `outbox_worker`, `subscriber`, `reconciler`);
* idempotency key with a unique constraint;
* redacted result code and timestamp.

Do not store plaintext tokens, passwords, secret keys, payment payloads, or recovery material.

## 5. Token contract

* Generate at least 256 random bits with a cryptographically secure generator.
* Store only an HMAC-SHA-256 token digest using a server-held admission secret.
* Give the plaintext token to the recipient once; never log it or place it in analytics.
* The admission landing page uses `Referrer-Policy: no-referrer`, loads no third-party resources, exchanges the token by POST, then redirects to a tokenless URL.
* Compare digests in constant time.
* Bind the token to one normalized email and one wave.
* Expire it after a short, explicit period; expiration never extends automatically.
* A successful exchange rotates to an HttpOnly, Secure, SameSite=Strict, short-lived admission cookie.
* Redemption reserves the invitation atomically. A concurrent redemption receives `409 INVITATION_ALREADY_RESERVED_OR_USED`.
* Revocation and expiration win over every nonterminal state.

The Supabase invite token is separately generated, expired, and consumed by Supabase. Cryptic Design stores the returned Auth user ID, not the provider token.

## 6. Server API boundaries

### Operator-only

`POST /api/admin/launch-waves/{waveId}/invitations`

Requires administrator authentication, MFA, an approved/open wave, capacity below the approved ceiling, and an idempotency key. Creates a `prepared` invitation. It does not create an Auth user.

`POST /api/admin/invitations/{id}/send`

Transitions `prepared` to `sent` and queues delivery. It cannot bypass wave, expiry, or revocation checks.

### Subscriber-facing

`POST /api/admission/exchange`

Accepts the plaintext admission token once, validates the digest/email/wave/expiry/state, creates the short-lived admission session, and returns only a generic result.

`POST /api/admission/checkout`

Requires the admission session. Creates or returns the provider checkout idempotently. It does not create an Auth user or entitlement.

`POST /api/admission/accept`

Requires an authenticated Supabase invite session. It validates `auth.uid() = invitations.auth_user_id`, normalized email equality, `status = auth_invited`, unexpired/unrevoked invitation, eligible payment state, and an open-or-explicitly-honored wave. It then marks the invitation accepted and activates the subscription/entitlement projection transactionally.

### Provider-facing

`POST /api/webhooks/payments`

Verifies the provider signature over the raw body before parsing, rejects stale or invalid signatures, stores each provider event once, and updates payment eligibility idempotently. A failed, abandoned, refunded, disputed, or reversed payment never grants or preserves entitlement.

### Internal worker

The outbox worker selects `paid_eligible` invitations using row locking, calls `auth.admin.inviteUserByEmail()` with a server-only secret key, records the returned Auth user ID, and advances to `auth_invited`. Browser code never receives the secret key.

## 7. Partial-failure and reconciliation rules

Supabase Auth administration and the application database are not treated as one atomic transaction. Use an outbox/saga:

1. Commit `paid_eligible` and an outbox command.
2. Claim the command with an idempotency key and row lock.
3. Call the Auth Admin API.
4. Persist `auth_user_id` and `auth_invited`.
5. On timeout, reconcile by the stored operation ID and normalized email before retrying.

If Auth creation succeeds but local finalization fails, the reconciler links the known user or disables/removes the unaccepted orphan. The account must not receive entitlement while reconciliation is unresolved.

If payment becomes ineligible before acceptance, revoke the invitation and remove/disable the unaccepted invited Auth user. If payment becomes ineligible after acceptance, transition the subscription and entitlements according to the approved grace/refund policy; do not delete historical audit evidence.

## 8. Member-profile trigger change

The current trigger creates a profile for every new Auth user. For Wave 1 this is acceptable only after provider-level public, anonymous, phone, and OAuth signup paths are proven closed and the only user-creation authority is the trusted admin invite path.

Before production, replace the free-member language and add a server-verifiable admission linkage. Do not trust `raw_user_meta_data` as an authority source because users can update it. The trusted link is the server-recorded `auth_user_id` returned by the Admin API and the corresponding eligible invitation record.

Member profile creation may remain automatic, but subscriber entitlement activation must occur only in `/api/admission/accept` after the full contract passes.

## 9. Required verification

### Provider configuration tests

* Direct `POST /auth/v1/signup` with the publishable key is rejected.
* Anonymous signup is rejected.
* Unapproved OAuth and phone signup cannot create users.
* Existing invited users can still sign in.
* A server-admin invitation succeeds while public signup is disabled.

### Application and data tests

* Direct application create-account calls return `403 ACCOUNT_ADMISSION_CLOSED`.
* Missing, malformed, expired, revoked, wrong-email, wrong-wave, and replayed invitations fail closed.
* Two simultaneous redemptions yield exactly one reservation/acceptance.
* Failed or abandoned checkout creates no Auth user, member entitlement, or subscription activation.
* Duplicate webhook delivery has one effect.
* Invalid webhook signatures have no effect.
* Auth invite success plus local-write failure reconciles without entitlement leakage.
* Refund/dispute transitions revoke access according to the approved policy.
* Waitlist submission creates no Auth or member record.
* Browser roles cannot mutate waves, invitations, payment evidence, subscriptions, provider events, or entitlement grants.

Source-text assertions are not sufficient for these acceptance tests; exercise real route handlers, database constraints/RLS, and a disposable Supabase environment.

## 10. Monitoring and stop conditions

Pause invitation issuance immediately when:

* a direct public signup succeeds;
* an invitation is accepted twice;
* Auth users exist without a traceable eligible invitation;
* payment or webhook reconciliation is behind or ambiguous;
* entitlement exists without eligible subscription state;
* wave capacity reaches its approved ceiling;
* recovery, cost, email, or security review enters hold state.

No automatic process may open the next wave.

## 11. Trade-offs and recommendation

Using Supabase's admin invitation path is the lowest-complexity Wave 1 design and keeps password and email-verification mechanics with the provider. The trade-off is a small saga/reconciliation layer because Auth user creation and application state cannot be assumed atomic.

A fully custom create-user flow would provide more control but would increase password, email, recovery, and partial-failure responsibility. Do not choose it for Wave 1 unless provider invites cannot meet the required user experience.

**Recommendation:** keep the current application gate closed, disable provider-level public signup, implement the invitation/payment/outbox contract above, and open `ACCOUNT_ADMISSION_MODE=invitation` only after the provider configuration tests and end-to-end acceptance suite pass.
