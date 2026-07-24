# TaskFlow UI — Design Language

> The goal: TaskFlow should feel **crafted by a designer**, not generated. That comes from a few
> disciplined choices — one real typeface pairing, a semantic color system that works in **light and
> dark**, a consistent spacing/radius/elevation rhythm, and **motion that has intent** (things enter,
> respond, and settle; nothing just "appears"). This document is the single source of truth for those
> choices. When building any screen or component, pull from the tokens here — never hardcode a hex or a
> duration.

_Reference feel: modern productivity SaaS (Linear / Noteflow / Height) — calm surfaces, soft depth,
one confident violet accent, rounded geometry, and micro-interactions that reward attention._

---

## 1. Principles

1. **Tokens, not values.** Every color/space/radius/shadow/duration is a CSS custom property or SCSS
   token. A component that writes `#111827` or `0.3s` is a bug. This is what makes light/dark and
   global re-skins possible.
2. **Two themes, one codebase.** Light is the default; dark is a first-class peer. Surfaces, text, and
   borders are *semantic* (`--surface`, `--text`, `--border`) so a component never needs to know which
   theme is active.
3. **Depth through softness, not lines.** Prefer layered surfaces + soft shadows + generous radius over
   hard 1px borders everywhere. Borders are a whisper (`--border`), not a box.
4. **Motion with intent.** Entrances are directional (fade + rise), interactions are immediate
   (≤200 ms), ambient motion is slow and subtle (8–20 s). Everything respects
   `prefers-reduced-motion`.
5. **One accent, used sparingly.** Violet is the brand. Status colors (green/amber/red/blue) are for
   meaning, not decoration. A page that's mostly neutral with *one* violet moment reads as premium; a
   page with six gradients reads as generated.
6. **Rhythm.** Space on a 4 px base. Consistent section padding, consistent card padding. Alignment and
   repetition do more for "designed" than any single flourish.

---

## 2. Typography

**The single biggest upgrade from the old look:** the fonts are now actually loaded (Inter was
referenced but never imported, so everything fell back to system sans — the #1 reason it felt
generic).

### Families
| Role | Family | Weights loaded | Notes |
|---|---|---|---|
| **Display / Headings / UI** | `Plus Jakarta Sans` | 500, 600, 700, 800 | Geometric, friendly, a little character. Used for headings, buttons, labels, nav. |
| **Body / Long-form** | `Inter` | 400, 500, 600, 700 | Neutral, hyper-legible at small sizes. Paragraphs, descriptions, table cells. |

Loaded via Google Fonts in `src/index.html` (with `preconnect` + `display=swap`). Exposed as SCSS
tokens in `styles/abstracts/_typography.scss` and as CSS vars:

```
--font-display: 'Plus Jakarta Sans', system-ui, sans-serif;   /* $font-family-display */
--font-body:    'Inter', system-ui, sans-serif;               /* $font-family-base    */
```

Rule of thumb: **headings and anything bold/short → display; anything you read in sentences → body.**

### Type scale (already in `_typography.scss`)
Display `5rem / 4.5 / 4` · H1 `3rem` · H2 `2.25` · H3 `1.875` · H4 `1.5` · H5 `1.25` · H6 `1.125` ·
Body `xl 1.25 / lg 1.125 / md 1 / sm .875 / xs .75`.

### Weights & tracking
- Big headings (`≥ H2`): weight **700–800**, letter-spacing **-0.02em to -0.03em** (`$tracking-tight`).
  Tight tracking on large display text is the hallmark of a designed page.
- Body: weight **400–500**, normal tracking, line-height **1.6–1.8** for comfort.
- Eyebrow labels (the little "FEATURES" kickers): display, **700**, uppercase, letter-spacing
  **+0.12em**, small (`.8rem`), in `--primary`.
- Never set body copy below `.8125rem`.

### Numeric / stats
For dashboard numbers and metrics use display weight 700–800 with `font-variant-numeric: tabular-nums`
so columns of numbers align.

---

## 3. Color System

Raw palette lives in `styles/abstracts/_colors.scss` (the violet `$primary-*`, blue `$secondary-*`,
neutral `$gray-*`, and semantic `$success/$warning/$danger/$info`). **Components do not use those
directly.** They use the **semantic tokens** below, which are redefined per theme in
`styles/themes/_light.scss` (`:root`) and `styles/themes/_dark.scss` (`[data-theme="dark"]`).

### Brand
| Token | Light | Dark | Use |
|---|---|---|---|
| `--primary` | `#7c3aed` | `#a78bfa` | Primary actions, links, active states, accent |
| `--primary-strong` | `#6d28d9` | `#8b5cf6` | Hover/pressed on primary |
| `--primary-soft` | `#f5f3ff` | `rgba(139,92,246,.14)` | Tinted backgrounds, soft chips, icon wells |
| `--on-primary` | `#ffffff` | `#0b0b12` | Text/icon on a primary fill |
| `--ring` | `rgba(124,58,237,.35)` | `rgba(167,139,250,.45)` | Focus ring |

### Surfaces & structure (semantic — the important ones)
| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f7f8fc` | `#0b0b12` | Page background |
| `--surface` | `#ffffff` | `#14141f` | Cards, header, primary panels |
| `--surface-2` | `#f9fafb` | `#1b1b28` | Nested panels, kanban columns |
| `--surface-inset` | `#f1f5f9` | `#101019` | Wells, track backgrounds |
| `--elevated` | `#ffffff` | `#1e1e2c` | Popovers, menus, modals |
| `--border` | `#e9ecf2` | `rgba(255,255,255,.08)` | Default hairline |
| `--border-strong` | `#d7dbe4` | `rgba(255,255,255,.14)` | Inputs, emphasized dividers |

### Text
| Token | Light | Dark |
|---|---|---|
| `--text` | `#0f1222` | `#f4f5fb` |
| `--text-muted` | `#5b6172` | `#a6abbd` |
| `--text-subtle` | `#878da0` | `#6f7488` |

### Status (each has a `-soft` tint for backgrounds)
`--success #10b981` · `--warning #f59e0b` · `--danger #ef4444` · `--info #3b82f6`, plus
`--success-soft`, `--warning-soft`, etc. (low-alpha tints that adapt per theme). Used for badges,
priority tags (High = danger-soft, Medium = warning-soft, Low = success/ info-soft), progress bars.

### Gradients & atmosphere
- `--gradient-brand`: `linear-gradient(135deg, var(--primary), var(--secondary))` — the one hero/logo/
  accent gradient. Use it *once or twice* per view, max.
- `--gradient-text`: same, clipped to text for a single highlighted phrase in a headline.
- **Mesh glow** (hero background): 2–3 large, heavily-blurred radial blobs in primary/secondary at low
  alpha behind content. In dark mode they become the room's only light source. Keep them *behind* a
  `backdrop-blur` or low opacity so text stays legible.

### Elevation (shadows) — `styles/abstracts/_shadows.scss` + tokens
Soft, colored-neutral shadows; in dark mode shadows are deeper and near-black.
`--shadow-sm / -md / -lg / -xl`. Cards rest on `-md`, lift to `-lg`/`-xl` on hover. A "brand" shadow
(`0 20px 40px rgba(124,58,237,.25)`) is reserved for the primary CTA and the logo.

---

## 4. Space, Radius, Layout

- **Spacing base = 4 px.** Use multiples (4, 8, 12, 16, 24, 32, 48, 64, 96). Section vertical rhythm:
  `$section-padding-y: 6rem` (desktop), tighten to ~4rem on mobile.
- **Radius** (`_radius.scss`): xs 4 · sm 6 · md 8 · lg 12 · xl 16 · 2xl 20 · 3xl 24 · full. Cards use
  **xl–2xl**, buttons/pills use **full**, chips use **full**, inputs use **lg**. Consistent, generous
  rounding is a big part of the "designed" feel — avoid mixing 6px and 20px randomly.
- **Container**: max-width `1320px` (`$container-max-width`), `1rem` gutter.
- **Focus**: never remove outlines. Use `box-shadow: 0 0 0 3px var(--ring)` on `:focus-visible`.

---

## 5. Motion

Defined in `styles/abstracts/_motion.scss` (SCSS tokens + CSS vars + keyframes). **Motion is where
"alive" is won or lost.**

### Duration & easing tokens
```
--dur-1: 120ms;   /* taps, color/opacity swaps            */
--dur-2: 200ms;   /* hovers, small transforms             */
--dur-3: 320ms;   /* entrances, expanding panels          */
--dur-4: 560ms;   /* hero / large reveals                 */

--ease-standard: cubic-bezier(.4, 0, .2, 1);    /* general UI            */
--ease-out:      cubic-bezier(.16, 1, .3, 1);   /* entrances (expo-out)  */
--ease-spring:   cubic-bezier(.34, 1.56, .64, 1);/* pops, playful accents */
```

### The core patterns (use these, don't invent new ones per component)
| Pattern | What it is | Where |
|---|---|---|
| **Reveal on scroll** | Element starts `opacity:0; translateY(16px)`, animates in when it enters the viewport. **Stagger** siblings by ~80 ms. | Every section, card grid, list. Via the `reveal` directive. |
| **Hover lift** | `translateY(-4px to -6px)` + shadow `-md → -lg`, `--dur-2 --ease-standard`. | Cards, tiles. |
| **Press** | `scale(.97)` on `:active`, `--dur-1`. | Buttons, interactive chips. |
| **Ambient float** | Slow `translateY` loop (`floatY`, 6–8 s) — the hero mockup / floating chips drift gently. | Hero visuals only; 1–2 elements max. |
| **Gradient shift** | `gradientShift` moves a large gradient's background-position over 12–18 s. | Hero mesh, CTA band. |
| **Marquee** | Infinite horizontal scroll for the logo strip. Pauses on hover. | "Trusted by" row. |
| **Shimmer / progress-grow** | Progress bars animate width from 0 → value on reveal; a soft shimmer sweeps once. | Stats, progress. |
| **Count-up** | Numbers tick from 0 to target when scrolled into view. | Headline stats. |

### Rules
- **Interactions ≤ 200 ms.** If a hover feels laggy it's too slow.
- **Entrances 320–560 ms, ease-out.** They should decelerate into place, never linear.
- **Stagger, don't dump.** A grid of 6 cards fading in together looks generated; an 80 ms cascade looks
  authored.
- **One ambient motion per region.** Constant motion everywhere is noise.
- **Always** wrap non-essential motion so it's disabled under:
  ```css
  @media (prefers-reduced-motion: reduce) { /* no transforms/loops; keep instant fades */ }
  ```

### How it's implemented in Angular (this is our "Framer Motion")
Angular has no Framer Motion, so we get the same results with platform tools:
- **`reveal` directive** (`shared/directives/reveal.directive.ts`) — an `IntersectionObserver` adds
  `.is-visible`; SCSS does the transition. Takes an optional stagger delay input. This is the workhorse
  for scroll animation.
- **CSS keyframes** (`_motion.scss`) for ambient/looping motion (float, gradient, marquee, shimmer).
- **`@angular/animations`** (already installed) for enter/leave of dynamic content (route/list/modal
  transitions) where JS-driven timing/stagger is needed.
- **Hover/press/focus** are pure CSS transitions on the tokens above.

---

## 6. Theming (light / dark)

- The active theme is a `data-theme="light|dark"` attribute on `<html>`, managed by
  `core/services/theme.service.ts` (signal-based, persisted to `localStorage` under `taskflow-theme`,
  defaults to the OS `prefers-color-scheme`).
- A tiny inline script in `index.html` `<head>` sets the attribute **before first paint** to avoid a
  flash of the wrong theme (FOUC).
- The theme **toggle** (sun/moon) lives in the public header and, later, every portal top bar. It calls
  `themeService.toggle()`.
- Components stay theme-agnostic: they only reference semantic tokens. If you find yourself writing
  `.dark-theme .foo { … }` overrides, the token set is missing something — add the token instead.
- Transitions between themes: put a short `background-color`/`color`/`border-color` transition
  (`--dur-2`) on `body` and surfaces so the switch glides rather than snaps.

---

## 7. Component patterns (the reusable vocabulary)

These are conventions the shared/ui library should converge on. See
[ATOMIC-DESIGN-GUIDE.md](ATOMIC-DESIGN-GUIDE.md) for atom/molecule/organism placement.

- **Buttons**: pill radius (`--radius-full`), display font 600. `primary` = brand fill + brand shadow;
  `secondary`/`outline` = `--surface` + `--border`; `ghost` = transparent. Press scales `.97`; primary
  hover deepens to `--primary-strong` and lifts. Icon + label gap `.5rem`.
- **Cards**: `--surface`, radius `xl–2xl`, `1px --border`, `--shadow-md`; hover lift + `--shadow-lg`.
  Padding `1.5–2rem`.
- **Chips / badges / priority tags**: pill, `--*-soft` background + solid status text; tiny (`.72rem`),
  display, medium weight. Priority: High→danger, Medium→warning, Low→success.
- **Inputs**: radius `lg`, `--surface` bg, `1px --border-strong`; focus → `--primary` border +
  `--ring` shadow. Never a bare browser input.
- **Kanban column** (dashboard/hero): `--surface-2` well, radius `xl`, a colored status dot + count
  pill in the header; task cards are `--surface` with a priority chip, a title, a thin progress bar,
  an avatar stack, and small meta icons — matching the reference boards.
- **Avatar stack**: overlapping circles with a `2px --surface` ring; a `+N` counter chip at the end.
- **Empty states**: centered icon-in-soft-well + one line + one action. Never a blank panel.

---

## 8. Anti-patterns (what made it look "AI-generated" — don't do these)

- ❌ Referencing a font you never load (Inter was declared, never imported → system font). Always load
  what you name.
- ❌ Hardcoding hex/px in components instead of tokens → impossible to theme, inconsistent by drift.
- ❌ No motion, or a single `translateY(-2px)` hover as the *only* interaction.
- ❌ Rainbow of gradients competing for attention. One accent, used with restraint.
- ❌ Uniform 1px-bordered boxes with no elevation hierarchy — everything at the same depth reads flat.
- ❌ Inconsistent radii/spacing (6px here, 20px there, 13px padding) — pick from the scale.
- ❌ Sections that all fade in at once. Stagger.
- ❌ Icon classes from a library that isn't installed (Bootstrap Icons `bi-*` were used but the package
  isn't present → invisible icons). We use `lucide-angular` everywhere.

---

## 9. File map

| Concern | File |
|---|---|
| Raw palette | `src/styles/abstracts/_colors.scss` |
| Type tokens + families | `src/styles/abstracts/_typography.scss` |
| Radius / shadows / spacing / z | `_radius.scss` · `_shadows.scss` · `_variables.scss` · `_breakpoints.scss` |
| **Motion tokens + keyframes** | `src/styles/abstracts/_motion.scss` |
| **Semantic theme tokens (light)** | `src/styles/themes/_light.scss` (`:root`) |
| **Semantic theme tokens (dark)** | `src/styles/themes/_dark.scss` (`[data-theme="dark"]`) |
| Global base (body, headings, utils) | `src/styles/base/_global.scss` |
| Global component skins | `src/styles/components/*` |
| Font loading + no-FOUC theme script | `src/index.html` |
| Theme state | `src/app/core/services/theme.service.ts` |
| Scroll-reveal | `src/app/shared/directives/reveal.directive.ts` |

> When you add a new visual primitive, add its **token** first (here + the theme files), then build the
> component against the token. Design system before pixels.
