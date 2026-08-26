# Responsive repair — 2026-08-26

Scope: local fixes for Robert's IMG_9140–IMG_9149 mobile screenshots. No deployment, push, Jira mutation, or Confluence mutation.

## Corrections

- Shared `ResponsiveSectionNavigation` gives Explore, Community, Professional, and authenticated Account the same mobile disclosure at 780px and below. Route changes/selected links close it. Mobile Explore destinations are links, not nested summaries inheriting duplicate +/- decorations.
- Header height and its sticky section offset share a token. At 1100px and below (including narrow desktops), a 64px header displays a hamburger and active route label. Above 1100px the original 58px primary bar remains. Professional and Account have five desktop columns.
- Explore keeps Cyan identity on Music, franchise, and Listening Rooms routes; category menus use Cyan rather than a legacy blue rule/purple label combination. Closed menus are explicitly hidden; long category lists use a bounded two-column panel.
- Mobile heroes use 100px art lead-in instead of 285–300px. Community/Home/Explore status panels return to document flow; section headings stack, and hero CTAs retain their minimum size.
- Small screens and short landscape viewports use a reserved bottom player dock with a 48px orb. The expanded player remains scrollable within the viewport. Prototype controls are in flow instead of competing with the player.
- Singularis workspace buttons use neutral navigation surfaces, an Indigo selected state, and no nested span borders.
- Singularis fullscreen uses dynamic viewport height and a flexible game track between toolbar and status. The exit control is outside the game frame. Small/coarse-pointer devices use the in-page fullscreen fallback; the media dock is hidden there.
- Game menus scroll safely from the top if they exceed the frame. Phone faction cards use compact horizontal layouts. Title advancement waits for a completed click, preventing the same tap from selecting the faction underneath. Briefing advancement likewise does not fire on the start of a scroll gesture.
- Professional keyboard focus uses the existing accessible light-violet text variant; canonical route accents and semantic status colors are unchanged. No changes to Singularis faction canon/colors.

## Evidence

Browser checks used the in-app Chromium browser, not a physical iPhone/WebKit:

| Check | Observed result |
| --- | --- |
| 320px phone width | Professional hamburger/active label fits with the brand; no horizontal overflow |
| 414 × 780 portrait | Header and integrated hamburger target 64px; expanded primary links 48px; section disclosure 50px; hero CTAs 48px |
| 1100px / 1101px boundary | Hamburger through 1100px; full six-destination navigation at 1101px; no overflow |
| 768 × 1024 tablet | Shared compact primary menu; 64px header; no document overflow |
| 1024 × 768 narrow desktop | Hamburger with active route label; bounded right-aligned dropdown; no document overflow |
| 896 × 414 landscape | Compact player dock; non-sticky header; no document overflow |
| 1440 × 900 desktop | All five Professional destinations on the same 76px row; no document overflow |
| Listening Rooms | Heading and description stack at full available width |
| Expanded player | Controls fit; focus moves to Play; collapse works |
| Phone fullscreen | Game frame 658px within a 780px viewport; toolbar and 36px status stay outside it |
| Landscape fullscreen | Game frame 314px within a 414px viewport |
| Faction selection | One click stops at selection; all three cards visible within a 414 × 658 frame |

Screenshots are in `artifacts/responsive-2026-08-26/`. Original user screenshots and pre-existing evidence files were preserved.

## Verification

- Automated tests: 228 passed, including responsive, compact-header route/disclosure, and VDS reuse contracts.
- Lint: passed, including the final rerun.
- Production build: passed, including the final touch/focus fixes. All 75 static pages generated. The repeat-build Windows `EINVAL readlink` error required removing only generated `.next` output.
- `git diff --check`: passed.

Physical iPhone Safari/Edge safe-area, address-bar resizing, touch scrolling, and rotation still require device confirmation. Authenticated Account uses the same navigation component but was not signed in during this visual pass; local membership requests return the existing unavailable-service response. No gameplay balancing, touch flight controls, authentication, or WebGL rendering policy was changed.

Updated production preview: `http://localhost:3100`. Same-LAN phone address advertised by Next: `http://192.168.1.2:3100` (subject to local firewall/network access).

## Files

- `src/components/ResponsiveSectionNavigation.tsx` (new), `EntertainmentNavigation.tsx`, `CommunityNavigation.tsx`, `ProfessionalNavigation.tsx`, `AccountNavigation.tsx`
- `src/app/responsive.css` (new), `src/app/layout.tsx`
- `src/components/player/FabMediaPlayer.tsx`
- `src/components/SingularisGamespace.tsx`, `public/games/singularis/v05/index.html`
- `src/lib/responsive-layout-contract.test.ts` (new), `community-page-contract.test.ts`, `site-header-auth-contract.test.ts`

## Compact primary navigation follow-up

- Shared `SiteHeader.tsx` now exposes a native button with `aria-expanded` and `aria-controls`. It shows the current route label and identity color; unknown utility routes fall back to Menu. Signed-in Home uses My Home/Indigo, with no duplicate destination.
- Closed primary navigation is removed from keyboard navigation via `display: none`. Escape restores toggle focus. Selecting a link, changing route, clicking outside, leaving the header by keyboard, or crossing the 1100px breakpoint closes it. Search and Sign In/Account remain first-class destinations.
- Phone Explore is a direct link; the existing wider-screen Explore drawer remains unchanged. Section navigation remains a separate control below the header.
- Browser-verified route navigation, Escape focus return, breakpoint reset, 320/414/768/1024/1100/1101/1280px widths, route colors, and absence of horizontal overflow. Professional label/focus uses readable light violet; its structural accent retains canonical Deep Violet.
- New evidence: `hamburger-community-closed-414.png`, `hamburger-community-open-414.png` in the same artifact directory. Shared design-system behavior was kept in the existing header/responsive stylesheet rather than added per page.
- Additional changed files: `src/components/SiteHeader.tsx`, `src/lib/site-navigation.ts`, `src/lib/site-navigation.test.ts`.
- Follow-up verification: 227 tests passed; lint/type validation and the production build passed with all 75 static pages generated. Production preview restarted on port 3100 with the compact header included.

### VDS correction and narrow-desktop support

Robert rejected the original boxed phone toggle and phone-only breakpoint. That implementation/evidence above is superseded by this correction:

- Reuse `site-primary-link` route tokens, typography, neutral separator, hover treatment, and route-colored bottom rule. No custom colored outline or permanently tinted button surface. The 2px keyboard focus outline remains intentionally available.
- Menu/close glyphs now live in the shared `EcosystemPortalIcon` 32px coordinate system, rather than a separate inline 24px icon in the header.
- The existing 1100px compact-layout boundary is the implementation threshold for primary navigation regardless of input device. Section navigation retains its independent 780px boundary. Primary dropdown is 360px maximum and right-aligned; phones at 480px and below use full width.
- Authority checked read-only: [current prismatic VDS](https://crypticdesign.atlassian.net/wiki/spaces/TEAM/pages/463208449), [Cryptic Design System](https://crypticdesign.atlassian.net/wiki/spaces/TEAM/pages/186875905), and checked-in navigation components. No claim of a new Figma-approved component or external documentation mutation.
- Evidence files: `vds-nav-community-phone-414.png`, `vds-nav-explore-desktop-1024.png`, `vds-nav-explore-desktop-open-1024.png`.
- Additional component changed: `src/components/EcosystemPortalIcon.tsx`.
- Final control order per Robert: active-section text on the left, shared hamburger/close icon on the right. DOM order matches visual order; styling, hit area, and 1100px breakpoint are unchanged. A navigation regression assertion protects this ordering.
- Final verification: 228 tests, lint, TypeScript `--noEmit`, production build, and diff whitespace checks passed. Port 3100 was rebuilt/restarted and browser-verified with the corrected 1024px desktop and 414px phone menus. Only generated `.next` output was cleared during the rebuild; source/evidence files were preserved. No deployment or external writes.
