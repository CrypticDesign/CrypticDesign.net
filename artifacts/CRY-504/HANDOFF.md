# CRY-504 — Codex implementation handoff

## Outcome

**CONDITIONAL PASS; implemented and ready for review, not merged.** Request Access is a truthful, mailto-only conversion. No account, member, subscription, entitlement, invitation, payment, provider, or persistent waitlist implementation was added. The only Homepage change is its final JOIN CTA and the sentence required to describe the new functional state.

| Item | Value |
| --- | --- |
| Authority | [Confluence 465764355](https://crypticdesign.atlassian.net/wiki/spaces/TEAM/pages/465764355), version 1, 2026-08-27 |
| Jira | [CRY-504](https://crypticdesign.atlassian.net/browse/CRY-504); parent release gate CRY-489; evidence consumer CRY-505 |
| Repository | `CrypticDesign/CrypticDesign.net` |
| Branch | `agent/cry-504-request-access` |
| Base | `712617fbf0320c701abcdf9def0d39d122a522c9` — fetched current origin/main |
| Implementation commit | [`1df50b80f54bfc7ed0e748c02b235d8c886d60ef`](https://github.com/CrypticDesign/CrypticDesign.net/commit/1df50b80f54bfc7ed0e748c02b235d8c886d60ef) |
| Evidence follow-up | `CRY-504 Record deploy preview and acceptance handoff` (evidence/QA only; application code unchanged from implementation commit) |
| PR | [#61 — CRY-504 Implement Wave 0 Request Access conversion](https://github.com/CrypticDesign/CrypticDesign.net/pull/61) |
| Deploy preview | [Request Access](https://deploy-preview-61--frabjous-frangipane-650548.netlify.app/account/create) |
| Verified application deploy | [Netlify 6a907eaabb00070008cade1f](https://app.netlify.com/projects/frabjous-frangipane-650548/deploys/6a907eaabb00070008cade1f) |
| Evidence | `artifacts/CRY-504/README.md` and adjacent logs, JSON, synthetic mailto samples, screenshots |
| Approved destination | `robert.croft@crypticdesign.net` |

## Verification summary

242/242 tests, 22/22 focused account/request contracts, full lint, production build, and TypeScript all passed. Desktop/tablet/mobile layouts have no horizontal overflow. Browser actions exercised native email validation, optional fields, minimal and full mailto preparation, truthful feedback, Homepage JOIN routing, Sign In, and public Entertainment. The local HTTP observer recorded 164 requests, all GET; preparation made no account-creation API request. No email was sent.

The production-mode local server used synthetic provider configuration settings and a deliberately enabled sandbox flag. Both direct `action:create` probes returned 403 `ACCOUNT_ADMISSION_CLOSED`, with creation false and no session cookie/member identity. The application admission/API/Auth code is byte-for-byte unchanged in this PR.

Preview routes returned 200 and the deployed browser prepared the correct email. The preview has no configured account services: its negative probes returned 503 `Membership sandbox is disabled`, no authentication/member ID, and no Set-Cookie. The original strict expected-403 preview assertion failed, and that environment limitation is retained in the evidence. An explicit unconfigured-service profile then passed. No provider configuration was changed.

## Acceptance disposition

| Criterion | Disposition |
| --- | --- |
| Request Access eyebrow and Join the next wave. H1 | PASS |
| Visitor can prepare/initiate the approved request | PASS locally and on preview |
| Required Email; optional Name and approved Primary Interest | PASS |
| No password/payment/unnecessary profile data | PASS |
| Approved company mailto destination | PASS |
| Explicit email-client and manual-send guidance | PASS |
| No fake server-success or access guarantee | PASS |
| No Auth/member/subscription/entitlement/payment/invitation mutation | PASS by dependency/code-path inspection, unchanged backend, HTTP observation and direct negative probes; not a privileged database audit |
| Public account creation stays false and fails closed | PASS; exact configured 403 locally, disabled-service 503 on preview |
| Existing-member Sign In retained | PASS route, password UI, and unchanged sign-in/auth contracts; no real member login performed |
| Entertainment remains public/accountless | PASS |
| Homepage JOIN synchronized; rest of hierarchy unchanged | PASS |
| Desktop, tablet, 390px mobile and no overflow | PASS locally and on preview |
| Visible focus, associated labels, 48px controls | PASS for inspected controls |
| Native keyboard-only traversal/activation | CONDITIONAL — in-app key automation did not reliably move focus/activate; requires manual browser confirmation |
| Local and preview verification | CONDITIONAL — local build/test checks and preview presentation pass; preview configured-provider path unavailable |
| Evidence committed for CRY-489 / CRY-505 | PASS with this evidence follow-up |

## Remaining gates and limitations

1. **Manual keyboard acceptance:** use Tab/Shift+Tab through Email, Name, Primary Interest, Prepare Access Request, and fallback links; verify visible focus and Enter/Space activation. Prepare only; do not send a test email unless separately desired.
2. **Review and release authority:** Robert reviews/accepts the PR and the limited environment/keyboard evidence. Merge and its metered Netlify production build remain explicit approval gates. No merge or main push occurred.
3. **Configured environment:** this preview cannot prove real-member login or the exact configured-provider response. The production-mode local rejection is proven; provider-specific gates remain with CRY-489/CRY-491. Do not add credentials or enable signup to resolve CRY-504.
4. **External bookkeeping:** no Jira transition, Confluence edit, or Figma mutation was performed. This committed handoff is ready for CRY-489/CRY-505 consumption. The approved route-label drift is documented in `docs/CRY_504_RequestAccess_2026-08-27.md`.

The visitor's own mail application and sending/receipt are outside the website's control. The UI offers a direct-email fallback and makes no persistence/delivery claim. No full screen-reader, real-account login, or comprehensive WCAG audit is claimed.

## Preservation and rollback

The separate approved hero/WebGL/status work remains in `codex/root-hero-layout`, uncommitted and unmodified by this CRY-504 branch. It is not silently included in this PR. The original preview on localhost:3000 is preserved. Temporary CRY-504 production/observer servers on 3001/3002 are stopped after validation.

Before merge, rollback is simply closing this PR. After an approved merge, a reviewed revert of the CRY-504 implementation restores the old Account Availability presentation and final JOIN wording; no data migration, account cleanup, provider rollback, or database operation is needed.
