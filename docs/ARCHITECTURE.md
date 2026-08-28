# TaskFlow UI — Frontend Architecture

> Angular 20 (standalone) · Component-Driven Design + Storybook · flat vertical slices ·
> signals + facades · role-based multi-portal routing · ESLint-enforced boundaries.
>
> _Last updated: 2026-07-24. Supersedes the 2026-07-05 draft that described per-feature Clean
> layer folders (`domain/data/application/presentation/`) — that structure was abandoned; features
> are now **flat** (see §6)._

This is the living reference for how the frontend is organized and **why**. If you are about to
add a file and aren't sure where it goes, jump to [Where does X go?](#10-where-does-x-go).

---

## 1. Philosophy

The app applies backend discipline (Clean Architecture, DDD, CQRS-style read/write split) to an
Angular frontend, chosen to feel familiar coming from ASP.NET Core:

| ASP.NET Core | Angular here |
|---|---|
| Middleware | HTTP Interceptors |
| Authorization Policy | Route Guards |
| Services / DI | Services + `inject()` |
| DTOs + Mappers | Feature `*.models.ts` |
| Repository | Feature `*.repository.ts` |
| Application service | Feature `*.facade.ts` |
| appsettings.json | `environments/*` + `AppSettings` |

Concepts are borrowed where they map cleanly and dropped where they don't (no MediatR, no
one-file-per-handler ceremony). On top of that, all reusable UI follows **Component-Driven Design**
(atoms → molecules → organisms) and is viewable in isolation via **Storybook**.

Layering is kept by **file role**, not by folders (this is the key change from the old draft):
inside a feature, pages talk only to the facade; the facade uses the repository + `@core`. No
`domain/data/application/presentation` folders.

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
src/styles/        Global SCSS design system (abstracts/base/components/themes)
.storybook/        Storybook config (scoped to shared/ui)
eslint.config.js   Flat ESLint config incl. boundary rules
```

---

## 3. The dependency rule (the fitness function)

Dependencies point **inward**, enforced by `eslint-plugin-boundaries` (see [§11](#11-enforced-boundaries)).

```
features/ ─▶ layouts/ ─▶ shared/ ─▶ core/ ─▶ (nothing)
```

Hard rules:
- `core` imports **nothing** from `shared` / `layouts` / `features`.
- `shared` may import `core` (types) — **never** a feature.
- `layouts` may import `shared`, `core`.
- `features` may import `layouts`, `shared`, `core`.
- **Features must not import each other.** Cross-feature communication goes through the
  `core/events/` RxJS bus (`AppEventBus`).
- Inside a feature: **pages import the facade only** (never a repository directly). Models/mappers
  stay pure (no `@angular`/`HttpClient` beyond types).

---

## 4. Component-Driven Design (`shared/ui`) + Storybook

All reusable, presentational components live under `shared/ui`, split by composition level:

| Level | Definition | Examples in repo |
|---|---|---|
| **atom** | No dependency on another app component. Only primitive `input()`s. Zero business/HTTP knowledge. | `atoms/buttons/button`, `atoms/inputs/text-input`, `atoms/inputs/email-input` |
| **molecule** | Composes atoms. Still dumb; still only inputs/outputs. | `molecules/pricing-card`, `molecules/review-card`, `molecules/feature-card`, `molecules/donut-chart-molecule` |
| **organism** | Composes molecules/atoms into a meaningful section. Presentational — no service injection. | `organisms/productivity-chart`, `organisms/project-health-chart` |

Atoms are grouped in **plural category folders** (`buttons/`, `inputs/`, `icons/`, `badges/`,
`avatars/`, `spinners/`). See [ATOMIC-DESIGN-GUIDE.md](ATOMIC-DESIGN-GUIDE.md) for the atom/molecule/
organism decision test and the variants-vs-new-component rules.

**The rule that makes them Storybook-able:** components in `shared/ui` are **dumb** — data in via
`input()`, events out via `output()`. No `HttpClient`, no feature services, no `Router`, no
hardcoded data.

Each component ships **5 files** (`.ts/.html/.scss/.spec.ts/.stories.ts`) — see [CONVENTIONS.md](CONVENTIONS.md)
and the scaffolding rule in `CLAUDE.md`. Stories exist **only** under `shared/ui/{atoms,molecules,
organisms}` — never in `features`, `layouts`.

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

| Layout (`layouts/`) | Portal | URL | Guard | Who lands here |
|---|---|---|---|---|
| `public-layout` | Marketing site (header + navbar + footer) | `/` | — | anyone |
| `auth-layout` | Login screens (full-bleed) | `/auth/*` | `guestGuard` | signed-out visitors |
| `member-layout` | Individual/solo user portal | `/member` | `authGuard` + `portalGuard('member')` | `AccountType.Individual` |
| `organization-layout` | Organization portal (sidebar + topbar) | `/organization` | `authGuard` + `portalGuard('organization')` | `AccountType.Organization` |
| `admin-layout` | Platform admin portal | `/admin` | `authGuard` + `roleGuard('Admin')` | users with the `Admin` system role |

### Page → layout matrix
Which pages live under which portal (✅ built · 🟡 placeholder · ⬜ planned):

| Portal (layout) | Route file | Pages |
|---|---|---|
| public | `public.routes.ts` (`PUBLIC_ROUTES`) | landing ✅ |
| auth | `auth.routes.ts` (`AUTH_ROUTES`) | login-solo ✅ · login-organization ✅ · login-admin ✅ (one `LoginPage`, 3 variants via route `data`) · register ⬜ · forgot-password ⬜ |
| member | `member.routes.ts` (`MEMBER_ROUTES`) | dashboard 🟡 · my-tasks ⬜ · calendar ⬜ · reports ⬜ · settings ⬜ |
| organization | `organization.routes.ts` (`ORGANIZATION_ROUTES`) | dashboard ✅(static) · projects ⬜ · tasks ⬜ · teams ⬜ · members+invites ⬜ · roles+permissions ⬜ · reports ⬜ · settings ⬜ |
| admin | `admin.routes.ts` (`ADMIN_ROUTES`) | dashboard 🟡 · users ⬜ · organizations ⬜ · settings ⬜ |

`layouts/partials/` holds shared shell pieces (`public-header`, `public-navbar`, `public-footer`).

**A layout is a route parent with a `<router-outlet/>`; pages are its children.** `app.routes.ts`
stays **thin** — it maps each layout to a lazily-loaded portal `*.routes.ts`:

```ts
{ path: 'organization', component: OrganizationLayout, canActivate: [authGuard],
  loadChildren: () => import('@features/organization/organization.routes')
    .then(m => m.ORGANIZATION_ROUTES) }
```

Each portal's `*.routes.ts` lazy-loads its pages via `loadComponent`. **Role-based `CanMatch`**
(`roleGuard`) gates the admin/member portals so an unauthorized role's bundle is never downloaded
(wire this when those portals get real pages).

> ⚠️ Current routes wire `''` (PublicLayout → landing), a top-level `login` branch, `auth`
> (guestGuard → login), and `organization` (authGuard → dashboard). There are **two** login pages
> today — `features/auth/login-page/` and `features/public/login-page/` — reconcile which is
> canonical.
>
> ⚠️ `/organization` is behind `authGuard`; with no session it redirects to `/auth/login`. To
> preview the dashboard before a real login exists, set a token via `TokenService` or temporarily
> drop the guard.

---

## 6. Anatomy of a feature (flat, current structure)

Features are organized **by layout/portal, then by page** — flat, no layer folders:

```
features/
  <layout-name>/              # public, auth, organization, member, admin
    <page-name>/              # one folder per routed page, named *-page
      <page-name>.ts          # class <PageName> (e.g. LandingPage, DashboardPage)
      <page-name>.html
      <page-name>.scss
      <page-name>.spec.ts
      <page-name>.model.ts    # (optional) page-local helper models
    <layout-name>.routes.ts   # lazy routes for this layout (e.g. ORGANIZATION_ROUTES)
    <feature>.facade.ts       # (optional) feature state/orchestration (signals)
    <feature>.repository.ts   # (optional) HTTP access via @core/api
    <feature>.models.ts       # (optional) feature DTOs + mappers merged into one file
```

The **auth** feature is the built reference implementation:

```
LoginPage (reactive form)
  → AuthFacade   (auth.facade.ts — orchestrates login; owns `loading` signal)
    → AuthRepository (auth.repository.ts — HTTP to /auth/*)         ── write side
    → @core/auth/AuthService (session state)
  → Router.navigate(['/organization'])
```

`auth.models.ts` holds the `LoginRequest`/`LoginResponse` DTOs **and** the `toUser()` mapper
(anti-corruption: API DTO → session `User`) in one file. The page calls only `facade.login(...)`.

### CQRS split (by file role)
- `*.repository.ts` — the only place a feature touches `@core/api`; write/read HTTP calls.
- `*.models.ts` — DTOs + mappers (DTO ↔ domain), so a backend contract change ripples through one file.
- `*.facade.ts` — use-cases + signal state the pages consume.

For **read-heavy** features you may split reads into a dedicated query method/file, but keep it flat
(no `data/` folder).

---

## 7. State management — signals + facades

No NgRx.
- **Session/global state** → `core/auth/AuthStore` (signal store: `signal<User|null>`, `computed`
  `isAuthenticated`/`roles`), fronted by `AuthService`.
- **Per-feature state** → the feature's `*.facade.ts` owns `signal`s and exposes them read-only
  (`asReadonly()`), e.g. `AuthFacade.loading`.
- **Pages talk to the facade only.** Presentational `shared/ui` components stay dumb (`input()`/`output()`).

---

## 8. Core infrastructure

```
core/
├── api/          ApiService (injects APP_SETTINGS) · api-endpoints (API map) · api-params
│                 api-response (ApiResponse<T>) · api-error-response (ApiErrorResponse)
├── auth/         AuthService (session facade) · AuthStore (signals) · TokenService · roles.enum
├── guards/       auth.guard (CanActivate) · guest.guard (CanActivate) · role.guard (CanMatch factory)
├── interceptors/ auth → logging → loading → error
├── events/       AppEventBus (cross-feature RxJS bus)
├── config/       app.settings (reads @env) · app.tokens (APP_SETTINGS)
├── constants/    failure-reasons (mirror API FailureReason codes)
├── enums/        general enums
├── models/       global domain types (User, …)
└── services/     dialog (SweetAlert2) · loading · notification (ngx-toastr)
```

### Interceptor pipeline (order matters — like ASP.NET middleware)
Registered in `app.config.ts` in this order:
1. `authInterceptor` — attaches `Authorization: Bearer <token>` when a token exists.
2. `loggingInterceptor` — logs the request/response.
3. `loadingInterceptor` — global spinner.
4. `errorInterceptor` — global exception handler; status `0` → "Unable to connect"; otherwise maps
   `ApiErrorResponse.failureReason` → a `NotificationService` toast per `FailureReason`.

The API success envelope `ApiResponse<T>` `{ success, message, data, timestamp }` is **unwrapped in
repositories** (`.data`), not in an interceptor — so `success`/`message` stay available.

### Config & environments
`AppSettings` reads `@env/environment` (`{ production, name, api: { baseUrl } }`). `angular.json`
`fileReplacements` swaps `environment.ts` for `environment.prod.ts` / `environment.staging.ts` per
build. `AppSettings` is provided app-wide via the `APP_SETTINGS` token and injected into
`ApiService` (never imported statically). Dev `baseUrl` = `https://localhost:7086/api`; keep the
dev server on **port 4200** (the API's CORS allows `http://localhost:4200`).

### Auth: the API login contract (what the frontend wires to)
`POST /api/auth/login` → `ApiResponse<T>` where `T` (`LoginUserResponseDto`) is:

| Field | Type | Notes |
|---|---|---|
| `userId` | int | |
| `fullName` | string | |
| `email` | string | |
| `token` | string | JWT access token (carries role claims) |
| `refreshToken` | string | random string, DB-backed, rotated on refresh |
| `refreshTokenExpiresAt` | datetime | |
| `roles` | string[] | **system roles**: `"Admin"` / `"Manager"` / `"User"` |

The login response carries **system roles but not account type**. `AccountType` (Individual=1 /
Organization=2) comes from `GET /api/user/me` (`UserDetailDto`, which also has `status`,
`isEmailVerified`, etc.). So the session principal is assembled from **two** calls: login (roles +
tokens) then `/user/me` (account type).

Related endpoints: `POST /auth/register` (takes `accountType`, default Individual), `POST /auth/refresh`
(same response shape), `POST /auth/logout`.

### Role-based redirect (which portal a user lands in)
Encoded in `core/auth/roles.enum.ts`:

```
SystemRole = 'Admin' | 'Manager' | 'User'          // exact API strings
AccountType = 'Individual' | 'Organization'         // mapped from int 1/2
Portal = 'admin' | 'organization' | 'member'
PORTAL_HOME = { admin: '/admin', organization: '/organization', member: '/member' }

resolvePortal(roles, accountType):
  Admin ∈ roles            → 'admin'          // admin role wins
  accountType = Organization → 'organization'
  else                      → 'member'         // Individual / solo user
```

The three login screens (solo / organization / admin) are one `LoginPage` with a `variant` from route
`data` — they change branding/copy only. **The redirect target is always authoritative from the API
response** (`resolvePortal`), never from which page was used — so an Individual who uses the "Organization"
entry still lands in the member portal.

### Session flow
```
LoginPage(variant) → AuthFacade.login(request, remember)
  → AuthRepository.login()  ── POST /auth/login → { token, refreshToken, roles }
  → TokenService.setTokens(token, refreshToken, remember)   // so the next call is authenticated
  → AuthRepository.me()     ── GET /user/me → { accountType, … }
  → AuthService.setUser(User{ roles, accountType })  → AuthStore signal
  → Router.navigateByUrl(AuthService.homeRoute())    // = PORTAL_HOME[resolvePortal(...)]
```

### Token storage
Driven by the login form's **rememberMe** control: `true` → `localStorage` (survives restart), `false`
→ `sessionStorage` (cleared on tab close). Keys: `access_token`, `refresh_token`. `TokenService`
reads/writes whichever storage holds them; `authInterceptor` attaches the access token as a Bearer.

### Guards
- `authGuard` (CanActivate) — must be logged in, else → `/auth/login?returnUrl=`.
- `guestGuard` (CanActivate) — already-logged-in users are bounced to `AuthService.homeRoute()`.
- `roleGuard(role)` (CanMatch factory) — system-role gate; used for `/admin` (`roleGuard('Admin')`).
- `portalGuard(portal)` (CanActivate factory) — account-type/portal gate; used for `/member` and
  `/organization`; sends a mismatched user to their own `homeRoute()`.

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
| A reusable button/input/badge/avatar/spinner | `shared/ui/atoms/<category>/<name>/` + 5 files |
| A reusable composite (card, form-field, search-bar) | `shared/ui/molecules/<name>/` + 5 files |
| A reusable section (table, chart, sidebar) | `shared/ui/organisms/<name>/` + 5 files |
| A routed screen | `features/<layout>/<page-name>/` (`*-page`, class `<Name>Page`) |
| An HTTP call for a feature | `features/<layout>/<feature>.repository.ts` (via `@core/api`) |
| DTO ↔ domain mapping | `features/<layout>/<feature>.models.ts` |
| Feature state / use-cases (signals) | `features/<layout>/<feature>.facade.ts` |
| A new portal/layout | `layouts/<name>-layout/` + route branch + guard |
| A cross-cutting service (dialog, toast) | `core/services/` |
| Global session/auth logic | `core/auth/` |
| A route guard | `core/guards/` |
| An HTTP interceptor | `core/interceptors/` (register in `app.config.ts`) |
| A global domain type | `core/models/` |
| A new API endpoint constant | `core/api/api-endpoints.ts` (the `API` map) |
| Cross-feature messaging | emit/subscribe via `core/events/AppEventBus` |
| A reusable validator | `shared/validations/` (planned decorator engine — currently empty) |

**Promote, don't pre-share:** a component starts inside a feature. Only when a *second* feature
needs it does it move to `shared/ui`.

---

## 11. Enforced boundaries

`eslint.config.js` uses `eslint-plugin-boundaries`. Each folder is tagged as an element type
(`core`, `shared`, `layouts`, `feature-api`, `features`, `app-root`) and the allowed dependency graph
is declared; illegal imports **fail `ng lint`**:

```
core         → core
shared       → shared, core
layouts      → layouts, shared, core, feature-api
feature-api  → features, feature-api, layouts, shared, core
features     → features, feature-api, layouts, shared, core
```

**`feature-api` is a feature's public surface**: `features/*/*.{facade,models,form-models}.ts`. It is
declared *before* `features` in `boundaries/elements` so it wins the first-match. That is what lets a
portal shell render feature state — the org switcher, the pending-invitation badge, sign-out — by
injecting a facade, while still being unable to import a page, a route file or a repository. Widening
`layouts → features` instead would have deleted the check entirely.

`eslint-import-resolver-typescript` lets the plugin resolve the `@`-aliases.

> The rule uses the `boundaries/element-types` name + string selectors — it works and lint is clean,
> but it emits a v6 deprecation notice. Migrating to the v6 `boundaries/dependencies` object schema is
> a future cleanup (logged in [V1-GAPS.md](V1-GAPS.md) §3).

---

## 12. Decisions log

| Decision | Choice | Why |
|---|---|---|
| pages vs features | Everything under `features/` | Single source of truth; scales as vertical slices |
| Feature internals | **Flat** (page folders + `*.facade/repository/models.ts`) | Per-feature Clean layers (2026-07-05 draft) were too messy; layering kept by file role |
| Login types | 4+ portals, role-driven `CanMatch` | Bundles gated by role; never downloaded if unauthorized |
| State management | Signals + facades (no NgRx) | Native to Angular 20; no boilerplate |
| Boundary enforcement | `eslint-plugin-boundaries` | Fitness function without an Nx migration |
| Config source | `environments/*` + inject `APP_SETTINGS` | Per-env builds + testable/mockable DI |
| Token storage | `rememberMe` → local vs session storage | Matches the existing UI control |
| Response envelope | Unwrap `ApiResponse<T>` in repositories | Keeps `success`/`message` for error handling |
| Validation | `shared/validations/` decorator engine | Kept the FluentValidation-style engine (not built yet) |
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

### Planner template boundary

Phase 20 shares template DTOs through `core/models/planner-template.model.ts` because both the Admin
and Member feature slices consume them without importing each other. Admin pages mutate templates only
through `AdminFacade`; Planner reads published templates through `PlannerFacade`. Excalidraw elements
cache only the node id: the workspace DTO supplies the immutable template-version snapshot used for
card dimensions and colors, so archived or superseded definitions never restyle an existing plan.

### Planner resource boundary

Phase 21 keeps resource orchestration in `PlannerFacade` and HTTP/FormData details in
`PlannerRepository`. The workspace DTO hydrates Note/Document cards from canonical resource metadata;
the separate resource list retains unlinked items for later relinking. Files are retrieved as authorized
Blobs only for a user action, preview object URLs are revoked, and no Blob/base64 data enters Excalidraw
serialization or Angular state. Direct Excalidraw image embedding stays blocked and points users to
Add resource instead.

### Planner requirement-history boundary

Phase 22 keeps baseline/history HTTP details in `PlannerRepository` and all async state in
`PlannerFacade`. The page only opens finalization and comparison workflows through that facade.
Angular never infers New/Changed/Removed from canvas or workspace DTOs: the API owns immutable
snapshots, actor/time/reason audit history, effective change state, and field differences. The facade
refreshes comparison after canonical node mutations, while status/completion changes remain ordinary
workspace progress and do not appear as requirement changes.

### Planner rollout and recovery boundary (Phase 23)

The Planner build flag controls route matching and both member/admin navigation surfaces; the server has
an independent runtime flag so rollback does not require deleting data. Canvas changes update immediate
selection state but coalesce JSON serialization, and the newest snapshot is flushed before context
switches. The shared 5,000-element ceiling is surfaced through the Planner facade.

Legacy `taskflow-planner:{user}` scenes are never silently promoted to cloud authority. The UI offers an
explicit import into the selected project, sanitizes embedded image/file payloads, saves the server scene,
and only then records migration metadata. The original browser value remains intact for rollback.

## 14. Adding a new feature (checklist)

1. Create `features/<layout>/<page-name>/` with the 4 page files (`.ts/.html/.scss/.spec.ts`).
2. Add optional `<feature>.repository.ts` (HTTP via `@core/api`), `<feature>.models.ts` (DTOs +
   mappers), `<feature>.facade.ts` (signals + use-cases).
3. Register the page in the layout's `*.routes.ts` via `loadComponent`.
4. If it's a new portal, add the layout branch (+ guards) in `app.routes.ts`.
5. Page injects the **facade only**; keep any reusable UI dumb and promote to `shared/ui` if reused.
6. `npx ng lint` to confirm no boundary violations.
