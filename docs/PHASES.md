# TaskFlow UI — Phases & Status

> Keep the Current Status section up to date at the end of every session.
> The backend (`D:\Projects\TMS\TaskFlow`) is fully implemented across its 8 phases; the frontend
> consumes it and is at the start of feature build-out. Phase order roughly follows the backend so
> each frontend phase has a working API behind it.

---

## ▶ NEXT SESSION — START HERE (invitation flow done; org settings is the last CRUD gap)

**API coverage: 63 of 71 endpoints are now reachable from the UI.** The remaining 8, and what they'd need:

| Not wired | What it would take |
|---|---|
| `PUT /organization`, `DELETE /{id}`, `GET /{id}` | An **org settings** screen (rename / delete the organization) — the last entity without edit/delete. Biggest remaining item. |
| `GET /user/{id}` | Admin user-detail drawer (repo method `getUser` already exists, unused). |
| `PUT /subtask` | Rename a subtask (repo method `updateSubTask` exists, unused). |
| `GET /task/mine`, `/task/mine/personal`, `GET /worklog/mine` | Personal tasks in the member portal — still **backend-blocked** (no endpoint creates a task without an `OrganizationId`). |

**Everything below still applies** — the running-the-app notes, the test logins, and the roadmap buckets.

**No re-explaining needed.** Org portal is feature/theme-complete (Phases 8–10); Admin has a live Users
page + dashboard (Phase 11); the **`shared/validations/` engine** is built + wired into register (Phase 12);
**confirm dialogs** gate destructive actions (Phase 13); **loading skeletons** replace the generic loading
states on the main list pages (Phase 14); an **accessible-drawer directive** (`appDialog`) gives every
slide-in drawer focus-trap + Escape + `role=dialog` (Phase 15); and **client-side pagination + list
filtering** ship on the four main list pages via a reusable `Pagination` molecule + `createPagination()`
helper (Phase 16); and **edit + delete** now exist for projects, tasks, teams and roles (Phase 17). Pick one
of the remaining roadmap buckets below (in rough priority order); follow existing patterns; verify live;
update these docs.

### Candidate next buckets
0. **Org settings (update/delete organization)** — see the coverage table above.
1. **Polish & Hardening cont.** (roadmap Phase 8) — validation engine ✅, confirm dialogs ✅, skeletons ✅,
   drawer a11y ✅, pagination/filtering ✅ are done; the remaining item is a **broader a11y** pass (contrast
   audit, form-label associations, the Storybook a11y addon). Also: adopt the validation engine in the
   remaining forms (login + the org create-drawers), extend the `Skeleton` atom to the pages still on a
   text/Lottie loading state (teams, roles, reports, project-detail, team-detail, dashboard), and apply the
   **list pattern** (`.list-toolbar` + `createPagination` + `<app-pagination>`, see CONVENTIONS) to the
   remaining lists (teams, roles, project-detail tasks, team-detail members, invitations).
2. **Reporting extras** (roadmap Phase 7) — CSV/PDF export, richer per-member trend charts.
3. **Auth leftovers** (roadmap Phase 2) — forgot-password / email-verification screens, surface login
   errors on the form, decide the Manager-role portal.
4. **Admin portal extras** — organizations overview + platform settings are **backend-blocked**: only
   `GET /organization/mine` exists (no list-all-orgs endpoint) and there is no settings endpoint. Needs new
   backend endpoints before building. User **detail** (`GET /user/{id}`) could be surfaced as a drawer now.

**Before building:** run the API (`https://localhost:7086/api`), dev server on **4200**, accept the
self-signed cert once at `https://localhost:7086`. Test org = **Northwind Labs (orgId 2)**, owner
**nadia.owens+org1@taskflow.test / Passw0rd!** (org login variant `/auth/organization`). Active member
seeded: **Jane Doe (userId 2, Manager)** — on the **Engineering** team (teamId 2); taskId 3 has a 2.5h
work log. BCrypt is slow (~5s) — one login at a time. Admin portal test login = **admin@taskflow.com /
Admin@123** (seeded Individual/Admin → `/admin`, variant `/auth/admin`). See
[[taskflow-api-integration-gotchas]] memory for the recurring traps (raw-vs-enveloped responses,
email-verify DB step, org-seeds-no-roles).

### Still open / blocked
- **Backend gap flagged (separate session/repo):** `POST /worklog/manual` returns a generic **500** when
  domain validation fails (e.g. end time in the future) — domain `ArgumentException` isn't mapped to 400
  in the API middleware. The frontend guards the future-time case client-side; the backend should still
  map it. See `TaskFlow.Domain/.../TaskWorkLog.cs` (LogManual).
- **Member (Individual) portal is backend-blocked**: no personal-task create endpoint (`CreateTask` needs
  a non-null `OrganizationId`). Don't build it until the backend adds one — flag it, don't fake it.

---

## Current Status (2026-07-26, Phase 18 — Invitation accept/reject (the invitee's side))
- ✅ **The invitee's half of the invitation flow is built.** New `features/member/` slice —
  `member.repository.ts` (`GET /organizationinvitation/mine`, `POST /accept`, `POST /reject`) and
  `member.facade.ts` (invitations signal, `init`/`refresh`/`accept`/`decline`, `pendingCount`) — plus an
  **invitations page** (4 files) listing each invitation as a card: org avatar, role chip, invited/expiry
  dates, **Accept** and **Decline** (declining is confirm-gated). Endpoint coverage **60/71 → 63/71**.
- ✅ **Mounted in BOTH portals.** Invitations are addressed to a **user**, not a portal — an Organization
  account can be invited into another organization just as an Individual can. So the same standalone page
  is routed at `/member/invitations` *and* `/organization/invitations`, with a red **pending-count badge**
  on both navs (the layouts call `MemberFacade.init()` so the badge is right wherever the user lands).
  Building it member-only would have hidden invitations from exactly the account type that owns an org.
- ✅ **Shared models extracted** — `shared/models/tone.model.ts` (`Tone`, previously duplicated in the
  organization *and* admin slices) and `shared/models/invitation.model.ts` (`InvitationStatus`,
  `OrganizationInvitation`, `invitationStatusMeta`, plus an `isExpired()` helper). `organization.models.ts`
  re-exports them, so every existing import still resolves. This filled the previously-empty
  `shared/models/` folder with its first real citizens.
- ✅ **Expired invitations are separated out.** `GET /mine` only returns Pending rows, but they can still
  be past `expiryDate` — and the API rejects accepting those with a 400. The page splits **actionable**
  from **Expired** (a dimmed section offering only Dismiss), so no one clicks Accept on something the
  server will refuse. `pendingCount` (the badge) counts only actionable ones.
- ✅ **Honest member dashboard.** It was showing hardcoded stats ("8 active tasks", "23 completed this
  week") for a portal with no task data at all. Replaced with a real pending-invitations callout and a
  straight explanation that personal tasks await an API endpoint — no fabricated numbers.
- ✅ **Verified live end-to-end** as the org owner (who had no membership row, so she was a valid
  invitee): invited her own address → the sidebar badge showed **1** and the card appeared (Jane's
  invitation correctly **not** shown — `/mine` filters by the caller's email) → **Accept** →
  `POST /accept 204` → she appeared in **Members** as an Active Manager. Then a second invite →
  **Decline** → confirm dialog → `POST /reject 204` → list empty, badge cleared. Checked in dark mode;
  no console errors. `ng build` passes; suite **184/184 green** (+7).
- ⚠️ **Backend finding: `RemoveMember` and `DeactivateMember` are the same operation.** Both handlers
  call `member.Deactivate()` — nothing is removed, so a "removed" member stays in the list as *Inactive*.
  The frontend was promising a deletion the API doesn't perform; the confirm copy now says what actually
  happens. Worth a backend decision: either hard-remove, or drop one of the two endpoints.
- ⏭️ **Next:** org update/delete (an org-settings screen — the last entity CRUD gap), admin user-detail
  drawer (`GET /user/{id}`), subtask rename (`PUT /subtask`); then the broader a11y pass. Personal tasks
  stay backend-blocked.

## Current Status (2026-07-26, Phase 17 — Edit & delete pass: projects, tasks, teams, roles)
- ✅ **Closed the biggest API-coverage gap.** The backend had full CRUD; the frontend was create + read +
  lifecycle only. Added the 8 missing calls — `updateProject`/`deleteProject`, `updateTask`/`deleteTask`,
  `updateTeam`/`deleteTeam`, `updateRole`/`deleteRole` — plus `getTask` (`GET /task/{id}`), through
  repository → facade → UI. Endpoint coverage went **51/71 → 60/71**.
- ✅ **New payload models** (`UpdateProjectPayload`/`UpdateTaskPayload`/`UpdateTeamPayload`/
  `UpdateRolePayload`) mirroring the API's commands exactly. They are deliberately **partial**: the update
  commands take no status, start date, or project reassignment, so those fields are hidden in edit mode and
  a `.drawer-note` explains why (status still moves via Start/Complete).
- ⚠️ **Data-loss trap found and fixed:** `TaskListItem` (the list DTO) carries **no `description`**, but
  `UpdateTaskCommand` requires one — filling an edit form from a table row and saving would have silently
  blanked every task's description. Only `GET /task/{id}` → `TaskDetailDto` has it, so `openEdit()` now
  opens the drawer from the row **and** calls `facade.loadTaskForEdit(id, …)` to fill the description
  before save. Covered by a unit test on both pages.
- ✅ **UI**: one drawer per page now serves create *and* edit (`editing` signal, `isEditing()` computed,
  heading/CTA/fields switch on it) on **projects, tasks, teams, roles**; `project-detail` and `team-detail`
  gained header **Edit + Delete**, and project-detail also gained per-task Edit/Delete. Every delete goes
  through `DialogService.confirmDelete` with a consequence-specific message ("…and its 3 task(s) will be
  deleted"). Detail-page deletes navigate back to the list via a new `onDeleted` callback on
  `deleteProject`/`deleteTeam` (fires only on success, so a failed delete doesn't navigate).
- ✅ **New global `styles/components/_actions.scss`** — `.icon-action` (+ `.danger`) and `.drawer-note`,
  so row/card affordances are identical everywhere. Tasks table columns re-balanced
  (`2fr .85fr .85fr .65fr 2.15fr`) so the wider action cluster stays on one line.
- ✅ **Removed the phantom endpoints** `API.User.Update` / `API.User.Delete` — `UserController` is
  read-only (no PUT/DELETE on `/user`), so the map was advertising routes that don't exist.
- ✅ **Verified live end-to-end**: task edit → `PUT /api/task 204`, reopened the drawer and the
  description **persisted** (the blank-out trap is really closed); temp task created → deleted
  (`DELETE /api/task/4 204`) and the list reloaded; team edit → "Team updated." toast + card text changed;
  temp project created → deleted from its **detail** page (`DELETE /api/project/2 204`) → **navigated back**
  to `/organization/projects` with the card gone. Roles/edit drawer checked in **dark mode**. All seed data
  restored; no console errors. `ng build` passes; suite **177/177 green** (+18).
- ⏭️ **Next:** invitation accept/reject (the invitee's side — `POST /accept|/reject`, `GET /mine`), which is
  the last big unwired cluster; then org update/delete, broader a11y, skeletons/list pattern on the
  remaining pages.

## Current Status (2026-07-26, Phase 16 — List pagination + filtering)
- ✅ **`createPagination()` signal helper** (`shared/utils/pagination.ts`) — a client-side pager over any
  source signal: `page`/`pageSize`/`pageSizes`/`total`/`totalPages`/`items`/`rangeStart`/`rangeEnd` plus
  `setPage`/`next`/`prev`/`setPageSize`/`reset`. The exposed **`page` is a computed clamp** of a private
  writable, so a shrinking source (typing in the search box while sitting on the last page) falls back to
  the last real page automatically — no `effect()`, no manual reset, no empty slice. `setPageSize` returns
  to page 1. 7 unit tests.
- ✅ **`Pagination` molecule** (`shared/ui/molecules/pagination/`, 5 files) — presentational: derives
  `totalPages`/range from `page`/`pageSize`/`total`, renders a "Showing 1–10 of 42 users" summary
  (`aria-live="polite"`), an optional rows-per-page select (hidden unless `pageSizes` offers a choice), and
  a windowed page list that collapses to `1 … 5 6 7 … 12` past `maxPageButtons` (default 7). A11y: the
  `<nav>` takes `ariaLabel`, the active button gets `aria-current="page"`, prev/next are labelled and
  disabled at the ends. Emits `pageChange`/`pageSizeChange`; tokenized for both themes. 10 unit tests +
  6 stories.
- ✅ **Global list-toolbar styles** (`styles/components/_toolbar.scss`, imported in `styles.scss`):
  `.list-toolbar` / `.list-search` / `.list-filter` / `.list-no-match`. The admin users page's local
  copies of those rules were deleted in favour of the shared ones (its markup migrated), so all list
  pages now share one control shape.
- ✅ **Wired filtering + paging into four list pages**: admin **users** (existing search + status/type
  filters, 10/page), org **tasks** (**new** title search + status + priority filters, 10/page), org
  **projects** (**new** title/description search + status filter, 9/page in the card grid, sizes 9/18/36),
  org **members** (**new** name/email search + active/inactive filter, 10/page). Each page owns its filter
  signals + a `filtered*` computed + `clearFilters()`; the facades stay pure data. Filter `<select>`s are
  `[value]`-bound so Clear filters resets the controls too.
- ✅ **Verified live** (org owner + admin): tasks page search narrows to 1 row and the summary tracks it;
  search + a conflicting status filter shows the `.list-no-match` state, and Clear filters restores both
  the box and the select; temporarily paging at 1 row/page confirmed real page buttons — clicking page 2
  moved `aria-current="page"`, disabled Next, and swapped the row, and then filtering down to a single
  match **dropped back to page 1** (the clamp). Members "Inactive only" → no-match state in **light**;
  tasks/projects verified in **dark**; admin users page renders the migrated toolbar + pager. No console
  errors. `ng build` passes; full suite **159/159 green** (+33: 7 pager util, 10 molecule, 16 page-level).
- ⏭️ **Next:** broader a11y pass (contrast, labels, Storybook a11y addon); extend `Skeleton` + the list
  pattern to the remaining pages (teams, roles, reports, project/team detail); validation engine in the
  login + create-drawer forms.

## Current Status (2026-07-25, Phase 15 — Accessible drawers (focus-trap dialog directive))
- ✅ **`DialogDirective` (`appDialog`)** — a reusable a11y behaviour for the slide-in drawers
  (`shared/directives/dialog.directive.ts`). On a `<aside class="drawer" appDialog (dismiss)="close()">`
  it: sets `role="dialog"` + `aria-modal="true"` + `tabindex="-1"`; auto-wires `aria-labelledby` to the
  drawer's first heading (minting an id if missing); moves focus into the panel on open (first **form
  field**, else first focusable, else the panel); **traps** Tab / Shift+Tab within the panel; emits
  `(dismiss)` on **Escape**; and **restores focus** to the trigger element on close. Pure DOM + `output()`;
  relies on the drawers being `@if`-created (open = init, close = destroy).
- ✅ **Wired onto all 10 drawers** across the org portal: projects/teams/roles(create)/tasks(create)/
  project-detail create drawers, members invite, team-detail add-member, roles permissions, tasks subtask +
  time-tracking drawers. Each `(dismiss)` calls that drawer's existing close handler; backdrop-click close
  stays as-is.
- ✅ **Verified live** (create-project drawer): inspected DOM → `role=dialog`, `aria-modal=true`,
  `aria-labelledby` → the "New project" heading; on open focus lands on the **title field**
  (`INPUT[fc=title]`); pressing **Escape** closes the drawer and **returns focus to the "New project"
  trigger button**. `ng build` passes; full suite **126/126 green** (+4 directive tests: aria wiring,
  labelledby, Escape-dismiss, Tab-wrap).
- ⏭️ **Next:** list pagination + a broader a11y pass (contrast, labels, Storybook a11y addon); extend the
  `Skeleton` atom to the remaining pages; adopt the validation engine in login + create-drawers.

## Current Status (2026-07-25, Phase 14 — Loading skeletons)
- ✅ **Theme-aware `Skeleton` atom** (`shared/ui/atoms/skeletons/skeleton/`, 5 files) — a thin wrapper over
  `ngx-skeleton-loader` (installed but previously unused). Inputs: `circle`, `width`, `height`, `radius`,
  `count`. It paints the base in the `--surface-inset` token and picks the shimmer animation from
  `ThemeService` (`progress` in light / `progress-dark` in dark) via `[theme]` + `[animation]`, so loading
  states match the design system in **both themes** without per-usage styling. 4 unit tests.
- ✅ **Replaced the generic loading states with content-shaped skeletons** on the four main list pages:
  admin **users** (row: avatar + 2 lines + 2 pills + id), org **projects** (6 card skeletons: avatar, badge,
  title, 2 desc lines, progress bar, footer), org **tasks** (table rows matching the 5 columns), org
  **members** (rows matching the member grid). Each loading branch gets `aria-busy="true"` + an aria-label.
  Small per-page `.sk-lines`/`.sk-card` flex helpers handle the stacked-line spacing.
- ✅ **Verified live** (org owner): reloaded `/organization/projects` and captured the 6-card skeleton grid
  in **light**, toggled dark and reloaded to confirm the skeleton is fully theme-aware (dark card surfaces,
  lighter `--surface-inset` placeholders). `ng build` passes; full suite **122/122 green** (+4 skeleton tests).
- ⏭️ **Next:** list pagination + a11y pass; extend the `Skeleton` atom to the remaining pages (teams, roles,
  reports, project-detail, team-detail, dashboard); adopt the validation engine in login + create-drawers.

## Current Status (2026-07-25, Phase 13 — Confirm dialogs on destructive actions)
- ✅ **Theme-aware `DialogService`** — the existing sweetalert2 wrapper (`core/services/dialog.service.ts`)
  was hardcoding hex colors and rendering white in dark mode (sweetalert portals at the document root,
  outside Angular's theming). Rewrote it to read the live design tokens off `:root` at call time
  (`getComputedStyle(documentElement).getPropertyValue('--surface' | '--text' | '--danger' | …)`) and pass
  `background`/`color`/button colors through, so every dialog is on-palette in both themes. Added a
  **`confirmDelete(title, text?, confirmText?)`** convenience (red `--danger` confirm, warning icon,
  Cancel focused) alongside the generic `confirm`.
- ✅ **Wired confirmations into every destructive action** (at the page/handler level, keeping facades pure
  orchestration): members-page **remove member** (`confirmDelete`) + **cancel invitation** (`confirm`),
  team-detail **remove from team** (`confirmDelete`), tasks-page **delete subtask** + **delete work log**
  (`confirmDelete`). Handlers became `async` and only call the facade when the user confirms. Deactivate
  member stayed un-gated (it's a reversible toggle, not destructive).
- ✅ **Verified live** (org owner, Engineering team / teamId 2): clicking **Remove** on Jane shows
  "Remove from team? Jane Doe will be removed from Engineering." with a red Remove + focused Cancel;
  cancelling leaves her in place. Confirmed the dialog is fully themed in **dark mode** too (dark card,
  light text, red button — all from tokens). `ng build` passes.
- ✅ **Got the whole test suite green** (was 15 pre-existing broken "should create" specs). Every failure
  was a missing TestBed provider, not a real defect: org/auth facade-backed pages needed
  `{ provide: APP_SETTINGS, useValue: AppSettings }` (+ http/toastr/router for login & org-layout); the two
  echarts organisms needed `provideEchartsCore({ echarts })`; the public partials + landing card needed
  `provideRouter([])`; `LandingFeatureCard` needed its required `feature` input set via `setInput` and its
  lucide icon provided; and the stale App "should render title" scaffold test became a router-outlet
  assertion. **118/118 tests now pass** (a few real assertions added along the way).
- ⏭️ **Next:** rest of Polish & Hardening — loading skeletons (`ngx-skeleton-loader`), pagination, a11y;
  adopt the validation engine in the login + org create-drawer forms.

## Current Status (2026-07-25, Phase 12 — Validation engine + register form wiring)
- ✅ **Built the `shared/validations/` FluentValidation-style decorator engine** (was 4 empty folders).
  Structure: `models/validation-types.ts` (`ValidationRule`/`ValidationFailure` + immutable
  `ValidationResult` with `isValid`/`firstError`/`errorsFor`/`hasError`), `metadata/validation-registry.ts`
  (rule store keyed by class constructor via `WeakMap`, prototype-chain-aware so subclasses inherit rules —
  no `emitDecoratorMetadata`, the registry is the source of truth), `decorators/validation-decorators.ts`
  (`@Required @IsTrue @MinLength @MaxLength @Email @Pattern @Min @Max @Matches @Custom` — every rule except
  Required/IsTrue passes on empty, FluentValidation-style), `engine/validation-engine.ts`, and an `index.ts`
  barrel (import from `@shared/validations`).
- ✅ **Engine runtime** = a pure `validate(Model, obj) → ValidationResult` plus Angular reactive-form
  adapters: `controlValidators(Model)` (per-property `ValidatorFn`s for field-scoped rules — controls get
  `.ng-invalid` naturally), `crossFieldValidator(Model)` (one group-level `ValidatorFn` for model-scoped
  rules like `@Matches`), and `messageFor(group, prop)` (touched/dirty-gated message: control's own error,
  then a cross-field error targeting that property). The adapters are **pure** (never `setErrors`), so no
  recursive-update pitfall.
- ✅ **Wired into `features/auth/register-page`** as the first consumer. New `register-page.model.ts`
  (`RegisterFormModel` with decorators mirroring the backend `RegisterUserCommandValidator` — names ≤100,
  email, phone 10–20, password ≥8 upper/lower/digit — plus `@Matches('password')` and `@IsTrue` on terms).
  The form builds its validators from `controlValidators` + `crossFieldValidator`; templates show messages
  via a `fieldError(prop)` helper → `messageFor`. Removed the ad-hoc `passwordsMatch` fn and all inline
  `Validators.*`.
- ✅ **Tests:** 16 engine unit tests (every decorator, empty-passes, decoration order, `@Pattern`
  statelessness, inheritance, all three Angular adapters) + 4 register-page tests (starts invalid, required
  message, cross-field mismatch message, becomes valid) — **all green**. (Fixed the pre-existing register
  spec which lacked the `APP_SETTINGS` provider.)
- ✅ **Verified live**: on `/auth/register`, invalid email / short phone / weak password / mismatched
  confirm each show the decorator's message (incl. the cross-field "Passwords don't match."). `ng build`
  passes (register-page chunk 24.3 kB / 6.2 kB gz).
- ⏭️ **Next:** rest of Polish & Hardening — skeletons, confirm dialogs (`DialogService` exists), pagination,
  a11y; and adopt the engine in the login + org create-drawer forms.

## Current Status (2026-07-25, Phase 11 — Admin portal: Users + real dashboard)
- ✅ **Admin portal Users page** (`features/admin/users-page`, 4 page files at `/admin/users`) wired to the
  **AdminOnly** `GET /user` → **UserListItemDto[]** `{ id, fullName, email, status (UserStatus), accountType
  (AccountType) }` (raw). Shows four **stat tiles** (total / active / organization-accounts / pending-
  verification), a **search** box (name/email), **status** + **account-type** filter selects, and a table of
  accounts (initials avatar, account-type badge with icon, status badge, `#id`). Filtering is client-side via
  a `filteredUsers` computed. New feature slice: `admin.models.ts` (UserStatus/AccountType enums exact-int +
  `userStatusMeta`/`accountTypeMeta` tone helpers), `admin.repository.ts` (`getUsers`/`getUser`), and
  `admin.facade.ts` (users signal + `init()` once-load + derived `totalUsers`/`activeUsers`/`pendingUsers`/
  `organizationAccounts` computeds).
- ✅ **Real admin dashboard** — replaced the hardcoded placeholder stats with the facade's derived counts
  (total users, organization accounts, active, pending) + a **User-management link card** to `/admin/users`.
  The "organizations & settings — coming soon" note now states honestly that those are **backend-blocked**.
- ✅ **Admin layout nav** — added a top-bar nav (Dashboard / Users) with `routerLinkActive`, matching the
  org portal's active-pill style; brand links to the dashboard. Theme toggle + Sign-out already existed.
- ✅ **Verified live** as **admin@taskflow.com / Admin@123** (seeded Individual/Admin → `/admin`): dashboard
  shows real counts (3 users, 1 org account, 3 active, 0 pending), Users page lists all 3 seeded users
  (Nadia Owens/org, Jane Doe/individual, Admin User/individual), the **Organization account-type filter**
  narrows to 1, and **dark mode** is fully tokenized (surfaces, badges, filters, active nav pill). `ng build`
  passes (users-page 12.5 kB / 3.4 kB gz, dashboard-page 18.8 kB / 5.0 kB gz); **4 real unit tests** on
  users-page pass (create + stats derivation + search + status filter).
- ⏭️ **Next:** org overview + platform settings are backend-blocked; move to Polish & Hardening, reporting
  export, or auth leftovers. Member portal stays backend-blocked.

## Current Status (2026-07-25, Phase 10 — Dark-mode theming of the org portal)
- ✅ **Tokenized the entire organization portal for dark mode.** Converted all light-only hardcoded colors
  to the semantic CSS-variable tokens (`src/styles/themes/_light.scss` `:root` / `_dark.scss`
  `[data-theme]`) across **10 SCSS files**: the org-layout shell + all 9 org pages (dashboard, projects,
  project-detail, tasks, teams, team-detail, members, roles, reports) — plus the shared
  `organisms/project-health-chart` (the dashboard donut card, which was still white in dark).
- ✅ **Mapping used** (consistent everywhere): surfaces `#fff`→`--surface`, subtle bg→`--surface-2`,
  inset/hover→`--surface-inset`, page bg→`--bg`; borders→`--border`/`--border-strong`; text
  `#111827`→`--text`, muted greys→`--text-muted`, subtle greys→`--text-subtle`; brand accents/links
  →`--primary`, brand buttons/fills→`--gradient-brand` + `--shadow-brand`; badge tone pairs→`--info`/
  `--info-soft` (and success/warning/danger/primary); card shadows→`--shadow-md`/`--lg`, drawers
  →`--shadow-xl`; focus rings→`--ring`. White text on gradient/colored chips kept literal `#fff`. Stat-card
  icon chips kept fixed saturated hues (white glyphs read on both themes).
- ✅ **Removed the `color-scheme: light` pins** on date/datetime inputs (tasks + reports) so native pickers
  now follow the active theme (the root sets `color-scheme` per theme). The theme toggle already lived in
  the org top bar, so no new toggle was needed.
- ✅ **Verified live in both themes**: toggled dark on the dashboard (hero, stat cards, recent-projects,
  and the donut "Task status" card all dark), the Tasks page + the **time-tracking drawer** (dark surface,
  primary-soft tracked-time pill, themed datetime inputs, running/timer cards), and the Reports page
  (panels, echarts bar chart, tables, date inputs). Toggled back to light — unchanged from before. `ng build`
  passes (no budget regressions).
- ⏭️ **Next:** the org portal is feature- and theme-complete; pick a new roadmap bucket (Admin portal,
  Polish & Hardening, reporting export, or auth leftovers). Member portal stays backend-blocked.

## Current Status (2026-07-25, Phase 9 — Work-log / time-tracking + Org switcher)
- ✅ **Work-log / time-tracking UI** — a **time-tracking drawer** opened from a new **Time** (clock) button
  on each Tasks-page row. Wired to `WorkLogController` (`api/worklog`, all raw): `GET /worklog/task/{taskId}`
  → **WorkLogDto[]** `{ id, taskId, userId, startedAt, endedAt?, durationMinutes, notes?, isRunning }`;
  `POST /worklog/start {TaskId,Notes?}` → int (409 if a timer already runs — **one per user**);
  `PUT /worklog/stop {WorkLogId,Notes?}`; `POST /worklog/manual {TaskId,StartedAt,EndedAt,Notes?}` → int;
  `DELETE /worklog/{id}`. The drawer shows **Total tracked**, a **Start/Stop timer** (green running card with
  a pulse dot when live), a **manual-entry form** (datetime-local Start/End + notes), and a **history list**
  (duration, time range, notes, Running badge, delete). Added `API.WorkLog.*` + repo/facade methods and a
  `WorkLog` model. `afterWorkLogChange` refreshes the open drawer's logs **and the dashboard summary**, so
  `trackedHours` (previously always empty on reports/dashboard) now populates.
- ✅ **Client guard for a backend gap:** `POST /worklog/manual` **500s** when the end time is in the future
  (domain `ArgumentException` "End time cannot be in the future." isn't mapped to 400 — flagged as a separate
  backend task). The manual form now blocks a future end time client-side (`future` error + `max` on the
  inputs) so users never hit the 500. (Note the server clock is UTC — a "later today" local time can be
  future in UTC; use past times when testing.)
- ✅ **Org switcher** — replaced the hardcoded "Acme Inc." workspace card in the org-layout sidebar with a
  real card bound to `OrganizationFacade` (`organizations`/`currentOrg`/`selectOrganization`). Shows the
  current org (initials avatar + name); with **multiple** orgs it becomes a dropdown (chevron) listing all
  orgs with a check on the active one and switching on select (persists `tf_org_id`, reloads all org data).
  With a single org it renders as a static card (no chevron). The layout now calls `orgFacade.init()`.
- ✅ **Verified live end-to-end** (taskId 3): opened Time → started timer (`POST /worklog/start → 200`,
  green running card) → stopped (`PUT /worklog/stop → 204`) → manual log Jul 24 09:00–11:30
  (`POST /worklog/manual → 200`, **Total tracked 2h 30m**) → deleted the stray log (`DELETE /worklog/1 →
  204`) → **dashboard now shows "2.5h tracked"**. Org switcher renders "Northwind Labs". `ng build` passes
  (tasks-page chunk 30.8 kB / 7.2 kB gz); datetime inputs pinned `color-scheme: light`.
- ⏭️ **Next (Phase 10):** extend design **tokens** to the org portal so **dark mode** works (broad SCSS
  sweep — org pages are still light-only hardcoded colors). Member portal stays backend-blocked.

## Current Status (2026-07-25, Phase 8 — Team detail + Subtasks)
- ✅ **Team detail page** (`team-detail-page`, 5 files) at `/organization/teams/:id` (mirrors
  `project-detail-page`): header (team icon, name, description, member-count pill, Add-member CTA) + a
  **member list** (avatar, name, email, joined date, Remove) fed by `GET /team/{id}` → **TeamDetailDto**
  `{ id, organizationId, name, description, members: TeamMemberDto[] }` (raw). Team cards on the Teams page
  got an **Open →** link.
- ✅ **Add/remove team members** — an **Add-member drawer** whose picker is the org **members** list
  (active only) minus those already on the team (`availableMembers` computed). `POST /team/{teamId}/members/
  {userId}` (204) / `DELETE /team/{teamId}/members/{userId}` (204). Facade: `teamDetail` signal +
  `loadTeamDetail`/`clearTeamDetail`/`addTeamMember`/`removeTeamMember` (reloads team detail + teams list).
- ✅ **Subtasks UI** — a **subtask drawer** opened from a clickable subtask chip on each Tasks-page row.
  `SubTaskController` (`api/subtask`, raw): `GET /subtask/task/{taskId}` → **SubTaskDto[]**
  `{ id, taskId, title, status (TaskStatus enum), createdDate, completedDate? }`; `POST {Title,TaskId}` →
  int; `DELETE /{id}`; `PUT /{id}/complete`; `PUT /{id}/reopen` (all 204). Add / toggle
  complete⇄reopen (checkbox) / delete, with the row's `completedSubTaskCount/subTaskCount` badge recomputed
  after each change (facade reloads org tasks + open project tasks). Added `API.SubTask.*` +
  `getTeam`/team-member/subtask methods to repository, `SubTask`/`TeamDetail`/`TeamMember` to models.
- ✅ **Verified live end-to-end**: opened Engineering (teamId 2) → added Jane (`POST /team/2/members/2 →
  204`, header "1 member") → removed her (`DELETE → 204`, back to empty) → re-added. Subtasks on "Build the
  responsive nav bar" (taskId 3): created (`POST → 200`, badge 0/0→0/1) → completed (`PUT /subtask/1/complete
  → 204`, badge 1/1, **parent task auto-completed by the backend**) → reopened (`PUT /1/reopen → 204`,
  badge 0/1, parent back to In progress) → deleted (`DELETE /1 → 204`, empty state). `ng build` passes;
  responsive at 375px (team header stacks, member rows reflow to stacked cards, drawers full-width).
- ⏭️ **Next (Phase 9):** work-log / time-tracking UI (`WorkLogController`), org switcher (facade already
  supports it), then extend design tokens to the org portal (still light-only). Member portal stays
  backend-blocked (no personal-task create endpoint).

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
  `create-project-modal-molecule`, `view-project-modal-molecule`, `task-detail-modal-molecule`,
  `pagination` (list pager — summary, rows-per-page, windowed page buttons).
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

## Phase 4 — Organization Portal ✅ (feature- and theme-complete)
- ✅ Dashboard wired to the API dashboard summary via `organization.facade` + `organization.repository`;
  `ProjectHealthChart` is now `input()`-driven and fed real task-status counts. Create-org onboarding.
- ✅ Projects (list + create) and Tasks (list + create + start/complete lifecycle) pages, registered in
  `ORGANIZATION_ROUTES`. Sidebar nav wired (routerLink/routerLinkActive).
- ✅ Members + Invitations, Teams, and Roles + Permissions pages built and live-verified (Phase 5).
- ✅ Project **detail** + task **assign/unassign** (Phase 7); **reports** (Phase 6/7); **team detail** +
  member add/remove and **subtasks** UI (Phase 8); **work-log / time-tracking** + **org switcher** (Phase 9);
  **dark-mode theming** via design tokens (Phase 10) — all built and live-verified.
- ✅ **Edit + delete** for projects, tasks, teams and roles (Phase 17) — create/edit share one drawer per
  page; detail pages carry header Edit/Delete; every delete is confirm-gated. Org update/delete is the
  only entity CRUD still missing (needs an org-settings screen).
- ✅ Org portal is feature- and theme-complete. Next work moves to other portals/polish (see START HERE).
- ⬜ Sidebar is inline in the layout (fine); a dedicated sidebar organism is optional.

## Phase 5 — Member (Individual) Portal 🟡 (invitations done)
- ✅ `MemberLayout` shell + Dashboard/Invitations nav (with a pending-invitation badge); `/member` branch
  guarded with `portalGuard('member')`.
- ✅ **My invitations** page (Phase 18) — accept/decline invitations addressed to your email. Also mounted
  at `/organization/invitations`, because invitations are user-scoped, not portal-scoped.
- ✅ Dashboard shows real invitation data instead of the old hardcoded task stats.
- ⬜ Personal task pages (create/subtasks/lifecycle), personal tracking/reports (weekly/monthly/yearly)
  — **backend-blocked**: `CreateTask` requires an `OrganizationId`, so there is no personal-task endpoint.

## Phase 6 — Admin Portal 🟡 (Users done)
- ✅ `AdminLayout` shell (now with Dashboard/Users nav); `/admin` branch guarded with `roleGuard('Admin')`.
- ✅ **User list** page (`GET /user`, AdminOnly) with search + status/account-type filters + stat tiles;
  real dashboard fed from the derived user counts. Feature slice: `admin.models/repository/facade`.
- ⬜ Organizations overview + platform settings — **backend-blocked** (no list-all-orgs or settings
  endpoint; only `GET /organization/mine`). User detail (`GET /user/{id}`) drawer is buildable now.

## Phase 7 — Reporting & Dashboard (headline feature) 🟡 (reports page done)
- ✅ Reports page consuming dashboard summary + member/team/project report endpoints; echarts team
  bar chart, member stat tiles, project completion ring + workload table (fed by the org facade).
- ✅ Date-window (From/To) controls with Week/Month/Year/All presets, reactive via effects.
- ✅ Work-log durations UI (Phase 9) — time-tracking drawer feeds `trackedHours` on dashboard/reports.
- ⬜ Richer per-member trend charts; export (CSV/PDF).

## Phase 8 — Polish & Hardening 🟡 (validation engine done)
- ✅ Custom `shared/validations/` decorator engine (FluentValidation-style) — built + unit-tested + wired
  into the register form. See CONVENTIONS.md "shared/validations engine". Import from `@shared/validations`.
- 🟡 Real unit/component tests — the **whole suite is green (118/118)** after fixing 15 pre-existing specs
  that were missing TestBed providers (APP_SETTINGS / echarts / router / required inputs). 16 engine + 4
  register + 4 admin-users are real assertions; most others are still "should create" (but now actually run).
- ✅ **Dialog confirmations** — `core/services/dialog.service.ts` (sweetalert2) is now theme-aware (reads
  design tokens off `:root`) with a `confirmDelete` helper, and gates every destructive action (member/
  team-member remove, invitation cancel, subtask/worklog delete). See Phase 13 status.
- ✅ **Loading skeletons** — theme-aware `Skeleton` atom (`shared/ui/atoms/skeletons/skeleton/`) over
  `ngx-skeleton-loader`, applied to the users/projects/tasks/members loading states. See Phase 14.
- ⬜ Extend skeletons to the remaining list pages (teams, roles, reports, project-detail, team-detail,
  dashboard); empty states.
- ⬜ Adopt the validation engine in the remaining forms (login + org create-drawers).
- ✅ **Drawer a11y** — `DialogDirective` (`appDialog`) gives all 10 slide-in drawers focus-trap, Escape,
  focus-restore, and `role=dialog`/`aria-modal`/`aria-labelledby`. See Phase 15.
- ⬜ Broader a11y pass (contrast audit, form-label associations, Storybook a11y addon).
- ✅ **Pagination/filtering for list views** — `createPagination()` (`@shared/utils/pagination`) + the
  `Pagination` molecule + the global `.list-toolbar` styles, on the admin-users / tasks / projects /
  members pages. Client-side until the API pages. See Phase 16 status and CONVENTIONS "List pages".
- ⬜ Apply the list pattern to the remaining lists (teams, roles, invitations, project/team detail).
- ⬜ `PagedResponse<T>` envelope support in `core/api` when the API adds pagination (then swap the
  client-side `createPagination` source for a server-driven one).

## Backlog (unscheduled)
- Dark/light theme toggle (theme SCSS exists), i18n, PWA/offline.
- Real-time updates (notifications/activity feed) when the API adds them.
- Report export (CSV/PDF) UI, kanban board view, tags/labels/search UI.
- Lottie onboarding animations (`ngx-lottie` installed), Storybook visual regression, CI/CD.

<!-- Phase ordering rationale: foundation → component library → auth (gate to portals) → public site
     (no auth needed) → organization portal (richest, drives most components) → member/admin portals →
     reporting → polish. Mirrors the backend phases so each frontend phase has a live API behind it. -->
