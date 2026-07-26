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

**TestBed providers a component needs (else `should create` fails with NG0201):** a component (or its
facade chain) that reaches `ApiService` needs `{ provide: APP_SETTINGS, useValue: AppSettings }`
(from `@core/config`) **and** `provideHttpClient()` (+ `provideHttpClientTesting()`); anything that shows a
toast (via `NotificationService`) needs `provideToastr()` + `provideAnimations()`; `RouterLink`/`routerLink`
needs `provideRouter([])`; a `LottiePlayer` needs `provideLottieOptions({ player: () => import('lottie-web') })`;
an echarts chart needs `provideEchartsCore({ echarts })`. For a **required `input()`**, set it before
`detectChanges()` with `fixture.componentRef.setInput('name', value)`. For a **lucide icon** used in the
template, provide it: `{ provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({ IconName }) }`.

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
- On submit, guard with `if (form.invalid) { form.markAllAsTouched(); return; }` then `form.getRawValue()`.
- **Validation:** two options —
  - Angular `Validators` (`Validators.required`, `Validators.email`) for simple, one-off forms.
  - The **`shared/validations/` decorator engine** (FluentValidation-style) for forms with reusable/
    cross-field rules — this is the preferred home. Declare a decorated model class, then build the
    reactive form's validators from it. First consumer: `features/auth/register-page`.

### `shared/validations` engine (built)

A decorator-driven validator that mirrors FluentValidation. Import everything from `@shared/validations`.

1. Declare a model with property decorators (`@Required @MaxLength @Email @Pattern @MinLength @Min @Max
   @IsTrue @Matches @Custom`). Messages are optional (sensible defaults). `@Matches('other')` is
   cross-field (model-scoped); the rest are field-scoped.
2. Build the reactive form from it:
   ```ts
   private readonly rules = controlValidators(MyModel);           // per-control ValidatorFns
   form = this.fb.nonNullable.group(
     { email: ['', this.rules['email']], /* … */ },
     { validators: crossFieldValidator(MyModel) },                // cross-field rules at group level
   );
   fieldError(p: string) { return messageFor(this.form, p); }     // touched-gated message for templates
   ```
3. Template: `@if (fieldError('email'); as msg) { <small class="field-msg">{{ msg }}</small> }`.
4. Pure check (no forms): `validate(MyModel, obj)` → `ValidationResult` (`isValid`, `firstError(p)`,
   `errorsFor(p)`, `hasError(p)`). Rules are inherited across a model subclass.

Structure: `models/` (types + `ValidationResult`), `metadata/` (rule registry keyed by class,
prototype-chain aware), `decorators/` (the property decorators), `engine/` (`validate` + the Angular
adapters). Relies on `experimentalDecorators` (legacy `(target, key)` signature) — no
`emitDecoratorMetadata`, so the registry is the single source of truth. Add new decorators in
`decorators/validation-decorators.ts` and re-export from `index.ts`.

## List pages: filtering + pagination (built)

Every list view follows the same three-piece pattern. The API has **no paging yet**, so filtering and
paging are entirely client-side over the full list the facade already holds.

1. **Filter signals + a `filtered*` computed on the page** (never in the facade — the facade owns data,
   the page owns view state):
   ```ts
   readonly search = signal('');
   readonly statusFilter = signal<'' | TaskStatus>('');   // '' = all
   readonly filteredTasks = computed(() => this.tasks().filter(t => /* term + filters */));
   onSearch(v: string) { this.search.set(v); }
   onStatusFilter(v: string) { this.statusFilter.set(v === '' ? '' : Number(v) as TaskStatus); }
   clearFilters() { /* reset every filter signal */ }
   ```
2. **`createPagination()` from `@shared/utils/pagination`** over that computed:
   ```ts
   readonly pager = createPagination(this.filteredTasks, { pageSize: 10 });
   // template: @for (t of pager.items(); track t.id)
   ```
   `page` is a *computed clamp*, so shrinking the source (typing in the search box while on the last
   page) silently falls back to the last real page — no effect, no manual reset.
3. **The `Pagination` molecule** (`@shared/ui/molecules/pagination/pagination`) under the list —
   summary line, rows-per-page select, windowed page buttons (`aria-current="page"`, `nav[aria-label]`):
   ```html
   <app-pagination [page]="pager.page()" [pageSize]="pager.pageSize()" [total]="pager.total()"
     [pageSizes]="pager.pageSizes" itemLabel="tasks" ariaLabel="Tasks pagination"
     (pageChange)="pager.setPage($event)" (pageSizeChange)="pager.setPageSize($event)" />
   ```

Markup for the toolbar uses the **global** classes from `styles/components/_toolbar.scss` (not
per-page SCSS): `.list-toolbar` wrapper, `.list-search` (icon + `input[type=search]`), `.list-filter`
(a `<select>`, bound `[value]` so `clearFilters()` resets the control too), and `.list-no-match`
(the "nothing matched" state + a Clear-filters button). Keep the page's own **empty state** (no rows
at all) separate from `.list-no-match` (rows exist, filters excluded them).

## Create / edit drawers, and delete (built)

One drawer per page serves **both** create and edit — don't build a second one.

```ts
readonly showDrawer = signal(false);
readonly editing = signal<Project | null>(null);   // null = create
readonly isEditing = computed(() => this.editing() !== null);

openCreate() { this.editing.set(null);  this.form.reset({ …defaults }); this.showDrawer.set(true); }
openEdit(row) { this.editing.set(row);  this.form.reset({ …fromRow(row) }); this.showDrawer.set(true); }
closeDrawer() { this.showDrawer.set(false); this.editing.set(null); }   // always clear `editing`
submit() { … this.editing() ? facade.updateX({ id, … }) : facade.createX({ … }); this.closeDrawer(); }
```

The template switches the heading, the submit label (`Save changes` / `Create …`) and the saving label
off `isEditing()`. Both branches keep `appDialog` on the `<aside class="drawer">`.

**Two rules that are easy to get wrong:**

1. **Diff the list DTO against the update command before writing the form.** The API's update commands
   are *whole-record* — every field you don't send is overwritten. `TaskListItem` has no `description`
   but `UpdateTaskCommand` requires one, so a form filled from a table row would blank it. Where the
   list DTO is short, fetch the detail first: `facade.loadTaskForEdit(id, (detail) => …)` patches the
   missing field in after the drawer opens.
2. **Don't render inputs the update command ignores.** These commands are partial (no status, start
   date, or project reassignment), so hide those fields under `@if (!isEditing())` and explain the
   absence with a `<p class="drawer-note">` — a control that silently does nothing is worse than none.

**Delete** always goes through `DialogService.confirmDelete(title, text, confirmLabel)` at the *page*
handler (async), never in the facade, and the message names the consequence ("…and its 3 task(s) will be
deleted"). Deleting the record a **detail page** is showing must navigate away, but only on success — the
facade's delete takes an optional `onDeleted` callback for exactly that:

```ts
this.facade.deleteProject(p.id, () => this.router.navigate(['/organization/projects']));
```

For the rare action that destroys a whole container of other records (deleting an **organization**), use
`DialogService.confirmTyped(title, text, expectedText, confirmLabel)` instead — the user must type the
record's name before the confirm button will resolve.

Row/card affordances use the global `.icon-action` (and `.icon-action.danger` for delete) from
`styles/components/_actions.scss`.

## Accessibility (enforced by lint + a script)

`npx ng lint` runs the `@angular-eslint/template` a11y rules, so these are build-time errors, not advice:

- **If it's clickable, it's a `<button>`.** A `<div (click)>` is invisible to the keyboard —
  `click-events-have-key-events` + `interactive-supports-focus` will fail. Making it a real button gets
  Enter/Space, focus order and a focus ring for free instead of bolting on `tabindex` + `keydown`.
  This applies to whole-row click targets *and* to **drawer backdrops** (`<button class="drawer-backdrop"
  aria-label="Close …">`); `styles/components/_modal.scss` has the global chrome reset, so a backdrop
  needs no per-page style beyond its existing appearance rules.
- **A `<label>` must point at one control.** To name a *group* (a radiogroup, a fieldset-like cluster),
  use a `<span class="form-label" id="…">` + `aria-labelledby` — `label-has-associated-control` fails
  otherwise, and a `<label for>` genuinely can't target a group.
- **Don't claim a role you don't implement.** `role="radiogroup"` obliges you to give the children
  `role="radio"` + `aria-checked` (not `aria-pressed`, which describes independent toggles), a roving
  `tabindex` so the group is one Tab stop, and arrow keys that move selection *and* focus. See
  `register-page` for the worked example. Bind the `keydown` on the radios, not the group — the group
  isn't focusable, so a handler there would fail `interactive-supports-focus`.
- **Drawers get `appDialog`** (`shared/directives/dialog.directive.ts`) — focus-trap, Escape, `role=dialog`,
  focus restore. Never hand-roll it.
- **Colour**: pull from tokens and run `npm run a11y:contrast` after touching any of them; use
  `--border-input` (not `--border`) on anything the user types into. See DESIGN.md §3.

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
