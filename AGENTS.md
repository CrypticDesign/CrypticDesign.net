# CrypticDesign.net — Repo Operating Policy

This repository is the implementation source of truth for the CrypticDesign.net platform (Jira epic CRY-242). Architecture and Sitemap v20 policy live in Confluence, executable work lives in Jira, and Figma/FigJam is optional reference tooling rather than a completion gate.

## Locked platform model (Sitemap v20 and low-cost wave launch policy — current direction, confirmed 2026-09-09)

- The current model combines Sitemap v20 and the canonical Platform Information Architecture with the CRY-489 admission contract and the development-experience public-gating policy. `docs/CRY_LowCostWaveLaunchArchitecture_v1_2026-08-03.md` is historical launch-planning input where later Jira, Confluence, repository, or production evidence supersedes it. The checked-in implementation and verified production deployment are current executable evidence; Figma availability never blocks governed implementation or closeout.
- Signed-out primary navigation uses **Home · Play · Community · Professional** with **Sign In** as the account utility. Signed-in navigation uses **My Home · Play · Community · Professional** with **Account** as the account utility. **Search** remains a global utility rather than a primary-nav destination; Store remains contextual unless an approved Jira scope changes that model.
- **Home** (`/`) is the public Cryptic Design introduction for signed-out visitors. **My Home** (`/`) is the authenticated personal dashboard state.
- **Entertainment Hub** (`/entertainment`) is the audience front door for releases, franchises, games, cinema, audio, rooms, visual studies, and experiments.
- **Community** (`/community`) is the governed front door for creators, groups, events, and participation states; community identity never grants account, operator, or administrative authority.
- **Professional** (`/professional`) is the Cryptic Design LLC front door for services, collaborations, capabilities, research, partnerships, and inquiries.
- **Sign In / Account** is state-aware in the global navigation. **Request Access** routes to `/account/create`; requesting access does not create an account or guarantee admission. Account-level subnavigation is shown only after authentication.
- Public discovery and approved released media remain accountless. Unfinished games, worlds, prototypes, and development experiences may be publicly discoverable but must fail closed at their executable boundary unless Robert explicitly approves a public release or the viewer has an exact server-resolved development entitlement. Public discovery must never create an anonymous Auth identity.
- A request-access or waitlist entry is not an Auth identity and must never create an account automatically.
- Initial production accounts are invite-only and require verified payment eligibility. Open registration remains disabled until Robert approves the financial, recovery, security, provider, and payment gates.
- `ACCOUNT_ADMISSION_MODE` is an operational display/state flag and never enables browser signup. Invitation admission must use the approved server-only path and remain closed until the CRY-489 launch wave, provider, payment, recovery, and acceptance gates pass.
- The initial subscription offer is **$5 USD per month**; displaying a preview does not authorize payment collection, vendor activation, spending, or public invitations.
- Do not add breadcrumbs to the current global or account page system. Use the primary and contextual subnavigation patterns approved for the page family.
- **Products & Franchises** (`/products`): Singularis, Lifa, Cryptic Signal, and Image of the Day are surfaced contextually through Entertainment and Creative Labs / Visual Studies. **Soundwave is tombstoned and is not a product, destination, or public brand surface.**
- **Cryptic Signal** (`/audio` and contextual product views) is the public music and sonic-media division. Do not describe it as Soundwave-powered or as Soundwave integration. Cryptic Design Audio is retired as a public brand; CDA catalog identifiers may remain internal.
- Rights and visibility governance is non-negotiable: nothing renders publicly without passing `isPubliclyRenderable`.
- New backend-heavy systems remain frontend previews until Robert explicitly approves the backend execution step. Existing approved production foundations remain governed by their Jira, migration, security, and operational evidence.
- Treat Sitemap v19 and earlier sitemap/Confluence models as historical reference where they conflict with Sitemap v20, canonical Confluence authority, current Jira decisions, current code, or verified deployment behavior.

## Deployment environments

- **Canonical production:** `https://crypticdesign.net/`. Production behavior, repository `main`, Jira, and Confluence are the current delivery evidence chain.
- `https://www.crypticdesign.net/` redirects to the canonical production domain.
- `https://demo.crypticdesign.net/` is a staging/reference alias for pre-production verification. It does not supersede production or establish a separate product model.
- Canonical, Open Graph, robots, sitemap, and host metadata use `https://crypticdesign.net`.

## Deployment cost discipline (Netlify)

Netlify project `frabjous-frangipane-650548` is linked to this GitHub repository with `main` as its production branch and automatic publishing enabled. **Production deploy credits, bandwidth, requests, and compute are finite and metered.** The verified incident state on 2026-10-20 is Personal, 1,000 credits/month, auto recharge disabled, and the project paused after consuming 1,100 credits. Web bandwidth dominated the period at 42.89 GB / 857.7 credits; 11 production deploys consumed 165 credits, 127,065 web requests consumed 25.4 credits, and compute consumed 51.9 credits.

- **Every push/merge to `main` triggers a production build that spends credits.** Opening or updating a pull request against `main` creates a non-production Deploy Preview instead. An ordinary feature-branch push without an open pull request does not deploy; branch deploys are limited to the branches explicitly enabled in Netlify.
- **Never use `main` as the debugging loop.** In July 2026, ~13 same-day pushes to `main` burned 275 of 300 monthly credits in four days and froze the demo. Do not repeat this.
- **Validate locally before deploying.** Run `npm run build`, `tsc --noEmit`, `npm test`, and viewport QA (`scripts/qa-viewports.mjs`) on a branch first. The deploy is the last step after the change is proven, not the tool you use to prove it.
- **One coherent unit = one merge = one deploy.** Batch related edits on a branch, open a PR, get review, then merge once. Do not push a fix, notice a problem, and push again — that is two builds where one would do.
- **Do not push directly to `main`.** Work on `agent/<topic>` branches and merge via PR. This gates review and naturally batches deploys.
- **Do not trigger production from Netlify UI, CLI, API, or MCP during routine work.** Provider-side Git-only production enforcement and GitHub `main` protection are required controls; their exact configuration and the verified trigger map are in `docs/CRY_363_GitHubNetlifyDeploymentWorkflow_2026-09-10.md`.
- **Treat every deploy as a spend.** Before merging, confirm the change is worth a build credit and that nothing else is about to follow it that could be batched in.
- **Treat every large asset response as a spend.** Google Analytics is not a bandwidth ledger: bots, crawlers, hotlinks, clients that block analytics, and non-consenting browsers still generate Netlify requests and bytes.
- **Never attach or preload public audio/video globally before playback intent.** A root-layout media element must keep its source unset while idle and use `preload="none"`; browser/network verification must prove zero media requests before Play.
- **Do not use Netlify static hosting as the long-term origin for public media.** The four-track preview catalog may remain only as a temporary fallback. The current recommendation is Cloudflare R2 through `NEXT_PUBLIC_AUDIO_BASE_URL`, subject to explicit provider, billing, DNS, and environment approval.
- **Do not buy credits before removing preventable traffic multipliers.** The site is paused now; land and verify containment before service resumes.
- **Capture the first 24 hours after resumption.** Personal Observability retains only 24 hours, so record `Bandwidth by URL` and `Bandwidth by client type` before the evidence expires.

## Sitemap sync rule

Route, navigation, and IA changes must be reconciled with Sitemap v20 in canonical Confluence authority and executable Jira scope. Record approved drift in Jira and the repository's relevant architecture/account evidence. Figma/FigJam may visualize an approved decision, but no design-tool frame, link, node, subscription, or synchronization step is required for definition, implementation, approval, or completion. Board `oen38yFKbFtgqx9LQKn38Y` remains historical/reference material unless Robert explicitly promotes a synchronized revision to current authority.

## Core doctrine

- Releases are the core published objects; lanes are discovery paths that route to releases.
- Collections are optional grouping pages. Projects do not automatically become top-level hubs.
- Do not organize the platform primarily by media type.
- External platforms are syndication endpoints, never the source of truth.

## Rules

- Never commit secrets, API keys, or credentials. Use `.env.local` (ignored) and document variable names in `.env.example`.
- Keep changes small and reviewable. Preserve working functionality.
- Work on `agent/<topic>` branches and merge via PR. Do not push to `main` directly — every push deploys and spends Netlify credits (see Deployment cost discipline).
- Use placeholder-safe content only; no CLIENT or UNCLEAR IP in public-facing content.
- Every page supports mobile and desktop.
- No backend-heavy systems without explicit approval.
- No destructive file moves or broad refactors without approval.

## Response completion protocol

Apply this rule to every assistant and agent response in every session loop:

1. End with a clear **Accomplished** summary stating what was completed, changed, verified, created, attempted, decided, or left unresolved.
2. Follow the summary with exactly four numbered **Action options** that are concrete, materially distinct next steps.
3. Add a fifth numbered option labeled **Do all** when executing all four actions together is relevant, authorized, and safe.
4. When **Do all** is not relevant, state that it is not applicable rather than inventing unnecessary work.
5. Keep the action menu grounded in the current task, Jira, Confluence, Figma, GitHub, repository state, and Robert's latest explicit direction.
6. Distinguish successful mutations from failed attempts, permission errors, blockers, and pending work.
7. Do not use the action menu to defer work that was already authorized and should have been completed in the current response.
8. Apply this format after audits, mutations, drafts, troubleshooting, research, and partial completions.

## Public vocabulary

- Use the approved CRY-271 vocabulary in `docs/CRY_271_PublicVocabularyProposal_2026-07-13.md` for all audience-facing copy.
- Public copy names what a person can see, do, or expect. Keep implementation and governance terms such as `lane`, `surface`, `shell`, `placeholder`, `V1`, `review queue`, and field-level publication statuses internal.
- Use **Home**, **My Home**, **Play**, **Entertainment Hub**, **Community**, **Professional**, **Sign In**, **Request Access**, **Account**, **Cryptic Signal**, **release**, **product**, **franchise**, **world**, **Character**, and **My Library** consistently with the current state-aware Sitemap v20 model.
- CTAs begin with a specific verb and name the outcome or destination. Preview forms must state clearly when data is saved only in the browser and is not submitted.
- `platform`, `system`, `rights`, and `production` remain valid when they add specific meaning; do not use them as vague interface filler.

## Source-of-truth links

- Canonical platform architecture: `https://crypticdesign.atlassian.net/wiki/spaces/TEAM/pages/440041473/CrypticDesign.net+Platform+Architecture`
- Canonical Sitemap v20 / information architecture: `https://crypticdesign.atlassian.net/wiki/spaces/TEAM/pages/434667532/Platform+Information+Architecture`
- Development-experience public gating: `https://crypticdesign.atlassian.net/wiki/spaces/TEAM/pages/473235458/`
- Historical launch-planning input: `docs/CRY_LowCostWaveLaunchArchitecture_v1_2026-08-03.md` (superseded where current Jira, Confluence, repository, or production evidence differs)
- Account admission contract: `docs/CRY_489_SingleUseInvitationAdmissionContract_2026-08-16.md`
- Visual direction: `docs/CRY_VisualDirection_IntegratedScreens_2026-07-12.md`
- Jira: CRY-242 and its current children, including CRY-489 and CRY-522 for admission and executable-development boundaries
- FigJam historical/reference board: `figma.com/board/oen38yFKbFtgqx9LQKn38Y`
- Historical Sitemap v19 and earlier Confluence/FigJam IA material remains reference-only where it conflicts with current policy, code, or verified deployment.
