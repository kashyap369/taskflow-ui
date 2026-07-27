# TaskFlowApp — Claude Instructions

Angular 20 app using Component-Driven Development with Atomic Design (atoms → molecules → organisms) under `src/app/shared/ui/`.

## Read the docs first (IMPORTANT)

Before working, read the project docs in [`docs/`](docs/) — they carry full context so you don't have to re-derive it:

- **`D:\Projects\TMS\TaskFlow\docs\ProjectCompletion.md`** — the **API ⇄ UI parity ledger**, the one doc covering *both* projects: which features exist on each side, which of the API's 71 endpoints this frontend consumes, and what's blocking whom. **Read it first** to see whether a task belongs here or in the backend, and **update it** (Changelog row + affected parity rows) whenever work changes what the UI consumes.

- [`docs/OVERVIEW.md`](docs/OVERVIEW.md) — what the app is, the two account types / portals, and how far it's built.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — the four buckets, routing/portals, auth/session, HTTP pipeline, state, "where does X go?".
- [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) — naming, the 5-file component rule, feature-slice shape, forms, HTTP, checklists.
- [`docs/DESIGN.md`](docs/DESIGN.md) — the design language: fonts, color tokens (light/dark), typography, motion. Pull from tokens, never hardcode.
- [`docs/DESIGN-PHASES.md`](docs/DESIGN-PHASES.md) — the **design remediation plan**: a full audit of where the UI diverges from DESIGN.md (token adoption, buttons, inputs, dead controls) and a numbered phase per session. When asked to "do Phase N", read this file and do exactly that phase. Also carries the **current typeface decision (Satoshi + Geist)**, which supersedes DESIGN.md §2 until Phase 10 folds it back in.
- [`docs/PHASES.md`](docs/PHASES.md) — the phased roadmap and **current status** (update at the end of every session).
- [`docs/V1-GAPS.md`](docs/V1-GAPS.md) — **v1 is complete**; this is what it deliberately excludes and why (backend-blocked / backend defects / deferred v1.x / non-goals). Start post-v1 work here.
- [`docs/SESSIONS.md`](docs/SESSIONS.md) — append-only session log (gotchas/decisions; add an entry each session).
- [`docs/ATOMIC-DESIGN-GUIDE.md`](docs/ATOMIC-DESIGN-GUIDE.md) — deciding atom vs molecule vs organism and variants-as-props.

The backend API this frontend consumes lives at `D:\Projects\TMS\TaskFlow` (its own `docs/` folder mirrors these).

## Component scaffolding rule (IMPORTANT)

Whenever asked to **create an atom, molecule, or organism**, ALWAYS generate exactly these **5 files** in the component's own folder — never skip any of them:

| File | Purpose |
|---|---|
| `<name>.ts` | Component class |
| `<name>.html` | Template |
| `<name>.scss` | Styles |
| `<name>.spec.ts` | Unit test (TestBed) |
| `<name>.stories.ts` | Storybook stories |

## Folder locations

- Atoms: `src/app/shared/ui/atoms/<category>/<component-name>/`
  - Atoms are grouped in **plural category folders**: `buttons/`, `inputs/`, `icons/`, `badges/`, `avatars/`, `spinners/`
  - Example: `atoms/buttons/sign-in-button/sign-in-button.ts`
- Molecules: `src/app/shared/ui/molecules/<component-name>/`
- Organisms: `src/app/shared/ui/organisms/<component-name>/`

## Feature (page) structure

Features are organized **by layout/portal, then by page** — flat, with NO `presentation/application/data/domain` layer folders:

```
src/app/features/
  <layout-name>/              # public, auth, organization, member, admin
    <page-name>/              # one folder per routed page, named *-page
      <page-name>.ts          # class <PageName> (e.g. LandingPage, DashboardPage)
      <page-name>.html
      <page-name>.scss
      <page-name>.spec.ts
      <page-name>.model.ts    # (optional) page-local helper models
    <layout-name>.routes.ts   # lazy routes for this layout (e.g. ORGANIZATION_ROUTES)
    <feature>.facade.ts       # (optional) feature state/orchestration
    <feature>.repository.ts   # (optional) HTTP access via @core/api
    <feature>.models.ts       # (optional) feature-level DTOs + mappers
```

Example: `features/auth/` contains `login-page/` plus `auth.routes.ts`, `auth.facade.ts`, `auth.repository.ts`, `auth.models.ts`. Pages talk only to the facade; the facade uses the repository and `@core` services. New pages register in their layout's `*.routes.ts` via `loadComponent`.

## File conventions (match existing components like `atoms/buttons/button/` and `molecules/pricing-card/`)

- **No `.component.` suffix** in filenames — use `button.ts`, not `button.component.ts`.
- Class name is the PascalCase component name **without a `Component` suffix**: `Button`, `PricingCard`, `SignInButton`.
- `@Component` decorator:
  - `selector: 'app-<component-name>'`
  - `standalone: true`
  - `imports: [CommonModule, ...]`
  - `templateUrl: './<name>.html'`
  - `styleUrl: './<name>.scss'`
- Icons come from `lucide-angular` (`LucideAngularModule`, `LucideIconData`) when needed.

### `<name>.spec.ts`

Standard TestBed boilerplate with at least a "should create" test:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button } from './button';

describe('Button', () => {
  let component: Button;
  let fixture: ComponentFixture<Button>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Button] }).compileComponents();
    fixture = TestBed.createComponent(Button);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### `<name>.stories.ts`

Storybook `Meta`/`StoryObj` pattern with `title` reflecting the atomic level:

- Atoms → `title: 'Atoms/<Name>'`
- Molecules → `title: 'Molecules/<Name>'`
- Organisms → `title: 'Organisms/<Name>'`

Include `argTypes` controls for the inputs and at least one story per meaningful variant/state (e.g. Primary, Disabled, Loading).
