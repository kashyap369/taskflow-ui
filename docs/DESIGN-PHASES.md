# TaskFlow UI — Design Remediation Plan (phased)

> **How to use this doc.** Each `## Phase N` below is sized to one Claude session. Say
> _"do Phase 3"_ and Claude reads this file, does exactly that phase's scope, ticks its checklist,
> and appends a line to [SESSIONS.md](SESSIONS.md). Do not start a phase before the one under it —
> later phases assume earlier tokens exist.
>
> Source of truth for *what good looks like* stays [DESIGN.md](DESIGN.md). This doc is the plan for
> getting the codebase there, plus the typeface decision that supersedes DESIGN.md §2.

**Audit date:** 2026-07-27 · **Scope audited:** all of `src/app` (5 portals, 22 routed pages,
15 shared components, 3 layouts, 193 `<button>`, ~60 form controls) + `src/styles`.

---

## 0. Executive summary

The **architecture is right and the token system is well designed — it is just barely used.**
`src/styles/abstracts/` defines a full type scale, radius scale, shadow set and motion set. Feature
and component SCSS then ignores almost all of it and hardcodes values. That single fact explains
every symptom below: drifted radii, 45 different font sizes, dark-mode leaks, and buttons that look
subtly different on every page.

| Area | Verdict | Evidence |
|---|---|---|
| Font loading | ✅ **Fixed** | Both families really are imported in `index.html`; `--font-display` used 77×. The old "declared but never loaded" bug is gone. |
| Motion tokens | 🟡 **Partly adopted** | 78 uses of `var(--dur-*)`, but 82× `.2s` / 22× `.15s` literals remain. |
| Color tokens | 🔴 **Leaking** | **197 hardcoded hex + 69 raw `rgba()`** across component SCSS → these do not respond to dark mode. |
| Type scale | 🔴 **Not adopted** | **0 uses** of `$fs-*`. ~45 distinct ad-hoc sizes incl. `.82`, `.88`, `.78`, `.84`, `.86`, `.92rem`, `12px`, `14px`. |
| Spacing scale | 🔴 **Not adopted** | **0 uses** of a spacing token anywhere in `src/app`. |
| Radius scale | 🔴 **Not adopted** | 0 uses of `$radius-*` in features. Literals incl. `14px` (55×), `22px`, `9px`, `7px`, `11px`, `13px`, `15px` — the exact anti-pattern DESIGN.md §8 names. |
| Button system | 🔴 **Duplicated 17×** | `.btn-primary-cta` is *defined* in 17 separate files, `.icon-btn` in 15, `.btn-ghost` in 14. 26 distinct ad-hoc button class names in templates. |
| Atomic UI library | 🔴 **Dead code** | `<app-button>`, `<app-text-input>`, `<app-email-input>`, `<app-form-field>`, `<app-text-area-input>` → **0 usages in the app**. Built, story'd, tested, never imported. |
| Global `_button.scss` | 🔴 **Dead + broken** | Defines `.btn-primary-custom` / `.btn-outline-custom` / `.btn-gradient` off raw `$gray-900`/`$white` (no theming) — and nothing uses those classes. |
| Button correctness | 🔴 **Real bug** | **126 of 193 buttons have no `type=`** → inside a `<form>` they default to `type="submit"`. |
| Dead controls | 🔴 | Landing page: 6 buttons, **0** handlers. Org layout global search + ⌘K: unbound. 8 `href="#"` links. |
| Focus / a11y | 🟡 | Good global `:focus-visible`, but only 8 files define their own; 43 of 193 buttons have `aria-label` while many are icon-only; `.icon-action` is 30×30. |
| Scroll reveal | 🟡 | `reveal` directive used in only **5** templates; DESIGN.md asks for every section/grid/list. |

**Root cause to fix first:** there is no enforcement. Nothing fails when a component writes `#7c3aed`
or `13px`. Phase 1 adds the guardrail so the later phases stay fixed.

---

## Typeface decision (supersedes DESIGN.md §2)

Replacing Plus Jakarta Sans + Inter. Inter in particular is the default-looking choice this app
should not be making.

| Role | New family | Weights | Why |
|---|---|---|---|
| **Display / headings / UI** | **Satoshi** | 500, 700, 900 | Geometric grotesque with actual personality — closed apertures, distinctive `a`/`g`/`R`. Reads premium at large sizes with tight tracking. |
| **Body / long-form / UI text** | **Geist** | 400, 500, 600 | Vercel's grotesque. Neutral and hyper-legible at 13–14px like Inter, but sharper terminals and a narrower default — visibly not Inter. |
| **Numeric / metrics** | **Geist Mono** | 400, 500 | True tabular figures for dashboard stats, table numbers, durations, IDs. |

Delivery:
- **Geist + Geist Mono** — Google Fonts CDN (same `<link>` pattern already in `index.html`).
- **Satoshi** — not on Google Fonts. **Self-host** the `woff2` files under `src/assets/fonts/satoshi/`
  with `@font-face` + `font-display: swap` (Fontshare's licence permits this; the CDN
  `api.fontshare.com` is the fallback if self-hosting is deferred). Self-hosting also removes a
  third-party render-blocking request.

New token surface (Phase 1 adds the third one):
```
--font-display: 'Satoshi', system-ui, sans-serif;
--font-body:    'Geist', system-ui, sans-serif;
--font-mono:    'Geist Mono', ui-monospace, monospace;   /* NEW — metrics & tabular numerals */
```

---

## Phase 1 — Typeface swap + type scale + the guardrail ✅ DONE (2026-07-27)

**Result:** **381 font-size declarations across 39 files** rewritten onto the scale. Zero raw
font-size literals remain in `src/`. `npm run design:lint` is green and wired into `npm run lint`.
204/204 tests pass, `a11y:contrast` 42/42, build clean.

**Deviations from the plan as written — read these before Phase 2:**
- **Satoshi is served from the Fontshare CDN, not self-hosted.** Self-hosting needs the woff2 binaries
  downloaded into the repo; deferred, and noted in `index.html` + DESIGN.md §2. Still an open item.
- **Two extra scale steps were added**, not just the two planned: `--fs-label` (13px) and
  `--fs-body-2xs` (11px) as planned, **plus four fluid tokens** (`--fs-fluid-hero/-h1/-h2/-h4`). The
  plan said to map the 9 hand-rolled `clamp()` headlines onto discrete steps; that would have visibly
  resized the landing hero and every page headline. Tokenising the ramps instead preserved the sizes
  and collapsed 6 distinct clamp signatures into 4 tokens.
- **`em` on `<code>`/`<kbd>`/`<pre>` is a sanctioned exception** and allowlisted in the linter — a mono
  face runs optically larger than the body face at the same px, so it is sized relative to context on
  purpose. 5 occurrences, all on `<code>`.
- **The type-scale CSS vars live in `abstracts/_typography.scss`, not `themes/_light.scss`.** Type is
  not theme-dependent; theme files stay about theme. The family declarations were *removed* from
  `_light.scss`. Follows the existing `_motion.scss` pattern.
- **`styles/base/_typography.scss` was empty** and is now the base layer that sizes `h1`–`h6` from the
  scale — that emptiness is *why* every page sized its own headings ad-hoc.
- `design-lint.mjs` ships with the Phase 2/3/8 rules written but **disabled**, so the lint can never be
  "temporarily red". `npm run design:report` prints their current counts:
  **color-literal 208 · border-radius 284 · duration 89.** Enable each rule as its phase lands.

**Original plan for reference:**
1. Add Satoshi `woff2` (500/700/900) to `src/assets/fonts/satoshi/`; write `@font-face` blocks in a new
   `src/styles/base/_fonts.scss`. Swap the Google `<link>` in `src/index.html` to Geist + Geist Mono.
2. Rewrite `styles/abstracts/_typography.scss`: keep the `$fs-*` scale, add `$font-family-mono`, and
   **expose the whole scale as CSS vars** in `themes/_light.scss` (`--fs-h1` … `--fs-body-xs`,
   `--fw-*`, `--lh-*`, `--tracking-*`) so component SCSS can use them without importing SCSS.
   Fix `$tracking-tight` — it is `-0.05em`, DESIGN.md §2 specifies `-0.02em to -0.03em`.
3. Add the two missing scale steps the codebase actually needs, rather than pretending it doesn't:
   `--fs-body-2xs: .6875rem` (11px, for chips/priority tags) and `--fs-label: .8125rem` (13px).
   These absorb the `.72/.78/.82` sprawl legitimately.
4. Sweep all ~45 ad-hoc `font-size` values → nearest token. Rounding table to apply consistently:
   `.72–.75rem → --fs-body-xs` · `.78–.82rem → --fs-label` · `.84–.92rem → --fs-body-sm` ·
   `.95–1.05rem → --fs-body-md` · `1.1–1.2rem → --fs-h6` · `1.25–1.35rem → --fs-h5` ·
   `1.4–1.6rem → --fs-h4` · `1.75–1.9rem → --fs-h3` · `2rem+ → --fs-h2`.
5. Apply `--font-mono` + `font-variant-numeric: tabular-nums` to dashboard stat numbers, table
   numeric cells, durations and counts (DESIGN.md §2 "Numeric / stats" — currently unimplemented).
6. **Guardrail:** new `scripts/design-lint.mjs` + `npm run design:lint`. Fails on a raw `font-size`
   literal, a raw hex, or a raw `border-radius` px value inside `src/app/**/*.scss`. Allowlist file
   for the handful of genuine exceptions. Wire into `npm run lint`.

**Exit criteria** — `npm run design:lint` passes for font-size · `npm run build` clean · both fonts
visibly render in light and dark · no page's headline reflows off-screen at 375px.

---

## Phase 2 — Color token sweep ✅ DONE (2026-07-27)

**Result:** **202 color literals** mapped to semantic tokens across 40 files (190 scripted + 12 by
hand). **Zero hex literals remain** outside masks. `color-literal` rule is now enabled in
`design:lint`. 204/204 tests, contrast 42/42, build clean, both themes verified.

**Deviations / findings — read before Phase 4:**
- **`color: #fff` does NOT map to `--on-primary`.** ~65 of these sit on a brand gradient or status
  fill. `--on-primary` flips to near-black in dark mode (because `--primary` becomes light violet),
  so that mapping would have turned the auth showcase panel's text black. Added a dedicated
  **`--on-accent`** set that is deliberately *identical* in both themes. This was the single biggest
  trap in the phase.
- **`mask-image` `#000` is an alpha channel, not a color.** Tokenising it breaks the mask. The linter
  skips mask properties — the only sanctioned raw-color exception.
- **New tokens added** (more than the "4–8" the plan predicted, ~25 total): the `--on-accent-*` and
  `--accent-surface-*` glass set, a decorative series `--accent-violet/-blue/-pink/-amber/-emerald`,
  composed gradients `--gradient-showcase/-admin/-highlight/-avatar-1..3`, `--scrim`, and
  `--ring-danger` / `--ring-success`.
- **Decorative ≠ semantic.** A rating star mapped to `--warning` rendered **brown** (`#96530b`) —
  light-mode status hues are darkened for text contrast. Decorative gold is `--accent-amber`. Caught
  visually in the browser, not by any automated check.

**Original plan for reference:**
1. Work file-by-file, worst first: `login-page.scss` (28) → `master-card.scss` (21) →
   `landing-page.scss` (16) → `register-page.scss` (15) → the three input atoms (12/11/10) →
   `organization/dashboard-page.scss` (8) → down the list.
2. Map each literal to the semantic token it *means* (`--surface`, `--surface-2`, `--text-muted`,
   `--border`, `--primary-soft`, `--success` …). If nothing fits, **add a token** to both theme files
   — do not keep the literal. Expect 4–8 genuinely new tokens (chart series colors, avatar-stack ring,
   overlay scrim are the likely ones).
3. Raw `rgba()` for scrims/overlays → new `--scrim`, `--overlay`, `--glow-primary` tokens per theme.
4. Fix `styles/components/_button.scss` to stop using raw `$gray-900`/`$white` (Phase 4 rewrites it
   fully; this phase just stops the theme leak).
5. Verify each touched screen in **both** themes before moving on.

**Exit criteria** — `design:lint` passes for hex · `npm run a11y:contrast` exits 0 · every page
screenshot-checked in light **and** dark · Storybook axe still green.

---

## Phase 3 — Radius, spacing and elevation rhythm ✅ DONE (2026-07-27)

**Result:** **285 radius values** (24 distinct sizes → 8 scale steps), **1185 spacing values** snapped
to the 4px scale across 46 files, **18 bespoke box-shadows** tokenised. `border-radius` rule enabled.
204/204 tests, contrast 42/42, `ng lint` clean, both themes verified.

**Deviations — read before Phase 4:**
- **Buttons were NOT made pills.** The plan said snap buttons to `--radius-full`. That is Phase 4's
  deliberate call as part of building the single button skin — doing it here would have meant a
  jarring interim look and work Phase 4 immediately redoes. Phase 3 only *quantised* geometry
  (`14px → --radius-xl`), preserving the current shape. **Phase 4 still owes the pill decision.**
- **The spacing scale gained mid-range steps** (`--space-7`=28px, `9`=36px, `11`=44px, `14`=56px,
  `20`=80px). A sparse scale forces destructive snapping — `1.75rem → 2rem` is a visible reflow,
  whereas with `--space-7` it is exact. Every step is still a true 4px multiple.
- **Spacing was swept app-wide, not just the "composed rhythm" the plan named.** 1185 values; the
  largest single shift is ~2px (`.85rem → 12px`, `.9rem → 16px`). Composed tokens
  (`--card-padding`, `--page-header-gap`, `--toolbar-gap`, `--stack-gap`) exist and are the right
  target for Phase 9's per-page consistency work.
- **`design-lint` now strips comments before matching.** It flagged a hex inside a comment that was
  explaining why that hex was replaced. A value in a comment is documentation.
- Bespoke shadows split into two families: elevation (→ `--shadow-md/-lg/-xl`) and focus rings
  (→ `0 0 0 3px var(--ring)`), which is what motivated `--ring-danger` / `--ring-success`.

**Original plan for reference:**
1. Expose radius + spacing as CSS vars (`--radius-xs…--radius-full`, `--space-1…--space-24` on the
   4px base) alongside the existing SCSS tokens.
2. Snap every `border-radius` literal to the scale per DESIGN.md §4: cards → `xl–2xl` ·
   buttons/pills/chips → `full` · inputs → `lg` · small icon buttons → `md`. Specifically:
   `14px → --radius-lg(12)` or `xl(16)` by element class, `22px/20px/18px → 2xl(20)`,
   `9/7/11/13/15px → nearest of 8/12/16`, `999px → --radius-full`.
3. Snap padding/margin/gap to the 4px scale. Consistent card padding (`1.5rem`), consistent page
   header block, consistent toolbar gap.
4. Audit shadow usage: cards rest at `--shadow-md`, hover `--shadow-lg`; reserve the brand shadow for
   the single primary CTA per view. Flatten anything using a bespoke `box-shadow`.

**Exit criteria** — `design:lint` passes for radius · a visual diff of any two list pages shows the
same header height, card padding and corner radius.

---

## Phase 4 — The button system ✅ DONE (2026-07-27)

**Result:** **47 duplicate definitions removed** across 26 files; one skin in
`styles/components/_button.scss`. Zero button definitions left in `src/app`. **No template edited**,
so no click handler could break. 204/204 tests, contrast 42/42, `ng lint` clean, both themes verified.

**Decisions & findings — read before Phase 6:**
- **Buttons are now pills** (`--btn-radius: var(--radius-full)`), settling the decision deferred from
  Phase 3. The landing page was *already* pill while every app page sat at 16px, so this makes the
  product match its own marketing site. It is **one token** — set it to `var(--radius-lg)` to revert
  the entire app.
- **`@extend` was a trap.** `@extend .btn` also extends **Bootstrap's** `.btn` (bootstrap is imported
  first in `styles.scss`), which would silently pull Bootstrap's padding/font/`--bs-*` machinery into
  all 49 legacy buttons. Replaced with explicit selector lists driven by a `$btn-all` SCSS variable.
- **A bare `.btn.is-loading` matched nothing where it mattered.** Auth submits carry
  `sign-in-btn is-loading`, never `btn`. Hence `$btn-all` / `$btn-loading` variables — a rule can no
  longer be written against `.btn` alone by accident.
- **`.icon-btn` was three different controls**: a 34px row action, a 40px circular top-bar affordance
  (`.icon-btn--round`), and the password-reveal glyph *inside* an input — which is an input
  affordance and moved to `_input.scss`. Row actions went 30–34px → **36px**.
- **Scope grew beyond the plan's big three.** `.action-btn` had 4 definitions and `.sign-in-btn` /
  `.sign-up-btn` are the app's most prominent CTAs, so all were folded in.
- **Loading state now exists.** Every page previously signalled "saving…" by swapping label text
  only, so a slow request looked like a dead button. Added a pseudo-element spinner — no template
  change needed since `[class.is-loading]` was already bound.
- **`tasks-page` keeps a partial `.btn-primary-cta`** (padding only) that relied on another file's
  definition via the cascade. It now legitimately overrides the global.

**Original plan for reference:**
1. Rewrite `styles/components/_button.scss` from tokens as the single source:
   `.btn` (base: pill radius, display font 600, `.5rem` icon gap, `--dur-2` transitions,
   `:active { scale(.97) }`, `:disabled`, `:focus-visible` ring) plus modifiers
   `.btn--primary` (brand fill + brand shadow, hover → `--primary-strong` + lift),
   `.btn--secondary` / `.btn--outline`, `.btn--ghost`, `.btn--danger`, and sizes `.btn--sm/--lg`.
2. Add `.icon-btn` **once** here, aligned with the existing `.icon-action` in `_actions.scss` — pick
   one name, delete the other, and raise the target from 30×30 to **36×36** (comfortable, still tight).
3. Keep the legacy aliases (`.btn-primary-cta`, `.btn-ghost`, `.icon-btn`) as `@extend`s of the new
   classes so no template edit is needed, then **delete all 17 local `.btn-primary-cta` blocks,
   15 `.icon-btn` blocks and 14 `.btn-ghost` blocks** from feature SCSS.
4. Delete the dead `.btn-primary-custom` / `.btn-outline-custom` / `.btn-gradient` classes.
5. Ensure every variant has a **loading** and **disabled** presentation — several pages currently
   express "saving…" only by swapping the label text.

**Exit criteria** — grep shows exactly one definition per button class · every portal's primary,
ghost, danger and icon buttons look identical across pages · hover/active/focus/disabled all present.

---

## Phase 5 — The input & form-control system ✅ DONE (2026-07-27)

**Result:** **45 duplicate definitions removed** (16 `.form-control`, 13 `.form-label`,
13 `.field-msg`, 10 `.field`) across 15 files; one vocabulary in `styles/components/_input.scss`.
Zero form-control definitions left in `src/app` outside three genuine flex overrides.
204/204 tests, contrast 42/42, `ng lint` clean, both themes verified.

**Findings — read before Phase 6:**
- **Three states did not exist anywhere in the app**: `read-only` (0 files), invalid /
  `aria-invalid` (0 files), and a consistent `:disabled` (only 10 of ~25 files). All three now exist
  and were verified live in the browser. `[aria-invalid]` is the accessible source of truth;
  `.is-invalid` is the class hook.
- **A debugging trap worth remembering:** reading `getComputedStyle` immediately after toggling a
  state returns the *pre-transition* value, because `background`/`border-color` are transitioned.
  Only `cursor` appeared to change, which looked exactly like a specificity bug and sent me hunting
  through Bootstrap and Angular's injected styles. The CSS was correct; the test was wrong. **Let the
  transition settle (~350 ms) before asserting on a state change.**
- **The auth pages hid a second layer of duplicates** nested inside `.input-icon-group`, which a
  top-level-only search misses. The leading-icon group is now part of the shared vocabulary
  (`.input-icon-group`, `:has(.icon-btn)` trailing pad, `:focus-within` icon tint).
- **Input radius standardised to `--input-radius: var(--radius-lg)`** per DESIGN.md §4; auth had
  drifted to `xl`.
- `--btn-radius` / `--input-radius` are component-level aliases that resolve to the radius scale.
  `design-lint`'s radius rule was widened to accept them — a semantic per-component token is the
  pattern the system wants, not a violation.
- Placeholder colour is `--text-subtle` (4.88:1 light / 4.79:1 dark) with `opacity: 1` to stop
  Firefox dimming it below AA.

**Original plan for reference:**
1. Expand `styles/components/_input.scss` into the full vocabulary from tokens: `.form-control`,
   `.form-select`, `textarea`, `.form-label`, `.form-hint`, `.form-error`, `.input-group`
   (leading/trailing icon), `.list-search`, `.list-filter`, checkbox/radio/switch.
   Radius `lg`, `--border-input` boundary, focus → `--primary` border + `--ring`.
2. Add the **states that are currently missing**: `:disabled`, `:read-only`, `[aria-invalid]` /
   `.is-invalid` (danger border + `--danger` message), and a consistent required marker.
3. Kill the hardcoded colors in `text-input.scss` (12), `text-area-input.scss` (11),
   `email-input.scss` (10) and align those atoms to the same skin — they are the reference
   implementation even while unused.
4. Verify placeholder color hits 4.5:1 in both themes (a common silent failure) and that `type="date"`
   / `type="number"` native controls are themed, not left browser-default.
5. Sweep every form page so labels, hints and error text use one pattern.

**Exit criteria** — `a11y:contrast` green incl. placeholders · every field in every drawer/modal shows
identical resting, hover, focus, disabled and error states.

---

## Phase 6 — Functional sweep ✅ DONE (2026-07-27)

**Result:** `type="button"` added to **77** buttons (0 remain untyped). **0** `href="#"` left.
16 dead controls resolved. 213/213 tests (7 new), contrast 42/42, `ng lint` clean, build clean.

**Two counts in the original audit were wrong** — both from regexes that matched inside HTML comments
and didn't handle multi-line tags:
- "126 buttons missing `type=`" → the real number was **77**.
- "6 dead landing buttons + footer socials ×3" → there were **16** dead controls overall, and the
  footer has **no social icons** at all; those three were the Product/Company/Resources link columns.

**The two worst bugs weren't in the plan at all:**
- **Both mobile menus were completely broken.** `angular.json` has `scripts: []`, so **no Bootstrap
  JS is loaded** — the public header's `data-bs-toggle="collapse"` toggler never opened anything.
  The org layout's hamburger had no handler and its sidebar was `d-none d-lg-flex`, so **below 992px
  the org portal had no navigation whatsoever.** Both are now signal-driven with an off-canvas
  sidebar, backdrop, aria-expanded, and Menu→X icon swap.
- **Hardcoded colors live in TypeScript too.** `productivity-chart.ts` held `#4F6EF7` / `#00A3FF` /
  `#E8ECF4` for its ECharts palette. `design-lint` only scans SCSS, so Phase 2 never saw them. ECharts
  is canvas-rendered and can't read CSS vars, so they now resolve tokens via `getComputedStyle`.
  **Worth extending design-lint to `.ts` in a later phase.**

**Decisions taken (user-confirmed):**
- **Org top bar: removed** the ⌘K search, "+ Create", the notification bell (hardcoded "3") and
  "See plans". All four were features that don't exist; markup is in git history.
- **Landing:** "View live demo" scrolls to `#product-preview` (that mockup *is* the demo); the hero
  board's fake tabs/"Create Task" became presentational `<div>`s inside `aria-hidden`, so they no
  longer invite clicks or take tab stops. Hero + CTA buttons became real `routerLink`s.
- **Legal:** Terms/Privacy render as `<strong>` text, footer legal as plain `<span>`. Footer columns
  now link only where a real landing anchor exists (Features, Pricing, Customers); the rest are text.
- **Login "Forgot?" removed** — backend-blocked (no endpoint, per V1-GAPS), so a link promised a flow
  that cannot work.
- `pricing-card` and `productivity-chart` now emit real outputs (`planSelected`, `viewChange`)
  instead of holding inert buttons.

**Original plan for reference:**
1. **Add `type="button"` to all 126 buttons missing it.** Highest-value fix in this doc — icon buttons
   inside `<form>` currently submit it. Prioritise the drawers: `tasks-page` (17),
   `my-tasks-page` (15), `project-detail-page` (10), `team-detail-page` (8), `roles-page` (7).
2. **Landing page (6 dead buttons):** wire "Start for free" and the CTA-band primary → `/auth/register`;
   "View live demo" → decide (scroll-to-section, or remove); board tabs + "Create Task" are part of the
   static hero mockup → convert to non-interactive `<div role="presentation">` so they stop looking
   clickable, or make the tabs really switch the mock board.
3. **Org layout global search + ⌘K** (`organization-layout.html:206`) — the input is unbound and the
   shortcut hint is a lie. Either wire it to a real command palette or remove it this phase; a dead
   search box in the top bar of every org screen is the most visible broken thing in the app.
4. **8 `href="#"` links:** login "Forgot?" (backend-blocked per V1-GAPS — make it a disabled hint or
   route to a "coming soon" note rather than a no-op anchor), register Terms/Privacy, footer socials ×3
   and Privacy/Terms/Cookies. Give each a real target or drop it.
5. Click-test every remaining interactive element per portal against its facade method; record any that
   throw or no-op.

**Exit criteria** — zero `<button>` without `type` · zero `href="#"` · a per-portal checklist in
SESSIONS.md confirming each control fires its handler.

---

## Phase 7 — Accessibility & interaction states ✅ DONE (2026-07-27)

**Result:** **0** icon-only controls without an accessible name (was 5). **0** unlabelled inputs
(was 8 real + 4 false positives). Focus rings verified with real keyboard input. axe/contrast green.

**Findings:**
- **The original "43 of 193 buttons have aria-label" figure was misleading.** Most buttons have
  visible text and need no label; only **5** were genuinely icon-only-and-unnamed. Fixed with
  contextual names (`'Remove ' + member.userFullName`, not just "Remove").
- **`prefers-reduced-motion` was already fully covered** — `_motion.scss` has a global
  `*, *::before, *::after` catch-all with `!important`. The 11 feature files with keyframes and no
  local guard are fine; no work was needed.
- **Two audit methodologies gave false negatives and cost real time:**
  1. `getComputedStyle` immediately after a state change returns the **pre-transition** value
     (same trap as Phase 5).
  2. **Programmatic `.focus()` does not trigger `:focus-visible`** in Chrome, so an automated sweep
     reports "no focus ring" on elements that are fine. Verify focus with a real `Tab` keypress —
     doing that confirmed `rgba(124,58,237,.35) 0 0 0 3px` plus a primary border.
- **A unit test caught a production bug.** The mobile sidebar swaps its icon to `X`, which was not
  registered in the org layout's `LucideIconProvider` — it would have rendered blank for real users,
  not just in tests. The org portal can't be browser-verified without the API running, so the
  sidebar's behaviour is covered by 4 new specs instead.
- Row action targets are 36px (Phase 4); primary/tap targets clear 44px. Remaining sub-24px hits are
  visually-hidden native checkboxes behind styled labels, which is correct.

**Original plan for reference:**
1. `aria-label` on every icon-only button (currently 43/193 buttons carry one; audit which are icon-only
   and fill the gap) and `aria-label`/`<label>` on every unlabelled input.
2. Confirm the global `:focus-visible` ring is not being overridden by components that set their own
   `box-shadow` on hover/focus — the most likely regression from Phases 4–5.
3. Keyboard pass per portal: tab order, drawer/modal focus trap + restore, `Esc` to close, no keyboard
   trap in the data table.
4. Touch targets ≥ 44px on mobile for primary actions; ≥ 36px for row icon actions.
5. `prefers-reduced-motion` — verify every animation added in Phase 8 and every existing one is
   disabled under it.
6. Run Storybook axe (already set to `test: 'error'`) plus `npm run a11y:contrast`.

**Exit criteria** — axe clean · contrast green · full keyboard traversal of one page per portal.

---

## Phase 8 — Motion pass

**Do**
1. Replace the remaining 82× `.2s` / 22× `.15s` / `.4s` / `240ms` literals with `--dur-*` + `--ease-*`.
2. Extend the `reveal` directive from 5 templates to every section, card grid and list, with the
   ~80ms sibling stagger DESIGN.md §5 specifies.
3. Add the patterns DESIGN.md documents but the app doesn't have: progress-bar grow-on-reveal, count-up
   on headline dashboard stats, hover-lift on cards, press-scale on chips.
4. Route + drawer/modal enter/leave via `@angular/animations`.
5. One ambient motion per region, max — audit the landing hero for competing loops.

**Exit criteria** — no duration literals · reveal on every major section · everything off under
reduced-motion.

---

## Phase 9 — Per-portal polish pass (one portal per session if needed)

With the system fixed, walk each portal for the things only a human eye catches:
`9a` Public + Auth (landing, pricing, login, register, verify-email) — **known bug:** the login submit
button binds `config.title`, so it reads "Welcome back" / "Organization sign-in" / "Admin sign-in"
instead of a verb. A button label should be the action ("Sign in"), not the page heading.
See `login-page.html:75`. ·
`9b` Organization (11 pages — the biggest surface) ·
`9c` Member (3 pages) · `9d` Admin (4 pages).

Per portal: page-header consistency, empty states (DESIGN.md §7 — centered icon-in-soft-well + one line
+ one action; several pages currently render a blank panel), loading skeletons vs spinners, table
density and alignment, responsive behavior at 375 / 768 / 1280, error/toast presentation, and both themes.

---

## Phase 10 — Lock it in

0. **Extend `design-lint` to `.ts` files.** Phase 6 found hardcoded hex in `productivity-chart.ts`
   that every SCSS-only rule missed. Anything canvas-rendered (ECharts) resolves tokens in TS.
1. Migrate templates to `<app-button>` / `<app-form-field>` **or** formally retire the unused atoms —
   whichever, stop shipping dead code that contradicts CLAUDE.md's Atomic Design rule.
2. Storybook stories for the button and input skins (all variants × states × both themes).
3. Update **DESIGN.md** with the new typefaces, the new tokens added in Phases 1–3, and the button/input
   vocabulary as-built.
4. Append the whole effort to **SESSIONS.md** and update **PHASES.md** status.
5. `npm run design:lint && npm run lint && npm run a11y:contrast && npm test && npm run build` all green.

---

## Ordering rationale

Phases 1–3 fix the **token layer** — everything above them is unstable until they land. Phase 4–5
rebuild the two **components users touch most**, and they need Phases 1–3's tokens to be written
against. Phase 6 is **pure behavior** and deliberately sits after the SCSS churn so a broken handler is
never confused with a broken style. Phases 7–8 are cross-cutting qualities that can only be verified
once the components are stable. Phase 9 is the human eye, last. Phase 10 prevents the whole thing from
drifting back.

**If you only get three sessions:** Phase 6 (things are actually broken), Phase 4 (the most visible
inconsistency), Phase 1 (the biggest perceived-quality jump).
