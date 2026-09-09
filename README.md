# CrypticDesign.net

Cryptic Design's owned, browser-first web application platform. Not a marketing site — the platform foundation for personal entertainment, professional services, release publishing, account/character identity, library, feed, Creative Labs, admin publishing, and external syndication metadata.

## Stack

- [Next.js 15](https://nextjs.org) (App Router) + React 19
- TypeScript (strict)
- Tailwind CSS v4
- ESLint 9 (`eslint-config-next`)

## Setup

Requires Node.js 20+ and npm.

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run lint    # ESLint
npm run build   # production build (includes type checking)
```

## Environment variables

Variables are documented in `.env.example`; keep real secret values in `.env.local` or the approved deployment environment. GA4 uses the public `NEXT_PUBLIC_GA_MEASUREMENT_ID` value only in production builds on canonical hosts and only after visitor consent.

## Project structure

```
src/app/    App Router routes, layouts, global styles
```

## Source of truth

- Architecture/IA: Confluence — "Corrected IA and Native Feature Taxonomy", "Native Audio Feature Correction", "MVP Boundary by Native Feature Set"
- Sitemap: FigJam — CrypticDesign.net Sitemap v11
- Executable work: Jira — epic CRY-242
- Implementation: this repository

See `AGENTS.md` for agent/contributor operating rules.
