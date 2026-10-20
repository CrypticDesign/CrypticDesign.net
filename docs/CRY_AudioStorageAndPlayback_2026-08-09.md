# Audio storage and playback — decision brief

**Date:** 2026-08-09
**Status:** Incident-informed recommendation, awaiting Robert's provider approval. No backend work started.
**Context:** The Cryptic Signal floating player (branch `agent/cry-fab-player`) now
plays real files. It needs a storage answer before the catalog grows past a
handful of preview tracks. This brief was reconciled with the four-file preview
catalog on 2026-10-17; its storage recommendation remains unapproved.

## Incident update — 2026-10-20

Netlify recorded 42.89 GB of web bandwidth and charged 857.7 of the current
period's 1,100 consumed credits to bandwidth, despite Google Analytics showing
only 13 active users. Netlify's daily billing chart shows a sudden change from
38.3 MB on September 5 to 1.6 GB and 7,700 requests on September 6, followed by
roughly 0.5-2.9 GB of sustained daily use until the project was paused.

The traffic shape is automated, not ordinary human use. Exact historical URL
attribution is unavailable because Personal Observability retains only 24 hours,
but the global player provided a strong application-level multiplier: it mounted
on every route with the first MP3 attached and `preload="metadata"`. A local
containment patch now leaves the audio `src` unset while idle and uses
`preload="none"`. Chromium verification observed zero MP3 requests on page load
and one request after Play, while the full test, type, lint, and build suite
passed.

This incident meets the earlier R2 decision threshold: egress is the dominant
hosting cost. The revised recommendation is Cloudflare R2 behind a custom media
domain for public audio. The existing `NEXT_PUBLIC_AUDIO_BASE_URL` indirection
means that migration requires no player-component rewrite. Provider account,
billing, bucket, upload, DNS, and Netlify environment changes remain owner-gated.

---

## 1. Where audio lives today

Files sit in `public/audio/` and Next serves them as static assets at
`/audio/<file>.mp3`. Four preview tracks are committed for the public player:

| File | Track | Size | Runtime |
| --- | --- | --- | --- |
| `cda001-reflection.mp3` | Reflection | 4.6 MB | 2:29 |
| `labprmg001-baseline.mp3` | Baseline | 4.9 MB | 3:25 |
| `sin-kyrie-of-a-dying-star-cabaret.mp3` | Kyrie of a Dying Star Cabaret | 5.8 MB | 4:17 |
| `sin-leviathan-dreaming.mp3` | Leviathan Dreaming | 8.5 MB | 6:33 |

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

### B. Supabase Storage
Supabase is already in the stack for auth and the character store, so this adds
no new vendor, no new billing relationship, and no new access-control model.

- Public bucket `audio-public` for freely listenable tracks. Point
  `NEXT_PUBLIC_AUDIO_BASE_URL` at its public CDN URL — zero code change.
- Private bucket `audio-gated` for restricted tracks, reached through a server
  route that checks entitlement and returns a short-lived signed URL.
- Range requests are supported, so seeking survives.
- **Against:** egress is billed on the Supabase plan; large catalogs get pricier
  than object storage with free egress.

### C. Cloudflare R2 — *recommended for public audio after the incident*
- **For:** zero egress fees, and Cloudflare is already in the stack (DNS).
  Best economics if the catalog gets large or traffic spikes.
- **Against:** a second access-control system to wire to Supabase identity;
  signed URLs and tokens live in a different place than the rest of auth.
- **Verdict:** the egress threshold has now been met. Use R2 for public audio,
  subject to owner approval and deployed verification.

### D. Managed audio platform (Mux, Bunny Stream)
- **For:** transcoding, HLS, adaptive bitrate, per-title analytics out of the box.
- **Against:** overkill for MP3 delivery; another vendor and monthly floor.
- **Verdict:** revisit only if adaptive streaming or DRM becomes a requirement.

## 4. Recommended design (revised: R2 public delivery, governed private delivery)

**Buckets**

| Bucket | Visibility | Holds |
| --- | --- | --- |
| `audio-public` | public R2 bucket behind a custom domain | tracks whose release is `visibility_status: public` |
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

1. Create an R2 bucket for public web derivatives and connect a custom media
   domain with cache and access controls.
2. Create the governed private-storage path only when restricted playback is
   in scope; keep it separate from the public R2 bucket.
3. Upload the existing public tracks; preserve their current filenames/keys.
4. Set `NEXT_PUBLIC_AUDIO_BASE_URL` to the public custom-domain URL in Netlify and
   `.env.example`.
5. Add `/api/audio/[trackId]` with the entitlement check above when restricted
   playback is approved.
6. `git rm` the files under `public/audio/` and add the path to `.gitignore`.
   History still carries the blobs; that is acceptable at the current four files.
7. Verify range requests, seeking, cache headers, hotlink policy, and playback
   against the deployed bucket.
8. During the first 24 hours after Netlify resumes, capture `Bandwidth by URL`
   and `Bandwidth by client type` before the Personal-plan window expires.

## 6. Open questions for Robert

1. Which tracks are public versus entitlement-gated at launch?
2. Delivery bitrate, and does the "320 Kbps" badge stay?
3. Do masters live anywhere the web path can reach, or stay entirely separate?
4. Are play counts needed in V1, or is that a later analytics ticket?

---

**Related:** `src/lib/player.ts`, `src/components/player/`, AGENTS.md
("Deployment cost discipline", "No backend-heavy systems without explicit
approval").
