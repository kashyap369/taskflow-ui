---
version: 1
slug: "eetings-guest-guest-join-page-guest-join-page-html"
primary_target: "src/app/features/meetings-guest/guest-join-page/guest-join-page.html"
related_targets: ["src/app/features/meetings-guest/guest-join-page/guest-join-page.ts","src/app/features/meetings-guest/guest-join-page/guest-join-page.scss"]
---

# Meeting guest join

## Direction

A calm, trustworthy access checkpoint that feels like entering a professional meeting room rather than completing account onboarding. The page should expose only the next required decision, preserve clear meeting context, and never imply that room media is available before Phase 4.

## Hierarchy

- Meeting identity and schedule establish confidence first.
- Email verification is the primary task; optional account binding remains secondary and explicit.
- Verification, display-name confirmation, and lobby status appear as progressive states rather than simultaneous forms.
- Security and reload behavior are explained in short, plain-language supporting copy.

## Visual language

Use the existing TaskFlow surfaces, spacing, type scale, semantic colors, focus treatment, and controls. Keep the public shell quiet and spacious; use restrained depth and a single focused card on narrow screens. Avoid decorative illustration, excessive badges, and invented product styling.

## Interaction contract

- Consume invite tokens from the URL fragment and scrub the address immediately.
- Restore verified tab sessions without exposing the invitation token.
- Keep all actions keyboard accessible and make waiting, admitted, denied, removed, expired, and error states unambiguous.
- The Phase 4 room action stays visibly unavailable with honest explanatory copy.
