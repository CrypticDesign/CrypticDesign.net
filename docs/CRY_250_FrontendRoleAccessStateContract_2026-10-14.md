# CRY-250 — Frontend Role and Access-State Contract

Status: implementation contract

Date: 2026-10-14

Authority: CRY-242, Sitemap v20, current account/admission/entitlement authority, and repository `main`

## Purpose

`src/lib/frontend-access-state.ts` provides a typed, frontend-only contract for describing access without creating a new authorization service. The server or another approved authoritative boundary must still resolve real roles and entitlements.

## Domain separation

The contract keeps these domains explicit and independent:

| Domain | What it describes | What it cannot grant |
| --- | --- | --- |
| Account identity | Anonymous, authenticated, or suspended account session | Character, membership, role, or entitlement |
| Character identity | Persona lifecycle and presentation | Account or operator authority |
| Membership | Request/admission/member lifecycle | Subscription, role, or entitlement |
| Subscription | Commercial lifecycle presentation | Production access without an authoritative entitlement |
| Progression | Level and achievement presentation | Account, operator, administrative, or paid access |
| Role | Creator, client, operator, or administrator responsibility | Access unless the evidence is authoritative and current |
| Entitlement | Explicit capability/resource grant | Broader identity or role authority |

## Presentation states

- `allowed` — public access or current authoritative account/role/entitlement evidence.
- `denied` — required evidence is missing or the account is suspended.
- `unavailable` — capability is not currently usable.
- `preview` — local/fixture presentation only; never production-authorized.
- `expired` — the relevant role or entitlement evidence is no longer current.
- `deferred` — approved future direction that is not active.

Every returned state includes user-facing copy and an explicit `productionAuthorized` boolean. Fixture evidence always resolves to `preview` with `productionAuthorized: false`.

## Representative fixtures

`FRONTEND_ACCESS_FIXTURES` covers public, account, member, creator, client, operator, and administrator presentations. The fixtures use non-production identifiers and exercise all six presentation states.

## Security and scope boundary

The resolver intentionally ignores Character state, progression, membership status, and subscription status when deciding protected access. Subscription or purchase presentation must be converted into an explicit authoritative entitlement by an approved backend before protected content may resolve to `allowed`.

This work does not introduce authentication, billing, commerce, persistent entitlement storage, or administrative backend behavior.
