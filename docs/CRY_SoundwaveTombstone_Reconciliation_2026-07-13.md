# Soundwave Tombstone Reconciliation

Owner: Robert Croft  
Date: 2026-07-13  
Status: Approved direction  
Jira: CRY-247

## Decision

Soundwave is tombstoned. It is no longer a Cryptic Design product, franchise, platform, destination, or public-facing brand surface.

## Retained capabilities

Playback, catalog, artist, playlist, release, submission, and analytics concepts previously explored through Soundwave may continue only as native CrypticDesign.net audio capabilities. They are not described as Soundwave integration or as a Soundwave-powered system.

## Public implementation

- Remove Soundwave from Products & Franchises.
- Remove the Soundwave product page generated from public product data.
- Remove Soundwave from Entertainment franchise discovery.
- Keep `/audio`, Listening Rooms, the shared player, and governed audio releases as native CrypticDesign.net experiences.
- Bundle all Cryptic Design audio through Cryptic Signal as the public music and sonic-media division.
- Retire Cryptic Design Audio as a public brand while preserving CDA catalog identifiers internally where needed.

## Source-of-truth change

Sitemap v18, FigJam section `82:3118`, is the current authority and supersedes v17 and earlier sections for this correction. The earlier sections remain historical.

## Constraints

This change does not authorize backend playback, uploads, submissions, analytics, messaging, payments, or account synchronization.
