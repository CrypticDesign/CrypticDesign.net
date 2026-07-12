# CrypticDesign.net — Repo Operating Policy

This repository is the implementation source of truth for the CrypticDesign.net platform (Jira epic CRY-242). Architecture lives in Confluence, executable work in Jira, and sitemap/IA in FigJam.

## Locked platform model (SITEMAP v15 — Robert's current direction, 2026-07-12)

- **The v15 "Three Front Doors" section on FigJam board `oen38yFKbFtgqx9LQKn38Y` is the canonical IA.** It preserves the release-platform model while defining clear personal, audience, and business entry points.
- Global nav: **My Home · Entertainment · Professional · Account · Search**. Releases and products surface contextually rather than as primary navigation destinations.
- **My Home** (`/`): personal member dashboard for character, progression, activity, library, interests, notifications, and settings. It is not a summary of Cryptic Design content.
- **Entertainment Hub** (`/entertainment`): the complete audience front door for all releases, franchises, content categories, games, cinema, audio, rooms, visual studies, and experiments.
- **Releases** (`/releases`) is an Entertainment Hub subpage and must show Entertainment Hub as its breadcrumb parent.
- **Professional** (`/professional`): the Cryptic Design LLC front door for services, collaborations, capabilities, research, partnerships, and inquiries.
- **Entertainment Channel** (`/entertainment`): Channel Home, Arcade, Cinema, Listening Rooms, Virtual Rooms, Creative Labs, My Library.
- **Account** (`/account`): create account → required character creation (UI-preview only until backend approval), sign in, character profile, subscription tiers, notifications, and settings.
- **Products & Franchises** (`/products`): Singularis, Lifa, Soundwave, Cryptic Design Audio, and Image of the Day reclassified into Creative Labs / Visual Studies.
- Franchise release flow: release selection → focused in-platform product view → optional owned franchise subdomain, such as `singularis.crypticdesign.net` or `lifa.crypticdesign.net`.
- Nested routes show contextual breadcrumbs below the primary header and above the footer.
- **Audio backbone** (`/audio`): shared player, catalog, artist profiles, playlists, submissions — Soundwave-powered preview shells.
- **Professional Studio** (`/professional`): home, services and service detail, case studies, articles/research, contributing creators, contact, and inquiry.
- Rights and visibility governance is non-negotiable: nothing renders publicly without passing `isPubliclyRenderable`.
- Backend-heavy systems remain frontend previews until Robert explicitly approves backend work.
- Do not derive current direction from Gate 1–4 Confluence locks, the "Corrected IA," or v9–v14 sitemap sections. Those are historical references superseded by v15.

## Sitemap sync rule

Any change to routes, navigation, or IA must bump the FigJam sitemap version on board `oen38yFKbFtgqx9LQKn38Y` in the same working session (current: v15). A stale sitemap caused costly direction swings; do not skip this.

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

## Source-of-truth links

- FigJam: CrypticDesign.net Sitemap v15 — `figma.com/board/oen38yFKbFtgqx9LQKn38Y`
- Visual direction: `docs/CRY_VisualDirection_IntegratedScreens_2026-07-12.md`
- Jira: CRY-242 and children
- Historical Confluence IA pages remain reference-only where they conflict with v13.
