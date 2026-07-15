# CRY-312 Renderer Evidence Packet Template v1

Status: **Controlled template; completed evidence not yet captured**

Budget authority: `CRY-312-3D-BUDGET-v1`

Asset authority: exact Robert-approved asset ID and lowercase SHA-256 required

Tracking: CRY-312

## Packet identity

| Field | Value |
| --- | --- |
| Evidence packet ID | `REPLACE` |
| Capture date/time | `REPLACE_WITH_ISO_8601` |
| Tester | `REPLACE` |
| Commit SHA | `REPLACE` |
| Asset ID | `REPLACE` |
| Asset SHA-256 | `REPLACE` |
| Export version | `REPLACE` |
| Rig ID/version | `REPLACE` |
| Budget ID | `CRY-312-3D-BUDGET-v1` |
| Intake report ID/result | `REPLACE` |

Do not begin renderer evidence capture unless the exact asset and provenance record have been explicitly approved for testing and the automated intake report returns `accepted: true`.

## Device profile

Record one packet per physical device/browser profile and retain three consecutive raw runs.

| Field | Value |
| --- | --- |
| Profile | `desktop-baseline`, `android-mobile-baseline`, or `apple-compatibility` |
| Physical device/model | `REPLACE` |
| OS and version | `REPLACE` |
| Browser and version | `REPLACE` |
| CPU/SoC | `REPLACE` |
| GPU | `REPLACE` |
| RAM | `REPLACE` |
| Viewport | `REPLACE` |
| Device pixel ratio/render cap | `REPLACE` |
| Power state | `REPLACE` |
| Network conditions | `REPLACE` |
| Instrumentation and versions | `REPLACE` |

Simulated mobile evidence may supplement but cannot replace a physical mobile run.

## Capability evidence

| Capability | Run 1 | Run 2 | Run 3 | Evidence reference | Notes |
| --- | --- | --- | --- | --- | --- |
| Exact approved asset/checksum loaded |  |  |  |  |  |
| Rig bound |  |  |  |  |  |
| Portrait camera framed |  |  |  |  |  |
| Full-body camera framed |  |  |  |  |  |
| Detail camera command |  |  |  |  |  |
| Reset camera command |  |  |  |  |  |
| Keyboard rotation |  |  |  |  |  |
| Pointer rotation |  |  |  |  |  |
| Material/signal variant applied |  |  |  |  |  |
| Wardrobe attachment applied |  |  |  |  |  |
| Optional empty selection represented |  |  |  |  |  |
| Static portrait captured |  |  |  |  |  |
| Static full-body captured |  |  |  |  |  |
| Structured-text alternative verified |  |  |  |  |  |
| Reduced motion verified |  |  |  |  |  |
| WebGL failure fallback verified |  |  |  |  |  |
| Context loss recovered |  |  |  |  |  |
| Resources disposed |  |  |  |  |  |
| Identity confirmation parity verified |  |  |  |  |  |

Use `pass`, `fail`, or `not run`. Missing or `not run` release-blocking evidence fails closed.

## Raw performance runs

| Measurement | Approved threshold | Run 1 | Run 2 | Run 3 | Reported result | Pass/fail |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Asset load, uncached (ms) |  |  |  |  | median |  |
| First meaningful frame, uncached (ms) |  |  |  |  | median |  |
| Sustained FPS, median |  |  |  |  | median |  |
| Sustained FPS, 1% low |  |  |  |  | median |  |
| Renderer GPU memory (bytes) |  |  |  |  | median |  |
| Context recovery (ms) |  |  |  |  | median |  |
| Residual resources after disposal | 0 |  |  |  | maximum |  |
| Sample duration (seconds) | minimum 30 |  |  |  | minimum |  |
| Long tasks over 50 ms |  |  |  |  | maximum |  |
| Longest main-thread task (ms) |  |  |  |  | maximum |  |

Use the profile-specific thresholds from the approved budget. Preserve raw traces; do not report only the median.

## Accessibility verification

| Check | Result | Assistive technology/device | Evidence reference | Notes |
| --- | --- | --- | --- | --- |
| Complete flow by keyboard only |  |  |  |  |
| Logical focus order |  |  |  |  |
| Visible focus indicator |  |  |  |  |
| Deterministic keyboard inspection commands |  |  |  |  |
| Status changes announced concisely |  |  |  |  |
| Reduced-motion behavior |  |  |  |  |
| Static and structured alternatives |  |  |  |  |
| 200% browser zoom |  |  |  |  |
| Representative screen-reader flow |  |  |  |  |
| 44 px mobile target behavior |  |  |  |  |
| Text/non-text contrast verification |  |  |  |  |

## Required attachments

- Completed machine-readable evidence JSON from the adjacent template
- Three raw run exports/traces
- Timestamped screen recording covering required capabilities
- Portrait and full-body static captures
- WebGL failure and context-recovery evidence
- Disposal/resource snapshot
- Keyboard-only and reduced-motion recordings
- Screen-reader notes and 200% zoom captures
- Automated evaluator output
- Exact asset manifest, intake report, and provenance-record references

## Exceptions and uncertainties

List every failed threshold, missing measurement, instrumentation limitation, visual deviation, and unexpected result. Do not convert a failure into a pass by averaging, omitting a run, changing the asset, or changing a budget without a separately approved version.

## Decision

| Gate | Result |
| --- | --- |
| Asset/provenance identity matches |  |
| Intake accepted |  |
| All required capabilities passed |  |
| Performance budget passed |  |
| Accessibility verification passed |  |
| Catastrophic failures observed |  |
| Reviewer |  |
| Review date |  |
| Final disposition | `pass`, `fail`, or `revision required` |

Passing this packet satisfies only the recorded device/profile evidence gate. Production deployment, public release, and CRY-312 completion remain subject to Robert's explicit approval.
