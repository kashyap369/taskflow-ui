# Atomic Design Guide — TaskFlowApp

A practical reference for deciding **what is an atom, molecule, or organism**, how to
**categorize** components, and how to handle **variants** (buttons, inputs, etc.).

All shared UI lives under `src/app/shared/ui/`. Each component gets its own folder with
the 5 files defined in `CLAUDE.md` (`.ts / .html / .scss / .spec.ts / .stories.ts`).

---

## 1. The core decision test

Apply this to every UI piece, top to bottom:

| Ask this | If yes → |
|---|---|
| Is it a single, indivisible element (button, input, icon, badge, avatar, label)? | **Atom** |
| Does it combine 2–3 atoms into one small reusable unit with one job? | **Molecule** |
| Is it a self-contained section that composes molecules and owns layout/state? | **Organism** |
| Does it need a service, HttpClient, or route data? | **Not shared UI** → put it in `features/` |

Tiebreakers:

- **Atoms take no other components as inputs** — only primitive `input()` values.
- **Molecules import other components** — that single fact answers "atom or molecule?" ~90% of the time.
- **When unsure between two levels, pick the smaller one.** Composing up later is cheap; breaking an over-built organism apart is painful.
- **Don't atomize everything up front.** Build pages normally; the moment you copy-paste a
  piece of UI a second time, *that* is your atom/molecule. Reuse pressure decides the level.

---

## 2. Categories

Follow the plural-category-folder convention: `atoms/<category>/<component>/`.
**Create a category folder only the first time you need a component in it** — don't
pre-make empty folders.

### Atoms — `shared/ui/atoms/<category>/`
Single, indivisible elements. Take only primitive `input()`s, never other components.

| Category | What lives here |
|---|---|
| `buttons/` | button, icon-button, fab, link-button |
| `inputs/` | text-input, textarea, checkbox, radio, toggle-switch, slider, otp-input |
| `icons/` | icon wrapper, icon-badge (icon-in-circle) |
| `badges/` | status-badge, count-badge, dot-indicator, tag/chip |
| `avatars/` | avatar (single), avatar-placeholder |
| `spinners/` | spinner, skeleton, progress-bar, progress-ring |
| `typography/` | heading, text, label, caption, code/kbd |
| `feedback/` | tooltip, divider, keyboard-hint |
| `media/` | image, logo-mark, thumbnail |
| `overlays/` | backdrop/scrim, portal-host |

### Molecules — `shared/ui/molecules/<category>/`
2–3 atoms combined into one small reusable unit with a single job.

| Category | What lives here |
|---|---|
| `forms/` | form-field (label+input+error), password-field, search-bar, dropdown/select, datepicker, time-picker, file-upload, input-group, combobox |
| `cards/` | stat-card, feature-card, pricing-card, project-card, profile-card |
| `lists/` | list-item, activity-item, deadline-item, avatar-group, nav-item |
| `navigation/` | breadcrumb, tabs, pagination, segmented-control, stepper, menu-item |
| `feedback/` | toast/notification, alert, empty-state, badge-with-label, progress-with-label |
| `menus/` | dropdown-menu, user-menu, workspace-switcher, context-menu |
| `data/` | key-value-pair, metric, legend-row, tag-list |

### Organisms — `shared/ui/organisms/<category>/`
Self-contained sections that compose molecules and own layout/interaction state.

| Category | What lives here |
|---|---|
| `navigation/` | navbar/top-bar, sidebar, footer, mobile-drawer, command-palette |
| `data-display/` | data-table, card-grid, list-view, kanban-board, calendar, timeline |
| `charts/` | line/area-chart, bar-chart, donut-chart, health-overview |
| `forms/` | login-form, signup-form, filter-panel, multi-step-form, settings-panel |
| `overlays/` | modal/dialog, drawer, popover, confirm-dialog |
| `feedback/` | toast-container, notification-center, banner |
| `sections/` | hero, pricing-section, feature-grid, cta-section, testimonial-section |

> **Duplicate categories are intentional.** `forms/` and `feedback/` appear at all three
> levels. The **level** is decided by composition depth; the **category** by domain purpose.
> A `checkbox` (atom/inputs) and a `login-form` (organism/forms) are both "form" things at
> different scales.

Common placement questions:

- **Dropdown / Select** → `molecules/forms/` (trigger atom + menu of item atoms)
- **Datepicker** → `molecules/forms/` (input + calendar popup)
- **Modal** → `organisms/overlays/` (owns backdrop + focus trap + layout)
- **Tabs** → `molecules/navigation/` (the tab strip; the panels are page content)
- **Tooltip** → `atoms/feedback/` (pure, no composition)
- **Chart** → `organisms/charts/` (owns rendering logic and axes, even if it looks like "one visual")

---

## 3. Variants: one flexible atom, not many

**Different types of the same element are variants (props), not new components.**

### Buttons

`submit`, `cancel`, `close`, `back` differ only by **label / color / icon / type** — all
props. Build **one `Button` atom**:

```ts
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
export type ButtonType    = 'button' | 'submit' | 'reset';

variant  = input<ButtonVariant>('primary');
type     = input<ButtonType>('button');
icon     = input<LucideIconData | null>(null);
size     = input<'sm' | 'md' | 'lg'>('md');
loading  = input(false);
disabled = input(false);
clicked  = output<void>();
```

Even when looks differ a lot (border vs background vs gradient, different text color and
typography), each look is **one named variant** = one SCSS block. The shared `.btn` block
holds what's common (radius, padding, transition, font family); each `.btn--x` overrides
only what makes it distinct (bg, border, color, weight).

```scss
.btn { padding: .7rem 1.4rem; border-radius: 10px; transition: .3s; }
.btn--primary  { background: $gray-900;   color: #fff; border: none; font-weight: 600; }
.btn--outline  { background: transparent; color: $text-primary; border: 1px solid $border-light; }
.btn--ghost    { background: transparent; color: $primary-600; border: none; }
.btn--gradient { background: $gradient-primary; color: #fff; border: none; font-weight: 600; }
```

`size` is a **separate axis** — combine freely: `variant="primary" size="lg"`. Never make
`primary-lg-button`.

### When a dedicated button IS justified

Only make a **thin semantic wrapper** when a specific, opinionated combo is repeated in
≥3 places (e.g. `SignInButton` = "Continue with Google" + Google icon). The wrapper
**composes the base `Button`** and adds zero SCSS:

```ts
@Component({
  selector: 'app-sign-in-button',
  imports: [Button],
  template: `<app-button variant="secondary" [icon]="GoogleIcon" (clicked)="clicked.emit()">
               Continue with Google
             </app-button>`,
})
export class SignInButton { clicked = output<void>(); }
```

**Button rule of thumb**

> Differs only by props (label/color/icon/type)? → **variant of `Button`**
> Same opinionated combo repeated in ≥3 places? → **thin wrapper that composes `Button`**
> A one-time custom look? → local class on the base button (`class="my-cta"`)
> Never duplicate the button's markup/SCSS into a new atom.

---

## 4. Inputs: three separated concerns

Split what people wrongly cram into one component:

1. **The input control** → atom
2. **The field wrapper** (label + error + hint) → molecule
3. **The validation rules** → NOT a UI component → lives in the form/feature

### `TextInput` atom — the control only

All control-level variation is props. The atom shows error **state**, never the rule.

```ts
export type InputType = 'text' | 'email' | 'password' | 'number';

type        = input<InputType>('text');
placeholder = input('');
leadingIcon = input<LucideIconData | null>(null);  // left icon slot
size        = input<'sm' | 'md' | 'lg'>('md');
disabled    = input(false);
invalid     = input(false);   // shows error STYLING only — not the message
value       = model('');      // two-way for forms
```

**Goes inside the one atom (props):** `type`, `leadingIcon`, `size`, `invalid`, `disabled`.
**Stays outside (composed by a molecule):** eye toggle, strength bar, label, error message.

### Where validation lives

Validation logic is not UI. It belongs to the form — Angular reactive-form `Validators`
or the project's `shared/validations` engine. Flow:

```
form control (rules) → produces errors → molecule reads errors
   → sets [invalid]="true" on the atom + renders the message text
```

Atom shows *state*; molecule shows *message*; form owns *rules*.

### `FormField` molecule — normal validated fields

```html
<label>{{ label() }}</label>

<app-text-input [type]="type()" [leadingIcon]="leadingIcon()"
                [invalid]="!!error()" [(value)]="value" />

@if (error()) { <span class="field-error">{{ error() }}</span> }
@if (hint() && !error()) { <span class="field-hint">{{ hint() }}</span> }
```

### `PasswordField` molecule — why password is a molecule

A password field composes **input atom + icon-button atom (eye) + strength atom** — the
moment you combine multiple atoms, you leave atom territory.

```html
<label>{{ label() }}</label>

<div class="password-control">
  <app-text-input [type]="visible() ? 'text' : 'password'"
                  [leadingIcon]="LockIcon" [invalid]="!!error()" [(value)]="value" />

  <app-icon-button [icon]="visible() ? EyeOff : Eye"
                   (clicked)="visible.set(!visible())" />
</div>

<app-password-strength [value]="value()" />

@if (error()) { <span class="field-error">{{ error() }}</span> }
```

Do **not** bake the eye toggle into `TextInput` — otherwise every text/email/number input
drags along logic it never uses.

### `PasswordStrength` atom

A dumb bar + label. Takes `value`, computes a score (rule in `shared/utils`), renders
colored segments. No sub-components → atom.

### Input mental model

```
TextInput          → atom      (control; type/icon/invalid are props)
IconButton (eye)   → atom      (reused, not password-specific)
PasswordStrength   → atom      (dumb bar + label)
FormField          → molecule  (label + input + error)          ← normal fields
PasswordField      → molecule  (input + eye + strength + error) ← composes 3 atoms
Validators/engine  → shared/validations  (rules, not UI)
```

**Input rule of thumb**

> Just a styled control (icon/size/state as props)? → **atom (`TextInput`)**
> Adds a label + error message around it? → **molecule (`FormField`)**
> Composes the input WITH other interactive atoms (eye, strength bar)? → **its own molecule**
> Validation *rules* are never a component — they live in the form / `shared/validations`.

---

## 5. Golden rules (summary)

1. **One flexible atom + variants** beats many near-duplicate atoms.
2. **A new component only when the DOM structure differs**, or when you must **combine
   two atoms** (→ that's a molecule).
3. **Different look = variant. Different size = separate axis. One-off = local class.**
4. **Dumb components only** in `shared/ui`: data in via `input()`, events out via
   `output()`, no service/HttpClient, no hardcoded data.
5. **Validation/business rules are never UI** — they live in the form/feature.
6. **Anything touching data or owning a whole screen region** belongs in `features/`,
   not `shared/ui`.
7. **Category = domain purpose; level = composition depth.** They are independent.
