# TaskFlow UI — Coding Conventions

Derived from the existing code and `CLAUDE.md`. When adding something, copy the shape of the nearest
existing example (auth feature for feature slices; `atoms/buttons/button/` and `molecules/pricing-card/`
for components).

## File & Class Naming

- **No `.component.` / `.service.` suffix in filenames.** Use `button.ts`, not `button.component.ts`;
  `auth.facade.ts`, `api.service.ts`.
- **Class names are PascalCase without a `Component` suffix**: `Button`, `PricingCard`, `SignInButton`,
  `LandingPage`, `DashboardPage`.
- Pages are named `<name>-page/` (folder + files) with class `<Name>Page`.
- Feature-level files: `<feature>.facade.ts` → `AuthFacade`, `<feature>.repository.ts` → `AuthRepository`,
  `<feature>.models.ts` (DTOs + mappers).

| Thing | Pattern | Example |
|---|---|---|
| Routed page | `<name>-page/` folder, class `<Name>Page` | `dashboard-page/` → `DashboardPage` |
| Route array | `SCREAMING_SNAKE` per layout | `ORGANIZATION_ROUTES`, `AUTH_ROUTES` |
| Facade | `<Feature>Facade` | `AuthFacade` |
| Repository | `<Feature>Repository` | `AuthRepository` |
| Request/Response DTO | `<Verb>Request` / `<Verb>Response` | `LoginRequest`, `LoginResponse` |
| Mapper | `to<Target>()` free function | `toUser(response)` |
| Signal store | `<Feature>Store` | `AuthStore` |
| Guard | `<name>Guard` (camelCase fn) | `authGuard`, `roleGuard` |
| Interceptor | `<name>Interceptor` | `errorInterceptor` |
| Atom/Molecule/Organism | PascalCase, no suffix | `TextInput`, `FormField`, `DataTable` |
| API endpoint constant | grouped in `API` map | `API.Auth.Login` |
| Error/failure code | mirror API `FailureReason` | `ValidationFailure`, `Forbidden` |

## Components (`@Component` decorator)

Every component is **standalone** (no NgModules):

```ts
@Component({
  selector: 'app-<component-name>',
  standalone: true,
  imports: [CommonModule, /* ...other standalone deps */],
  templateUrl: './<name>.html',
  styleUrl: './<name>.scss',   // note: styleUrl (singular), not styleUrls
})
export class ComponentName { }
```

- `selector: 'app-<component-name>'` (kebab-case).
- Prefer **`templateUrl`/`styleUrl`** (separate files) — matches the 5-file rule; inline templates
  only for the tiniest wrappers.
- **Signals-first**: inputs via `input()` / `model()`, outputs via `output()`, local state via
  `signal()`, derived via `computed()`. Use `inject()` for DI, not constructor params.
- Icons come from `lucide-angular`: import the icon data, provide via `LUCIDE_ICONS` +
  `LucideIconProvider` in the component's `providers`, and import `LucideAngularModule`.

## The 5-File Component Rule (shared/ui only)

Whenever creating an **atom, molecule, or organism**, ALWAYS generate exactly these 5 files in the
component's own folder — never skip any:

| File | Purpose |
|---|---|
| `<name>.ts` | Component class |
| `<name>.html` | Template |
| `<name>.scss` | Styles |
| `<name>.spec.ts` | Unit test (TestBed) |
| `<name>.stories.ts` | Storybook stories |

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
Storybook `Meta`/`StoryObj` pattern with a `title` reflecting the atomic level:
- Atoms → `title: 'Atoms/<Name>'`
- Molecules → `title: 'Molecules/<Name>'`
- Organisms → `title: 'Organisms/<Name>'`

Include `argTypes` controls for the inputs and at least one story per meaningful variant/state
(e.g. Primary, Disabled, Loading).

## Folder Locations

- **Atoms**: `shared/ui/atoms/<category>/<name>/` — grouped in **plural category folders**
  (`buttons/`, `inputs/`, `icons/`, `badges/`, `avatars/`, `spinners/`). Create a category folder
  only the first time you need a component in it — don't pre-make empty folders.
- **Molecules**: `shared/ui/molecules/<name>/`.
- **Organisms**: `shared/ui/organisms/<name>/`.
- **Pages**: `features/<layout>/<page-name>/`.
- See [ATOMIC-DESIGN-GUIDE.md](ATOMIC-DESIGN-GUIDE.md) for how to decide the level and category, and
  the variants-are-props rule (one flexible `Button` with a `variant` input, not many near-duplicates).

## `shared/ui` = Dumb Components

Presentational components in `shared/ui` must be **dumb**:
- Data in via `input()`, events out via `output()`.
- **No** service / `HttpClient` / `Router` injection.
- **No** hardcoded data (charts must be `input()`-driven — the current dashboard charts hardcode data
  and are flagged for refactor).
- Validation *rules* are never a UI component — they live in the form/feature.

## Feature Slices

```
features/<layout>/
  <page-name>/            <page-name>.ts/.html/.scss/.spec.ts (+ optional .model.ts)
  <layout>.routes.ts      lazy routes (loadComponent per page)
  <feature>.facade.ts     signals + orchestration; the ONLY thing pages inject
  <feature>.repository.ts HTTP via @core/api ApiService; unwraps ApiResponse<T>
  <feature>.models.ts     DTOs + mapper functions
```

Rules:
- **Pages inject the facade only** — never a repository or `ApiService` directly.
- **Repositories are the only place** a feature touches `@core/api`. They call `ApiService`
  (`get/post/put/patch/delete`) with an endpoint from the `API` map, and return the typed
  `Observable<ApiResponse<T>>`.
- **Mappers** (`to<Target>()` in `*.models.ts`) convert API DTOs → session/domain models
  (anti-corruption). Facades unwrap `response.data` and pass it through the mapper.
- **Facades own signals** (`private readonly _loading = signal(false); readonly loading = this._loading.asReadonly();`)
  and use `finalize()` to reset loading on completion/error.
- Register a new page in its layout's `*.routes.ts` via `loadComponent`.

## Forms

- Use **reactive forms** with `FormBuilder.nonNullable.group({...})`.
- Angular `Validators` for now (`Validators.required`, `Validators.email`). On submit, guard with
  `if (form.invalid) { form.markAllAsTouched(); return; }` then `form.getRawValue()`.
- The custom `shared/validations/` decorator engine is the intended long-term validation home
  (not built yet).

## Routing

- `app.routes.ts` is thin: layout component + `canActivate` guard + lazy `loadChildren` into the
  portal's `*.routes.ts`.
- Portal `*.routes.ts` (`AUTH_ROUTES`, `ORGANIZATION_ROUTES`, …): first entry redirects `''` to the
  default page (`pathMatch: 'full'`), then one `loadComponent` per page.
- Guards: `authGuard` (CanActivate), `guestGuard` (CanActivate), `roleGuard(role)` (CanMatch factory
  for portal branches).

## HTTP & API

- All calls go through `ApiService` (prefixes `AppSettings.api.baseUrl`). Never inject `HttpClient`
  outside `core`.
- Endpoint strings live in `core/api/api-endpoints.ts` as the `API` map — grouped by resource, with
  functions for parameterized routes: `GetById: (id: number) => \`/user/${id}\``.
- Consume the `ApiResponse<T>` success envelope by unwrapping `.data` in the repository/facade.
- Error handling is centralized in `errorInterceptor` — don't hand-roll error toasts in features;
  throw/propagate and let the interceptor map `failureReason` → `NotificationService`.

## Styling

- Global tokens/mixins live in `src/styles/abstracts/` (`@use`-only, no output). Component-specific
  styles go in the component's own `.scss`.
- Reuse design tokens (colors, radius, shadows, typography, breakpoints) from `abstracts/` rather
  than hardcoding values. Bootstrap 5 utilities/grid are available.
- Prettier config (in `package.json`): `printWidth: 100`, `singleQuote: true`; HTML uses the
  `angular` parser.

## Style / Formatting

- One import group per source (Angular → third-party → app), blank-line separated — match existing files.
- `private readonly` fields assigned via `inject()`; no constructor-param injection in new code.
- Keep pages thin (a "controller"): form + facade calls only. Business/orchestration in the facade.

## New Page / Feature Checklist

1. Page folder `features/<layout>/<page-name>/` with the 4 files (`.ts/.html/.scss/.spec.ts`).
2. Register it in the layout's `*.routes.ts` (`loadComponent`).
3. Need data? Add/extend `<feature>.repository.ts` (endpoint in the `API` map) + `<feature>.models.ts`
   (DTO + mapper) + `<feature>.facade.ts` (signals + use-case).
4. Page injects the **facade only**.
5. New reusable UI? Build it in `shared/ui` with all **5 files** (dumb, `input()`/`output()`), add a
   Storybook story.
6. New portal? Add the layout + `app.routes.ts` branch + guard.
7. `npx ng lint` — confirm no boundary violations.
