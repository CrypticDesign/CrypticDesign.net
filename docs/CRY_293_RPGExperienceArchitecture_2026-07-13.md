# CRY-293 RPG Experience Architecture

**Status:** Draft for Robert approval  
**Date:** 2026-07-13  
**Depends on:** CRY-292 character identity and CRY-291 persistent RPG ledger, both Done  
**Authority:** Local architecture draft only; no production services, public economy, or external data collection

## Product Thesis

CrypticDesign.net is a persistent entertainment RPG in which one character moves through releases, Arcade games, interactive video, rooms, events, worlds, and future media. Content is not consumed in isolation: verified experiences create character history, and the character's accumulated capabilities influence later experiences.

The core progression rule is:

> Time records how long the character has meaningfully participated. Context determines how that experience shapes the character.

The system is classless at launch. All characters begin with equal attributes and develop through use. Future archetypes or classifications may describe demonstrated behavior, but do not determine initial capability.

## CRY-291 Reconciliation

CRY-291 provides the trusted substrate:

* character-bound activity events
* controlled event vocabulary
* versioned rules
* append-only progression ledger
* idempotency and replay protection
* additive corrections and reversals
* owner-private history
* a portable, unapplied schema

CRY-293 must extend these contracts rather than replace them. The existing `internalUnits` remain historical sandbox-rule output. CRY-293 introduces versioned Time, Context, attribute-usage, level, resource, condition, quest, and achievement records derived from qualifying events.

The following CRY-291 limitations are intentional and become CRY-293 work:

* events do not yet capture verified active duration
* events do not carry source, schema version, evidence, correlation, causation, rights, privacy, challenge, novelty, or context
* no endless level projection exists
* no attribute usage or effective-stat projection exists
* no resources or conditions exist
* no quests, achievements, reputation, campaigns, or interactive-experience contract exists

## Universal Character Model

One persistent character uses the same stable `character_id` across the ecosystem. RPG state remains separate from account authorization and from the CRY-292 identity record.

### Core Attributes

All attributes begin at 10:

| Attribute | Meaning |
| --- | --- |
| Strength | Physical force, lifting, breaking, carrying, and direct power |
| Agility | Coordination, speed, precision, reaction, and physical control |
| Vitality | Health, endurance, resistance, recovery, and physical resilience |
| Intelligence | Reasoning, learning, analysis, memory, and technical understanding |
| Perception | Awareness, observation, discovery, interpretation, and detecting hidden information |
| Creativity | Imagination, invention, expression, improvisation, and transformation |
| Presence | Communication, empathy, leadership, persuasion, and social influence |
| Resolve | Focus, courage, discipline, patience, and resistance to mental pressure |

Attributes increase through contextual use. Levels do not automatically increase every attribute.

### Base and Effective Attributes

Permanent development and current capability are separate:

```text
effective attribute = base attribute
                    + equipment modifiers
                    + situational modifiers
                    + world modifiers
                    + condition modifiers
```

A broken arm may reduce effective Strength or prohibit two-handed actions without deleting permanent Strength development.

### Universal Resources

Initial universal pools:

* **Health** — bodily condition and injury tolerance
* **Focus** — mental effort, perception, technical work, and complex creative action
* **Resolve** — emotional endurance, courage, discipline, and resistance

Campaigns may add local resources without changing the universal character contract.

## Time and Levels

One Time unit (`1t`) represents one verified active minute in a qualifying experience. Merely leaving a page or client open does not qualify.

Failure may still grant Time because the experience occurred. Outcome controls consequences, rewards, conditions, and contextual growth.

Initial cumulative level curve:

```text
time required for level L = round(30 * (L - 1)^1.5)
```

Characters begin at Level 1. There is no level cap. The formula is a versioned rule, and historical awards retain their original rule version.

## Contextual Growth

Every qualifying experience supplies a normalized context vector across the eight attributes. Weights normally total `1.0`.

```text
attribute usage = time
                * context weight
                * challenge factor
                * novelty factor
                * value factor
```

Context is determined through a controlled mixture of authored experience metadata, observed behavior, player decisions, campaign state, trusted evidence, and rules-engine evaluation. An untrusted client cannot assign its own final growth.

### Diminishing Returns

Routine actions continue to produce legitimate Time while their contextual attribute growth becomes a drip. Greater difficulty, novelty, responsibility, or demonstrated value restores meaningful growth.

For example, early constructive chat develops Presence. Repetitive ordinary chat eventually produces little Presence usage. Difficult mediation may meaningfully exercise Presence, Resolve, Perception, and Intelligence again.

Initial attribute advancement curve:

```text
usage required from score S to S + 1 = round(60 * 1.18^(S - 10))
```

This formula is an initial sandbox balance rule, not approved public reward economics.

## Conditions

Conditions are versioned, sourced, auditable effects with:

* condition definition and version
* character and campaign
* global, campaign, or session scope
* source event and evidence
* severity
* effective and expiration timestamps
* attribute, resource, action, or choice modifiers
* recovery requirements
* correction or removal relationship

Global injuries or major persistent consequences require an explicitly declared campaign mode. A casual Arcade session cannot silently impose a global broken arm.

## Interactive Experience Contract

Arcade games, branching videos, rooms, and future interactive media use one provider-neutral contract:

### Character input

* character ID and approved public/personal snapshot
* level and Time projection
* base and effective attributes
* relevant resources and conditions
* campaign state, inventory, achievements, and quest state only when authorized
* rules and snapshot version

### Experience output

* experience, campaign, and rules versions
* session ID and idempotency key
* verified active duration
* actions, decisions, outcomes, score, and difficulty evidence
* context vector proposal
* quest-objective evidence
* condition, inventory, relationship, or reward proposals
* correlation and causation IDs
* verification signature or trusted source classification

The platform validates and awards results. The game or video client proposes evidence but does not directly mutate progression.

### Play modes

* **Pure:** normalized character statistics for comparable player-skill records
* **Character:** persistent attributes influence options and tolerances
* **Campaign:** persistent resources, conditions, inventory, and consequences are active
* **Challenge:** the experience supplies a fixed character or build
* **Practice:** no persistent rewards or consequences

Attributes create options, tolerances, and advantages; they do not replace player skill.

## Branching Narrative Model

Interactive video and other branching stories may use:

* visible or hidden attribute checks
* passive Perception discoveries
* resource and inventory checks
* history, relationship, achievement, and condition checks
* success, partial success, failure, and critical outcomes
* canonical, alternate-timeline, practice, and challenge runs

Character history, campaign state, and replay state remain separate. Players may explore alternate paths without silently overwriting canonical character history.

## Quest Model

Required versioned records:

* quest definition
* objective definition
* eligibility rule
* enrollment
* objective evidence
* completion or failure
* reward proposal
* abandonment, expiration, repeat window, and correction history

Initial states:

```text
eligible -> available -> active -> completed
                               -> failed
                               -> abandoned
                               -> expired
```

Quest completion is unique per character, quest version, and repeat window. System-character issuers provide narrative identity, while trusted server policy authorizes issuance.

## Achievement Model

Achievement definitions and awards are immutable and versioned. Award states are:

* earned
* revoked
* superseded
* hidden

Each award retains the definition version, source evidence, explanation, and visibility. Rule changes do not erase historical awards.

## Reputation Boundary

Reputation is multidimensional and contextual, never one universal trust score. It cannot grant account authority or automatically change commercial entitlements.

Implementation remains deferred until Robert approves the initial dimensions and visibility rules. Candidate dimensions include participation, discovery, contribution, and world- or faction-specific standing.

## Noncommercial Rewards and Collections

CRY-293 may create noncommercial, nontransferable sandbox collectibles with complete provenance and display controls. Commercial ownership and purchased access remain in the entitlement/library systems.

No real-money wagering, cash-out value, transferable currency, paid power, loot-box economy, scarce reward market, token, or cryptocurrency is introduced.

Casino-style sandbox games use fictional, nonpurchasable, nontransferable play resources. Production release requires separate age, jurisdiction, and policy review.

## Privacy and Safety

RPG state is private by default. Public display requires explicit field-level visibility and existing rights/publication checks.

The following fail closed or enter review:

* unknown event or rule versions
* missing or contradictory evidence
* duplicate keys with different payloads
* unauthorized character or issuer
* spoofed active time
* impossible or suspicious outcomes
* corrections without an original record
* attempts to connect progression to account authority or purchased access

Production retention, deletion, export, youth safety, moderation sanctions, analytics collection, and public competitive rankings remain approval-gated.

## Proposed CRY-293 MVP

The first no-cost sandbox slice should include:

1. Versioned Time and level rules over the CRY-291 ledger.
2. Eight equal starting attributes and contextual usage projections.
3. Challenge, novelty, value, and diminishing-return evaluation.
4. Health, Focus, Resolve, and scoped conditions.
5. One onboarding quest with success and failure paths.
6. One discovery or consumption quest.
7. One earned achievement with explanation and correction behavior.
8. One noncommercial collectible.
9. One Interactive Experience Contract fixture simulating an Arcade or branching-video session.
10. Owner-private progression, attribute, condition, quest, achievement, and history presentation.

Reputation should remain modeled but unimplemented until its dimensions are approved.

## Verification

* level-curve boundary and high-level tests
* contextual usage and diminishing-return tests
* rule-version and original-version replay tests
* duplicate, spoofing, impossible-outcome, and unauthorized-source tests
* base-versus-effective attribute and condition-recovery tests
* quest success, failure, abandonment, expiry, repeat-window, and correction tests
* achievement earned, revoked, superseded, hidden, and historical-version tests
* explicit entitlement and account-authority separation tests
* interactive-experience contract tests
* owner-privacy and public-projection tests
* local end-to-end onboarding experience
* lint, TypeScript, and clean production build

## Approval Gates

Robert approval is still required for:

* final public names and presentation for Time, levels, attributes, and resources
* public reward values and pacing
* reputation dimensions and visibility
* global injury severity and recovery policy
* public rankings or prestige systems
* scarce, tradable, purchasable, or prize-bearing rewards
* production casino-like experiences
* production event ingestion, analytics, personal-data collection, and database provisioning

