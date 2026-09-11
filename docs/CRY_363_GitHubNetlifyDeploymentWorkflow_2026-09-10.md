# CRY-363 GitHub to Netlify Deployment Workflow

**Verified:** 2026-09-10 (America/Chicago)

**Repository:** `CrypticDesign/CrypticDesign.net`

**Netlify project:** `frabjous-frangipane-650548`

**Authority:** CRY-363, CRY-320, CrypticDesign.net Platform Operations Manual, Infrastructure and Operations Architecture

**Result:** Conditional pass. PR verification, Deploy Preview behavior, Netlify Git-only production enforcement, and the GitHub `production-main` ruleset are verified. One post-change approved merge must still confirm exactly one production deploy, and the duplicate same-SHA scheduling incident still requires Netlify audit/support follow-up.

## Authoritative production branch

`main` is authoritative in all three live sources:

- GitHub repository default branch and `origin/HEAD` resolve to `main`.
- Netlify **Branches and deploy contexts** reports `main` as the Production branch.
- Netlify **Deploys** reports auto publishing is on and deploys from `main` are published automatically.

The verified live baseline was GitHub `main` commit `ac8046e2e1801dc868e4d1b545ed31ca688672b7`.

## Current trigger map

| Event | Current result | Production? | Evidence / constraint |
| --- | --- | --- | --- |
| Push directly to `main` | Rejected by the active `production-main` ruleset for routine users/operators; an Organization Admin using the always-allow bypass can still push, which causes Netlify to start a production deploy | Only through the explicit admin bypass | The ruleset requires a pull request before merging; `main` remains the Netlify production branch |
| Merge a pull request into `main` | The merge commit is pushed to `main`; Netlify starts and auto-publishes a production deploy | Yes | Recent production deploys normally map one-to-one to accepted PR merge commits |
| Open or update a pull request targeting `main` | Netlify builds a Deploy Preview at `deploy-preview-<PR>--frabjous-frangipane-650548.netlify.app` | No | PR #78 successfully reported `netlify/frabjous-frangipane-650548/deploy-preview`; its GitHub Actions job reported `Test, type, lint, and build` |
| Push to an ordinary feature branch with no open PR | No Netlify deploy | No | Branch deploys are limited to two explicitly configured branches |
| Push to `codex/cry-320-launch-readiness` or `codex/cry-335-production-auth` | Netlify creates/updates a stable branch deploy | No | These are the only configured Branch deploy branches |
| Netlify UI **Trigger deploy**, retry, or publish operation not backed by a production-branch Git change | Cannot publish production; non-production contexts remain available | No | Git-only production deployment enforcement is enabled |
| Netlify CLI `netlify deploy --prod` | Production publication is blocked; CLI remains available for non-production contexts | No | Git-only production deployment enforcement is enabled |
| Netlify API or MCP production request | Production publication is blocked; API and MCP remain available for non-production contexts | No | Git-only production deployment enforcement is enabled |
| Netlify build hook | None configured | No current hook trigger | **Build hooks** contains only **Add build hook**; no hook entries are present |
| GitHub Actions workflow | The CRY-363 repository-verification workflow runs on pull requests targeting `main` and does not deploy | No | Successful PR #78 job name: `Test, type, lint, and build` |
| GitHub repository or organization webhook | None configured | No current webhook trigger | Both repository and CrypticDesign organization **Settings > Webhooks** showed no webhook entries |
| Netlify GitHub App | Receives repository/PR events and creates the Git-based deploys above | Depends on branch/event | One Netlify GitHub App installation is present |

## Deploy Preview and branch-deploy behavior

Deploy Previews are enabled for any pull request whose base is the production branch or one of the branch-deploy branches. Live PR #78 confirms that the GitHub App reports the successful preview as `netlify/frabjous-frangipane-650548/deploy-preview`; GitHub Actions reports repository verification as `Test, type, lint, and build`.

Normal development should therefore use a feature branch plus an early pull request against `main`. Each additional feature-branch commit updates the same non-production Deploy Preview. A feature branch that needs a stable URL without a pull request must first be added to the Netlify Branch deploy list; repository configuration cannot grant that provider setting.

The two existing branch-deploy entries are historical release/auth branches. They do not consume the stated production-deploy charge, do not publish the production domain, and are not a reason to broaden Branch deploys to every branch.

## Unnecessary production deploys found

The September 9, 2026 merge of PR #75 at commit `80572232ee4ecd8e3a5019cc25466baf329184a5` produced three production-context builds:

1. `6aa1521795a1e200082e7ebc` at 7:33 AM, attributed to Cryptic-Croft on GitHub.
2. `6aa1523ac08d9f0008348d72` at 7:34 AM, attributed to Cryptic-Croft on GitHub for the same merge commit.
3. `6aa154a33dec89ef6e745b64` at 7:44 AM, with no GitHub actor or deploy message, for the same commit.

Only one production deploy was required for that release. The first two overlapping Git-attributed builds indicate a duplicate Git-integration delivery or Netlify scheduling defect; GitHub has one Netlify App installation and no repository webhook, so a duplicate repository webhook was ruled out. The third deploy is consistent with a provider-side manual/retry/API-style trigger, but the UI does not expose enough actor metadata to identify it more narrowly without an audit-log/support investigation. Do not guess the initiator.

At the stated 15 credits per production deploy, this incident used 45 credits where 15 were expected: 30 avoidable credits and a 66.7% reduction opportunity for an equivalent release.

## Repository-side hardening implemented

- `.github/workflows/verify.yml` runs tests, TypeScript, lint, and a production build for pull requests targeting `main`. It has read-only repository permission, no secrets, no deploy step, PR-scoped concurrency, and cancellation of superseded runs.
- `.github/pull_request_template.md` makes the preview check, coherent batching decision, metered merge impact, and rollback target explicit before merge.
- `src/lib/deployment-workflow-contract.test.ts` prevents the verification workflow from silently gaining a `push`, `pull_request_target`, credential, or production-deploy path and preserves the PR release gates.
- `AGENTS.md` now records the verified trigger boundary and points operators to this runbook.

These controls improve release readiness but deliberately do not pretend that a repository file can enforce provider account settings.

## Verified provider controls and remaining manual action

### Netlify: Git-only production deployment enforcement — PASS

Netlify Git-only production deployment enforcement is enabled for `frabjous-frangipane-650548`:

- Only changes to the production Git branch can deploy to production.
- Netlify CLI, MCP, and API cannot publish production.
- CLI, MCP, and API remain available for non-production deploy contexts.
- Deploy Previews, branch deploys, merge-to-`main` continuous delivery, and Git-based emergency-fix PRs remain available.

Official behavior: <https://docs.netlify.com/build/git-workflows/overview/#enforce-git-based-deployments>.

### GitHub: `production-main` ruleset — PASS

The `production-main` ruleset is active and targets the default branch, `main`. Its verified rules are:

- Require a pull request before merging.
- Restrict deletions.
- Block force pushes.
- Required approving reviews: `0`.
- Organization Admin bypass: **Always allow**.
- Merge commits, squash merges, and rebase merges remain allowed.

PR #78 established the exact successful check names `Test, type, lint, and build` and `netlify/frabjous-frangipane-650548/deploy-preview`. These observed names must be used exactly if required status checks are added to the ruleset later; this runbook does not claim that a required-status-check rule was enabled when it was not among the verified rules above.

The active ruleset preserves normal accepted merge-to-production continuous delivery: review and verification happen on the PR, then the single accepted merge commit triggers the single intentional production deploy. The Organization Admin bypass preserves emergency and rollback authority but is not the routine development path.

### Netlify support/audit follow-up for the duplicate Git event — PENDING

Open a Netlify support request or inspect the team audit log using the three deploy IDs above. Ask Netlify to identify why two Git-attributed production builds were scheduled for the same `8057223` merge commit one minute apart and whether both incurred the 15-credit production charge. Do not delete deploys or relink the repository as a speculative fix.

## Release and rollback operating rule

1. Work and QA locally on a feature branch.
2. Open a PR against `main` early enough to use its Deploy Preview.
3. Require repository verification and the Netlify preview to pass.
4. Batch the coherent release unit and record the prior known-good production deploy.
5. Merge once only when the change is an intentional release or operationally justified fix.
6. Verify Netlify schedules exactly one production deploy for the merge SHA.
7. If the new build fails, keep the previously published deploy. If a published regression occurs, restore the recorded known-good Netlify deploy; do not create repeated same-SHA builds unless the incident record justifies the retry.

## Credit reduction expectation

- Deploy Previews and the two configured branch deploys: no change to the stated zero-credit deployment charge.
- Intended releases/fixes: remain one production deploy at 15 credits per accepted merge.
- Direct-to-`main` iteration: reduced from one 15-credit deploy per routine push to zero production deploys before the final merge now that the GitHub ruleset is active. Organization Admin retains an always-allow emergency bypass.
- Non-Git production triggers: reduced to zero now that Netlify Git-only production enforcement is enabled.
- Duplicate Git scheduling: not guaranteed fixed by repository controls; resolving the provider duplicate would have saved 15 credits in the September 9 incident.

For the observed September 9 incident, the full target is 15 credits instead of 45, saving 30 credits (66.7%). Future monthly savings are `15 credits × the number of avoided direct-main, manual/API, and duplicate production deploys`; no honest fixed monthly amount can be claimed from one incident.

## Local verification

Run on 2026-09-10 with temporary Node `v24.21.0`, matching Netlify's configured Node 24.x runtime:

- `npm test`: pass, 298/298 after the two CRY-363 workflow contract checks were added.
- `npx tsc --noEmit`: pass.
- `npm run lint`: pass.
- `npm run build`: pass, Next.js 15.5.21 compiled successfully and generated 78/78 static pages.

## Acceptance verification

- [x] **PASS — PR verification + Deploy Preview:** PR #78 completed `Test, type, lint, and build` and `netlify/frabjous-frangipane-650548/deploy-preview` successfully.
- [x] **PASS — Netlify Git-only production enforcement:** only changes to the production Git branch can deploy to production.
- [x] **PASS — GitHub `production-main` ruleset:** active and targeting the default branch `main` with the verified pull-request, deletion, and force-push protections.
- [x] **PASS — CLI/API/MCP production publication blocked:** these methods remain available only for non-production contexts.
- [ ] **PENDING — Single-deploy release proof:** one approved merge to `main` must produce exactly one production deploy for its merge SHA.
- [ ] **PENDING — Duplicate scheduling audit:** Netlify audit/support must explain the duplicate Git-attributed production builds for the same September 9 merge SHA and confirm their credit treatment.
