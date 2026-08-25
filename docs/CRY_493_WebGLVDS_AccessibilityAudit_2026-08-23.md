# CRY-493 WebGL and VDS Accessibility Audit

**Standard:** WCAG 2.1 AA

**Date:** 2026-08-23; palette amendment 2026-08-24 (America/Chicago)

**Scope:** Home, Entertainment, Community, Professional, Account Availability, and Sign In

**Live baseline:** `https://demo.crypticdesign.net` at merge commit `09ff8f3`

**Hardened candidate:** `agent/cry-493-runtime-hardening`

## Summary

The live baseline still uses the original high-saturation destination colors. The local hardened candidate now uses a calmer cool spectrum and matches each destination color across menus, page sections, and WebGL scenes. Green, yellow, and red are reserved exclusively for success, warning, and error/status semantics. The initial automated and keyboard review found one serious contrast violation, one missing focus treatment affecting native `summary` controls, and several undersized inline targets; the local candidate resolves those findings.

Final local candidate result:

- Automated WCAG 2.1 A/AA violations: **0** across six routes.
- Critical findings remaining: **0**.
- Major findings remaining: **0** in the tested browser paths.
- Sampled keyboard controls with visible focus: **all**.
- Interactive targets below 44×44 CSS pixels: **0** across the audited routes.
- 720 px reflow/zoom-equivalent horizontal overflow: **0 routes**.
- Manual NVDA/VoiceOver verification: **not yet performed** and remains a production Go/No-Go gate.

## Findings and remediation

### Perceivable

| # | Issue | WCAG criterion | Baseline severity | Resolution |
|---|---|---|---|---|
| 1 | Deep Violet was used directly for six small Professional text elements against dark surfaces. | 1.4.3 Contrast | Major | Replaced the high-saturation palette with six calm section tokens that all exceed 4.5:1 against the standard dark surface. |

### Operable

| # | Issue | WCAG criterion | Baseline severity | Resolution |
|---|---|---|---|---|
| 2 | Native `summary` navigation controls did not inherit the two-pixel visible focus rule. | 2.4.7 Focus Visible | Major | Added `summary:focus-visible` to the global focus selector. |
| 3 | Several inline, footer, and account utility actions were below the 44×44 target guideline. | 2.5.5 Target Size | Minor | Added 44 px minimum target sizing to affected actions, including password utilities and footer links. |

### Understandable

No automated A/AA violations were reported. Account Availability and Sign In retain accurate invitation-gated language and labeled form controls.

### Robust

No automated name/role/value violations were reported. Decorative WebGL canvases remain `aria-hidden`; semantic DOM content and static poster fallback remain available independently of the renderer.

## Color contrast check

| Element | Foreground | Background | Ratio | Required | Result |
|---|---:|---:|---:|---:|---|
| Calm Blue / Home | `#4F8FEA` | `#07111B` | 5.84:1 | 4.5:1 | Pass |
| Calm Cyan / Entertainment | `#4CC9D8` | `#07111B` | 9.64:1 | 4.5:1 | Pass |
| Periwinkle / Community | `#7C8CE8` | `#07111B` | 6.13:1 | 4.5:1 | Pass |
| Lavender / Professional | `#9A86D8` | `#07111B` | 6.13:1 | 4.5:1 | Pass |
| Violet / supporting sections | `#B17AC8` | `#07111B` | 5.87:1 | 4.5:1 | Pass |
| Orchid / supporting sections | `#C978B4` | `#07111B` | 6.18:1 | 4.5:1 | Pass |
| Muted body text | `#8FA0AF` | `#03080F` | 7.48:1 | 4.5:1 | Pass |
| Primary text | `#F5F7FA` | `#03080F` | 18.72:1 | 4.5:1 | Pass |

## Keyboard navigation

| Surface | Tab order | Enter/Space | Focus indicator | Result |
|---|---|---|---|---|
| Global navigation | Logical sample order begins with Skip to main content | Native anchors/details behavior | Visible 2 px outline | Pass |
| Entertainment destination menu | Desktop and mobile destinations remain reachable | Mobile details menu opens from keyboard | Visible on anchors and summaries | Pass |
| Account Availability | Navigation remains available without signup | Native link behavior | Visible | Pass |
| Sign In | Email, password, visibility control, recovery, and submit remain reachable | Native form/control behavior | Visible | Pass |

## Visual review

- Home, Entertainment, Community, and Professional use one coherent calm-spectrum system.
- Menu, hero, and WebGL colors share the exact same destination tokens: blue, cyan, periwinkle, and lavender respectively.
- Green (`#34D399`), yellow (`#F6C453`), and red (`#FF6B7A`) are semantic status tokens only and are not section accents.
- The new asset-backed scene layer remains restrained and does not reduce hero copy readability.
- No horizontal page overflow was observed at the audited desktop or 720 px reflow-equivalent viewport.

## Remaining manual checks

1. Run NVDA with Chrome or Firefox through the six audited routes.
2. Confirm VoiceOver/Safari reading and details-menu announcements on Apple hardware.
3. Confirm real-device touch behavior on iOS and Android rather than relying only on CSS geometry.
4. Repeat the automated scan against the deployed candidate after merge.
