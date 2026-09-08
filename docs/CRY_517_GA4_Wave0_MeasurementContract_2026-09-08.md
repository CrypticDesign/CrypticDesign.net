# CRY-517 — GA4 Wave 0 Measurement Contract

Date: 2026-09-08  
Implementation base: `origin/main` at `9f25dcfe4606109927efa94c28e3c19edf31c57a`

## Provider and data-stream decision

Robert confirmed `G-WRXM0WLPF9` as the correct production GA4 property/data-stream measurement ID on 2026-09-08. The preserved Squarespace ID `G-XBP2025J3N` is rejected for this implementation because it is not the current property Robert selected. No duplicate property was created and no external Google Analytics setting was changed.

Production configuration remains environment-driven through `NEXT_PUBLIC_GA_MEASUREMENT_ID`. Missing configuration, tests, development, and any host other than `crypticdesign.net` or `www.crypticdesign.net` fail closed. This excludes local, branch-preview, and `demo.crypticdesign.net` traffic from the canonical production stream.

## Consent and loading

The Google tag is not requested until a visitor affirmatively allows analytics. The preference is stored as one first-party local-storage value: `cryptic.analytics-consent.v1`, with `granted` or `denied` as its only valid values. The footer and Privacy Policy expose a control that lets the visitor change or revoke the preference. Revocation sets GA consent to denied and activates the measurement-ID-specific `ga-disable` flag.

## Event contract

| Event | Allowed payload |
| --- | --- |
| `page_view` | `page_path`: canonical pathname only |
| `experience_play` | `experience_id`: stable public runtime key |
| `community_open` | `source`: stable governed CTA key |
| `request_access_open` | `source`: stable governed CTA key |
| `request_access_submit` | `method`: fixed `mailto_handoff`; no form values |
| `sign_in_open` | `source`: stable governed CTA key |
| `release_view` | `release_slug`: stable public slug |
| `product_view` | `product_slug`: stable public slug |
| `outbound_link` | `destination_domain`, bounded destination category; no full URL |

Every transmitted event receives a canonical page location without a query string and a referrer reduced to origin plus pathname. Only allowlisted, token-shaped `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and `utm_term` values are mapped to GA campaign fields; no custom attribution profile is persisted.

Names, emails, account/member/Character identifiers, Request Access contents, invitation/admission/authentication tokens, payment/order data, private state, arbitrary queries, per-frame input, audio history, advertising audiences, and replay/heatmap data are outside this contract.

## Environment matrix

| Runtime | Host | Measurement ID | Visitor consent | Result |
| --- | --- | --- | --- | --- |
| Production | `crypticdesign.net` or `www.crypticdesign.net` | Valid `G-` value | Granted | Tag loads; bounded events may send |
| Production | Canonical host | Missing or invalid | Any | Disabled |
| Production | Any preview, demo, or local host | Any | Any | Disabled |
| Development or test | Any | Any | Any | Disabled |
| Production | Canonical host | Valid | Missing or denied | Tag does not load; events do not send |

## Verification record

Verified on 2026-09-08 against the production build generated from this branch:

- `npm test`: 295 passed, 0 failed.
- TypeScript no-emit check: passed.
- `npm run lint`: passed.
- `npm run build` with `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-WRXM0WLPF9`: passed; 78 static routes generated.
- In-app browser journeys passed for Home → Entertainment → explicit experience activation → Community → Request Access and Release → Product.
- Browser resource timing and DOM inspection found zero GA scripts and zero GA collection resources on `127.0.0.1`, confirming local fail-closed behavior. No browser console errors were recorded; an existing Three.js deprecation warning was present.

Live canonical-host dispatch remains intentionally unverified in this local-only change because no deployment or Google Analytics administration change was authorized. After an approved deployment, validate consent grant/revoke, one `page_view` per canonical route change, the nine event names and payload shapes, absence of query strings/direct identifiers, and the GA4 Realtime/DebugView results before closing production verification.
