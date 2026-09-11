# CRY-405 Dependency Remediation Evidence

Date: 2026-09-02  
Branch: `agent/cry-405-dependency-remediation`  
Starting commit: `162af02473cbd10121ce60c66765f2146e07012d`

## Change

The lockfile now overrides the vulnerable transitive packages without changing the application framework version:

- `nanoid` 3.3.15 -> 3.3.18
- `postcss` 8.5.16 / 8.4.31 -> 8.5.25 (deduplicated)
- `sharp` 0.34.5 -> 0.35.3
- `next` remains 15.5.21

## Verification

- `npm audit --omit=dev`: PASS, 0 vulnerabilities (baseline: 4 high)
- `npm test`: PASS, 287/287
- ESLint: PASS
- `tsc --noEmit`: PASS
- `npm run build`: PASS, 78 static pages generated
- Sharp runtime smoke: PASS with Sharp 0.35.3 and libvips 8.18.3
- Membership sandbox E2E: PASS
- Character sandbox E2E: PASS
- CRY-502/503 authenticated continuity: PASS

## Baseline findings outside this change

The full account CTA E2E contains a stale public-home copy assertion (`Explore entertainment`) while the current source renders `Explore What's Here`. The CRY-502/503 front-door suite also reports the pre-existing Axe `aria-prohibited-attr` violation on `.experience-runtime__controls`; the deployed demo contains the same markup. Neither finding is caused by the dependency override.

## Remaining gates

- Run the same audit, build, and image smoke checks in the supported CI/Netlify environment.
- Review the generated preview before merge.
- Keep CRY-405 open until the verified change is merged and the release evidence is linked in Jira.
