# CrypticDesign.net — Repo Operating Policy

This repository is the source of truth for **implementation** of the CrypticDesign.net platform (Jira epic CRY-242). Architecture lives in Confluence, executable work in Jira, sitemap/IA in FigJam.

## Locked platform model (audience-first doctrine, 2026-07-10)

- CrypticDesign.net is an **entertainment hub first, digital media services and solutions second**. Target more personal audience members than professionals.
- **Home IS the entertainment hub**: hero feature, Continue, New Releases, and discovery lane rows (Watch, Listen, Play, Read, Creative Labs, Rooms, Collections) routing to releases.
- Top nav is slim: Home, Library, Studio & Services, Sign In. Releases, Creative Works, Worlds, Labs, Creator Tools, Search are secondary (footer) destinations.
- Professional ("Studio & Services") = services, service detail, review-based inquiry — fully built, deliberately secondary in prominence.
- Account is universal; Character is contextual (worlds/games/immersive only, never required for browsing, inquiry, or account basics).
- Rights/visibility governance is non-negotiable: nothing renders publicly without passing `isPubliclyRenderable` (rights, visibility, publication status).
- Doctrine trail: Gate 1–4 locks (Confluence) as amended by the audience-first correction recorded on CRY-255 (2026-07-10). If these conflict, the amendment wins.

## Sitemap sync rule

Any change to routes, navigation, or IA MUST bump the FigJam sitemap version on board `oen38yFKbFtgqx9LQKn38Y` in the same working session (current: v12). A stale sitemap caused two costly direction swings — do not skip this.

## Core doctrine

- Releases are the core published objects; lanes are discovery lanes that route to releases.
- Collections are optional grouping pages. Projects do not automatically become top-level hubs.
- Do not organize the platform primarily by media type.
- External platforms are syndication endpoints, never the source of truth.

## Rules

- No secrets, API keys, or credentials in the repo — ever. Use `.env.local` (ignored) and document names in `.env.example`.
- Small, reviewable commits. Preserve working functionality.
- Placeholder-safe content only; no CLIENT or UNCLEAR IP in public-facing content.
- Every page supports mobile and desktop.
- No backend-heavy systems in Sprint 1 without explicit approval.
- No destructive file moves or broad refactors without approval.

## Source of truth links

- Confluence: Corrected IA and Native Feature Taxonomy (page 431947778); Native Audio Feature Correction (432013313); MVP Boundary by Native Feature Set (432046082) — crypticdesign.atlassian.net/wiki/spaces/TEAM
- FigJam: CrypticDesign.net Sitemap v11 — figma.com/board/oen38yFKbFtgqx9LQKn38Y
- Jira: CRY-242 and children CRY-243..CRY-260
