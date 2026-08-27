# CRY-504 — Wave 0 Request Access

Authority: [Codex implementation handoff, Confluence 465764355](https://crypticdesign.atlassian.net/wiki/spaces/TEAM/pages/465764355), version 1, 2026-08-27; [CRY-504](https://crypticdesign.atlassian.net/browse/CRY-504).

The existing `/account/create` route now presents **Request Access**, with **Join the next wave.** as its H1. The final signed-out Homepage JOIN action points to that route as **Request Access**. The hero CTA pair and remaining Homepage hierarchy are unchanged.

This supersedes earlier Account Availability presentation guidance only for this route and the final Homepage JOIN presentation. Other navigation/account-availability labels remain outside this change. No route was added. Record this approved presentation drift when Sitemap v20/Figma synchronization resumes; Figma is reference-only for CRY-504.

The form prepares a structured `mailto:` addressed to **robert.croft@crypticdesign.net**, following the Professional inquiry pattern. Email is required; Name and Primary Interest are optional. The visitor must review and send the email in their own email application. Preparing a request does not submit to a server, create a persistent waitlist entry, create an account, or guarantee access. An unavailable mail handler has a visible direct-email fallback.

`PUBLIC_ACCOUNT_CREATION_AVAILABLE` remains false. The membership API, sandbox production guard, provider configuration, invitation exchange, Auth forms, and all membership/payment persistence are unchanged. CRY-489 retains release authority; CRY-491 provider hardening is separate.

See `artifacts/CRY-504/README.md` for verification, evidence, and acceptance gates.
