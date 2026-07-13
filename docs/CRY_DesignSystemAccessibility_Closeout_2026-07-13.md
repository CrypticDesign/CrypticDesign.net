# CRY-262 design-system and accessibility closeout

Date: 2026-07-13  
Scope: v15 Three Front Doors frontend shells and the approved integrated visual direction.

## Shared rules

- Color, spacing, border, control radius, target size, and motion values live as CSS custom properties in `src/app/globals.css`.
- Keyboard focus uses a two-pixel cyan outline with a three-pixel offset on links, buttons, and form controls.
- Primary controls and navigational targets use a 44px minimum target size where layout permits.
- Motion honors `prefers-reduced-motion`; decorative lift, image zoom, smooth scrolling, and long transitions are suppressed.
- Disabled controls remain perceivable, expose the native disabled state, and use unavailable wording in their accessible names when context is not otherwise clear.
- Empty and loading shells use `.ui-empty` and `.ui-loading`; loading regions set `aria-busy="true"` and announce meaningful completion separately.

## Media regions

- Full-bleed hero and card imagery is decorative when adjacent headings already provide the accessible name; use empty `alt` text in that case.
- Meaningful editorial images require concise alt text describing information not already present in nearby copy.
- Approved Cryptic Design-owned abstract system artwork may be used full bleed. Client work, contracted imagery, identifiable people, and third-party marks remain excluded until rights are confirmed.

## Audit status

- Added a keyboard-visible skip link to the shared layout.
- Added focus treatment for form controls.
- Added reduced-motion behavior.
- Marked the nonfunctional player preview controls disabled and exposed its progress semantics.
- Raised muted text contrast and normalized target sizing.
- Responsive CSS retains single-column mobile layouts and removes nonessential player utilities below 900px.

The integrated Figma file contains a separate landing concept, but v15 currently maps the public frontend to My Home, Entertainment, and Professional. No landing route was invented during this closeout; that remains an explicit IA decision.
