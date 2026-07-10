# CrypticDesign.net — Repo Operating Policy

This repository is the source of truth for **implementation** of the CrypticDesign.net platform (Jira epic CRY-242). Architecture lives in Confluence, executable work in Jira, sitemap/IA in FigJam.

## Locked platform model

- Top-level IA: Home, Personal, Professional, Account, Search.
- Personal = Netflix-style entertainment hub (Hub, Feed, Library, Character) with discovery lanes: Hero Feature, Continue, New Releases, Featured, Watch, Listen, Play, Read, Creative Labs, Rooms, Collections.
- Professional = studio, services, case studies, platform capabilities, articles/research, creator-facing, contact/inquiry.
- Every account creates a required character. Account = ownership/access/billing. Character = identity/progression/presence/history.

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
