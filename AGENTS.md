# CrypticDesign.net — Repo Operating Policy

This repository is the implementation source of truth for the CrypticDesign.net platform (Jira epic CRY-242). Architecture lives in Confluence, executable work in Jira, and sitemap/IA in FigJam.

## Locked platform model (SITEMAP v18 — Robert's current direction, 2026-07-17)

- **The v18 "Three Front Doors" section on FigJam board `oen38yFKbFtgqx9LQKn38Y` is the canonical IA.** It preserves the release-platform model while defining clear personal, audience, and business entry points.
- Global nav: **My Home · Entertainment · Professional · Account · Search**. Releases and products surface contextually rather than as primary navigation destinations.
- **My Home** (`/`): personal member dashboard for character, progression, activity, library, interests, notifications, and settings. It is not a summary of Cryptic Design content.
- **Entertainment Hub** (`/entertainment`): the complete audience front door for all releases, franchises, content categories, games, cinema, audio, rooms, visual studies, and experiments.
- **Releases** (`/releases`) is an Entertainment Hub subpage and must show Entertainment Hub as its breadcrumb parent.
- **Professional** (`/professional`): the Cryptic Design LLC front door for services, collaborations, capabilities, research, partnerships, and inquiries.
- **Entertainment Channel** (`/entertainment`): Channel Home, Arcade, Cinema, Listening Rooms, Virtual Rooms, Creative Labs, My Library.
- **Account** (`/account`): create account → required character creation (UI-preview only until backend approval), sign in, character profile, subscription tiers, notifications, and settings.
- **Products & Franchises** (`/products`): Singularis, Lifa, Cryptic Signal, and Image of the Day reclassified into Creative Labs / Visual Studies. **Soundwave is tombstoned and is not a product, destination, or public brand surface.**
- Franchise release flow: release selection → focused in-platform product view → optional owned franchise subdomain, such as `singularis.crypticdesign.net` or `lifa.crypticdesign.net`.
- Nested routes show contextual breadcrumbs below the primary header and above the footer.
- **Cryptic Signal** (`/audio` and its contextual product view): the public music and sonic-media division. All Cryptic Design audio is bundled through Cryptic Signal, including the shared player, catalog, artist profiles, playlists, releases, submissions, and analytics preview shells. Do not describe this capability as Soundwave-powered or Soundwave integration. Cryptic Design Audio is retired as a public brand; CDA catalog identifiers may remain internal.
- **Professional Studio** (`/professional`): home, services and service detail, case studies, articles/research, contributing creators, contact, and inquiry.
- Rights and visibility governance is non-negotiable: nothing renders publicly without passing `isPubliclyRenderable`.
- Backend-heavy systems remain frontend previews until Robert explicitly approves backend work.
- Do not derive current direction from Gate 1–4 Confluence locks, the "Corrected IA," or v9–v17 sitemap sections. Those are historical references superseded by v18.

## Deployment environments

- **Temporary staging source of truth:** `https://demo.crypticdesign.net/`. Use this URL for deployment verification, route and redirect smoke tests, visual review, and pre-production acceptance until Robert explicitly promotes the build or names a replacement staging URL.
- `https://crypticdesign.net/` and `https://www.crypticdesign.net/` remain production-facing domains and may continue serving the legacy site during staging. Do not interpret their state as evidence that the current Next.js staging deployment failed.
- Production metadata may intentionally use `https://crypticdesign.net` for canonical, Open Graph, robots, sitemap, and host values while the build is staged at the temporary URL.

## Sitemap sync rule

Any change to routes, navigation, or IA must bump the FigJam sitemap version on board `oen38yFKbFtgqx9LQKn38Y` in the same working session (current: v18). A stale sitemap caused costly direction swings; do not skip this.

## Core doctrine

- Releases are the core published objects; lanes are discovery paths that route to releases.
- Collections are optional grouping pages. Projects do not automatically become top-level hubs.
- Do not organize the platform primarily by media type.
- External platforms are syndication endpoints, never the source of truth.

## Rules

- Never commit secrets, API keys, or credentials. Use `.env.local` (ignored) and document variable names in `.env.example`.
- Keep changes small and reviewable. Preserve working functionality.
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
- Use **My Home**, **Entertainment Hub**, **Professional**, **Cryptic Signal**, **release**, **product**, **franchise**, **world**, **character**, and **My Library** consistently with their v18 meanings.
- CTAs begin with a specific verb and name the outcome or destination. Preview forms must state clearly when data is saved only in the browser and is not submitted.
- `platform`, `system`, `rights`, and `production` remain valid when they add specific meaning; do not use them as vague interface filler.

## Source-of-truth links

- FigJam: CrypticDesign.net Sitemap v18 — `figma.com/board/oen38yFKbFtgqx9LQKn38Y`, section `82:3118`
- Visual direction: `docs/CRY_VisualDirection_IntegratedScreens_2026-07-12.md`
- Jira: CRY-242 and children
- Historical Confluence IA pages remain reference-only where they conflict with v13.
