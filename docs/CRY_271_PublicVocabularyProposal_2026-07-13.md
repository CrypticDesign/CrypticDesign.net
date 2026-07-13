# CRY-271 — Public Vocabulary Proposal

**Status:** Proposed for Robert approval  
**Date:** 2026-07-13  
**Applies to:** CrypticDesign.net public frontend  
**Direction:** Sitemap v15 — Three Front Doors

## Purpose

Make the platform sound clear, intentional, and human without exposing internal production, governance, or implementation terminology. This proposal changes language only; it does not change the v15 information architecture, routes, visual direction, rights controls, or backend scope.

## Voice Standard

Public copy should be:

- **Direct:** say what a person can see, do, or expect.
- **Specific:** name the release, world, service, or destination.
- **Inviting:** lead with the experience, not the machinery behind it.
- **Confident but accurate:** describe previews honestly without calling them placeholders or shells.
- **Consistent with the three front doors:** My Home is personal, Entertainment is experiential, and Professional is business-facing.

## Canonical Public Terms

| Use | Meaning and rule | Example |
|---|---|---|
| **My Home** | The signed-in person's personal home: character, interests, activity, library, notifications, and settings. | “Welcome back, Robert.” |
| **Entertainment Hub** | The audience front door for all Cryptic Design releases, franchises, and entertainment categories. | “Explore the Entertainment Hub.” |
| **Professional** | The Cryptic Design LLC front door for services, capabilities, collaborations, research, and inquiries. | “Work with Cryptic Design.” |
| **release** | A published or upcoming piece of playable, watchable, listenable, readable, or exploratory content. | “Open release” |
| **product** | The in-platform home for a Cryptic Design product or franchise and its related releases. | “Explore the Singularis product” |
| **franchise** | The broader owned universe or property when that distinction matters. Do not use it as a generic synonym for product. | “Visit the Singularis franchise site” |
| **world** | A fictional or experiential setting. Use only when the content is genuinely a world. | “Explore the world of Singularis.” |
| **character** | The member's required platform identity and presence. | “Create your character” |
| **My Library** | Saved releases and recent activity. | “Save to My Library” |
| **preview** | An honest label for a limited or early experience when necessary. Prefer a specific description of what is available. | “Preview the listening experience” |
| **coming soon** | A public status only when the item is intentionally announced but unavailable. | “Coming soon” |

## Internal Terms to Keep Out of Public Copy

These terms may remain in code, admin tools, documentation, and governance workflows. They should not appear in normal audience-facing copy.

| Avoid publicly | Replace with | Rule |
|---|---|---|
| governed / governance | curated, published, available, or omit | Describe the audience benefit, not the control system. |
| lane | category, path, section, or the named destination | “Lane” remains an internal IA concept. |
| surface | page, experience, player, profile, form, or omit | Name the actual thing. |
| shell | preview, early experience, or omit | Never describe a visible page as a shell. |
| placeholder | preview, sample, coming soon, or omit | State what is available now. |
| V1 | preview, first version, or omit | Version language belongs in release notes unless meaningful to users. |
| review queue / local review queue | saved in this browser, ready for review, or submission received | Explain the user-visible state. |
| browser-local | saved on this device / saved in this browser | Use only when the limitation matters. |
| rights status / visibility status / publication status | unavailable, private, under review, or omit | Expose only the status a person needs to act on. |
| continuity / member continuity | activity, progress, history, or account | Use familiar language for personal state. |
| platform return layer | sign in, account, or My Home | Describe the action or destination. |
| native platform audio | audio from Cryptic Design / listen here | Lead with the content rather than architecture. |
| pipeline | submissions, process, or how it works | Use “pipeline” only in Professional content where industry context makes it useful. |
| router / routing | takes you to, opens, or connects | Implementation language stays internal. |

## Terms to Use Selectively

- **Platform:** appropriate when referring to CrypticDesign.net as a connected whole. Avoid repeating it in headings and descriptions where “here,” “Cryptic Design,” or the named destination is clearer.
- **System / systems:** part of the Cryptic Design voice when describing integrated creative or technical work. Avoid using it as vague filler.
- **Rights / rights-first:** appropriate in Professional or creator-facing explanations where ownership and permission are material. Do not expose internal rights fields or statuses.
- **Production:** appropriate for behind-the-scenes content and Professional services. Avoid “production thread” unless the destination actually contains an ongoing production record.
- **Product view:** use “product” or the product name publicly; “view” is an interface label, not a destination name.

## CTA Standard

CTAs should begin with a specific verb and name the destination or outcome.

| Context | Recommended CTA |
|---|---|
| Release card | **Open release** |
| Featured release | **Explore [release name]** |
| Release to parent product | **Explore [product name]** |
| Product to external franchise site | **Visit the [franchise name] site** |
| Entertainment entry | **Explore Entertainment** |
| Save action | **Save to My Library** |
| Audio | **Listen now** / **Open player** |
| Game | **Play now** / **Preview game** |
| Video | **Watch now** / **Watch preview** |
| Professional service | **View service** |
| Inquiry | **Start an inquiry** |
| Creator application | **Apply to contribute** |
| Behind-the-scenes content | **View production notes** |

Avoid generic CTAs such as “Learn more,” “Click here,” and “Submit” when a clearer outcome is available.

## Status and Empty-State Standard

Every status or empty state should answer: what happened, what it means, and what the person can do next.

- **Upcoming content:** “Coming soon” plus an optional action such as “Save to My Library.”
- **No saved items:** “Your library is ready. Save a release to find it here.”
- **No recent activity:** “Your recent activity will appear here as you explore.”
- **Local-only form:** “This preview saves your inquiry in this browser. It is not sent to Cryptic Design.”
- **Unavailable content:** “This release is not available yet.” Avoid exposing the failed governance condition.
- **Form success in preview:** “Saved in this browser.” Never imply transmission to a backend that does not exist.

## High-Priority Copy Replacements

These are the first production strings to revise after approval.

| Location | Current direction/problem | Proposed public copy |
|---|---|---|
| Releases intro | “Governed drops, versions, and experiences…” | “Games, films, music, stories, and experiments from across Cryptic Design.” |
| My Home eyebrow | “Personal continuity / member space” | “Your space” |
| My Home section | “Your continuity” | “Your activity” |
| Audio intro | “Native platform audio…” and preview-shell language | “Listen to music, scores, soundscapes, and audio releases from Cryptic Design.” |
| Audio submissions | “Approved-collaborator pipeline…” | “A submission path for approved collaborators creating audio with Cryptic Design.” |
| Creator Tools intro | “Governed creator pathways” | “Ways to contribute to Cryptic Design releases and productions.” |
| Creator Tools governance detail | Public rights/visibility/publication field language | “Every contribution is reviewed for ownership, permission, and where it may appear.” |
| Creator request form | “V1 placeholder… local review queue” | “This preview saves your application in this browser. It is not submitted yet.” |
| Professional inquiry form | “V1 placeholder stored your inquiry…” | “This preview saves your inquiry in this browser. It is not sent to Cryptic Design.” |
| Character creator | “Visual form: placeholder…” | “Choose how your character appears across Cryptic Design.” |
| Entertainment trend label | “Trending across the platform” | “Popular now” |
| Entertainment activity label | “What people are entering now” | “Explore what’s happening now” |
| Product page eyebrow | “Product view” | Use the product category or omit the eyebrow. |
| Seed release descriptions | “Placeholder entry pending…” | A concise truthful preview description, or do not render the entry publicly. |
| Virtual Rooms | “media surface” / “preview shell” | “Shared spaces built around releases, events, and creative worlds.” |
| Professional page | “directional placeholders” | Describe the actual capability shown, or remove the module until content is ready. |

## Three-Front-Door Copy Boundaries

### My Home

Use second-person language: **your character, your interests, your activity, your library**. Do not make My Home a company overview or entertainment catalog.

### Entertainment

Lead with discovery and experience: **play, watch, listen, read, explore**. Releases, products, franchises, and categories live here contextually.

### Professional

Lead with outcomes, capabilities, and collaboration: **design, build, research, collaborate, inquire**. Rights and process language is appropriate only when it helps a prospective client or contributor understand how work happens.

## Approval Gate and Application Order

After Robert approves or revises this proposal:

1. Add the approved vocabulary rules to the repository operating guidance.
2. Replace the high-priority public strings above.
3. Audit all remaining public pages and shared components for prohibited internal terms.
4. Verify desktop and mobile copy wrapping, navigation labels, and breadcrumb consistency.
5. Run lint and a production build with the development server stopped.
6. Record the applied vocabulary in Jira CRY-271.

Image selection and rights review remain a separate content pass. This vocabulary proposal does not approve or replace any image asset.
