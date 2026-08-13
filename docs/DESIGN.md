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
| **Display / Headings / UI** | `Satoshi` | 500, 600, 700, 800, 900 | Geometric grotesque with real character — closed apertures, distinctive `a`/`g`/`R`. Headings, buttons, labels, nav. |
| **Body / Long-form** | `Switzer` | 400, 500, 600, 700 | Precise, contemporary, and highly legible. Paragraphs, descriptions, table cells. |
| **Numeric / metrics / code** | `IBM Plex Mono` | 400, 500, 600 | Distinct data voice with true tabular figures. Dashboard stats, table numerals, durations, `<code>`. |

Satoshi + Switzer load from **Fontshare**, while IBM Plex Mono loads from **Google Fonts**; both
stylesheets are declared in `src/index.html`
(with `preconnect` + `display=swap`). Self-hosting Satoshi's woff2 under `assets/fonts/satoshi/` is
the eventual goal — it removes a third-party render-blocking request — but is deferred.

Exposed as SCSS tokens **and CSS vars** in `styles/abstracts/_typography.scss` (same pattern as
`_motion.scss` — the SCSS token and its `--var` mirror live together):

```
--font-display: 'Satoshi', system-ui, sans-serif;      /* $font-family-display */
--font-body:    'Switzer', system-ui, sans-serif;         /* $font-family-base */
--font-mono:    'IBM Plex Mono', ui-monospace, monospace; /* $font-family-mono */
```

> Replaced Plus Jakarta Sans + Inter in Phase 1. Inter is the default-looking choice a product like
> this should not be making; see [DESIGN-PHASES.md](DESIGN-PHASES.md) "Typeface decision".

Rule of thumb: **headings and anything bold/short → display; anything you read in sentences → body.**

### Type scale (in `_typography.scss`, mirrored as `--fs-*`)
Display `5rem / 4.5 / 4` · H1 `3rem` · H2 `2.25` · H3 `1.875` · H4 `1.5` · H5 `1.25` · H6 `1.125` ·
Body `xl 1.25 / lg 1.125 / md 1 / sm .875 / **label .8125** / xs .75 / **2xs .6875**`.

`--fs-label` (13px — labels, table headers, meta) and `--fs-body-2xs` (11px — chips, priority tags)
were added in Phase 1: the codebase had ~45 ad-hoc sizes clustered at those two roles with no token
to land on.

**Fluid tokens** for headlines that scale with the viewport — the discrete scale can't express a
responsive ramp, and the alternative is hand-rolled `clamp()` drift:
`--fs-fluid-hero` · `--fs-fluid-h1` · `--fs-fluid-h2` · `--fs-fluid-h4`.

**Product-role tokens** keep equivalent screens aligned: `--fs-page-title` is the 28–32px responsive
heading used by admin, organization, and member pages; `--fs-auth-title` is the 32–36px sign-in and
registration heading. Readable-width utilities use `--measure-copy` (68ch) and
`--measure-compact` (54ch).

**A component never writes a raw `font-size`.** `npm run design:lint` fails the build on one. The
single sanctioned exception is `em` on `<code>`/`<kbd>`/`<pre>`, which is context-relative on purpose
because a mono face runs optically larger at the same px.

### Weights & tracking
- Big headings (`≥ H2`): weight **700–800**, letter-spacing **-0.02em to -0.03em**
  (`--tracking-tight` / `--tracking-tighter`). `$tracking-tight` was `-0.05em`, well past that range
  and visibly cramped on Satoshi — corrected in Phase 1.
  Tight tracking on large display text is the hallmark of a designed page.
- Body: weight **400–500**, normal tracking, line-height **1.6–1.8** for comfort.
- Eyebrow labels (the little "FEATURES" kickers): display, **700**, uppercase, letter-spacing
  **+0.12em**, small (`.8rem`), in `--primary`.
- Never set body copy below `.8125rem`.

### Numeric / stats
For dashboard numbers and metrics use display weight 700–800 with `font-variant-numeric: tabular-nums`
so columns of numbers align. Implemented in Phase 1 via `styles/base/_typography.scss`:
`.stat-value` / `.metric-value` / `.tabular` get tabular figures automatically; `.metric-mono` adds
IBM Plex Mono for the big readouts; `.cell-numeric` right-aligns table figures.

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
| `--border` | `#e9ecf2` | `rgba(255,255,255,.08)` | Default hairline — **decorative** dividers, card edges |
| `--border-strong` | `#d7dbe4` | `rgba(255,255,255,.14)` | Emphasized dividers |
| `--border-input` | `#848da0` | `rgba(255,255,255,.34)` | **Form-control boundary** — the one border token held to 3:1 |

**Use `--border-input` on anything a user types into or picks from** (`.form-control`, `.form-select`,
`.list-search`, `.list-filter`). WCAG 1.4.11 requires 3:1 for a control's boundary because it's the only
thing identifying the control; `--border` sits at 1.18:1 and is for decoration, where no minimum applies.

### Text
| Token | Light | Dark |
|---|---|---|
| `--text` | `#0f1222` | `#f4f5fb` |
| `--text-muted` | `#5b6172` | `#a6abbd` |
| `--text-subtle` | `#6b7180` | `#7d8296` |

### Status (each has a `-soft` tint for backgrounds)
`--success` · `--warning` · `--danger` · `--info`, plus `--success-soft`, `--warning-soft`, etc.
(low-alpha tints that adapt per theme). Used for badges, priority tags (High = danger-soft,
Medium = warning-soft, Low = success/info-soft), progress bars.

| Token | Light | Dark |
|---|---|---|
| `--success` | `#047857` | `#34d399` |
| `--warning` | `#96530b` | `#fbbf24` |
| `--danger` | `#c81e1e` | `#f87171` |
| `--info` | `#1d4ed8` | `#60a5fa` |

**Why light-mode status hues are dark.** They began on the 500-weight palette (`#10b981` / `#f59e0b` /
`#ef4444` / `#3b82f6`), which reaches only 2.1–3.8:1 as text on white — every badge and status label
failed AA. Dark mode was already fine (bright hues on near-black), so only light changed. Where these
act as a *fill* they pair with white text, which the darker values only improve.

### Contrast is enforced, not eyeballed
`npm run a11y:contrast` parses the real values out of `themes/_light.scss` / `_dark.scss` and checks
every foreground/background pairing the UI renders, in both themes — 4.5:1 for body text (1.4.3 AA),
3:1 for a form-control boundary (1.4.11). It exits non-zero on a failure, so a token can't quietly drift.
**Run it after touching any colour token.** Storybook additionally runs axe-core per story
(`@storybook/addon-a11y`, set to `test: 'error'` in `.storybook/preview.ts`).

### On-accent — content sitting ON a saturated fill (added Phase 2)
`--on-accent` (white), `--on-accent-muted`, `--on-accent-subtle`, plus the glass set
`--accent-surface`, `--accent-surface-2`, `--accent-border`, `--accent-border-strong`,
`--accent-grid`, `--accent-mint`, `--accent-gold`.

**These are identical in dark mode, and that is the point.** `--on-primary` flips to near-black in
dark because `--primary` becomes a light violet — but a brand *gradient* stays saturated in both
themes, so its content stays white. Phase 2 found ~65 `color: #fff` sites relying on this; mapping
them to `--on-primary` would have turned the auth showcase panel's text black.

### Decorative series vs status (added Phase 2)
`--accent-violet` · `--accent-blue` · `--accent-pink` · `--accent-amber` · `--accent-emerald` —
meaning-free colors for avatars, icon tiles, ambient blobs and chart series. Lifted in dark mode.

**Use these when a color means nothing; use status tokens when it means something.** They are not
interchangeable: light-mode `--warning` is deliberately darkened to `#96530b` so warning *text*
clears 4.5:1, and Phase 3 caught a rating star mapped to it rendering **brown instead of gold**.

Composed gradients: `--gradient-showcase` (auth panel), `--gradient-admin` (admin's slate identity),
`--gradient-highlight`, `--gradient-avatar-1/-2/-3`. Plus `--scrim` (modal/drawer backdrop) and the
status focus rings `--ring-danger` / `--ring-success`.

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

- **Spacing base = 4 px** — `styles/abstracts/_spacing.scss`, added in Phase 3 (before that there was
  no spacing token in the codebase at all, so every padding was invented per component). Steps are
  named `--space-1` … `--space-24` by 4px multiple; the mid-range is dense (`7`=28px, `9`=36px,
  `11`=44px) so snapping never forces a visible reflow. Composed rhythm tokens: `--card-padding`,
  `--page-header-gap`, `--toolbar-gap`, `--stack-gap`. Section vertical rhythm `--space-24` (6rem)
  desktop, `--space-16` (4rem) mobile.
- Page shells use `--page-padding` (24px desktop, 16px mobile). Marketing sections use
  `--section-padding` and `--section-padding-compact`, so rhythm adapts without per-page values.
- **Radius** (`_radius.scss`, mirrored as `--radius-*`): xs 4 · sm 6 · md 8 · lg 12 · xl 16 · 2xl 20 ·
  3xl 24 · full. Cards use **xl–2xl**, chips use **full**, inputs use **lg**. Consistent, generous
  rounding is a big part of the "designed" feel — avoid mixing 6px and 20px randomly.
  Phase 3 snapped 285 raw values across 24 distinct sizes onto 8 steps with this band table:
  `≤4→xs · 5-6→sm · 7-9→md · 10-12→lg · 13-16→xl · 17-23→2xl · ≥24→3xl · 999/9999→full`.
  `50%` (true circles) and `inherit` are left alone — neither is a scale step.
- **Both are enforced.** `npm run design:lint` fails on a raw `border-radius`. Hex, px and rem values
  *inside comments* are ignored, so a token's rationale can quote the value it replaced.
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

--ease-standard: cubic-bezier(.4, 0, .2, 1);       /* color / hover state    */
--ease-out:      cubic-bezier(.23, 1, .32, 1);     /* entrances / feedback   */
--ease-in-out:   cubic-bezier(.77, 0, .175, 1);    /* on-screen movement      */
--ease-drawer:   cubic-bezier(.32, .72, 0, 1);     /* drawers and sheets      */
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

- **Buttons** — one definition, `styles/components/_button.scss`. Base `.btn` + variants
  `.btn--primary` (brand gradient + brand shadow), `.btn--secondary`/`--outline`, `.btn--ghost`,
  `.btn--danger`; sizes `.btn--sm`/`--lg`; layout `.btn--full`. Pill radius via **`--btn-radius`**
  (one token — set to `var(--radius-lg)` for rounded rectangles app-wide). Display font 600, icon gap
  `--space-2`, press `scale(.97)`, focus `0 0 0 3px var(--ring)`, and a real **`.is-loading`** spinner.
  Legacy names (`.btn-primary-cta`, `.btn-ghost`, `.sign-in-btn`, `.sign-up-btn`, `.action-btn`) are
  aliases on the same skin, listed in the `$btn-all` variable — **never `@extend .btn`**, that also
  extends Bootstrap's `.btn`.
- **Icon buttons**: `.icon-btn`/`.icon-action` = 36px row action; `.icon-btn--round` = 40px circular
  top-bar affordance. A glyph *inside* a control is an input affordance, not a button — see `_input.scss`.
- **Cards**: `--surface`, radius `xl–2xl`, `1px --border`, `--shadow-md`; hover lift + `--shadow-lg`.
  Padding `1.5–2rem`.
- **Chips / badges / priority tags**: pill, `--*-soft` background + solid status text; tiny (`.72rem`),
  display, medium weight. Priority: High→danger, Medium→warning, Low→success.
- **Inputs** — one definition, `styles/components/_input.scss`. `--input-radius` (= `lg`),
  `--input-height` 48px, `--surface` bg, `1px --border-input` boundary; focus → `--primary` border +
  `--ring`. Full vocabulary: `.field`, `.form-label` (+`.required`), `.form-control`, `.form-select`,
  `.form-hint`, `.field-msg`/`.form-error`, `.input-icon-group`, `.form-check-input`.
  **States**: `:disabled` (inset bg, not-allowed), `[readonly]` (inset bg, full-contrast text,
  default cursor — deliberately distinct from disabled), `[aria-invalid]`/`.is-invalid` (danger border
  + `--ring-danger`). Placeholder is `--text-subtle` with `opacity: 1` so Firefox can't dim it below AA.
  Never a bare browser input.
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
