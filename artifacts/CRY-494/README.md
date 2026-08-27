# CRY-494 / CRY-500 / CRY-501 — signed-out Homepage v2 evidence

**Evidence date:** 2026-08-26 (America/Chicago)
**Local implementation disposition:** PASS
**Deploy-preview disposition:** PASS
**Launch disposition:** CONDITIONAL PASS

The candidate implements the approved entertainment/community-first Homepage hierarchy and passes the focused Home, authenticated My Home, responsive, keyboard, WebGL, reduced-motion, no-WebGL, type, lint, unit/contract, production-build, and full six-route accessibility checks described below. PR #60 and its Netlify deploy preview pass the deployed Homepage, accessibility, route, metadata, fallback, and shared-scene checks. Launch remains conditional because merge/production deployment and manual screen-reader coverage were not performed.

## Branch and external state

- Repository source: `C:\Projects\CrypticDesign.net`
- Isolated worktree: `C:\Users\Robert Croft\crypticdesign.net\.worktrees\cry-494-homepage-v2`
- Branch: `agent/cry-494-homepage-v2`
- Base: `origin/main` at `073d165` (`Merge pull request #59 from CrypticDesign/agent/cry-496-professional-refinement`)
- Implementation commits: `c0914cd` and `3c31e81`; branch pushed to `origin/agent/cry-494-homepage-v2`
- PR: [#60 — CRY-494 Refine signed-out homepage around entertainment and community](https://github.com/CrypticDesign/CrypticDesign.net/pull/60)
- Deploy preview: [Netlify preview #60](https://deploy-preview-60--frabjous-frangipane-650548.netlify.app)
- Netlify checks: PASS — deploy preview, header rules, and redirect rules successful; pages-changed check neutral/skipped
- Production/staging mutation: none
- Parallel-work protection: the active `C:\Projects\CrypticDesign.net` CRY-496 checkout and its uncommitted `next-env.d.ts` change were not modified

## Changed files

- `src/components/PublicHome.tsx`
- `src/app/responsive.css`
- `src/app/globals.css`
- `src/lib/my-home-dashboard-contract.test.ts`
- `src/lib/site-header-auth-contract.test.ts`
- `src/lib/public-home-v2-contract.test.ts`
- `src/lib/prismatic-spectrum-contract.test.ts`
- `scripts/qa-my-home.mjs`
- `scripts/qa-public-home-v2.mjs`
- `artifacts/CRY-494/**`

`src/app/page.tsx`, `MyHomeDashboard`, `PageScene`, shared VDS tokens, account APIs, Professional implementation files, dependencies, and Home metadata were not changed.

## Before / after hierarchy

Before:

`mixed hero → generic Featured navigation cards → three equal paths including Professional → administrative public/account/My Home grid → combined studio/Professional strip`

After:

`ENTER → EXPERIENCE → EXPLORE → CONNECT → CONTINUE → CURRENT SIGNAL → CREATOR → PROFESSIONAL → JOIN`

The hero now routes to Entertainment and Community. Professional appears only after Creator as a compact tertiary bridge.

## Governed Featured Experience sources

| Homepage item | Shared source | State shown | Destination | Image |
|---|---|---|---|---|
| Singularis | `getProduct("singularis")` from `src/lib/products.ts` | In development · Scheduled | `/products/singularis` | existing `/images/singularis-marketing-02.jpg` |
| Lifa: Genesis | `getProduct("lifa")` from `src/lib/products.ts` | In development · Scheduled | `/products/lifa` | existing `/images/lifa-marketing-intro-01.png` |
| Signal & Systems: Deep Space Transmission | released `signal-and-systems` entry from `src/lib/media-catalog.ts` | Released | source-provided `/releases/singularis-themes-vol-1` | existing `/images/signal-systems.png` |
| Visual Study 01 | `getRelease("visual-study-01")` plus shared release helpers from `src/lib/releases.ts` | Coming soon · Scheduled | `/releases/visual-study-01` | shared `releaseImage` result |

No Homepage-only product or release record was created.

## CURRENT SIGNAL source

`CURRENT SIGNAL` is derived from the existing `MUSIC_ENTRIES` item with slug `signal-and-systems`, requiring both `status === "Released"` and a source-provided destination. Displayed fields are source-supported title, release type, status, premise, image, and destination. No date is displayed because this catalog object contains no governed date. The module does not use `Latest`.

## Account admission and authenticated Home

- Actual governed Join action: **Account availability** → `/account/create`
- Reason: CRY-489 currently exposes a fail-closed availability page and no functioning Request Access / Join Waitlist form. The Homepage states that account requests are not open yet and does not pretend the action submits a request.
- Secondary Join action: **Sign In** → `/account/sign-in`
- Prohibited open-registration wording is absent.
- Production-mode account sandbox remained disabled and returned its expected fail-closed 503.
- Development-only authenticated QA used `MEMBERSHIP_SANDBOX_ENABLED=true` and a local non-production sandbox secret.
- Across 1920×1080, 1440×900, 1024×768, 768×1024, and 390×844, signed-in `/` rendered one My Home H1, five account utility destinations, no clipped controls, and no horizontal overflow. Evidence: `runtime/results.json`.

## Verification results

| Command / check | Result |
|---|---|
| `git fetch --prune origin` | PASS |
| `npm test` | PASS — 236/236 |
| `.\node_modules\.bin\tsc.cmd --noEmit` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — 75 static/dynamic routes generated |
| `node scripts/qa-my-home.mjs http://127.0.0.1:3102` | PASS — five Chromium viewports, signed-out Home + Community + Explore + authenticated My Home |
| `node scripts/qa-public-home-v2.mjs http://127.0.0.1:3101 artifacts/CRY-494/home-v2` | PASS — semantic order, routes, metadata, focus, overflow, normal WebGL, mobile static tier, reduced motion, forced no-WebGL |
| `node scripts/qa-page-scene-runtime.mjs http://127.0.0.1:3101` | PASS — Home, Entertainment, Community, Professional share one governed runtime and active scenes |
| `node scripts/qa-live-a11y.mjs http://127.0.0.1:3100 artifacts/CRY-494/a11y` | PASS — zero WCAG 2.1 A/AA violations across all six routes |
| `node scripts/qa-public-home-v2.mjs https://deploy-preview-60--frabjous-frangipane-650548.netlify.app artifacts/CRY-494/deploy-preview/home-v2` | PASS — all six desktop/mobile rendering and fallback modes plus twelve governed destinations |
| `node scripts/qa-live-a11y.mjs https://deploy-preview-60--frabjous-frangipane-650548.netlify.app artifacts/CRY-494/deploy-preview/a11y` | PASS — zero WCAG 2.1 A/AA violations across all six deployed routes |
| `node scripts/qa-page-scene-runtime.mjs https://deploy-preview-60--frabjous-frangipane-650548.netlify.app` | PASS — all four deployed scenes active; only expected fail-closed membership 503s |

## Browser, viewport, and accessibility coverage

- Browser actually tested: Playwright Chromium.
- Homepage responsive evidence: 1920×1080, 1440×900, 1024×768, 768×1024, and 390×844.
- Focused mode evidence: 1440×900 and 390×844 in default, reduced-motion, and forced-no-WebGL modes.
- Keyboard: tab focus moved to an interactive element with a visible 2px or 3px outline.
- Automated WCAG 2.1 A/AA on Home: zero axe violations.
- Home touch targets below 44×44: zero.
- 720px reflow-equivalent horizontal overflow: none.
- Horizontal overflow/clipped controls at all five Home runtime viewports: none.
- Manual visual inspection performed on full-page desktop and mobile screenshots.
- Manual NVDA, VoiceOver, TalkBack, real iOS, real Android, Firefox, WebKit/Safari: not performed.

## WebGL / fallback evidence

- Default desktop: `scene=public-home`, `quality=high`, `state=ready`, `lifecycle=running`, `renderer=active`.
- Default 390px mobile: governed low/static poster tier.
- Reduced motion at desktop and mobile: `quality=low`, `state=poster`, `lifecycle=static`, `renderer=inactive`.
- Forced no-WebGL at desktop and mobile: the same complete static poster path.
- Every mode retained all nine semantic stages, canonical metadata, keyboard focus, one fallback poster, and no console errors.
- Structured results: `home-v2/results.json`.

## Screenshots

- `home-v2/default-desktop-1440.png`
- `home-v2/default-mobile-390.png`
- `home-v2/reduced-motion-desktop-1440.png`
- `home-v2/reduced-motion-mobile-390.png`
- `home-v2/no-webgl-desktop-1440.png`
- `home-v2/no-webgl-mobile-390.png`
- `runtime/desktop-wide-1920.png`
- `runtime/desktop-1440.png`
- `runtime/laptop-1024.png`
- `runtime/tablet-768.png`
- `runtime/mobile-390.png`
- `deploy-preview/home-v2/*.png`
- `deploy-preview/a11y/*.png`

## Limitations / waivers

1. The canonical spec's generic Request Access / Join Waitlist wording conflicts with the current CRY-489 runtime, which has no request submission behavior. The implementation preserves the truthful `Account availability` action instead.
2. The four Entertainment media-card contrast findings were remediated by routing section link text through the accessible `--section-accent-text` token. The rebuilt six-route axe audit now passes with zero violations.
3. PR #60 and the Netlify deploy preview are complete and verified. Merge and production deployment remain separate approval gates.
4. Manual assistive-technology and non-Chromium browser coverage remain outstanding.

## Recommendation

**Local CRY-494 candidate: PASS.**
**Deploy-preview evidence: PASS.**
**Launch evidence: CONDITIONAL PASS** pending merge/production authorization, Robert's final preview approval, and the remaining manual accessibility gates.
