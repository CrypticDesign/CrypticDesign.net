# CrypticDesign.net — Repo Operating Policy

This repository is the implementation source of truth for the CrypticDesign.net platform (Jira epic CRY-242). Architecture lives in Confluence, executable work in Jira, and sitemap/IA in FigJam.

## Locked platform model (Sitemap v19 and low-cost wave launch policy — current direction, confirmed 2026-08-16)

- The current model combines the v19 information architecture with `docs/CRY_LowCostWaveLaunchArchitecture_v1_2026-08-03.md` and the CRY-489 admission contract. The checked-in implementation and verified staging deployment are the current executable evidence while Figma access is unavailable.
- Signed-out global navigation uses **Home · Entertainment · Professional · Sign In**. Signed-in navigation uses **My Home · Entertainment · Professional · Account**. The signed-out Home hero places **Sign Up** beside **Account Availability**. Search and Store remain planned/contextual destinations and must not be inserted into the primary navigation without an approved Jira scope.
- **Home** (`/`) is the public Cryptic Design introduction for signed-out visitors. **My Home** (`/`) is the authenticated personal dashboard state.
- **Entertainment Hub** (`/entertainment`) is the audience front door for releases, franchises, games, cinema, audio, rooms, visual studies, and experiments.
- **Professional** (`/professional`) is the Cryptic Design LLC front door for services, collaborations, capabilities, research, partnerships, and inquiries.
- **Sign In / Account** is state-aware in the global navigation. **Sign Up** routes to the signed-out account-benefits overview at `/account`, while **Account Availability** routes to `/account/create`. Account-level subnavigation is shown only after authentication.
- Public pages and static samples remain accountless. A waitlist entry is not an Auth identity and must never create an account automatically.
- Initial production accounts are invite-only and require verified payment eligibility. Open registration remains disabled until Robert approves the financial, recovery, security, provider, and payment gates.
- `ACCOUNT_ADMISSION_MODE` is an operational display/state flag and never enables browser signup. Future invitation admission must create Auth users through a server-only admin path after the CRY-489 provider and acceptance tests pass.
- The initial subscription offer is **$5 USD per month**; displaying a preview does not authorize payment collection, vendor activation, spending, or public invitations.
- Do not add breadcrumbs to the current global or account page system. Use the primary and contextual subnavigation patterns approved for the page family.
- **Products & Franchises** (`/products`): Singularis, Lifa, Cryptic Signal, and Image of the Day are surfaced contextually through Entertainment and Creative Labs / Visual Studies. **Soundwave is tombstoned and is not a product, destination, or public brand surface.**
- **Cryptic Signal** (`/audio` and contextual product views) is the public music and sonic-media division. Do not describe it as Soundwave-powered or as Soundwave integration. Cryptic Design Audio is retired as a public brand; CDA catalog identifiers may remain internal.
- Rights and visibility governance is non-negotiable: nothing renders publicly without passing `isPubliclyRenderable`.
- Backend-heavy systems remain frontend previews until Robert explicitly approves backend work.
- Treat v18 and earlier sitemap/Confluence models as historical reference where they conflict with v19, the low-cost launch architecture, CRY-446, CRY-489, current code, or verified deployment behavior.

## Deployment environments

- **Temporary staging source of truth:** `https://demo.crypticdesign.net/`. Use this URL for deployment verification, route and redirect smoke tests, visual review, and pre-production acceptance until Robert explicitly promotes the build or names a replacement staging URL.
- `https://crypticdesign.net/` and `https://www.crypticdesign.net/` remain production-facing domains and may continue serving the legacy site during staging. Do not interpret their state as evidence that the current Next.js staging deployment failed.
- Production metadata may intentionally use `https://crypticdesign.net` for canonical, Open Graph, robots, sitemap, and host values while the build is staged at the temporary URL.

## Deployment cost discipline (Netlify)

Demo hosting runs on Netlify (`frabjous-frangipane-650548`, project `demo.crypticdesign.net`), auto-deploying from GitHub on every push to `main`. **Build credits are finite and metered.**

- **Every push/merge to `main` triggers one production build that spends credits.** Plan allowances: Free = 300 credits/month, Personal = 1,000/month, Pro = 3,000/month. The billing period resets mid-month (currently the 17th). When credits run out, production deploys pause until reset — the demo freezes at the last successful build and review-by-demo goes dark for the rest of the cycle.
- **Never use `main` as the debugging loop.** In July 2026, ~13 same-day pushes to `main` burned 275 of 300 monthly credits in four days and froze the demo. Do not repeat this.
- **Validate locally before deploying.** Run `npm run build`, `tsc --noEmit`, `npm test`, and viewport QA (`scripts/qa-viewports.mjs`) on a branch first. The deploy is the last step after the change is proven, not the tool you use to prove it.
- **One coherent unit = one merge = one deploy.** Batch related edits on a branch, open a PR, get review, then merge once. Do not push a fix, notice a problem, and push again — that is two builds where one would do.
- **Do not push directly to `main`.** Work on `agent/<topic>` branches and merge via PR. This gates review and naturally batches deploys.
- **Treat every deploy as a spend.** Before merging, confirm the change is worth a build credit and that nothing else is about to follow it that could be batched in.

## Sitemap sync rule

Route, navigation, and IA changes must be reconciled with Sitemap v19. While the Figma subscription is unavailable, record approved drift in Jira and the repository's canonical architecture/account documents; keep Figma-dependent work in **Impediment** and do not block mixed documentation tickets that can proceed in Jira or Confluence. When Figma access is restored, synchronize the accumulated approved changes to board `oen38yFKbFtgqx9LQKn38Y` before treating the board as current again.

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
- Use **Home**, **My Home**, **Entertainment Hub**, **Professional**, **Sign In**, **Sign Up**, **Account Availability**, **Account**, **Cryptic Signal**, **release**, **product**, **franchise**, **world**, **character**, and **My Library** consistently with the current state-aware v19 model.
- CTAs begin with a specific verb and name the outcome or destination. Preview forms must state clearly when data is saved only in the browser and is not submitted.
- `platform`, `system`, `rights`, and `production` remain valid when they add specific meaning; do not use them as vague interface filler.

## Source-of-truth links

- Launch architecture: `docs/CRY_LowCostWaveLaunchArchitecture_v1_2026-08-03.md`
- Account admission contract: `docs/CRY_489_SingleUseInvitationAdmissionContract_2026-08-16.md`
- Visual direction: `docs/CRY_VisualDirection_IntegratedScreens_2026-07-12.md`
- Jira: CRY-242 and children, especially CRY-446 and CRY-489 for current navigation/account policy
- FigJam historical/reference board while access is unavailable: `figma.com/board/oen38yFKbFtgqx9LQKn38Y`
- Historical v18 and earlier Confluence/FigJam IA material remains reference-only where it conflicts with the current policy, code, or verified deployment.
