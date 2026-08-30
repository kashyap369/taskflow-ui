# 004 — Make toast feedback crisp and interruptible

- **Status**: DONE
- **Commit**: eba86eb
- **Severity**: MEDIUM
- **Category**: Interruptibility, performance, feedback
- **Estimated scope**: 1 file, small

## Problem

The toast skin uses a bare `transition: 0.25s ease`, which can animate layout and does not clearly
define its enter/exit material.

```scss
/* src/styles/components/_toastr.scss:24 — current */
transition: 0.25s ease;
```

## Target

Animate only opacity and transform, use ngx-toastr’s active/remove classes for a short translate
entrance and quicker exit, keep hover feedback fine-pointer-only, and retain fade feedback under
reduced motion.

## Repo conventions to follow

- Toast styling lives in `src/styles/components/_toastr.scss` after the library import.
- Use duration and easing tokens from `_motion.scss`.

## Steps

1. Replace the ambiguous transition with explicit transform/opacity transitions.
2. Style the library’s active/remove states without layout animation.
3. Gate hover motion and add a reduced-motion fallback.

## Boundaries

- Do NOT alter notification timing, copy, or service behavior.
- Do NOT add dependencies.

## Verification

- **Mechanical**: build succeeds.
- **Feel check**: trigger multiple toasts; they can stack and disappear without restarting from zero.
- **Done when**: toast feedback is explicit, GPU-friendly, and reduced-motion safe.
