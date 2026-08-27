# CrypticDesign.net Low-Cost Wave Launch Architecture v1

**Status:** APPROVED / LOCKED LOCAL BASELINE — external source synchronization pending
**Date:** 2026-08-03
**Approved and locked:** 2026-08-04
**Owner / final decider:** Robert Croft
**Initial property:** Singularis
**Scope:** Cost-constrained MVP architecture, Wave 1 acceptance scope, admission model, entity/cardinality model, and operating-cost ledger
**External mutations:** None. This document does not authorize Supabase paid-plan activation, payment-provider setup, Jira/Confluence/Figma changes, deployment, or public launch.

## 1. Decision summary

### Approved navigation label update — 2026-08-27

Robert approved the main-menu sequence **Home / Play / Community / Professional**, renaming the existing **Explore** primary label to **Play**. Play retains the /entertainment destination, cyan identity, active-route matching, and existing drawer behavior. The compact header uses the same Play label. This is a label-only change: contextual Explore navigation, page titles, homepage section copy, routes, Search, and Sign In / Account utilities are unchanged. Jira/Confluence/FigJam synchronization is pending separate write authorization; this note records the approved local drift from earlier sitemap labels.

CrypticDesign.net should launch through controlled subscriber invitation waves while keeping the public sampling experience static, accountless, and inexpensive.

The initial operating model is:

```text
Public visitor
  -> static CrypticDesign.net and Singularis pages
  -> static public samples
  -> waitlist
  -> invitation
  -> subscription checkout
  -> subscriber account activation
  -> My Home / My Library / Singularis subscriber access
```

The initial admission ceiling is 1,000 subscriber accounts, opened manually in batches:

| Batch | New invitations | Maximum activated subscribers after batch |
|---|---:|---:|
| Wave 1A | 100 | 100 |
| Wave 1B | 150 | 250 |
| Wave 1C | 250 | 500 |
| Wave 1D | 500 | 1,000 |

The 1,000 figure is an admission ceiling, not a simultaneous-user target and not an automatic growth rule. Every batch requires a manual review and Robert's approval.

Supabase Free remains the development/staging service. Supabase Pro should be activated immediately before accepting the first paid subscriber because the existing production decision requires non-pausing service and scheduled backups for public customer data. The current expected application-service floor is $25/month, excluding payment fees, domain/hosting commitments already in place, transactional email overages, and external media/broadcast services.

The approved initial subscription offer is **$5 USD per month**. Annual billing, introductory-duration rules, future price changes, taxes, and payment-provider fees remain separate decisions.

## 2. Architectural decision record

### Context

Cryptic Design needs an MVP that:

- keeps founder cash exposure as low and predictable as possible;
- launches one franchise, Singularis, before expanding to other internal or external properties;
- supports game, music, video, articles/lore, library, progression, public profiles, community, live events, store, and public sampling;
- does not create free registered accounts during the initial launch phase;
- permits public visitors to experience static samples without an account;
- can admit subscribers in controlled waves while capacity, support, and revenue mature;
- preserves a clean path for internally owned, licensed, commissioned, distributed, and co-owned IP;
- keeps releases, commercial products, offers, access rules, and rights separate;
- builds on the checked-in Supabase membership, entitlement, identity, and character foundation rather than replacing it.

### Decision

Adopt a **static-public / subscriber-dynamic / manually waved** architecture:

1. Public pages and samples are static or CDN-cached and require no platform account.
2. Waitlist identity is separate from account identity.
3. Accounts are created or activated only for invited paying subscribers.
4. A single initial subscription plan grants the MVP subscriber benefits.
5. Supabase stores compact relational metadata, authentication, entitlements, profiles, library records, and summarized game progress.
6. Large media, game binaries, broadcast streams, and high-frequency telemetry do not flow through Supabase at MVP launch.
7. Wave admission is explicit, auditable, reversible, and manually approved.
8. The visible navigation hierarchy is not encoded as the database hierarchy.

### Options considered

| Option | Fixed cost | Operational risk | Scalability | Decision |
|---|---:|---|---|---|
| Open public account registration on Supabase Free | Lowest | High for paid launch; no scheduled backups | Broad sign-up, weak launch control | Rejected |
| Paid subscriber launch on Supabase Free | $0 Supabase subscription | Unacceptable customer-data recovery posture | Technically possible at small scale | Rejected |
| Supabase Pro before any public waitlist | At least $25/month immediately | Low | Good | Deferred as unnecessary before paid admission |
| Static waitlist phase, then Supabase Pro for first paid wave | $0 incremental during preparation; $25/month at paid launch | Controlled | Good through early waves | **Selected** |
| Custom/self-hosted auth and PostgreSQL | Variable | High founder operations burden | Potentially high | Rejected for MVP |

### Consequences

What becomes easier:

- predictable early operating cost;
- controlled support load;
- capacity observation between batches;
- static public discovery and previews;
- future addition of new IP without Singularis-specific schema;
- future commercial models without rewriting identity.

What becomes harder:

- waitlist and invitations require operational discipline;
- account creation cannot remain an unrestricted public flow;
- all requested features must ship in minimum viable forms rather than their most infrastructure-heavy forms;
- the existing public IA and account copy must be reconciled with subscription-only registration;
- billing-provider integration is still a separate gated project.

Revisit triggers:

- sustained invoice above the approved monthly ceiling;
- more than 1,000 activated subscribers;
- more than 100 simultaneous authenticated sessions observed or forecast;
- requirement for native live chat, native live video/audio broadcast, or multiplayer state;
- subscriber media delivery approaches the hosting/CDN allowance;
- recovery requirements exceed seven-day daily backups;
- a licensed or partner IP introduces new territorial, contractual, or data-separation obligations;
- free registered accounts become strategically justified.

## 3. MVP system boundary

### 3.1 Public, accountless layer

The public layer should include:

- Cryptic Design company home;
- Entertainment and Professional discovery;
- Singularis franchise director at the approved canonical franchise route;
- Singularis game, video, music, article/lore, and communication descriptions;
- static game sampling that does not save server-side progress;
- compressed music/video samples delivered through the existing CDN or an approved external media service;
- public product/subscription presentation;
- waitlist enrollment and privacy/consent language;
- public event pages and externally delivered broadcast embeds where approved.

The public layer must not require anonymous Supabase Auth sessions. Anonymous browsing should not consume authenticated MAU or create dormant identity records.

### 3.2 Subscriber layer

The subscriber layer should include:

- account authentication and recovery;
- one active subscription option;
- My Home;
- My Library;
- compact Singularis progress and session summaries;
- subscriber-only complete releases or editions;
- optional public-facing profile with member-controlled visibility;
- asynchronous community participation in its cheapest supportable form;
- subscriber-gated event pages;
- entitlements derived from the active subscription.

### 3.3 Explicit MVP exclusions

The MVP should not include:

- free registered accounts;
- native video broadcasting;
- native audio broadcasting;
- always-connected gameplay telemetry;
- native multiplayer state synchronization;
- persistent presence indicators;
- native real-time chat;
- large media delivery from Supabase Storage unless a measured test proves it remains within the cost envelope;
- automatic opening of admission waves;
- automatic account creation from a waitlist entry;
- multiple paid tiers at launch;
- product purchases beyond the initial subscription option;
- a custom database or authentication platform.

These are deferrals, not permanent product prohibitions.

## 4. Wave 1 subscriber experience

### 4.1 Minimum subscriber promise

A Wave 1 subscriber receives:

1. A production account created through an approved invitation and subscription flow.
2. Access to My Home and My Library.
3. Access to the complete subscriber-designated Singularis game release.
4. Access to subscriber-designated Singularis music, video, articles/lore, and communications.
5. Persistent compact game progress and operation outcomes.
6. An optional public profile with explicit visibility controls.
7. Access to the MVP community surface.
8. Access to subscriber event pages and approved externally delivered live broadcasts.
9. Clear subscription state, renewal/cancellation information, and support path.

### 4.2 Cheapest acceptable implementation by capability

| Capability | Wave 1 implementation | Deferred expensive form |
|---|---|---|
| Singularis game | Existing static browser build; checkpoint/outcome persistence | Continuous server telemetry or multiplayer |
| Music | Compressed streams/samples and controlled subscriber links | Custom lossless streaming platform |
| Video | Prerecorded compressed delivery or approved external embed | Native transcoding/live video infrastructure |
| Articles/lore | Static or cached content pages | Personalized content feeds |
| Library | Relational references to entitled/saved items | Offline synchronization across native apps |
| Progression | Versioned checkpoint and final-session summary | Per-frame or per-action event ingestion |
| Public profile | Handle, display name, avatar reference, selected achievements | Social graph and activity feed |
| Community | Moderated asynchronous discussion or event thread | Persistent native live chat |
| Live events | Subscriber-gated page with external broadcast embed | Cryptic-operated broadcast pipeline |
| Store | One subscription product with one active $5 USD/month offer | A full multi-product commerce catalog |
| Public sampling | Static, accountless, non-persistent excerpts | Saved anonymous progress |

### 4.3 Wave 1 acceptance criteria

#### Admission and subscription

- Public registration is unavailable without a valid, unexpired, unused invitation.
- Joining the waitlist does not create an Auth user or member profile.
- An invitation is bound to one normalized email address and one launch wave.
- Replaying the same checkout/provider event is idempotent.
- A failed or abandoned checkout does not grant subscriber entitlements.
- An active subscription grants the initial subscriber benefit set.
- Cancellation, expiration, refund, dispute, or termination revokes future subscriber access according to an explicitly approved grace policy.
- Provider identifiers and financial events remain server-only.

#### Access and privacy

- Every application table exposed through Supabase has RLS enabled.
- Subscriber content fails closed when the account, subscription, entitlement, rights, or publication state is invalid.
- Product marketing and approved public samples remain viewable without authentication.
- Private account data is never rendered through the public profile.
- Public-profile visibility defaults to off until the member intentionally enables it.
- Waitlist consent and subscriber account consent are stored separately.

#### Singularis runtime

- The first-contact overview is always presented and is never automatically skipped.
- The embedded game remains in a stable parent render tree and does not remount on telemetry updates.
- Only versioned checkpoints, lifecycle boundaries, and final summaries are eligible for persistence.
- The server rejects unknown game-state contract versions or records them for controlled migration; it never silently reinterprets them.
- A saved session can be restored or safely abandoned without corrupting the member's prior valid progress.

#### Reliability and recovery

- Production uses Supabase Pro or an explicitly approved replacement before the first paid subscriber is admitted.
- Daily provider backups are enabled.
- A separate logical export/recovery runbook is documented and tested.
- Authentication email delivery and scanner-resistant confirmation pass against an external mailbox.
- A database restore drill succeeds before Wave 1B.
- Critical account, entitlement, and progress mutations are idempotent.

#### Cost and performance

- Supabase spend cap remains enabled.
- No large audio, video, or game binary is served from Supabase without an explicit measured exception.
- No gameplay path opens a persistent Supabase Realtime connection.
- Normal gameplay does not produce continuous database writes.
- Cost and usage are reviewed before each invitation batch.
- The public site and static sample remain usable when subscriber services are temporarily unavailable.

#### Accessibility and support

- Invitation, checkout, sign-in, entitlement-denied, and recovery states are keyboard accessible and clearly worded.
- A subscriber can identify whether access is pending, active, past due, canceled, or expired.
- Robert has a documented path to pause invitations without disabling existing subscriber access.
- Known critical incidents have a rollback or containment procedure.

## 5. Entity and cardinality model

### 5.1 Creative, rights, publishing, and commerce

```text
Organization 1 ─────< PropertyRight >───── 1 Property
Organization 1 ─────< FranchisePublisher > 1 Franchise

Property     1 ─────< Franchise
Franchise    1 ─────< Work
MediaType    1 ─────< Work
Work         1 ─────< Edition

Work         1 ─────< PublicationRelease
Edition      1 ─────< PublicationRelease
Product      1 ─────< PublicationRelease

Product      1 ─────< ProductComponent >── 1 Work or Edition
Product      1 ─────< Offer
Offer        0..1 ── 1 TierDefinition

Work         0..* ──< WorkRelationship >── 0..* Work
Franchise    1 ─────< Communication
```

Rules:

- `Property` represents the governed IP/property, not a route.
- `Franchise` represents the audience-facing universe/project within a property.
- `Work` represents a creative work and has exactly one primary media type.
- `Edition` represents a version/configuration of a work.
- `PublicationRelease` records a publication/availability event. It is not a product and does not imply payment.
- `Product` represents commercial packaging.
- `ProductComponent` permits a product to contain multiple works/editions and permits a work/edition to appear in multiple products.
- `Offer` defines how a product can be acquired in a territory, currency, and time window.
- The initial subscription is one product with one active offer; the schema does not assume that all future products are subscriptions.
- A product release is represented by a `PublicationRelease` targeting a `Product`; this removes the false choice between “release” and “product.”

### 5.2 Rights for internal and external IP

```text
Property 1 ─────< PropertyRight
Organization 1 ─< PropertyRight (grantor)
Organization 1 ─< PropertyRight (grantee)
PropertyRight 1 ─< RightMediaScope
PropertyRight 1 ─< RightTerritoryScope
```

Minimum `PropertyRight.relationship` values:

```text
owned
licensed_in
licensed_out
commissioned
distributed
co_owned
```

`PropertyRight` requires effective dates, permitted uses, territory scope, media scope, operational status, and a restricted contract-reference identifier. Public presentation consumes only an approved rights summary. It must never expose private contract terms.

### 5.3 Content access and preview

```text
AccessPolicy 1 ─────< AccessPolicyBinding >──── 1 governed target
AccessPolicy 1 ─────< PreviewAsset
Benefit      1 ─────< AccessPolicyRequirement > 1 AccessPolicy
```

The governed target can be a work, edition, release, product presentation, communication, or asset. Implement this with typed binding tables or a validated governed-resource registry; do not use an unconstrained polymorphic text reference.

Minimum access modes:

```text
public
subscription
private
operator_only
```

Minimum preview modes:

```text
none
excerpt
time_limited
feature_limited
```

The product presentation normally remains public even when its deliverable requires subscription access.

### 5.4 Waitlist, invitations, accounts, and waves

```text
WaitlistEntry 0..1 ───── 0..1 Invitation
LaunchWave    1 ─────────< Invitation
Invitation    0..1 ────── 0..1 MemberProfile
AuthUser      1 ────────── 1 MemberProfile
MemberProfile 1 ─────────< Subscription
TierDefinition 1 ────────< Subscription
PriceDefinition 1 ───────< Subscription
Subscription 1 ──────────< SubscriptionEvent
MemberProfile 1 ─────────< EntitlementGrant
```

Rules:

- A waitlist entry is not an account.
- A waitlist entry may be invited at most once at a time; expired/revoked invitations remain auditable.
- An invitation belongs to exactly one launch wave.
- An invitation may be accepted by at most one member profile.
- A member profile must map one-to-one to the Supabase Auth user, preserving the existing schema.
- Launch-wave capacity is enforced on successful subscriber activation, not merely on email delivery.
- Account creation and subscription activation must be transactionally coordinated or recoverably reconciled.
- An invitation token is stored only as a one-way hash; the raw token is shown/sent once.

Suggested admission tables:

```text
waitlist_entries
  id uuid PK
  normalized_email text UNIQUE
  email_hash text UNIQUE
  consent_version text
  consented_at timestamptz
  source text
  status waiting|invited|converted|declined|suppressed
  created_at timestamptz

launch_waves
  id uuid PK
  code text UNIQUE
  status planned|inviting|observing|paused|completed
  activation_limit integer
  opens_at timestamptz NULL
  closes_at timestamptz NULL
  approved_by uuid NULL
  approved_at timestamptz NULL
  created_at timestamptz

invitations
  id uuid PK
  launch_wave_id uuid FK
  waitlist_entry_id uuid FK NULL
  normalized_email text
  token_hash text UNIQUE
  status prepared|sent|accepted|expired|revoked
  expires_at timestamptz
  accepted_member_id uuid FK NULL UNIQUE
  sent_at timestamptz NULL
  accepted_at timestamptz NULL
  revoked_at timestamptz NULL
  created_at timestamptz

wave_reviews
  id uuid PK
  launch_wave_id uuid FK
  review_type pre_open|mid_wave|closeout
  reliability_state pass|hold
  capacity_state pass|hold
  cost_state pass|hold
  support_state pass|hold
  evidence jsonb
  recommendation open|continue|pause|close
  approved_by uuid NULL
  approved_at timestamptz NULL
  created_at timestamptz
```

The browser must not receive direct write permission for wave approval, invitations, subscriptions, provider events, or entitlement grants.

### 5.5 Library, profile, and game state

```text
MemberProfile 1 ───── 0..1 PublicProfile
MemberProfile 1 ─────< LibraryEntry >──── 1 Work or Edition
MemberProfile 1 ─────< GameProgress >──── 1 GameEdition
GameProgress  1 ─────< GameSession
GameSession   1 ─────< GameCheckpoint
MemberProfile 1 ─────< AchievementGrant
```

Rules:

- Public-profile data and private account data are separate projections.
- Library membership does not itself grant commercial entitlement.
- Entitlement does not require the member to add an item to the library.
- Game progress targets a stable edition identifier, not a URL.
- Game-session telemetry is summarized before persistence.
- Checkpoints are bounded in number and size; redundant telemetry is discarded or aggregated client-side.
- Contract versions are explicit and migrations are additive.

### 5.6 Stable identity and route projection

Every domain record uses a stable UUID. Slugs and routes are mutable presentation metadata.

```text
Canonical record ID
  -> current slug
  -> current canonical route
  -> previous route aliases / redirects
```

The current working route direction is:

```text
/entertainment/singularis
/entertainment/arcade/singularis/game-01
/entertainment/video/singularis/video-01
/entertainment/music/singularis/music-01
```

These routes project franchise and media relationships; they do not define database ownership. The repo's v18 IA instructions still describe older `/products` and `/releases` destinations. Robert's 2026-08-03 direction supersedes that historical organization for this working proposal, but Jira and FigJam must be reconciled before these routes become canonical implementation requirements.

## 6. Admission-control operating loop

### Trigger

Robert requests consideration of the next invitation batch, or the current wave reaches its observation checkpoint.

### Source inputs

- Supabase usage and upcoming invoice;
- hosting/CDN usage;
- authentication and entitlement errors;
- game persistence success/failure metrics;
- open critical defects;
- support requests and response capacity;
- subscriber activation, cancellation, refund, and dispute counts;
- media/broadcast vendor usage where applicable.

### Authority class

- Read and recommend: Class 0/1.
- Create local review packet: Class 2 within approved workspace scope.
- Send invitations, change billing, provision capacity, or open a wave: Class 3/4 and requires Robert's explicit approval or an approved runbook.

### Verification method

The wave review must pass all four gates:

```text
Reliability PASS
Capacity    PASS
Cost        PASS
Support     PASS
```

Any hold pauses new invitations while preserving existing subscriber access.

### Stop condition

- Robert approves opening/continuing the batch;
- Robert pauses or closes the wave;
- a critical defect, recovery failure, spend concern, rights issue, or support overload creates a hold;
- the 1,000-subscriber launch ceiling is reached.

### Usage guardrail

Run the full review once before a batch and once at its closeout. Use alerts for critical exceptions; do not create a high-frequency reporting loop that costs more than the service it observes.

## 7. Cost ledger

### 7.1 Cost states

All figures are planning estimates in USD and must be rechecked against vendor pricing before Robert authorizes spending.

#### State A — Development and public waitlist

| Cost item | Target | Guardrail |
|---|---:|---|
| Existing Netlify-hosted public site | $0 incremental | Batch changes; do not burn metered build credits through main-branch debugging |
| Supabase development project | $0 | Free project remains non-production; manual logical exports |
| Public static samples | $0 incremental target | Keep assets compressed and within existing hosting allowance |
| Waitlist | $0 target | Prefer a lightweight static/serverless form; no Auth user creation |
| Transactional email | $0 target within existing free allowance | Send only consent/confirmation/invitation messages needed for the flow |
| Payment processing | $0 before checkout | No provider activation or live charges without approval |
| Native Realtime/chat/broadcast | $0 | Excluded |
| **Target recurring incremental cost** | **$0** | Development/waitlist only; not a paid subscriber production state |

#### State B — Wave 1A through Wave 1D

| Cost item | Expected baseline | Included/avoidance strategy |
|---|---:|---|
| Supabase Pro | $25/month | One production project; spend cap on; Micro compute covered by included credit at current pricing |
| Additional Supabase compute | $0 target | No read replicas, branches left running, PITR, dedicated IPv4, or extra compute |
| Supabase MAU overage | $0 | 1,000 subscribers is far below the current 100,000 Pro MAU allowance |
| Supabase database overage | $0 | Compact relational state should remain far below the current included database allowance |
| Supabase egress overage | $0 | Large media and game binaries stay outside Supabase |
| Supabase Realtime overage | $0 | No launch dependency on Realtime |
| Supabase Edge Function overage | $0 | Use only for bounded server workflows where Next.js/server routes are unsuitable |
| External media/broadcast | $0 target / provider-dependent | Use approved free/low-cost external delivery; do not build native broadcast infrastructure |
| Transactional email | $0 target / usage-dependent | Keep invitation batches small and monitor provider allowance |
| Payment processing | Variable per successful charge | Treat as cost of revenue, not fixed infrastructure; confirm provider pricing before activation |
| Domain/DNS | Existing commitment | No new paid domain required for MVP |
| Netlify | $0 incremental target | Stay within the current plan/credit allowance and deploy coherent batches |
| **Target fixed recurring incremental cost** | **$25/month** | Excludes variable payment fees and any approved media vendor |

### 7.2 Supabase thresholds to monitor

As checked on 2026-08-03, Supabase publicly listed the following relevant allowances:

| Meter | Free | Pro baseline relevant to MVP |
|---|---:|---:|
| Monthly active authenticated users | 50,000 | 100,000, then metered overage |
| Database size | 500 MB | 8 GB, then metered overage |
| Egress | 5 GB | 250 GB, then metered overage |
| Storage | 1 GB | 100 GB, then metered overage |
| Edge Function invocations | 500,000 | 2 million, then metered overage |
| Realtime messages | 2 million | 5 million, then metered overage |
| Realtime peak connections | 200 | 500, then metered overage |

Pricing source: <https://supabase.com/pricing> and <https://supabase.com/docs/guides/platform/billing-on-supabase>.

The 500,000 number that prompted the original discussion corresponds to the current Free Edge Function invocation allowance, not an economical registered-user launch target.

### 7.3 Cost alerts

| Alert | Response |
|---|---|
| Forecast fixed cost exceeds $25/month without prior approval | Pause new invitations and identify the meter |
| Supabase egress rises because of media/game payloads | Move or cache the payload outside Supabase before next wave |
| Realtime connections appear in normal gameplay | Treat as an implementation regression unless explicitly approved |
| Database writes scale with frame rate or raw telemetry | Stop persistence path and aggregate client-side |
| Email allowance approaches exhaustion | Pause invitations; do not silently add a paid vendor tier |
| Netlify build credits approach monthly limit | Batch changes and postpone noncritical deployments |
| Recovery test fails | Block the next paid invitation batch |
| External broadcast requires paid capacity | Present a separate spend decision to Robert |

## 8. Security, privacy, and financial boundaries

- Never store payment card data in Cryptic Design systems.
- Verify payment-provider webhooks cryptographically and process them idempotently.
- Store only provider customer, price, subscription, invoice, and event references needed for reconciliation.
- Keep waitlist consent, marketing consent, account terms acceptance, and public-profile consent distinct.
- Normalize email for matching while preserving only the minimum operational data.
- Provide suppression/deletion handling before sending launch invitations at scale.
- Apply RLS to all member-scoped data and deny browser writes to authority-bearing tables.
- Do not let profile, character, achievement, library, or gameplay state grant account or commercial authority.
- Treat refunds, disputes, grace periods, and entitlement revocation as explicit state transitions.
- Do not activate payments, Supabase Pro, paid email, paid broadcast, or other vendors without Robert's explicit approval.

## 9. Source-of-truth reconciliation required

This packet records Robert's newer working direction but does not update external systems.

Conflicts to reconcile after approval:

1. Repo `AGENTS.md` identifies FigJam Sitemap v18 as canonical and preserves `/releases` and `/products` contextual destinations.
2. Robert's current direction consolidates the public experience around franchise and media routes, with `/entertainment/singularis` as the franchise director.
3. Existing account UI and architecture include free/member tier language that conflicts with the initial subscription-only account policy.
4. Existing sign-up is publicly reachable; Wave 1 requires invitation-gated registration.
5. Existing release seed data uses `/products/singularis` and `/releases/...`; the new route projection requires a planned redirect and migration matrix.

Required future synchronization surfaces:

- Jira epic/issues and acceptance criteria;
- Confluence architecture and membership documentation;
- FigJam sitemap version and route hierarchy;
- Figma screen flows and account/subscription states;
- repository route, navigation, access, and copy implementation.

Jira, Confluence, Figma/FigJam, GitHub, Supabase billing, payments, and deployment remain approval-gated.

## 10. Implementation sequence

### Gate 0 — Approve architecture

- Robert approves or revises this packet.
- Resolve whether the initial 1,000 ceiling counts active paying subscribers or all activated subscriber accounts. Recommended: activated subscriber accounts for admission control, with active-paying count reported separately.
- Initial launch subscription price and interval approved: $5 USD per month.

### Gate 1 — Reconcile source systems

- Update Jira-ready acceptance criteria.
- Update Confluence architecture.
- Version the FigJam sitemap.
- Update Figma flows.
- Produce the implementation handoff packet.

### Gate 2 — Build $0 preparation state

- Static public previews.
- Waitlist without account creation.
- Invitation data model and operator-only tooling in an isolated environment.
- Subscriber-only account flow behind a disabled launch flag.
- Cost and recovery dashboards/checklists.

### Gate 3 — Paid-production readiness

- Approve and activate Supabase Pro.
- Confirm production domain, redirects, SMTP, CAPTCHA, administrator recovery, privacy/terms, and dependency risk.
- Configure payment provider after explicit approval.
- Test webhook idempotency and entitlement reconciliation.
- Test backup/export/restore.

### Gate 4 — Wave 1A

- Approve 100 invitations.
- Observe reliability, capacity, cost, conversion, cancellation, and support.
- Pause automatically on critical operational exceptions, but never open the next wave automatically.

### Gates 5–7 — 250, 500, and 1,000

- Repeat the wave review.
- Expand only after Robert approves each batch.
- Revisit the architecture before exceeding 1,000 activated subscriber accounts.

## 11. Open decisions

These decisions are intentionally not invented by this packet:

1. Whether to add annual billing after the monthly launch offer.
2. Payment provider and its exact fee structure.
3. External broadcast/video/audio delivery provider.
4. Minimum community form for Wave 1.
5. Grace-period behavior after failed payment or cancellation.
6. Waitlist communication frequency and marketing-consent language.
7. Public-profile handle policy, moderation, and age requirements.
8. Whether Wave 1 admissions are geographically restricted.
9. Exact retention periods for waitlist records, game sessions, entitlement decisions, and operational logs.

## 12. Approval statement

Robert Croft approved and locked this architecture as the local planning baseline on 2026-08-04. The team may use it to prepare source-of-truth reconciliation and implementation work.

The locked decisions are the static-public/subscriber-dynamic architecture, subscription-only registered accounts for the initial launch, an initial $5 USD/month subscription offer, accountless static public samples, manually approved admission waves of 100 → 250 → 500 → 1,000 activated subscriber accounts, Supabase Free for development/waitlist preparation, and Supabase Pro immediately before the first paid subscriber wave.

Changes to those decisions require a new Robert-approved revision or a superseding architecture record. Open decisions listed in Section 11 remain open and are not silently resolved by this approval.

This approval does **not** authorize spending, production provisioning, payment activation, public invitations, deployment, or external source-of-truth mutations. Jira, Confluence, Figma/FigJam, and implementation synchronization must follow their applicable authority gates.
