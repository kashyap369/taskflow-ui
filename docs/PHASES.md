# TaskFlow UI — Phases & Status

> Keep the Current Status section up to date at the end of every session.
> The backend (`D:\Projects\TMS\TaskFlow`) is fully implemented across its 8 phases; the frontend
> consumes it and is at the start of feature build-out. Phase order roughly follows the backend so
> each frontend phase has a working API behind it.

## Current Status (2026-07-24, role-based login + admin/member portals)
- ✅ **Real login wired with role-based redirect.** The login form now calls the API, stores the
  session (access + refresh token), fetches `/user/me` for account type, and routes the user to their
  portal. Redirect rule (`core/auth/roles.enum.ts` → `resolvePortal`): **Admin system role → `/admin`;
  else Organization account → `/organization`; else (Individual) → `/member`**. This fixes the
  "login doesn't redirect" issue — the form was previously presentational with no submit.
- ✅ **Auth core reworked to the real API contract.** `SystemRole` (`'Admin'|'Manager'|'User'`, exact
  API strings) + `AccountType` (`'Individual'|'Organization'`, mapped from int 1/2) + `Portal` type.
  `User` model, `AuthStore` (adds `accountType` + computed `portal`), `AuthService` (`homeRoute()`,
  `canAccessPortal()`), `TokenService` (now stores the refresh token too), and guards
  (`authGuard`/`guestGuard`/`roleGuard(SystemRole)`/new `portalGuard(Portal)`) all updated.
  `auth.models.ts` now matches `LoginUserResponseDto` + `UserDetailDto`; `auth.repository` has
  `login()` + `me()`; `auth.facade` orchestrates login → session → profile → redirect and logout.
- ✅ **Three login entry screens** (solo / organization / admin) = one `LoginPage` with a `variant`
  from route `data` (branding/copy differ; redirect is always authoritative from the API). Routes:
  `/auth/login`, `/auth/organization`, `/auth/admin`. The old duplicate `features/public/login-page`
  was removed; `/login` now redirects to `/auth/login`. `AuthLayout` is full-bleed so the split-screen
  design fills it.
- ✅ **Member + Admin portals** now exist as themed layout shells with placeholder dashboards, guarded
  (`/member` via `portalGuard('member')`, `/admin` via `roleGuard('Admin')`), so redirects land
  somewhere real. Organization portal unchanged.
- ✅ **Session rehydration on refresh** implemented: the `User` principal is persisted next to the
  tokens (`TokenService.setUser`/`getUser`) and restored in the `AuthService` constructor, so a hard
  refresh keeps the session (roles come from login, not `/me`, so we can't rebuild from `/me` alone —
  persisting the whole principal sidesteps that).
- ✅ **Guard flows verified in-browser** (seeding a fake session, no API needed): signed-out → `/member`
  redirects to `/auth/login`; an Individual can enter `/member` but is bounced from `/organization` and
  `/admin` back to `/member`; a logged-in user is kept out of `/auth/login`. All three login variants
  render with distinct copy, theme-aware.
- ⚠️ **The live `/auth/login` call was NOT exercised** (no API running). When testing end-to-end, run
  the API (`https://localhost:7086/api`) and the dev server on **port 4200** (CORS). If the browser
  blocks the API's self-signed cert, open `https://localhost:7086` once and accept it.
- ⏭️ **Next session pickup — see "Phase 2" below.** Top items: register (with account-type choice),
  refresh-token rotation on 401, real logout wiring in the portal top bars, and building out the
  organization portal pages against the API.

## Current Status (2026-07-24, documentation set up)
- ✅ **Frontend docs created** (this set): `docs/OVERVIEW.md`, `ARCHITECTURE.md`, `CONVENTIONS.md`,
  `PHASES.md`, `SESSIONS.md` — mirroring the backend's docs so a new session has full context. The
  pre-existing `ARCHITECTURE.md` (2026-07-05) described the abandoned per-feature Clean-layer folder
  structure; rewritten to the current **flat** feature layout (confirmed by the git restructure and
  `CLAUDE.md`). `ATOMIC-DESIGN-GUIDE.md` retained.
- **Where the code actually stands** (see per-phase detail below):
  - ✅ Architecture, tooling, core infra, guards, interceptors, SCSS design system, environments — done.
  - ✅ Public landing page renders through the public layout.
  - 🟡 Component library — a dozen+ atoms/molecules/organisms with stories; several categories still empty.
  - 🟡 Auth — **login** wired end-to-end (page → facade → repository → API → session). No register /
    refresh / real logout / account-type / forgot-password.
  - 🟡 Organization dashboard — renders with charts on **hardcoded** data; no API wiring.
  - ⬜ Member portal, admin portal, projects/tasks/teams/members/roles/invitations/work-logs/reports.
  - ⬜ Custom validations engine (folders empty), real tests.
- ⚠️ **Uncommitted restructure.** The whole "restructure level 1" (flat features, atom category
  folders, new molecules) is currently **unstaged/untracked** in git — commit it so the flat layout
  is the recorded baseline before building on top.
- ⏭️ **Do next:** commit the restructure; reconcile the two login pages (`features/auth/login-page`
  vs `features/public/login-page`); wire the organization dashboard to a real facade/repository
  against the API's dashboard summary endpoint.

---

## Phase 0 — Project Foundation & Architecture ✅
- ✅ Angular 20 standalone app; four buckets (`core`/`shared`/`layouts`/`features`); path aliases
  (`@core`/`@shared`/`@features`/`@layouts`/`@env`).
- ✅ ESLint flat config + `eslint-plugin-boundaries` (inward-only dependency graph).
- ✅ Storybook 10 (`@storybook/angular`) scoped to `shared/ui` (Compodoc disabled — `wmic` gone on Win11).
- ✅ SCSS design system under `src/styles/` (abstracts / base / components / themes tokens).
- ✅ Environments (dev/staging/prod) + `angular.json` fileReplacements; `AppSettings` via `APP_SETTINGS` token.
- ✅ HTTP interceptor pipeline (auth → logging → loading → error); `ApiService`; `ApiResponse`/`ApiErrorResponse`.
- ✅ Guards (`authGuard`, `guestGuard`, `roleGuard`); signal-based `AuthStore`/`AuthService`/`TokenService`.
- ✅ Feature structure **revised to flat** (page folders + `*.facade/repository/models.ts`); documented in `CLAUDE.md`.
- ⏭️ Leftover: commit the restructure; update `eslint-plugin-boundaries` element patterns if they still
  reference the old `presentation/application/data/domain` paths.

## Current Status (2026-07-24, design language + landing redesign)
- ✅ **`docs/DESIGN.md` created** — the design language (fonts, color tokens, typography, motion) with a
  light/dark strategy. Implemented the foundation to match: **real fonts now load** (Plus Jakarta Sans
  display + Inter body — Inter was previously named but never imported, the #1 reason it felt generic);
  full **semantic CSS-variable token system** in `themes/_light.scss` (`:root`) + `themes/_dark.scss`
  (`[data-theme]`); `abstracts/_motion.scss` (duration/easing tokens + keyframes + scroll-reveal utility).
- ✅ **Theme toggle** — `core/services/theme.service.ts` (signal, persists to `localStorage`, no-FOUC
  inline script in `index.html`); toggle button added to the public header (now glassy + lucide icons,
  replacing the broken `bi-*` classes since Bootstrap Icons isn't installed).
- ✅ **Scroll-reveal** — `shared/directives/reveal.directive.ts` (IntersectionObserver + stagger), our
  Angular stand-in for Framer Motion; used across the landing page.
- ✅ **Landing page redesigned** — hero with animated mesh glow + gradient CTA, a floating product
  **board mock** resembling the reference (status columns, priority chips, colored progress, avatar
  stacks), marquee logo strip, staggered feature grid, workflow card with progress bars that grow on
  reveal, pricing/reviews, animated-gradient CTA band. Fully light/dark. The 3 landing molecule cards +
  footer + public layout were converted to tokens. Verified live in the browser in both themes; `ng
  build` passes (raised the per-component style budget to 12/24 kB).
- ✅ **Login page (`/login`, public) redesigned** — theme-aware form (custom gradient checkbox, icon
  focus states, staggered reveal) + an animated showcase panel (aurora bg, self-completing checklist,
  drawing productivity ring, looping toast, floating cards, pointer parallax via signals→CSS vars). All
  CSS/SVG (no Lottie/GSAP — see SESSIONS for rationale). Both themes verified.
- ⏭️ Next: reconcile the two login pages (public `/login` vs `auth/login` under AuthLayout's 420px card);
  extend tokens to the organization pages/components; make the dashboard charts theme-aware; add a theme
  toggle to the portal top bars.

## Phase 1 — Design System / Component Library 🟡 (in progress)
- ✅ Atoms: `buttons/` (`button`, `sign-in-button`, `sign-up-button`), `inputs/` (`text-input`,
  `email-input`, `text-area-input`) — full 5 files each.
- ✅ Molecules (5 files each): `pricing-card`, `review-card`, `feature-card`, `landing-feature-card`,
  `master-card`, `deadline-molecule`, `recent-activity-molecule`, `project-overview-molecule`,
  `notification-pop-up-molecule`, `bar-chart-molecule`, `donut-chart-molecule`,
  `create-project-modal-molecule`, `view-project-modal-molecule`, `task-detail-modal-molecule`.
- ✅ Organisms: `productivity-chart`, `project-health-chart`.
- 🟡 Placeholder-only (`.gitkeep`): atoms `avatars`/`badges`/`icons`/`spinners`; molecules
  `form-field`, `search-bar` (folders exist, 5 files not filled); organisms `data-table`/`navbar`/`sidebar`.
- ⏭️ Next: fill the form atoms/molecules needed by real feature forms (form-field, password-field,
  select, search-bar); build the `sidebar`/`navbar`/`data-table` organisms the portals need; make chart
  components `input()`-driven (currently hardcoded).

## Phase 2 — Auth, Session & Role-Based Portals 🟡 (in progress)

> The multi-portal login is the current focus. Detailed so the next session can pick up precisely.

### 2a — Role-based login & redirect ✅ (done this session)
- ✅ Auth types (`SystemRole`/`AccountType`/`Portal`/`resolvePortal`/`PORTAL_HOME`), `User` model with
  `accountType`, `AuthStore` (+`portal` computed), `AuthService` (`homeRoute`/`canAccessPortal`),
  `TokenService` (access + refresh).
- ✅ `auth.models.ts` matches `LoginUserResponseDto` (+ `UserDetailDto` for account type); mappers
  `mapSystemRoles`/`mapAccountType`/`toUser`. `auth.repository` = `login()` + `me()`. `auth.facade`
  orchestrates login → store tokens → `/user/me` → set user → `router.navigateByUrl(homeRoute())`;
  exposes `loading` + `error` signals.
- ✅ Guards: `authGuard`, `guestGuard` (→ homeRoute), `roleGuard('Admin')`, `portalGuard(portal)`.
- ✅ One `LoginPage`, three route variants (`/auth/login` solo, `/auth/organization`, `/auth/admin`);
  full-bleed `AuthLayout`; old public login removed; `/login` → `/auth/login`.

### 2b — Portal shells as redirect targets ✅ (basic)
- ✅ `member-layout` + `admin-layout` themed shells + placeholder dashboards; `MEMBER_ROUTES` /
  `ADMIN_ROUTES`; guarded branches in `app.routes.ts`.

### 2c — Remaining auth work ⬜ (next)
- ⬜ **Register** page(s) with **account-type choice** (Individual vs Organization → API `accountType`);
  org register may also capture the organization name (check the register command's org flow).
- ⬜ **Logout** wired from the portal top bars → `AuthFacade.logout()` → `POST /auth/logout` (send the
  refresh token) → `endSession()` → `/auth/login`.
- ⬜ **Refresh-token rotation**: on a 401, call `POST /auth/refresh` with the stored refresh token,
  swap tokens, retry once; on reuse/failure → force logout. Add to `error.interceptor` (or a dedicated
  refresh interceptor) with a single-flight lock.
- ⬜ **Forgot-password / email-verification** screens (API email-verification endpoint is itself a
  backend leftover — coordinate).
- ⬜ **Manager** system role: decide its portal (currently only Admin is special; Manager falls through
  to account-type routing). Confirm with the product intent.
- ✅ **Session bootstrap on refresh** — DONE via storage persistence of the `User` principal
  (`TokenService` + `AuthService` constructor). (A future hardening: also validate the token against
  `/user/me` on load to catch server-side expiry/revocation.)
- ⬜ Handle login errors in the UI (the `error` signal is set; surface it on the form, not just a toast).

## Phase 3 — Public Marketing Site ✅ (mostly)
- ✅ `PublicLayout` (header/navbar/footer partials) + landing page (~400 lines) with pricing/review/feature cards.
- ⏭️ Possible: pricing page, about/contact, wire "Sign up"/"Log in" CTAs to auth routes.

## Phase 4 — Organization Portal ⬜ (dashboard shell only)
- 🟡 `OrganizationLayout` + `DashboardPage` render with `ProductivityChart` + `ProjectHealthChart` —
  but on **hardcoded** data, no facade/repository.
- ⬜ Wire dashboard to the API dashboard summary (Dapper read side) via an `organization.facade` +
  `organization.repository`; feed charts through `input()`.
- ⬜ Pages: projects (list/create/detail), tasks (list/assign/lifecycle), teams, members + invitations,
  roles + permissions, reports. Register each in `ORGANIZATION_ROUTES`.
- ⬜ Sidebar navigation organism for the portal.

## Phase 5 — Member (Individual) Portal ⬜
- ✅ `MemberLayout` shell + placeholder dashboard; `/member` branch guarded with `portalGuard('member')`.
- ⬜ Personal task pages (create/subtasks/lifecycle), personal tracking/reports (weekly/monthly/yearly)
  against the API's personal-task + report endpoints.

## Phase 6 — Admin Portal ⬜
- ✅ `AdminLayout` shell + placeholder dashboard; `/admin` branch guarded with `roleGuard('Admin')`.
- ⬜ Platform admin pages: user list (`GET /user`, AdminOnly), organizations overview, platform settings.

## Phase 7 — Reporting & Dashboard (headline feature) ⬜
- ⬜ Rich charts/reports consuming the API's report endpoints (dashboard summary, member task report,
  team performance, project report) via echarts organisms fed by facades.
- ⬜ Date-window (From/To) controls for weekly/monthly/yearly cuts; work-log durations.

## Phase 8 — Polish & Hardening ⬜
- ⬜ Custom `shared/validations/` decorator engine (FluentValidation-style) — folders exist, empty.
- ⬜ Loading skeletons (`ngx-skeleton-loader`), empty states, dialog confirmations (`sweetalert2`).
- ⬜ Real unit/component tests beyond "should create"; a11y pass (Storybook a11y addon is installed).
- ⬜ Pagination/filtering for list views (mirrors the API's pending pagination work).
- ⬜ `PagedResponse<T>` envelope support in `core/api` when the API adds pagination.

## Backlog (unscheduled)
- Dark/light theme toggle (theme SCSS exists), i18n, PWA/offline.
- Real-time updates (notifications/activity feed) when the API adds them.
- Report export (CSV/PDF) UI, kanban board view, tags/labels/search UI.
- Lottie onboarding animations (`ngx-lottie` installed), Storybook visual regression, CI/CD.

<!-- Phase ordering rationale: foundation → component library → auth (gate to portals) → public site
     (no auth needed) → organization portal (richest, drives most components) → member/admin portals →
     reporting → polish. Mirrors the backend phases so each frontend phase has a live API behind it. -->
