# Audio storage and playback — decision brief

**Date:** 2026-08-09
**Status:** Proposal, awaiting Robert's decision. No backend work started.
**Context:** The Cryptic Signal floating player (branch `agent/cry-fab-player`) now
plays real files. It needs a storage answer before the catalog grows past a
handful of preview tracks.

---

## 1. Where audio lives today

Files sit in `public/audio/` and Next serves them as static assets at
`/audio/<file>.mp3`. Two preview tracks are committed for the demo:

| File | Track | Size | Runtime |
| --- | --- | --- | --- |
| `cda001-reflection.mp3` | Reflection | 4.6 MB | 2:29 |
| `labprmg001-baseline.mp3` | Baseline | 4.9 MB | 3:25 |

The player never hardcodes an origin. `src/lib/player.ts` resolves every track
through a single base:

```ts
const AUDIO_BASE = (process.env.NEXT_PUBLIC_AUDIO_BASE_URL ?? "/audio").replace(/\/$/, "");
```

Setting `NEXT_PUBLIC_AUDIO_BASE_URL` moves the whole catalog to another origin
with no component changes. That indirection is the reason this decision can be
deferred without accruing rework.

## 2. Why static hosting does not scale here

**Repository weight.** ~4.7 MB per track, binary, no delta compression, and
permanent in git history. A 50-track catalog is roughly 250 MB that cannot be
reclaimed without rewriting history.

**Deploy cost.** Every asset ships in every Netlify build, and build credits are
metered (see AGENTS.md, "Deployment cost discipline"). Audio churn would spend
credits on bytes that never change.

**No access control.** The release model defines `entitlement-required` and
`account-required` visibility. A static URL cannot enforce either — anyone with
the link has the file. This is the blocking problem, not the size.

**No playback signal.** No play counts, completion rate, or per-track analytics.

**Not a problem:** seeking. Netlify serves HTTP byte-range requests on static
assets, so scrubbing already works. Any replacement must preserve range support.

## 3. Options

### A. Stay static (`public/audio`)
- **For:** zero new infrastructure; works today.
- **Against:** every problem in §2 except seeking.
- **Verdict:** correct for two demo tracks. Not correct for a catalog.

### B. Supabase Storage — *recommended*
Supabase is already in the stack for auth and the character store, so this adds
no new vendor, no new billing relationship, and no new access-control model.

- Public bucket `audio-public` for freely listenable tracks. Point
  `NEXT_PUBLIC_AUDIO_BASE_URL` at its public CDN URL — zero code change.
- Private bucket `audio-gated` for restricted tracks, reached through a server
  route that checks entitlement and returns a short-lived signed URL.
- Range requests are supported, so seeking survives.
- **Against:** egress is billed on the Supabase plan; large catalogs get pricier
  than object storage with free egress.

### C. Cloudflare R2
- **For:** zero egress fees, and Cloudflare is already in the stack (DNS).
  Best economics if the catalog gets large or traffic spikes.
- **Against:** a second access-control system to wire to Supabase identity;
  signed URLs and tokens live in a different place than the rest of auth.
- **Verdict:** the right move *later*, if egress becomes the dominant cost.

### D. Managed audio platform (Mux, Bunny Stream)
- **For:** transcoding, HLS, adaptive bitrate, per-title analytics out of the box.
- **Against:** overkill for MP3 delivery; another vendor and monthly floor.
- **Verdict:** revisit only if adaptive streaming or DRM becomes a requirement.

## 4. Recommended design (Option B)

**Buckets**

| Bucket | Visibility | Holds |
| --- | --- | --- |
| `audio-public` | public | tracks whose release is `visibility_status: public` |
| `audio-gated` | private | `account-required` and `entitlement-required` tracks |

**Track model.** `PlayerTrack.src` becomes a storage *key* rather than a URL for
gated tracks, resolved at request time. Public tracks keep resolving through
`AUDIO_BASE` as they do now.

**Gated playback route.** `GET /api/audio/[trackId]`:

1. Resolve the track to its release.
2. Run the existing `evaluateReleaseAccess(release, viewer)`.
3. `granted` → `createSignedUrl(key, 3600)` and 302 to it.
4. `account-required` / `entitlement-required` → 403 with the reason.
5. `not-renderable` → 404.

The player is unaffected: it receives a URL and plays it. Signed-URL expiry is
longer than any single track, so mid-playback expiry is not a concern; a fresh
URL is minted per play.

**Delivery format.** Serve a web derivative, not the master. The player badge
currently reads "320 Kbps" as a static label — it is not measured. Decide the
real delivery bitrate (192–256 kbps AAC or MP3 is typical) and make the badge
reflect it, or drop the badge.

## 5. Migration steps, once approved

1. Create both buckets and the storage RLS policies.
2. Upload the existing tracks; record keys in `src/lib/player.ts`.
3. Set `NEXT_PUBLIC_AUDIO_BASE_URL` to the public bucket URL in Netlify and
   `.env.example`.
4. Add `/api/audio/[trackId]` with the entitlement check above.
5. `git rm` the files under `public/audio/` and add the path to `.gitignore`.
   History still carries the blobs; that is acceptable at two files.
6. Verify range requests and seeking against the deployed bucket.

## 6. Open questions for Robert

1. Which tracks are public versus entitlement-gated at launch?
2. Delivery bitrate, and does the "320 Kbps" badge stay?
3. Do masters live anywhere the web path can reach, or stay entirely separate?
4. Are play counts needed in V1, or is that a later analytics ticket?

---

**Related:** `src/lib/player.ts`, `src/components/player/`, AGENTS.md
("Deployment cost discipline", "No backend-heavy systems without explicit
approval").
