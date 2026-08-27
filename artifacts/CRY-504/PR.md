## Summary

Implements CRY-504 from Confluence handoff 465764355 on current main `712617f`.

- `/account/create` becomes Request Access: required email, optional name/approved interest, and a structured mailto to `robert.croft@crypticdesign.net`.
- Clearly explains that visitors must send the prepared email; no success/delivery or admission guarantee is claimed.
- Preserves Sign In, public Entertainment, canonical route/share asset, and all admission/auth/backend code.
- Synchronizes only the final Homepage JOIN CTA and contradictory closed-request sentence. No hero hierarchy or navigation changes.

## Verification

- 242/242 tests; 22/22 focused contracts; full lint, production build, and TypeScript passed.
- Production-mode direct `action:create` probes both returned 403 `ACCOUNT_ADMISSION_CLOSED`, public creation false, no authentication/member ID or session cookie. Synthetic sandbox flag cannot bypass production guard.
- Desktop 1440, tablet 768, mobile 390: no horizontal overflow, associated labels, minimum 48px controls, visible focus outline.
- Browser preparation produced the expected synthetic mailto; local observer recorded zero non-GET requests. No email sent.
- Homepage JOIN and Sign In/Entertainment navigation verified.

## Acceptance / review gates

Conditional pass: native keyboard-only traversal/activation needs manual confirmation because the in-app browser's key automation did not reliably activate or move focus. Native form semantics are retained; no tool-specific workaround added.

Deploy preview: https://deploy-preview-61--frabjous-frangipane-650548.netlify.app/account/create — browser preparation and responsive checks pass. Account services are unconfigured there, so negative creation probes return 503 with no cookie; the configured 403 rejection is verified locally in production mode. Complete verification is recorded in `artifacts/CRY-504/HANDOFF.md`. No production merge/deploy is authorized by this PR. Existing root-hero changes remain in a separate uncommitted worktree and are not part of this PR.

Evidence: `artifacts/CRY-504/README.md`. No new backend endpoint, provider, database table, persistent waitlist, CAPTCHA, or paid service.
