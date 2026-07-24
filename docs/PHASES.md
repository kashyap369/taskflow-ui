# TaskFlow UI — Phases & Status

> Keep the Current Status section up to date at the end of every session.
> The backend (`D:\Projects\TMS\TaskFlow`) is fully implemented across its 8 phases; the frontend
> consumes it and is at the start of feature build-out. Phase order roughly follows the backend so
> each frontend phase has a working API behind it.

## Current Status (2026-07-25, Phase 7 — Task assignment + Project detail)
- ✅ **Task assignment.** Repository `assignTask(taskId,userId)`/`unassignTask(taskId)` →
  `PUT /task/{id}/assign/{userId}` | `/task/{id}/unassign`. Facade actions reload org tasks + summary
  (and the open project's tasks). The **Tasks page** and **Project detail** each row now has an
  **assignee `<select>`** (Unassigned + members) that assigns/unassigns on change.
- ✅ **Project detail page** (`project-detail-page`, 5 files) at `/organization/projects/:id`: header
  (status badge, description, dates, progress bar from `GET /project/{id}`), a tasks table
  (`GET /task/project/{id}`) with assignee + start/complete, and a **create-task drawer scoped to the
  project** (`createProjectTask` → `POST /task` with the projectId). Project cards got an **Open →** link.
- ✅ **Verified the whole work-management loop live**: opened Website Redesign → created "Build the
  responsive nav bar" (header recomputed to **1/2 tasks, 50%**) → assigned it to Jane
  (`PUT /task/3/assign/2 → 204`) → **member report for Jane now shows Assigned: 1**. Reports finally
  populate with real workload. `ng build` passes; responsive (table reflows, header stacks).
- ⚠️ **Backend gap found:** `CreateTask` requires a valid `OrganizationId` (404s otherwise) and there is
  **no endpoint to create a personal/org-less task** — only `GET /task/mine/personal` (read). So the
  Member (Individual) portal's core "create personal task" isn't buildable via the current API; it's
  backend-blocked. To make assignment testable, jane (userId 2) was added as an active Manager member of
  org 2 directly in the dev DB (`OrganizationMembers` was empty; no accept-invitation flow available to us).
- ⏭️ **Next:** team member add/remove (`/team/{id}/members/{userId}`) + team detail; subtasks UI
  (`/subtask`); work-log/time-tracking UI; org switcher; then either unblock the Member portal (needs a
  backend personal-task create endpoint) or extend design tokens to the org portal (still light-only).

## Current Status (2026-07-24, Phase 6 — Reporting)
- ✅ **Reports page** (`reports-page`, 5 files) wired to `/report/*` (all raw DTOs). A **date-window**
  control (Week/Month/Year/All-time presets + From/To inputs) drives the reports reactively via two
  `effect()`s (one for team, one for member) that reload when the org resolves or the window changes.
  - **Team performance** — `GET /report/team/{orgId}?from&to` (returns a LIST): an **echarts** grouped
    bar chart (Assigned vs Completed per team) + a table (members/assigned/completed/tracked-hrs/avg-days).
  - **Member report** — member selector (from members list) → `GET /report/member/{userId}?from&to`
    (single DTO) → six stat tiles (created/assigned/completed/in-progress/overdue/tracked). Shows a hint
    linking to Members when the org has no active members yet.
  - **Project report** — project selector → `GET /report/project/{projectId}` (single DTO, no date
    window) → a completion **ring** (conic-gradient), tasks/tracked-hours, and a per-member workload table.
- ✅ Route `/organization/reports` + Reports sidebar link enabled (only Calendar remains "Coming soon").
  Date inputs forced to `color-scheme: light` so native pickers match the light theme.
- ✅ **Verified live**: team report loads + reloads on preset change (`?from&to` window updates), project
  report for "Website Redesign" shows **100% complete, 1/1 tasks**; member report shows the empty-member
  hint (no accepted members in the test org). Responsive: chart/tables scroll, two-col collapses, tiles
  reflow. `ng build` passes.
- ⏭️ **Next:** project **detail** page (tasks under a project) + task **assign/unassign** UI (so member/
  project reports get populated workloads), team member add/remove (`/team/{id}/members/{userId}`), org
  switcher, member portal (Phase 5 in the old numbering), and extending design tokens to the org portal.

## Current Status (2026-07-24, Phase 5 — Roles/Members/Teams + Lottie)
- ✅ **Lottie infrastructure.** `provideLottieOptions({ player: () => import('lottie-web') })` in
  `app.config.ts`; new reusable atom `shared/ui/atoms/animations/lottie-player/` (wraps `<ng-lottie>`,
  inputs: `src`/`width`/`height`/`loop`/`ariaLabel`). Two **hand-authored, offline-safe** JSONs in
  `public/lottie/` (`loading-dots.json`, `empty.json` — no external fetch, so CSP/offline-safe). Used
  for loading/empty states on the new pages. Verified rendering in-browser (lottie-web parses the JSON
  into SVG; the `lottie-web is not ESM` build warning is harmless).
- ✅ **Roles & Permissions page** (`roles-page`) — list roles, create role, and a **permissions editor**
  drawer with the grantable **catalog** (`GET /organizationrole/permissions`) as toggle switches;
  grant/revoke by **permission NAME** (`POST grant-permission`/`revoke-permission`). Verified: create
  role + grant persists.
- ✅ **Members + Invitations page** (`members-page`) — members list (change-role inline select,
  activate/deactivate, remove) + **pending invitations** (invite into a role → `POST invite`, cancel).
  Note: **inviting requires a role first** (a notice links to Roles when none exist). Verified: invited
  jane@example.com into Manager → appears as Pending.
- ✅ **Teams page** (`teams-page`) — list + create (`POST /team`). Verified: created "Engineering".
- ✅ **Facade/repo/models extended** for roles/members/invitations/teams (all raw, unenveloped). `loadOrgData`
  now forkJoins these alongside summary/projects/tasks; permission catalog fetched once. Added
  `ApiService.delete(endpoint, body?)` for remove-member (DELETE-with-body). Sidebar nav now routes
  Members/Teams/Roles (Calendar/Reports still "Coming soon").
- ✅ **Responsive**: verified no horizontal overflow at 375px; sidebar collapses, member rows reflow to a
  stacked grid, card grids use `auto-fill minmax`, drawers go full-width. `ng build` passes.
- ⚠️ **Gotcha:** creating an org seeds **no roles**, and Invite needs an `organizationRoleId` — so Roles
  is a prerequisite for Invitations (surfaced in the UI). Invite is slow (~3.5s: backend sends an email).
- ⏭️ **Next:** Reporting pages (dashboard already done; add member/team/project reports with From/To date
  windows via `/report/member|team|project`), project **detail** + task assign/unassign UI, team member
  management (add/remove via `/team/{id}/members/{userId}`), org switcher, and extend design tokens to the
  org portal (still light-only hardcoded colors).

## Current Status (2026-07-24, Phase 4 — Organization portal wired to the live API)
- ✅ **Org portal foundation.** `features/organization/organization.models.ts` (DTOs + enums
  `OrganizationStatus`/`ProjectStatus`/`TaskStatus`/`TaskPriority` with exact API int values + label/tone
  helpers), `organization.repository.ts` (getMyOrganizations, getDashboard, getProjects, getTasks,
  createOrganization/Project/Task, start/completeTask), `organization.facade.ts` (signals: currentOrg,
  summary, projects, tasks; resolves the current org via `/organization/mine` and persists the selected
  id; `needsOrganization` drives onboarding). **All non-Auth endpoints return RAW values (no
  `ApiResponse<T>` envelope)** — repositories are typed to the bare DTOs. `core/api/api-endpoints.ts`
  extended with Organization/Report/Project/Task route builders.
- ✅ **Dashboard wired to real data.** `dashboard-page` now shows the live `DashboardSummary` (projects,
  active/completed/overdue tasks, members/teams, tracked hours), a **recent-projects** panel, and a real
  **task-status donut** (made `ProjectHealthChart` `input()`-driven). Includes a **create-organization
  onboarding** state for freshly registered org accounts (register does NOT create an org).
- ✅ **Projects page** (`projects-page`, 5 files) — live list from `/project/organization/{id}` as cards
  (status badge + progress), **create-project** slide-in drawer → `POST /project`.
- ✅ **Tasks page** (`tasks-page`, 5 files) — live list from `/task/organization/{id}` as a table
  (status/priority badges, subtask progress), **create-task** drawer (priority + project select fed from
  real projects) → `POST /task`, and **Start/Complete lifecycle** → `PUT /task/{id}/start|complete`.
- ✅ **Sidebar routing** — org-layout nav wired with `routerLink`/`routerLinkActive` (Dashboard/Projects/
  Tasks); not-yet-built items (Calendar/Team/Reports/Settings) shown disabled ("Coming soon").
- ✅ **FIXED a latent Phase-2 auth bug** exposed by the live API: `GET /user/me` returns the DTO **raw**
  (not enveloped), but the login flow read `profileRes.data` → `undefined` → `toUser` threw inside the
  `next` handler, so the token was stored but the user principal wasn't and login silently didn't
  redirect. `auth.repository.me()` now returns the raw `UserProfileResponse`; `auth.facade` maps it
  directly. Login → `/organization` now works.
- ✅ **Verified end-to-end against the running API** (localhost:4200 → https://localhost:7086): register
  org account → login → create org (Northwind Labs) → dashboard (real summary) → create project → create
  task under it → Start → Complete → dashboard reflects 1 project / 1 completed task. `ng build` passes.
- ⚠️ **Testing gotchas (see SESSIONS):** (1) new users are `PendingVerification` and login returns
  `EMAIL_NOT_VERIFIED` — there's **no email-verification endpoint** (backend leftover); to test, the
  user's `Status`/`IsEmailVerified` were set in the dev DB. (2) BCrypt is very slow on this machine
  (~5s/hash) — concurrent login attempts saturate the API; do one at a time.
- ⏭️ **Next (remaining org pages):** Teams, Members + Invitations, Roles + Permissions, and the
  Reporting pages (member/team/project reports with date windows). Each needs its controller/DTOs read
  and a page built. Also: org switcher UI (facade already supports multiple orgs), and extend the design
  tokens to the org portal (currently light-only hardcoded colors).

## Current Status (2026-07-24, Phase 2c — register + refresh rotation + org logout)
- ✅ **Register wired end-to-end.** New `features/auth/register-page/` (5 files) — a themed two-panel
  screen mirroring the login design, with an **account-type toggle** (Individual / Organization) that
  feeds the API's `accountType` int (Individual = 1, Organization = 2). Reactive form validates to the
  backend's `RegisterUserCommandValidator` rules (names ≤100, email, phone 10–20, password ≥8 with
  upper/lower/digit) plus a client-only **confirm-password** cross-field validator and a terms checkbox.
  `auth.models.ts` adds `RegisterRequest`/`RegisterPayload` + `accountTypeToInt`/`toRegisterPayload`;
  `auth.repository.register()` posts to `/auth/register`; `auth.facade.register()` shows a success toast
  and routes to the matching login variant (org → `/auth/organization`, else `/auth/login`). Route
  `/auth/register` added. Links wired: login "Create one" → register, public header "Get started" →
  register. Verified live: renders (both fields + toggle + showcase), required-field + password-mismatch
  validation fire, Organization toggle activates. `ng build` passes. (Live `/auth/register` POST not
  exercised — no API running, same constraint as login.)
- ✅ **Refresh-token rotation** — new `core/interceptors/refresh.interceptor.ts` (registered **last** in
  the pipeline, innermost). On a `401` from a protected endpoint it calls `POST /auth/refresh` with the
  stored refresh token, swaps tokens via new `TokenService.updateTokens()` (preserves the remember-me
  storage + user principal), and **retries the original request once**. Single-flight lock
  (`isRefreshing` + a `BehaviorSubject`) queues concurrent 401s and replays them with the new token.
  On refresh failure → `clearSession()` + redirect to `/auth/login`. Skips the auth endpoints
  (login/register/refresh/logout) to avoid loops. Sits inner of the error interceptor so a successful
  refresh never surfaces the 401 toast.
- ✅ **Organization portal logout wired.** `organization-layout` now injects `AuthService`/`AuthFacade`/
  `ThemeService`: replaced the hardcoded "Avery Mitchell" user with the **real session principal**
  (initials avatar + name + email), added a **theme toggle** and a **Sign out** button →
  `AuthFacade.logout()`. (Member + admin layouts already had logout.)
- ⏭️ **Next:** wire the organization **dashboard** to a real `organization.facade`/`repository` against
  the API dashboard summary (replace hardcoded chart data) — Phase 4. Then build the first real portal
  pages (projects/tasks). Optional auth leftovers: forgot-password, Manager-role portal decision.

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

### 2c — Remaining auth work 🟡 (mostly done this session)
- ✅ **Register** page with **account-type choice** (Individual vs Organization → API `accountType` int).
  `features/auth/register-page/` (5 files), route `/auth/register`, facade/repository/models wired,
  entry links hooked from the login page + public header. Note: the API's `RegisterUserCommand` does
  **not** take an organization name — an org account registers as a user with `AccountType.Organization`;
  org-name capture (if ever needed) would be a separate backend concern.
- ✅ **Logout** wired from **all three** portal top bars (member/admin already; organization added this
  session) → `AuthFacade.logout()` → `POST /auth/logout` (refresh token) → `endSession()` → `/auth/login`.
- ✅ **Refresh-token rotation**: dedicated `core/interceptors/refresh.interceptor.ts` — on 401 calls
  `POST /auth/refresh`, swaps tokens (`TokenService.updateTokens`), retries once; single-flight lock
  queues concurrent 401s; on failure → force logout. Registered innermost in the pipeline.
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

## Phase 4 — Organization Portal 🟡 (dashboard + projects + tasks wired to live API)
- ✅ Dashboard wired to the API dashboard summary via `organization.facade` + `organization.repository`;
  `ProjectHealthChart` is now `input()`-driven and fed real task-status counts. Create-org onboarding.
- ✅ Projects (list + create) and Tasks (list + create + start/complete lifecycle) pages, registered in
  `ORGANIZATION_ROUTES`. Sidebar nav wired (routerLink/routerLinkActive).
- ✅ Members + Invitations, Teams, and Roles + Permissions pages built and live-verified (Phase 5).
- ⬜ Remaining pages: project **detail**, task **assign/unassign** UI, team member add/remove, reports.
  Org **switcher** UI (facade supports it).
- ⬜ Sidebar is inline in the layout (fine); a dedicated sidebar organism is optional.

## Phase 5 — Member (Individual) Portal ⬜
- ✅ `MemberLayout` shell + placeholder dashboard; `/member` branch guarded with `portalGuard('member')`.
- ⬜ Personal task pages (create/subtasks/lifecycle), personal tracking/reports (weekly/monthly/yearly)
  against the API's personal-task + report endpoints.

## Phase 6 — Admin Portal ⬜
- ✅ `AdminLayout` shell + placeholder dashboard; `/admin` branch guarded with `roleGuard('Admin')`.
- ⬜ Platform admin pages: user list (`GET /user`, AdminOnly), organizations overview, platform settings.

## Phase 7 — Reporting & Dashboard (headline feature) 🟡 (reports page done)
- ✅ Reports page consuming dashboard summary + member/team/project report endpoints; echarts team
  bar chart, member stat tiles, project completion ring + workload table (fed by the org facade).
- ✅ Date-window (From/To) controls with Week/Month/Year/All presets, reactive via effects.
- ⬜ Work-log durations UI; richer per-member trend charts; export (CSV/PDF).

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
