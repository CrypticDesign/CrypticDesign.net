# CRY-260 Staging Verification and Production Cutover

**Owner:** Robert Croft  
**Prepared:** 2026-07-18  
**Status:** Staging launch blockers resolved; production cutover awaiting Robert approval  
**Staging:** https://demo.crypticdesign.net/  
**Verified source:** GitHub `main`; record the final release SHA at the cutover approval gate

## Verification summary

- All 28 URLs in the deployed sitemap returned HTTP 200 from staging.
- `/entertainment/visual-studies` is present in the deployed sitemap and returned HTTP 200.
- `robots.txt`, `sitemap.xml`, `share.png`, and the custom icon returned HTTP 200.
- All CRY-260 legacy routes returned the intended temporary redirects.
- Visual Studies and the custom 404 render cleanly at desktop width.
- Visual Studies renders cleanly at 390 × 844 mobile width.
- Visual Studies has no horizontal overflow at 768px, 1024px, or desktop width.
- The 1200 × 630 social-share image has strong contrast, safe margins, and readable brand hierarchy.
- The homepage emits `og:url`, complete structured Open Graph image metadata, and the existing `summary_large_image` Twitter/X card.
- ESLint, `tsc --noEmit`, and the Next.js production build passed before deployment.

## Resolved staging blockers

### 1. Tablet horizontal overflow

At 768 × 1024, the primary navigation and the Visual Studies hero heading extend beyond the right edge of the viewport. The mobile layout at 390px does not show the same defect.

**Resolution:** The wrapped header breakpoint now activates at 900px, and the release hero content has a defensive minimum-width constraint. Responsive verification passes without horizontal overflow.

**Acceptance criteria**

- No horizontal document overflow at 768px.
- The full primary navigation remains accessible without clipping.
- “Visual Studies & Experiments” wraps within its bordered hero container.
- Recheck at 390px, 768px, 1024px, and desktop width.

### 2. Incomplete Open Graph metadata

The staging homepage currently emits `og:title`, `og:type`, `og:image`, `og:description`, and `og:site_name`, plus a complete `summary_large_image` Twitter/X card. It does not emit the required Open Graph `og:url` property. Recommended structured image properties are also absent: `og:image:type`, `og:image:width`, `og:image:height`, and `og:image:alt`.

**Resolution:** Root metadata now emits the production `og:url`, PNG type, 1200 × 630 dimensions, descriptive image alt text, and the existing Twitter/X card fields.

**Acceptance criteria**

- Emit `og:url` using the production canonical URL.
- Emit image type `image/png`, width `1200`, height `630`, and meaningful alt text.
- Preserve the existing Twitter/X large-card metadata.
- Confirm the production URL and image are publicly accessible over valid HTTPS before refreshing external preview caches.

## Production cutover checklist

### Pre-cutover

- [x] Resolve the tablet overflow blocker and verify responsive acceptance criteria.
- [x] Complete Open Graph metadata and verify the rendered `<head>`.
- [x] Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
- [x] Smoke-test every staging sitemap URL and all legacy redirects.
- [x] Confirm `robots.txt` allows public pages and blocks `/account/` and `/api/`.
- [x] Confirm `share.png` is 1200 × 630, publicly accessible, and returned as `image/png`.
- [x] Confirm FigJam sitemap v18 remains aligned with the deployed routes.
- [ ] Record the release commit SHA and a rollback commit/deployment target.

### Cutover approval gate

- [ ] Robert explicitly approves production deployment and domain/DNS changes.
- [ ] Record the approved cutover window and responsible operator.
- [ ] Confirm access to hosting, DNS, and certificate controls without exposing credentials.
- [ ] Confirm the legacy Squarespace rollback path remains available until acceptance passes.

### Cutover

- [ ] Deploy the approved commit to the production hosting target.
- [ ] Point the approved production hostnames to the new deployment.
- [ ] Provision and verify certificates for both apex and `www` hostnames.
- [ ] Verify the apex/`www` canonical redirect direction.
- [ ] Do not alter mail records or unrelated DNS entries.

### Post-cutover verification

- [ ] Verify homepage, Visual Studies, custom 404, icon, share image, robots, and sitemap.
- [ ] Verify all sitemap URLs return successful responses.
- [ ] Verify all legacy redirects resolve to their approved destinations.
- [ ] Verify canonical, Open Graph, and Twitter/X metadata on production.
- [ ] Use LinkedIn Post Inspector and the relevant social preview debuggers to refresh caches after production is live.
- [ ] Check browser console/network errors at mobile, tablet, and desktop widths.
- [ ] Monitor the production deployment through the rollback window.

## Rollback conditions

Rollback if any of the following occurs and cannot be corrected within the approved cutover window:

- Production TLS fails or presents the wrong hostname.
- The homepage, sitemap, robots file, or core front doors return errors.
- Redirect loops or widespread 404s appear.
- Public assets or release data fail rights/visibility governance.
- The deployment introduces a material accessibility or navigation regression.

Rollback means restoring the previously recorded production routing/deployment target, verifying the legacy site is reachable, and recording the incident before another cutover attempt.

## Jira-ready completion update

**CRY-260 staging verification — 2026-07-18**

The latest GitHub `main` deployment is verified at `https://demo.crypticdesign.net/`. All 28 sitemap URLs return HTTP 200, all approved legacy redirects resolve correctly, and launch primitives are live: robots, sitemap, custom 404, app icon, Visual Studies, and the 1200 × 630 share image. Responsive checks pass at mobile, tablet, 1024px, and desktop widths without horizontal overflow. Required Open Graph URL and structured image metadata are present, and the existing Twitter/X large-card metadata is preserved. Lint, TypeScript, and production build pass. FigJam sitemap v18 is synchronized. Production cutover now awaits Robert's explicit approval and a recorded release/rollback SHA.

## Confluence-ready status

### Decision

Keep `demo.crypticdesign.net` as the temporary staging source of truth. The identified launch blockers are resolved; do not switch production DNS or retire the Squarespace rollback path until Robert approves the production cutover and the release/rollback SHAs are recorded.

### Evidence

- Staging deployment: https://demo.crypticdesign.net/
- Visual Studies: https://demo.crypticdesign.net/entertainment/visual-studies
- Sitemap: https://demo.crypticdesign.net/sitemap.xml
- Robots: https://demo.crypticdesign.net/robots.txt
- Share image: https://demo.crypticdesign.net/share.png
- FigJam sitemap v18: https://figma.com/board/oen38yFKbFtgqx9LQKn38Y?node-id=82-3118
- GitHub commit: https://github.com/CrypticDesign/CrypticDesign.net/commit/3eec770be8eba2a370f5614a3d9bfba0ed36628c

### Next action

Record the approved release and rollback SHAs, then return the production cutover authority decision to Robert.
