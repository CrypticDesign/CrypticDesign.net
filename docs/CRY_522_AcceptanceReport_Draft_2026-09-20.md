# CRY-522 acceptance report — draft

Prepared: 2026-09-20 (America/Chicago)
Issue: https://crypticdesign.atlassian.net/browse/CRY-522
Epic: https://crypticdesign.atlassian.net/browse/CRY-242
Baseline: `c0cbe5dddb90eba98252f25f35289df9b0a3389d` (PR #80 merge)
Local branch: `agent/cry-522-manifest-hardening`
Disposition: local correction verified; production behavior verified before, during, and after a temporary exact development grant. The grant was revoked and 0 active exact grants remain. This is a draft, not a Jira update or completion approval.

## Result

The original signed-out runtime exposure was denied by the production and demo sites during the 2026-09-18 checks. On 2026-09-21, Robert successfully authenticated in production after the Supabase project was restored. Without a matching grant, that account received Coming Soon on Singularis and Lifa. With an explicitly approved, 30-minute exact administration grant, the Singularis product unlocked and all six protected runtime files loaded. After a separately confirmed revocation, the query returned 0 active exact grants and the same authenticated product page returned to Coming Soon. The remaining release work is to promote and deploy the local unknown-path correction, then verify it in production; live alternating-account cache isolation and authenticated direct-runtime denial remain additional acceptance limits.

Verification found a separate unknown-path handling defect: a legitimately authorized request for `constructor`, `toString`, or `__proto__` reached an inherited manifest property and threw `relativePath.split is not a function`. This did not demonstrate unauthorized runtime access. The local correction requires an own property of the fixed manifest before resolving a file. It preserves the six approved asset paths and their canonical URLs.

The correction and regression test are local and uncommitted. They have not been pushed or deployed.

## Verification evidence

### Local correction and repository checks — 2026-09-18

- Added a regression covering `constructor`, `toString`, `__proto__`, and `hasOwnProperty`.
- Confirmed that regression failed on the original implementation, then passed with the own-property guard.
- Focused access/runtime suite: **23 passed, 0 failed**.
- Full repository suite: **318 passed, 0 failed, 0 skipped**.
- Production build: **passed**, including its lint and TypeScript checks and generation of 74 pages.
- Build ID: `E9O7dKMYdRBhSLGwDw2H1`.
- Additional in-memory route checks: **19 passed**. These executed the actual route, manifest resolver, and disk reads with simulated authorization results: six denials, six successful authorized asset deliveries, and seven malformed/unknown-path denials. They are not proof of deployed Supabase/RLS behavior or real-account authorization.

### Packaging and built-server checks — 2026-09-20

- All **six** protected HTML entry points are included in `.next/server/app/games/singularis/[...assetPath]/route.js.nft.json` and exist on disk.
- **Zero** copies of those files remain under `public/games/singularis/`.
- Product pages and runtime routes are dynamic; no product/runtime entries are present in the prerender manifest.
- Started the completed production build on loopback at `127.0.0.1:3105` for verification.
- **11 signed-out runtime requests passed:** the six canonical entry points, three inherited-object names, an unknown sibling, and a double-encoded traversal candidate all returned 404, `Not found`, and private/no-store caching.
- Singularis and Lifa each returned 200 with Coming Soon content, no Singularis runtime iframe/shell, and private/no-store caching.
- First Signal's API returned 503 with the production sandbox disabled.
- `git diff --check` passed.

### Public deployment observations — 2026-09-18

These observations apply to the deployed baseline, not the unshipped manifest correction. No deployed SHA was independently reconciled in this work.

On both `https://crypticdesign.net` and `https://demo.crypticdesign.net`:

- All six canonical Singularis runtime entry points returned 404 and `Cache-Control: private,no-store,max-age=0` without authentication.
- Responses included `X-Robots-Tag: noindex, nofollow, noarchive`.
- An unknown sibling asset and double-encoded traversal candidate also returned the protected 404 response.
- Singularis and Lifa product pages returned 200 with Coming Soon content; the Singularis runtime shell was absent.
- Overture and Themes cards remained discoverable outside the runtime gate. Those cards themselves were marked Coming Soon; this check does not claim released-media playback acceptance.
- First Signal's API returned 503 with `RPG sandbox is disabled`.

### Real-account browser attempt — 2026-09-20

The available in-app browser was on the production sign-in page. Its visible result was **“Email or password was not accepted.”** No authenticated account session was established for this verification. No passwords were read, no account was created, and no grant, entitlement, or database state was changed.

### Restored-service real-account check — 2026-09-21

- Robert explicitly approved resuming the existing paused Supabase project without upgrading its plan. The dashboard reported restoration complete and the project back online.
- Robert performed the credential and Turnstile steps. Production redirected to My Home and displayed **`Welcome back, Robert Croft.`**
- In that same authenticated browser session, Singularis and Lifa both remained publicly discoverable and displayed **Coming Soon**. Neither page exposed a playable runtime or development experience.
- This establishes the real authenticated-without-unlock product-page case. The follow-up production inspection below then confirmed the stored grant state.
- Direct `/games/singularis/...` navigation returned `net::ERR_BLOCKED_BY_CLIENT` from the in-app browser before a server response could be observed. That client error is not counted as a runtime-denial pass.

### Production grant inspection — 2026-09-21

- Robert explicitly approved a read-only inspection of the account's exact development-grant state.
- One aggregate query matched the existing member through the `@robertkcroft` member character and evaluated only `experience:singularis` / `execute-development` grants from `role` or `administration`.
- Result: **1 matching member, 0 exact grants total, 0 active exact grants**.
- The query returned counts only. It did not expose or record account IDs, emails, tokens, grant IDs, or unrelated member data. It remained unsaved and made no database or project-setting changes.
- A follow-up read-only Table Editor inspection showed that the entire production `entitlement_grants` table is empty: **0 records**. There is therefore no existing production account with an exact Singularis development grant available for the authorized-execution test.

### Temporary production grant acceptance — 2026-09-21

- Robert explicitly approved creating a 30-minute exact grant for `experience:singularis` / `execute-development` from source `administration`, labeled `cry-522-acceptance-2026-09-21`.
- The guarded insert required exactly one member linked to `@robertkcroft` and returned one created row.
- The authenticated Singularis product page changed from Coming Soon to the full interactive experience.
- All six canonical runtime files loaded through the authenticated production session: the v05 vertical slice plus Arsenal, Codex, Hangar, Pilot, and War Effort.
- Robert separately confirmed revocation at the action boundary. One row was revoked with reason `CRY-522 production acceptance verification completed`.
- Post-revocation verification returned **1 exact grant record, 0 active exact grants**. The authenticated Singularis product page returned to Coming Soon.
- The revoked row remains as audit evidence. No other grant, account, role, policy, or project setting was changed.

## Acceptance assessment

| Acceptance area | Evidence and remaining limit |
| --- | --- |
| Coming Soon discovery without execution | Signed-out deployment, browser, and built-server checks pass. A real authenticated production account also received Coming Soon on Singularis and Lifa with no development experience. |
| Exact development authorization permits execution | Pass. Controlled checks pass, and one explicitly approved exact production grant unlocked the authenticated product page and all six canonical runtime files. |
| Authentication alone is insufficient | Controlled adapter checks deny. A real authenticated production account remained in Coming Soon mode on both unfinished product pages, and a read-only production query confirmed 0 exact Singularis development grants for that member. |
| PUBLIC_RELEASE stays executable | Existing pure resolver test passes. No newly published experience was created for testing. |
| INTERNAL_ONLY stays private | Discovery filtering inspected; pure resolver test passes; First Signal's production API is disabled. |
| Six direct runtime URLs fail closed | Pass for signed-out production/demo observations and fresh local build. |
| Assets cannot bypass the page gate | Six HTML files removed from public static hosting; server gate precedes file reads; signed-out direct requests deny. |
| Unknown/traversal/sibling paths rejected | Regression and controlled route checks pass after the local own-property fix. The fix is not deployed. |
| Viewer decisions are not shared through caches | Dynamic rendering and private/no-store headers verified. Live alternating-account cache isolation still pending. |
| Existing identity, profiles, grants, and RLS reused | Production matched the existing member, applied the exact grant, unlocked access, honored revocation, and returned to Coming Soon. Applied production RLS policy definitions were not independently audited in this pass. |
| Public media governed independently | Rendering remains outside the runtime branch and cards remain discoverable. No comprehensive media-playback claim. |
| Arcade copy is truthful | Existing contract tests and deployed Coming Soon catalog observations pass. |
| Coverage includes valid/invalid access and paths | Existing suite plus the inherited-property regression pass. Real authenticated denial, real authorized product execution, all six authorized runtime files, and post-revocation denial are verified. Authenticated direct-runtime denial remains limited by the in-app browser's client-side block. |
| Build, types, focused and package tests | Pass for the local corrected candidate. |

## Remaining completion conditions

Follow-up on 2026-09-21: after Robert approved read-only provider-log access and completed Supabase MFA, the documented authentication project was found paused. Authentication logs returned no events while paused. Robert explicitly approved resuming the existing project without a plan change; the dashboard then reported that restoration completed and the project was back online. Robert successfully signed in afterward, and the authenticated session received Coming Soon on Singularis and Lifa. See `CRY_SignInFailure_Diagnosis_2026-09-21.md`. The earlier browser failure remains a historical observation, not proof of incorrect credentials.

1. Review and promote the local manifest correction through separately authorized Git/PR/release actions, then confirm the corrected unknown-path response in the deployed environment using an approved exact grant.
2. Complete authenticated direct-runtime denial through a client that does not block `/games/` navigation and, if required for closure, alternate granted and ungranted sessions to check live cache isolation.
3. If needed before release, audit the applied production RLS policy definitions through a separate approved read-only check.
4. Decide whether the revoked CRY-522 acceptance grant should remain as audit evidence or be removed through a separately confirmed data-deletion action.

## Jira-ready comment

CRY-522 verification completed against local PR #80 merge baseline `c0cbe5d`, with a follow-up correction on `agent/cry-522-manifest-hardening`.

The original six signed-out Singularis runtime URLs returned private/no-store 404s on production and demo during the 2026-09-18 checks. Singularis/Lifa remain discoverable with Coming Soon content. Verification found an authorized-user edge case where inherited manifest properties (`constructor`, `toString`, `__proto__`) threw instead of returning 404; a local own-property guard and regression test correct it.

Local evidence: 23 focused tests and all 318 repository tests pass; the production build, lint, and type validation pass. On 2026-09-20, packaging verification found all six protected assets in the server output trace and none in public static hosting. The built server passed 11 signed-out runtime denial checks and both Coming Soon product checks. Nineteen controlled route checks also passed, including legitimate file delivery with simulated authorization.

After the paused Supabase project was restored on 2026-09-21, Robert successfully signed in to production. Without a matching grant, the account received Coming Soon on Singularis and Lifa. Robert then explicitly approved a 30-minute exact administration grant for CRY-522 acceptance. The Singularis product page unlocked, and all six protected runtime files loaded in the authenticated production session. Robert separately confirmed revocation; post-revocation verification returned 1 retained audit record and 0 active exact grants, and the product page returned to Coming Soon.

Real authorized execution now passes. Keep CRY-522 open until the local inherited-property correction is promoted and verified in production. Authenticated direct-runtime denial through a client that permits `/games/` navigation and live alternating-account cache isolation remain additional limits. No Jira transition, deployment, or account creation was performed during verification. The only entitlement mutation was the explicitly approved temporary grant and its confirmed revocation; Git and PR promotion are tracked separately.
