# CrypticDesign.net — Repo Operating Policy

This repository is the implementation source of truth for the CrypticDesign.net platform (Jira epic CRY-242). Confluence is the documentation source of truth, Jira is the execution and scheduling source of truth, and the checked-in application/runtime is the implementation source of truth. Figma and FigJam are optional working/reference surfaces, not completion gates.

## Locked platform model (Sitemap v20 — current direction, confirmed 2026-09-09)

- The current model combines Sitemap v20 with `docs/CRY_LowCostWaveLaunchArchitecture_v1_2026-08-03.md`, the CRY-489 admission contract, current Jira authority, and current repository/runtime evidence. Sitemap v18/v19 models are historical wherever they conflict with v20.
- Signed-out global navigation uses **Home · Play · Community · Professional**. Play routes into Entertainment. Account actions remain available through the governed utility controls without displacing the four signed-out primary destinations.
- **Home** (`/`) is the public Cryptic Design introduction for signed-out visitors. **My Home** (`/`) is the authenticated personal dashboard state.
- **Entertainment** (`/entertainment`) is the audience front door. Its primary hubs are Arcade, Music, and Video. Singularis is a cross-media franchise/property director, not a fourth media type. My Library is an Account/global utility, not an Entertainment category.
- **Community** (`/community`) is a major public pillar with approved subnavigation Explore, Groups, Spaces, Events, and Creators. Spaces remains conditional until a meaningful implementation exists; Community must not fabricate activity or maturity.
- **Professional** (`/professional`) is the Cryptic Design LLC front door for services, collaborations, capabilities, research, partnerships, and inquiries.
- **Account** owns administrative identity, security, settings, subscription/access, privacy, and account controls. **Character** is persistent member representation. **My Home** is the authenticated member aggregation surface. **Mission Control** is governed goals/progress/unlocks only where implemented.
- Public browsing remains accountless where authorized. Public Join is **Request Access** / waitlist unless an approved admission condition exists. A waitlist entry must never create a production Auth user or member profile.
- Initial production accounts are invite-only and require verified payment eligibility. Open registration remains disabled until Robert approves the financial, recovery, security, provider, and payment gates.
- `ACCOUNT_ADMISSION_MODE` is an operational display/state flag and never enables browser signup. Future invitation admission must create Auth users through a server-only admin path after the CRY-489 provider and acceptance tests pass.
- The initial subscription offer is **$5 USD per month**; displaying a preview does not authorize payment collection, vendor activation, spending, or public invitations.
- Do not add breadcrumbs to the current global or account page system. Use the primary and contextual subnavigation patterns approved for the page family.
- **Products & Franchises** (`/products`): Singularis, Lifa, Cryptic Signal, and other governed properties are surfaced contextually through current v20 destinations. **Soundwave is tombstoned and is not a product, destination, or public brand surface.**
- **Cryptic Signal** (`/audio` and contextual product views) is the public music and sonic-media division. Do not describe it as Soundwave-powered or as Soundwave integration. Cryptic Design Audio is retired as a public brand; CDA catalog identifiers may remain internal.
- Rights and visibility governance is non-negotiable: nothing renders publicly without passing `isPubliclyRenderable`.
- Backend-heavy systems remain frontend previews until Robert explicitly approves backend work.
- Treat v18/v19 sitemap and governance models as historical where they conflict with v20, current CRY-242 authority, current code, or verified deployment behavior.

## Deployment environments

- **Canonical production:** `https://www.crypticdesign.net/` and the approved root-domain behavior run the Netlify production application following the September 7, 2026 cutover.
- **Non-production verification:** `https://demo.crypticdesign.net/` remains available for staging/preview verification where a ticket names it. It is not the canonical production source of truth.
- Production metadata intentionally uses the approved `https://crypticdesign.net` canonical host policy. Preserve rollback evidence and do not retire the Squarespace rollback state without separate approval.

## Deployment cost discipline (Netlify)

Netlify project `frabjous-frangipane-650548` is linked to this GitHub repository with `main` as its production branch and automatic publishing enabled. **Production deploy credits are finite and metered.** The verified operating state on 2026-09-10 is Personal, 1,000 credits/month, 479.7 remaining, auto recharge disabled, 15 credits per production deploy, and zero deployment charge for Deploy Previews or branch deploys.

- **Every push/merge to `main` triggers a production build that spends credits.** Opening or updating a pull request against `main` creates a non-production Deploy Preview instead. An ordinary feature-branch push without an open pull request does not deploy; branch deploys are limited to the branches explicitly enabled in Netlify.
- **Never use `main` as the debugging loop.** In July 2026, ~13 same-day pushes to `main` burned 275 of 300 monthly credits in four days and froze the demo. Do not repeat this.
- **Validate locally before deploying.** Run `npm run build`, `tsc --noEmit`, `npm test`, and viewport QA (`scripts/qa-viewports.mjs`) on a branch first. The deploy is the last step after the change is proven, not the tool you use to prove it.
- **One coherent unit = one merge = one deploy.** Batch related edits on a branch, open a PR, get review, then merge once. Do not push a fix, notice a problem, and push again — that is two builds where one would do.
- **Do not push directly to `main`.** Work on `agent/<topic>` branches and merge via PR. This gates review and naturally batches deploys.
- **Do not trigger production from Netlify UI, CLI, API, or MCP during routine work.** Provider-side Git-only production enforcement and GitHub `main` protection are required controls; their exact configuration and the verified trigger map are in `docs/CRY_363_GitHubNetlifyDeploymentWorkflow_2026-09-10.md`.
- **Treat every deploy as a spend.** Before merging, confirm the change is worth a build credit and that nothing else is about to follow it that could be batched in.

## Sitemap and design-governance rule

Route, navigation, and IA changes must be reconciled with Sitemap v20 and explicit product/IA approval. Figma/FigJam may be used when useful, but missing files, nodes, screenshots, synchronization, prototypes, Dev Mode mappings, or Code Connect artifacts are never completion blockers. Approved direction may be recorded directly in Jira and Confluence and implemented in the repository.

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
- Use **Home**, **Play**, **Community**, **Professional**, **My Home**, **Entertainment**, **Arcade**, **Music**, **Video**, **Request Access**, **Sign In**, **Account**, **Character**, **Cryptic Signal**, **release**, **product**, **franchise**, **world**, and **My Library** consistently with the current v20 model.
- CTAs begin with a specific verb and name the outcome or destination. Preview forms must state clearly when data is saved only in the browser and is not submitted.
- `platform`, `system`, `rights`, and `production` remain valid when they add specific meaning; do not use them as vague interface filler.

## Source-of-truth links

- Launch architecture: `docs/CRY_LowCostWaveLaunchArchitecture_v1_2026-08-03.md`
- Account admission contract: `docs/CRY_489_SingleUseInvitationAdmissionContract_2026-08-16.md`
- Visual direction: `docs/CRY_VisualDirection_IntegratedScreens_2026-07-12.md`
- Jira: CRY-242 and children, especially CRY-446 and CRY-489 for current navigation/account policy
- Jira platform authority: CRY-242 and current linked execution issues.
- FigJam historical/reference board: `figma.com/board/oen38yFKbFtgqx9LQKn38Y`
- Historical v18/v19 Confluence/FigJam IA material remains reference-only where it conflicts with current v20 authority, code, or verified deployment.
