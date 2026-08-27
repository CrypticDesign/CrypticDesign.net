## CRY-502 / CRY-503 coordinated Wave 0 refinement

Authority: https://crypticdesign.atlassian.net/wiki/spaces/TEAM/pages/465960961

Started from current origin/main `712617fbf0320c701abcdf9def0d39d122a522c9` on `agent/cry-502-503-wave0-frontdoors`.

### CRY-502 — CONDITIONAL PASS

- Canonical public Entertainment front door with six-stage hierarchy, public exploration/Releases hero, explicit Arcade/Music/Video, separate governed Singularis/Lifa worlds, and Community/Releases/Sign In continuation.
- Removed unsupported popularity/live/current-release claims. Featured **Singularis Themes, Vol. 1 — Coming soon** from the governed release record; the old Deep Space Transmission display entry could not support its fourteen-track/current-release presentation.
- Arcade retains `/entertainment/explore`, now labeled Arcade and focused on playable catalog; `/entertainment/arcade` and query compatibility retained.

### CRY-503 — CONDITIONAL PASS

- Staged participation, Creators → Groups → Events availability, hidden Spaces, compact Activity: Not connected.
- Removed false happening-now and large empty-feed presentation; cross-platform discovery labeled explicitly.
- Preserved real server-authenticated My Home/Library/Account continuation, Signal Indigo, shared PageScene and static/reduced-motion paths.

### Verification

- 240/240 unit/contracts; TypeScript; lint; production build: PASS.
- 21 focused browser cases: PASS (390/768/1440; reduced motion; no WebGL; no JS).
- Current six-route axe/keyboard/touch/reflow scan, four-route PageScene runtime and viewport navigation checks: PASS.
- Local membership and character E2E: PASS. Current Homepage-to-Community and signed-in/out continuity: PASS.
- **Existing account E2E FAILS** at `tests/account-auth-ctas.e2e.mjs:17`, which still expects pre-Homepage-v2 labels. Homepage and account test are unchanged from main. Full details in `artifacts/CRY-502-503/e2e-exception.md`.
- Local performance was constrained; adaptive/fallback behavior passed. No real screen-reader or deployed-provider acceptance claimed.

Evidence and screenshots: `artifacts/CRY-502-503/README.md`, `browser/`, `a11y.log`, `page-scene.log`, `continuity.json`.

### Integration boundary

No account/Join/auth/API changes, shared renderer rewrite, Homepage hierarchy changes, new dependencies, merge or deploy. CRY-504 remains independently owned. Rebase on its approved merge if it lands first, then run integrated acceptance. **Do not close CRY-505 from this PR.** Owner review/merge and integrated acceptance remain pending.
