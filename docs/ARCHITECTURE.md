# TaskFlow — Frontend Architecture

> Angular 20 (standalone) · Component-Driven Design + Storybook · layered vertical slices ·
> signals + facades · role-based multi-portal routing · ESLint-enforced boundaries.
>
> _Last updated: 2026-07-05_

This is the living reference for how the frontend is organized and **why**. If you are about to
add a file and aren't sure where it goes, read [Where does X go?](#where-does-x-go).

---

## 1. Philosophy

The app is organized on **two axes at once**:

- **Vertical** — the app is split into **features** (bounded contexts). Each feature is a
  self-contained slice you could almost lift out on its own.
- **Horizontal** — inside each feature the code is split into **Clean-Architecture layers**
  (`domain → data → application → presentation`), with dependencies pointing **inward only**.

On top of that, all reusable UI follows **Component-Driven Design** (atoms → molecules →
organisms) and is viewable in isolation via **Storybook**.

We deliberately do **not** mirror backend patterns 1:1. Concepts are borrowed where they map
cleanly (CQRS, repositories, DTO mappers, middleware pipeline, domain events) and dropped where
they don't (no MediatR, no one-file-per-handler ceremony).

---

## 2. Top-level structure

```
src/app/
├── core/          Infrastructure — app-wide singletons. NO UI. Imports nothing from the others.
├── shared/        Reusable, presentational UI + helpers. NEVER imports a feature.
├── layouts/       Portal "shells" (one per user type) + partials.
└── features/      Vertical slices (bounded contexts). ALL routed screens live here.
```

Plus at the project level:

```
src/environments/  environment.ts (dev) · environment.staging.ts · environment.prod.ts
.storybook/        Storybook config (scoped to shared/ui)
eslint.config.js   Flat ESLint config incl. boundary rules
```

---

## 3. The dependency rule (the fitness function)

Dependencies point **inward**. This is enforced automatically by `eslint-plugin-boundaries`
(see [§11](#11-enforced-boundaries)).

```
                 ┌──────────────────────────────────────────────┐
   features/  ─▶ │  presentation → application → data → domain   │   (inward only)
                 └──────────────────────────────────────────────┘
        │                    │            │
        ▼                    ▼            ▼
     layouts/ ───────────▶ shared/ ───▶ core/ ───▶ (nothing)
                                          ▲
   domain/ = pure TypeScript, imports NOTHING ─┘
```

Hard rules:

- `core` imports **nothing** from `shared` / `layouts` / `features`.
- `shared` may import `core` (types) — **never** a feature.
- `layouts` may import `shared`, `core`.
- `features` may import `layouts`, `shared`, `core`.
- **Features must not import each other.** Cross-feature communication goes through the
  `core/events` bus.
- Inside a feature: `presentation → application → data → domain`. `presentation` talks to the
  **facade only** (never a repository directly). `domain` imports no `@angular` / `HttpClient`.

---

## 4. Component-Driven Design (`shared/ui`) + Storybook

All reusable, presentational components live under `shared/ui`, split by composition level:

| Level | Definition | Examples |
|---|---|---|
| **atom** | No dependency on another app component. Only inputs/outputs. Zero business/HTTP knowledge. | `button`, `input`, `badge`, `avatar`, `spinner`, `icon` |
| **molecule** | Composes atoms. Still dumb; still only inputs/outputs. | `form-field`, `search-bar`, `pricing-card`, `review-card` |
| **organism** | Composes molecules/atoms into a meaningful section. Presentational — no service injection. | `data-table`, `sidebar`, `productivity-chart` |

**The rule that makes them Storybook-able:** components in `shared/ui` are **dumb** — data comes
in via `input()`, events go out via `output()`. No `HttpClient`, no feature services, no
`Router` navigation, no hardcoded data.

### Workflow

```bash
ng g c shared/ui/atoms/submit-button   # generates .ts .html .scss .spec.ts
```

Then **hand-add** `submit-button.stories.ts` in the same folder. Stories exist **only** under
`shared/ui/{atoms,molecules,organisms}` — never in `features`, `layouts`, or `pages`.

Reference stories already in the repo: `shared/ui/atoms/button`,
`shared/ui/molecules/pricing-card`, `shared/ui/organisms/productivity-chart`.

Storybook config (`.storybook/main.ts`) is scoped to `../src/app/shared/ui/**/*.stories.ts`.
Global styles/tokens load automatically via the Angular `browserTarget`.

```bash
npm run storybook          # dev server → http://localhost:6006
npm run build-storybook    # static build → storybook-static/
```

> **Compodoc is disabled** in the Storybook targets (it depends on `wmic`, removed on Windows 11).
> Controls still work from `argTypes`. Re-enable `compodoc: true` in `angular.json` for richer
> auto-generated prop tables on a machine where Compodoc runs.

---

## 5. Layouts & multi-portal routing

Each **user type = one layout = one guarded route branch = one feature area.**

| Layout (`layouts/`) | Portal | Guard |
|---|---|---|
| `public-layout` | Marketing site (header + footer) | — |
| `auth-layout` | All login/register screens (centered card) | `guestGuard` |
| `organization-layout` | Org area (sidebar + topbar) | `authGuard` |
| `admin-layout` | Admin portal (scaffold) | `authGuard` + `roleGuard(Role.Admin)` |
| `member-layout` | Member portal (scaffold) | `authGuard` + `roleGuard(Role.Member)` |

`layouts/partials/` holds shared shell pieces (`public-header`, `public-footer`, `public-navbar`).

**A layout is a route parent with a `<router-outlet/>`; pages are its children.** This is what
answers "which page belongs to which layout" — it's literally the route tree. Move a route node
to change a page's layout.

`app.routes.ts` stays **thin**: it maps layouts to lazily-loaded feature route files.

```ts
{ path: 'organization', component: OrganizationLayout, canActivate: [authGuard], children: [
  { path: 'dashboard', loadChildren: () => import('@features/organization/dashboard/dashboard.routes')
      .then(m => m.DASHBOARD_ROUTES) },
]}
```

**Role-based `CanMatch`** (`roleGuard`) is used for the admin/member portals: an unauthorized
role's feature bundle is never even downloaded.

> ⚠️ `/organization` is behind `authGuard`. With no active session it redirects to `/auth/login`.
> To preview the dashboard before login exists, temporarily remove `authGuard` in
> `app.routes.ts`, or set a token via `TokenService`.

---

## 6. Anatomy of a feature (Clean layers)

```
features/organization/projects/          # one bounded context
├── domain/                (1) pure TS — no @angular, no HTTP
│   ├── models/                entities / value objects
│   ├── events/                domain events
│   └── rules/                 pure business logic
├── data/                  (2) infrastructure — the ONLY layer that touches HttpClient
│   ├── project.repository.ts    WRITE side (commands): POST/PUT/DELETE
│   ├── project.query.ts         READ side (queries):   GET → view models
│   └── dto/                     DTOs + mappers (DTO ↔ domain) = anti-corruption
├── application/           (3) orchestration — no UI, no raw HTTP
│   ├── project.store.ts         signals: projects(), loading(), error()   (state)
│   └── project.facade.ts        use-case API the pages call
├── presentation/          (4) entry points
│   ├── pages/                   smart/routed components (thin controllers)
│   └── components/              feature-only dumb components (NO stories)
└── projects.routes.ts
```

Flow, one direction:

```
page → facade → { store (state) + repository/query (data) } → mapper → domain
```

The **auth** feature is the built reference implementation:
`presentation/pages/login-page → application/auth.facade → data/auth.repository (HTTP)`
→ `@core/auth/AuthService` (session) → navigate. The facade owns the `loading` signal; the page
only calls `facade.login(...)`.

### CQRS split

- `*.repository.ts` — writes/commands. Returns command results.
- `*.query.ts` — reads. Returns flat view-models optimized for the screen.
- Both are the only place that touches `@core/api`. They receive/return **domain models**, never
  raw DTOs — a `mapper` in `data/dto/` converts between them, so a backend contract change ripples
  through one file.

---

## 7. State management — signals + facades

No NgRx. Each feature's `application/` holds:

- a **store** (`*.store.ts`) — `signal()` state + `computed()` derived values + dumb setters.
- a **facade** (`*.facade.ts`) — use-cases: calls data layer, updates the store, emits events,
  navigates. **Pages talk to the facade only.**

Global/session state lives in `core/auth` (`AuthStore` + `AuthService`). Genuinely cross-cutting
state belongs in `core`, not a top-level `state/` folder.

---

## 8. Core infrastructure

```
core/
├── api/          ApiService (injects APP_SETTINGS) · api-endpoints · api-params
│                 api-response (ApiResponse<T>, PagedResponse<T>) · api-error-response
├── auth/         AuthService (session facade) · AuthStore (signals) · TokenService · roles.enum
├── guards/       auth.guard (CanActivate) · guest.guard (CanActivate) · role.guard (CanMatch)
├── interceptors/ auth → logging → loading → error
├── events/       AppEventBus (cross-feature RxJS bus)
├── config/       app.settings (reads @env) · app.tokens (APP_SETTINGS)
├── constants/    failure-reasons
├── enums/        general enums
├── models/       global domain types (User, …)
└── services/     dialog · loading · notification
```

### Interceptor pipeline (order matters — like ASP.NET middleware)

1. `authInterceptor` — attaches the JWT.
2. `loggingInterceptor` — logs method/URL/status/duration (silent in production).
3. `loadingInterceptor` — global spinner, **ref-counted** for concurrent requests.
4. `errorInterceptor` — global exception handler; maps `failureReason` → toast.

The API response envelope `ApiResponse<T>` is **unwrapped in repositories** (`.data`), not in an
interceptor — so `success`/`message` stay available for error handling.

### Config & environments

`AppSettings` reads from `@env/environment`. `angular.json` `fileReplacements` swaps
`environment.ts` for `environment.prod.ts` / `environment.staging.ts` per build. `AppSettings` is
provided app-wide via the `APP_SETTINGS` injection token and injected into `ApiService`
(not imported statically).

> The default build configuration is **production**. Use `ng build --configuration development`
> for a fast, unminified build; `ng serve` uses development automatically.

### Auth & token storage

Token persistence is driven by the login form's **rememberMe**:

- `rememberMe = true` → `localStorage` (survives browser restart)
- `rememberMe = false` → `sessionStorage` (cleared when the tab closes)

---

## 9. Path aliases

Defined in `tsconfig.json`. Always prefer these over `../../../` for cross-module imports:

| Alias | Path |
|---|---|
| `@core/*` | `src/app/core/*` |
| `@shared/*` | `src/app/shared/*` |
| `@features/*` | `src/app/features/*` |
| `@layouts/*` | `src/app/layouts/*` |
| `@env/*` | `src/environments/*` |

Intra-feature imports may stay relative.

---

## 10. Where does X go?

| I'm adding… | It goes in… |
|---|---|
| A reusable button/input/badge | `shared/ui/atoms/<name>/` + `.stories.ts` |
| A reusable composite (card, form-field) | `shared/ui/molecules/<name>/` + `.stories.ts` |
| A reusable section (table, chart, sidebar) | `shared/ui/organisms/<name>/` + `.stories.ts` |
| A component used by only one feature | `features/<f>/presentation/components/` (no story) |
| A routed screen | `features/<f>/presentation/pages/<name>/` |
| An HTTP call (write) | `features/<f>/data/<x>.repository.ts` |
| An HTTP call (read/query) | `features/<f>/data/<x>.query.ts` |
| DTO ↔ domain mapping | `features/<f>/data/dto/<x>.mapper.ts` |
| Feature state (signals) | `features/<f>/application/<x>.store.ts` |
| A use-case the page calls | `features/<f>/application/<x>.facade.ts` |
| Entities / pure business rules | `features/<f>/domain/` |
| A new portal/layout | `layouts/<name>-layout/` + route branch + guard |
| A cross-cutting service (dialog, toast) | `core/services/` |
| Global session/auth logic | `core/auth/` |
| A route guard | `core/guards/` |
| An HTTP interceptor | `core/interceptors/` (register in `app.config.ts`) |
| A global domain type | `core/models/` |
| Cross-feature messaging | emit/subscribe via `core/events/AppEventBus` |
| A reusable validator | `shared/validations/` (decorator-based engine) |

**Promote, don't pre-share:** a component starts in a feature's local `components/`. Only when a
*second* feature needs it does it move to `shared/ui`.

---

## 11. Enforced boundaries

`eslint.config.js` uses `eslint-plugin-boundaries`. Each folder is tagged as an element type
(`core`, `shared`, `layouts`, `features`, `app-root`) and the allowed dependency graph is
declared. Illegal imports **fail `ng lint`**:

```
core       → core
shared     → shared, core
layouts    → layouts, shared, core
features   → features, layouts, shared, core
```

`eslint-import-resolver-typescript` lets the plugin resolve the `@`-aliases.

> The rule currently uses the `boundaries/element-types` name + string selectors (works, emits a
> v6 deprecation notice). Migrating to the v6 `boundaries/dependencies` object schema is a future
> cleanup. Cross-feature imports are allowed for now; tighten to same-feature-only with a capture
> group when needed.

Run it:

```bash
npx ng lint
```

---

## 12. Decisions log

| Decision | Choice | Why |
|---|---|---|
| pages vs features | Everything under `features/` | Single source of truth; scales as vertical slices |
| Login types | 4+ portals, role-driven `CanMatch` | Bundles gated by role; never downloaded if unauthorized |
| State management | Signals + facades (no NgRx) | Native to Angular 20; no boilerplate; CQRS via command/query services |
| Boundary enforcement | `eslint-plugin-boundaries` | Compile-time-ish fitness function without an Nx migration |
| Config source | `environments/*` + inject `APP_SETTINGS` | Per-env builds + testable/mockable DI |
| Token storage | `rememberMe` → local vs session storage | Matches the existing UI control |
| Validation | `shared/validations/` decorator engine | Kept the FluentValidation-style engine already scaffolded |
| Compodoc | Disabled | Depends on `wmic`, removed on Windows 11 |

---

## 13. Commands

```bash
npm start                 # ng serve            → http://localhost:4200
npm run build             # ng build (production, default config)
npm test                  # ng test (Karma)
npm run storybook         # Storybook dev       → http://localhost:6006
npm run build-storybook   # static Storybook    → storybook-static/
npx ng lint               # ESLint + boundary + a11y checks
```

---

## 14. Adding a new feature (checklist)

1. `features/<name>/` with `domain/ data/ application/ presentation/{pages,components}`.
2. Define `domain/models` (+ `rules`, `events` if needed) — pure TS.
3. `data/<name>.repository.ts` (writes) and/or `data/<name>.query.ts` (reads); `data/dto/` + mapper.
4. `application/<name>.store.ts` (signals) + `application/<name>.facade.ts` (use-cases).
5. `presentation/pages/<page>/` — inject the **facade only**.
6. `<name>.routes.ts` exporting lazy routes.
7. Wire it into `app.routes.ts` under the right layout branch (+ guards).
8. `npx ng lint` to confirm no boundary violations.
