# 003 — Refine dialogs, confirmations, and drawers

- **Status**: DONE
- **Commit**: eba86eb
- **Severity**: HIGH
- **Category**: Physicality, easing, accessibility
- **Estimated scope**: 12 files, medium CSS consolidation

## Problem

Ten drawer surfaces duplicate generic `.25s ease` keyframes and SweetAlert confirmations use the
library’s default motion. These occasional, consequential interactions should share deliberate
physicality and reduced-motion behavior.

```scss
/* src/app/features/organization/project-detail-page/project-detail-page.scss:84 — current */
.drawer-backdrop { ... animation: fadeIn .2s ease; }
.drawer { ... animation: slideIn .25s ease; }
```

## Target

Drawers arrive from the right over 320ms with `--ease-drawer`; backdrops fade over 200ms. Centered
SweetAlert cards use a 240ms `scale(0.96)` entrance and a faster 160ms exit with the backdrop in sync.

## Repo conventions to follow

- Shared overlay styling belongs in `src/styles/components/_modal.scss`.
- SweetAlert is wrapped only by `src/app/core/services/dialog.service.ts`.
- Drawers already carry `.drawer` and `.drawer-backdrop` classes globally.

## Steps

1. Add shared named drawer and dialog keyframes.
2. Move drawer motion to the global overlay stylesheet and remove duplicated local keyframes.
3. Configure SweetAlert custom show/hide classes from the shared service.
4. Add fade-only reduced-motion fallbacks.

## Boundaries

- Do NOT change confirmation wording, focus behavior, or destructive-action safeguards.
- Do NOT change drawer layout or form logic.
- Do NOT add dependencies.

## Verification

- **Mechanical**: build and existing dialog tests succeed.
- **Feel check**: open a drawer and a destructive confirmation; both surfaces feel connected to their
  trigger and the confirmation remains centered.
- **Done when**: all drawers and SweetAlert dialogs share one motion language.
