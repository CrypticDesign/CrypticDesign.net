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

None required yet. When variables are introduced, document them in `.env.example` (committed) and keep real values in `.env.local` (ignored).

## Project structure

```
src/app/    App Router routes, layouts, global styles
```

## Source of truth

- Architecture/IA: Confluence — "CrypticDesign.net — Creator-Owned Entertainment Operating System"
- Sitemap: FigJam — CrypticDesign.net Sitemap v18, section `82:3118`
- Executable work: Jira — epic CRY-242
- Implementation: this repository

See `AGENTS.md` for agent/contributor operating rules.
