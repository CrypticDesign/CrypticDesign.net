## Change

Describe the coherent release unit and link its Jira issue.

## Verification

- [ ] `npm test`
- [ ] `npx tsc --noEmit`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] The Netlify Deploy Preview is ready and the affected routes were checked there.

## Deployment impact

- [ ] I understand this pull request is non-production until it is merged into `main`.
- [ ] If merged, this is an intentional release or operationally justified fix worth one metered Netlify production deploy.
- [ ] Related changes are batched; no follow-up production deploy is already known to be necessary.
- [ ] The rollback target or prior known-good deploy is identified for production-sensitive changes.
