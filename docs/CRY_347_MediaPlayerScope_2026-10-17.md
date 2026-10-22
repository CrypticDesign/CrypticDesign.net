# CRY-347 media player scope and state contract

**Date:** 2026-10-17

**Status:** Implemented on `codex/cry-347-media-player`; merge and deployed verification remain gated

**Parent:** CRY-242

**Delivery boundary:** CRY-458 owns production storage, signed delivery, and entitlement enforcement

## V1 responsibility boundary

The global Cryptic Signal player is the persistent **audio** surface. It owns a
single shared browser audio element, the listening queue, transport, volume,
repeat and shuffle controls, route persistence, and audio-priority arbitration
with interactive experiences.

The Video destination owns Video discovery, preview artwork, release status,
age guidance, captions/transcript availability, and the non-media fallback.
It does not hand a title to the global audio player. A Video playback surface is
deferred until an approved source and delivery contract exist; the interface
must not imply playback before then.

## Media capability disposition

| Capability | Global audio player | Video destination |
| --- | --- | --- |
| Playback | Four published public preview tracks | Deferred until an approved source exists |
| Queue and transport | Implemented | Not part of the current destination |
| Chapters | Explicitly not offered for current audio tracks | Declare per release when playback ships |
| Captions | Not applicable to audio-only tracks | Availability is declared per Video release |
| Transcript | Explicitly not offered for current audio tracks | Availability is declared per Video release |
| Preview artwork | Track artwork | Required on every discovery card |
| Restricted delivery | State supported; no restricted source is mounted | Owned by the future delivery implementation |

## Operational state contract

The provider exposes one of these states to both the visible panel and its live
region:

| State | User-facing behavior |
| --- | --- |
| Idle / ready / paused / playing | Normal transport and truthful current status |
| Loading / buffering | Playback remains selected while the browser prepares more audio |
| Offline | Playback stops, reconnection guidance appears, and retry is offered |
| Unavailable | Play and seek are disabled; no simulated timeline runs |
| Restricted | Play and seek are disabled and no source URL is mounted |
| Interrupted | Playback pauses while an experience owns audio priority, then resumes only if it was previously playing |
| Error | Playback stops and offers a deliberate retry |

Browser media events drive the state: `loadstart`, `loadedmetadata`, `canplay`,
`playing`, `waiting`, `stalled`, `pause`, `ended`, and `error`. Browser online
and offline events provide the network state. A failed `play()` promise becomes
an error or offline state instead of disappearing silently.

## Accessibility and interaction contract

- The player remains a disclosure with a stable panel relationship.
- Opening and closing moves focus only after user interaction; Escape collapses it.
- Status changes use a polite live region.
- Disabled media cannot be played or scrubbed.
- Controls keep accessible names and pressed/expanded state.
- Optional media support is stated rather than implied.

## Verification required before completion

1. Focused player model and source-contract tests.
2. Full automated test suite.
3. TypeScript, ESLint, and production build.
4. Desktop and mobile browser checks for expansion, transport, queue, seeking,
   visible status, keyboard focus, and published-track playback.
5. Deployed preview confirmation before CRY-347 is marked Done.

## Explicit exclusions

- No new provider, bucket, paid service, or environment value.
- No production storage migration or entitlement API.
- No restricted source URL in public data or rendered markup.
- No invented Video asset, player, caption file, transcript, or chapter data.
- No play-count or completion analytics.

Related: `src/lib/player.ts`, `src/components/player/PlayerProvider.tsx`,
`src/components/player/FabMediaPlayer.tsx`, and
`docs/CRY_AudioStorageAndPlayback_2026-08-09.md`.
