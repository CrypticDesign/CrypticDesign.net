# Product: CrypticDesign.net

**Last updated:** 2026-09-09
**Method:** codebase scan + existing CRY-517 decisions

## Product Identity
- **One-liner:** Visitors explore Cryptic Design's public worlds, releases, music, interactive experiences, creator work, and community paths, while admitted members can return to persistent personal capabilities.
- **Category:** owned entertainment and creative-platform web application
- **Product type:** hybrid B2C/public-audience platform with controlled member capabilities
- **Collaboration:** hybrid; public discovery is active, while deeper community participation opens in governed stages

## Business Model
- **Monetization:** public access with an invite-only paid membership model planned under the account-admission contract
- **Pricing tiers:** public access is free; the initial planned membership offer is $5 USD per month, but open registration and payment collection are not active
- **Billing integration:** no active browser billing integration detected; production admission and payment remain separately gated

## Tech Stack
- **Primary language:** TypeScript
- **Framework:** Next.js 15 App Router with React 19
- **Database:** PostgreSQL through Supabase for approved account, Character, entitlement, and experience state
- **Background jobs:** Supabase-backed admission outbox worker; no general browser analytics job system
- **HTTP client patterns:** browser-native loading and fetch patterns; GA4 uses the hosted `gtag.js` library
- **Module organization:** routes in `src/app`, shared product logic in `src/lib`, reusable client surfaces in `src/components`

## Value Mapping

### Primary Value Action
**Engage with a published experience or release** — visitors discover, open, play, listen to, or continue into Cryptic Design's public work. If this drops to zero, the public platform is not delivering its primary value.

### Core Features (directly deliver value)
1. **Entertainment and world discovery** — routes visitors into games, music, video, visual studies, releases, and connected franchises.
2. **Interactive experiences** — lets visitors deliberately activate playable or immersive public experiences.
3. **Release and product continuity** — connects individual releases to the wider product or franchise universe.
4. **Community discovery** — exposes current participation paths while preserving the staged admission boundary.

### Supporting Features (enable core actions)
1. **Account and Character identity** — supports admitted-member continuity without making private identity part of public analytics.
2. **My Library and My Home** — preserve selected releases and personal continuity for supported sessions.
3. **Request Access and Sign In** — provide governed entry paths without enabling open registration.
4. **Professional services and public creator profiles** — connect the owned platform to studio work and approved public identity.

## Entity Model

### Users
- **ID format:** Supabase Auth UUID for admitted accounts; no user ID is sent in GA4 Wave 0
- **Roles:** public visitor, admitted member, and governed administrative roles in the application; roles are not analytics traits in Wave 0
- **Multi-account:** no

### Accounts
- **ID format:** Supabase Auth UUID at the application layer
- **Hierarchy:** individual account with separately governed Character and entitlement records; GA4 Wave 0 does not identify or group accounts

## Group Hierarchy

No analytics group hierarchy. GA4 Wave 0 is anonymous, browser-level public measurement only.

**Default event level:** anonymous browser/client session
**Admin actions at:** not measured in GA4 Wave 0

## Current State
- **Existing tracking:** direct browser `gtag.js` integration for GA4 property `G-WRXM0WLPF9`
- **Documentation:** partial before this telemetry foundation; the CRY-517 measurement contract defines privacy, environment, consent, and event boundaries
- **Known issues:** Google Tag Assistant detects the configured tag and destination but reports deferred events and no transmitted hits from the production implementation

## Integration Targets
| Destination | Purpose | Priority |
|-------------|---------|----------|
| GA4 (`G-WRXM0WLPF9`) | Aggregate, consented public visits and feature engagement | Production / Wave 0 |

## Codebase Observations
- **Feature areas inferred:** Home/My Home, Entertainment, releases, products/franchises, Community, Professional, creator tools, account/admission, Character, My Library, search, and privacy controls
- **Entity model inferred:** anonymous public visitors plus controlled Supabase-backed accounts, Characters, memberships, entitlements, saved releases, and experience state
