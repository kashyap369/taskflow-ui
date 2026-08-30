# 001 — Unify interaction motion and press feedback

- **Status**: DONE
- **Commit**: eba86eb
- **Severity**: HIGH
- **Category**: Easing, duration, performance, cohesion
- **Estimated scope**: 9 files, small CSS edits

## Problem

Routine controls use a mixture of weak built-in easings, `transition: all`, and no physical press
feedback. This makes identical actions feel unrelated and can animate unintended properties.

```scss
/* src/app/shared/ui/atoms/inputs/email-input/email-input.scss:20 — current */
transition: all 0.25s ease;

/* src/app/shared/ui/molecules/master-card/master-card.scss:21 — current */
transition: all .3s ease;
```

## Target

Use shared strong curves and property-specific transitions. Pressable controls use
`transform: scale(0.97)` for 120ms; hover movement is gated to fine pointers.

```scss
transition: transform var(--dur-1) var(--ease-out);

&:active:not(:disabled) { transform: scale(0.97); }
```

## Repo conventions to follow

- Motion tokens live in `src/styles/abstracts/_motion.scss`.
- The global button vocabulary lives in `src/styles/components/_button.scss`.

## Steps

1. Add strong `--ease-in-out` and `--ease-drawer` tokens and align `--ease-out` with the audit values.
2. Apply press feedback to global labelled and icon controls.
3. Replace every audited `transition: all` with explicit properties.
4. Gate hover transforms behind `(hover: hover) and (pointer: fine)`.

## Boundaries

- Do NOT alter component behavior or markup.
- Do NOT add dependencies.
- Preserve existing visual identity and colors.

## Verification

- **Mechanical**: `npm run build` and `npm run design:lint` succeed.
- **Feel check**: press representative primary, secondary, icon, and segmented controls; feedback is
  immediate and releasing never jumps.
- **Done when**: no `transition: all` remains in application SCSS and reduced motion removes movement.
