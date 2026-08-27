# CRY-504 implementation evidence

Date: 2026-08-27. Authority: [Confluence 465764355, version 1](https://crypticdesign.atlassian.net/wiki/spaces/TEAM/pages/465764355), [CRY-504](https://crypticdesign.atlassian.net/browse/CRY-504). Parent release gate: CRY-489; downstream evidence consumer: CRY-505.

## Provenance

- Repository: `CrypticDesign/CrypticDesign.net`
- Branch: `agent/cry-504-request-access`
- Base after `git fetch --prune origin`: `712617fbf0320c701abcdf9def0d39d122a522c9` (current origin/main; same as handoff baseline).
- Implementation commit, PR, deploy preview: recorded in `HANDOFF.md` after PR creation.
- The approved but uncommitted root-hero/WebGL/status work remains isolated in the separate `codex/root-hero-layout` worktree. It was not overwritten or included in this PR.

## Scope and mechanism

Dedicated RequestAccessForm and request-access helper replace the closed account form on `/account/create`. Required Email, optional Name, and the five approved interests prepare a mailto to **robert.croft@crypticdesign.net**. The UI tells visitors that their email application opens and that they must review and send the email themselves. It never reports delivery, waitlist enrollment, account creation, guaranteed admission, or timing.

Only the final Homepage JOIN link and its now-outdated sentence changed. The hero pair, section hierarchy, state panel, PageScene, Professional pages, and navigation are unchanged. Metadata retains the canonical route and existing account-create share image.

Application files changed: `src/app/account/create/page.tsx`, `src/components/RequestAccessForm.tsx`, `src/components/RequestAccessForm.module.css`, `src/lib/request-access.ts`, and the final JOIN block in `src/components/PublicHome.tsx`. Contract changes: `request-access.test.ts`, `public-home-v2-contract.test.ts`, `site-header-auth-contract.test.ts`. QA scripts and this evidence/documentation are not application endpoints.

## Verification commands and results

| Command / check | Result | Evidence |
| --- | --- | --- |
| `npm test` | PASS, 242/242 | `tests.log` |
| `node --experimental-strip-types --test src/lib/request-access.test.ts src/lib/account-admission.test.ts src/lib/account-access-form-contract.test.ts src/lib/public-home-v2-contract.test.ts` | PASS, 22/22 | `focused-tests.log` |
| `npm run lint` | PASS, exit 0, no findings | `lint.log` |
| `npm run build` | PASS, exit 0 | `build.log` |
| `node_modules/.bin/tsc --noEmit` | PASS, exit 0 | `typecheck.log` (empty success output) |
| `git diff --check` | PASS | no whitespace errors |
| `node scripts/qa-request-access-http.mjs http://127.0.0.1:3001 artifacts/CRY-504/local-http.json` | PASS | four 200 routes; two 403 admission rejections |
| Browser QA through Codex Browser runtime | PASS for actions/layout below; keyboard limited | screenshots, `browser-viewports.json`, `browser-network.json`, `home-join.json`, mailto samples |

Local HTTP QA used `next start` (production mode) on 3001 with synthetic provider settings: URL `http://127.0.0.1:9`, a clearly synthetic public key, and `MEMBERSHIP_SANDBOX_ENABLED=true`. No real provider credentials were used. This verifies that the production sandbox guard still prevents a bypass and that rejection occurs before provider access. The existing hero preview on 3000 was left intact.

Browser actions used the same production build through a temporary loopback-only QA observer on 3002. The observer records only HTTP method/path, never bodies, headers, cookies, or query strings. `browser-network.json` reports zero non-GET requests during preparation tests. Existing shared-header session GETs are expected; no creation API POST was made. No email was sent.

## No-mutation evidence

- `git diff origin/main -- src/lib/account-admission.ts src/app/api/membership/session/route.ts src/components/AccountAccessForm.tsx` is empty. No Auth, API, provider, migration, database, subscription, invitation, entitlement, or payment implementation changed.
- The new form imports only React, its CSS, and the pure mailto helper. No fetch, API call, Supabase client, storage, telemetry, CAPTCHA, or payment dependency exists in the Request Access mechanism; the focused contract governs this.
- Direct `action:create` probes with and without synthetic form details returned `403`, `ACCOUNT_ADMISSION_CLOSED`, `accountCreationAvailable:false`, no member ID/authentication, and no Set-Cookie header.
- `PUBLIC_ACCOUNT_CREATION_AVAILABLE=false` is unchanged and covered by tests. Production sandbox prohibition is unchanged.
- This is code-path and HTTP evidence, not a privileged production database audit. No provider database was accessed to inspect private records.

## Browser and accessibility checks actually performed

- Viewports: 1440×900 desktop, 768×1024 tablet, 390×844 mobile. One H1, associated field labels, no horizontal overflow, and controls at least 48 CSS pixels tall.
- Empty and malformed email blocked preparation through native validation. Email-only and fully populated synthetic requests prepared the correct encoded subject/body; blank interest defaults to General Platform Access; Name defaults to Not provided.
- Optional name/interest changes clear the previous prepared-message state. Reopen prepared email exposes the governed URL. Direct-email fallback remains visible.
- Visible cyan 2px focus outline observed on form controls. Native Tab/Enter automation was attempted via locator and browser keyboard controls, but the in-app runtime did not move focus or activate the focused button reliably. **Native keyboard-only traversal/activation remains a manual verification gate.** No custom keyboard workaround was added to the application.
- Homepage Request Access was clicked and reached the new route. Existing-member Sign In was clicked and its password control remained present. Explore Entertainment was clicked and reached the public Entertainment heading without an account.
- Screenshots cover hero/form at all three sizes and mobile prepared-email guidance. Desktop captures reflect the available browser capture area; the JSON records the full measured viewport dimensions.
- No screen-reader session or full axe audit was performed; do not interpret the focused accessibility checks as a full WCAG certification.
- The legacy `test:e2e:account` script targets pre-CRY-494 Homepage labels and a credential-free sandbox sign-in journey. It was not run against the production negative-test setup; current request/account browser checks above and 22 focused contracts cover this change. `scripts/qa-viewports.mjs` is Entertainment-navigation-specific; its required size matrix was exercised on this page using the supported Browser runtime instead.

## Acceptance disposition

**CONDITIONAL PASS locally and on deploy preview.** The conversion, truthful copy, data limits, approved destination, no-mutation boundary, public fallback, Sign In route, and narrow Homepage synchronization pass. Native keyboard traversal/activation needs manual confirmation. Deploy-preview validation and review/merge gates are recorded in `HANDOFF.md`.

## Deploy preview

PR: [#61](https://github.com/CrypticDesign/CrypticDesign.net/pull/61). [Request Access preview](https://deploy-preview-61--frabjous-frangipane-650548.netlify.app/account/create). Application commit: `1df50b80f54bfc7ed0e748c02b235d8c886d60ef`. Netlify deploy `6a907eaabb00070008cade1f` succeeded; header/redirect checks passed, Pages changed was skipped.

The strict configured admission probe initially failed its expected-403 assertion because preview account services are unconfigured: response `503 {"error":"Membership sandbox is disabled"}`, without Set-Cookie. This is a fail-closed environment state, not evidence of the configured rejection branch. No provider configuration or credentials were changed to force a pass.

`node scripts/qa-request-access-http.mjs https://deploy-preview-61--frabjous-frangipane-650548.netlify.app artifacts/CRY-504/preview-http.json --expect-unconfigured` passed the explicitly selected disabled-service profile, both negative probes, and four page checks. The script still defaults to requiring the exact 403 rejection; the local production run reconfirmed that profile.

Preview browser preparation produced the approved Community mailto with synthetic data (`preview-mailto.txt`). Feedback and geometry passed at 1440×900, 768×1024, and 390×844 (`preview-browser.json`, preview screenshots). No email was sent. Preview provider availability remains a separate environment limitation; CRY-491/provider and CRY-489 release gates are not closed by this work.

Email application availability/delivery is controlled by the visitor's device. The site cannot confirm sending or receipt, and no automation sent an email. No persistent waitlist, provider, API, CRM, CAPTCHA, or recurring service was added. No merge, production deploy, Jira transition, or Confluence write is part of this evidence.
