# CrypticDesign.net — Repo Operating Policy

This repository is the source of truth for **implementation** of the CrypticDesign.net platform (Jira epic CRY-242). Architecture lives in Confluence, executable work in Jira, sitemap/IA in FigJam.

## Locked platform model (SITEMAP v9 — Robert's final direction, 2026-07-10, supersedes all prior frames)

- **The v9 "Release Platform" diagram on FigJam board oen38yFKbFtgqx9LQKn38Y is the canonical IA.** Entertainment hub first, digital media services second; more audience members than professionals.
- Global nav: **Home · Releases · Entertainment · Professional · Account · Search**.
- **Entertainment Channel** (/entertainment): Channel Home, Arcade, Cinema, Listening Rooms, Virtual Rooms, Creative Labs, My Library.
- **Account** (/account): create account → **required character creation** (UI-preview only until backend approved), sign in, character profile (stats/XP/presence/history), subscription tiers (Free/Supporter/Premium — no payments yet), notifications (strict, platform-owned messaging), settings.
- **Products & Franchises** (/products): Singularis, Lifa, Soundwave, Cryptic Design Audio, Image of the Day (reclassified → Creative Labs / Visual Studies).
- **Audio backbone** (/audio): shared player, catalog, artist profiles, playlists, submissions — Soundwave-powered, preview shells.
- **Professional Studio** (/professional): home, services + service detail, case studies, articles/research, contributing creators, contact, inquiry.
- Rights/visibility governance is non-negotiable: nothing renders publicly without passing `isPubliclyRenderable`.
- Backend-heavy systems (real auth, payments, messaging, rooms runtime) remain frontend previews until Robert explicitly approves backend work.
- Do NOT re-derive direction from the Gate 1-4 Confluence locks or the "corrected IA" — those documents predate this decision and need updating to match v9.

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
