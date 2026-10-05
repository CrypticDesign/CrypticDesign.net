# ADR-CRY-400-COST: Production Operator Isolation and Hosting Cost

**Status:** Accepted as local decision evidence; no production action authorized
**Date:** 2026-10-03
**Decider:** Robert K. Croft
**Related work:** CRY-400

## Context and Constraints

CRY-400 Gate 4 is verified for its local read-only scope. Production activation remains unnecessary and unapproved. Any future operator surface must preserve the dedicated-host security boundary while avoiding a second release pipeline or unnecessary Netlify production deploys.

The repository has no `netlify.toml`; current deploy behavior is controlled in Netlify. The existing project is `frabjous-frangipane-650548`, with `main` as the production branch. GitHub Actions verifies the application but does not deploy it. The deployment runbook also records a prior same-SHA duplicate production scheduling event, so one merge cannot be assumed to equal one billed production deploy until that provider-side behavior is understood.

For Netlify credit-based plans, a successful production deploy currently costs 15 credits. Deploy Previews and branch deploys do not carry that production-deploy charge, although their requests and bandwidth remain metered. Production traffic can also consume request, bandwidth, and compute credits. The actual Cryptic Design plan, remaining credits, and account-specific limits have not been verified by this local review.

## Decision

1. **Keep CRY-400 local-only and default-off now.** Do not create a production operator hostname, DNS record, site, deploy, PR, secret, or hosted configuration change.
2. **If Robert later approves production activation, prefer a dedicated hostname alias on the existing Netlify site**, such as `operator.crypticdesign.net`, rather than a second Netlify site. Bundle the host-aware code/configuration into one already-planned coherent production release.
3. The operator hostname must be an exact allowlisted host. The operator UI and `/api/operator/*` routes must fail closed on the apex domain, `www`, the Netlify default domain, Deploy Preview domains, branch deploy domains, and every other alias unless explicitly approved.
4. This is **logical host isolation on one deployed artifact**, not physical runtime or site isolation. It is acceptable only for the read-only Gate 4 design. Gate 5 mutation capability requires a new security and cost decision.

No production host value is selected by this ADR. The example hostname is illustrative until Robert separately approves it.

## Options Considered

| Option | Production-deploy effect | Runtime effect | Assessment |
|---|---:|---:|---|
| A. Keep local-only | 0 Netlify production deploys | 0 Netlify operator traffic | **Selected now.** Safest and lowest cost while the feature is not operationally required. |
| B. Existing-site dedicated hostname alias | No additional deploy pipeline; activation code must ride one planned production release, currently 15 credits for that release on a credit-based plan | Operator requests, bandwidth, and dynamic compute may be metered | **Preferred future topology.** Preserves an exact-host boundary without intentionally doubling releases. |
| C. Separate Netlify site from the same repository | A successful production release to the second site would add another production deploy, currently 15 credits, and creates another opportunity for duplicate scheduling | Separately metered traffic/compute | Rejected for read-only Gate 4 because the incremental cost and operational surface are not justified. |
| D. Same public hostname under `/internal` | No separate deploy | Shared public-origin traffic | Rejected because public-site XSS would share the operator origin and cookie authority. |

## Required Controls for Any Future Activation

- Exact operator-host allowlist in middleware and the BFF; no suffix, substring, or caller-controlled forwarded-host trust.
- Operator path and APIs unavailable on public, default Netlify, preview, and branch hosts.
- Independent BFF, live-read UI, and issuance gates remain false by default.
- No mutation controls or command endpoints under the Gate 4 approval.
- Host-only `__Host-` cookie, exact origin checks, no CORS, `Cache-Control: no-store`, strict CSP, and no public-site analytics or third-party scripts.
- One explicitly approved merge and one expected production deploy; stop and investigate if Netlify schedules duplicates.
- Read-only verification of the current Netlify plan, remaining credits, production-branch settings, aliases, and deploy history before activation.

## Stop Conditions

- This decision authorizes no provisioning, DNS change, deploy, PR, push, secret, hosted Supabase change, or Netlify mutation.
- If the hosted Supabase project is paused, unavailable, or not explicitly approved for operator use, remain local-only.
- If the Netlify plan or available credits are unknown at the activation gate, remain local-only.
- If duplicate production scheduling remains unexplained and an extra 15-credit deployment is unacceptable, do not release.
- If exact-host isolation cannot be demonstrated on the existing site, do not fall back to a same-origin public path; return for a new decision.
- Any Gate 5 mutation proposal stops this decision and requires a separate review.

## Consequences

- CRY-400 can leave the testing loop and remain a verified local read-only capability with no hosting cost.
- A future same-site hostname alias avoids deliberately creating a second production deployment pipeline, but it still shares one artifact and runtime.
- Future activation is not literally zero-cost: the planned production release and operator traffic may consume credits.
- DNS, hostname ownership, account limits, and duplicate-deploy behavior remain external evidence gates, not assumptions.

## Verification and Sources

- Netlify pricing: https://www.netlify.com/pricing/
- Netlify credit metering: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/
- Netlify credit-based plans: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/
- Netlify billing FAQ: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/
- Production domain aliases: https://docs.netlify.com/manage/domains/configure-domains/add-a-domain-alias/
- External DNS and subdomains: https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/
- Repository deployment runbook: `docs/CRY_363_GitHubNetlifyDeploymentWorkflow_2026-09-10.md`

## Action Items

1. [x] Select the current zero-cost state: local-only, default-off, no production action.
2. [x] Select the cost-minimizing future candidate: exact dedicated hostname alias on the existing site, bundled with one planned release.
3. [ ] Before any activation, perform a read-only account-specific Netlify plan, credit, alias, deploy-history, and duplicate-scheduling check.
4. [ ] Obtain separate Robert approval for any hostname, DNS, hosted configuration, PR, merge, or deployment action.
