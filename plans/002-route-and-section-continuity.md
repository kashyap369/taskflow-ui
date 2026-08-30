# 002 — Add restrained route and section continuity

- **Status**: DONE
- **Commit**: eba86eb
- **Severity**: MEDIUM
- **Category**: Purpose, missed opportunities, accessibility
- **Estimated scope**: 3 files, small

## Problem

Major route changes teleport while marketing section reveals use a long 560ms repeated fade-and-rise.
The former loses spatial continuity; the latter can become repetitive.

```scss
/* src/styles/abstracts/_motion.scss:64 — current */
transition:
  opacity var(--dur-4) var(--ease-out),
  transform var(--dur-4) var(--ease-out);
```

## Target

Use Angular view transitions for a subtle 180–220ms route crossfade and make section reveals a
single 320ms, 12px arrival. Reduced motion keeps content visible and drops displacement.

## Repo conventions to follow

- Router providers live in `src/app/app.config.ts`.
- Global animation primitives live in `src/styles/abstracts/_motion.scss`.
- The existing `appReveal` directive fires once and remains the reveal workhorse.

## Steps

1. Enable Angular `withViewTransitions()`.
2. Define fast root view-transition old/new animations.
3. Tighten reveal distance/duration and cap authored stagger delays.
4. Preserve a fade-only reduced-motion path.

## Boundaries

- Do NOT animate initial app boot.
- Do NOT add per-page choreography to daily-use dashboard pages.
- Do NOT add a dependency.

## Verification

- **Mechanical**: build succeeds.
- **Feel check**: navigate between landing/login and nested app routes; the outgoing view clears
  promptly and the incoming view never waits for decoration.
- **Done when**: route changes have continuity and marketing reveals remain one-time and restrained.
