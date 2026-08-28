# TaskFlow UI — Phases & Status

> Keep the Current Status section up to date at the end of every session.
> The backend (`D:\Projects\TMS\TaskFlow`) and frontend advance together. Planner Phases 17–23 are
> complete end to end, including the hardened production rollout.

## ✅ Planner Phase 23 — Hardening, scale, and production rollout (2026-08-28)

- Coalesces expensive Excalidraw serialization while keeping selection feedback immediate, flushes the
  latest snapshot before project switches/destruction, and reports the shared 5,000-element limit.
- Gates member/admin Planner routes and navigation with the build-time Planner feature flag.
- Detects legacy per-user browser scenes, requires explicit import into a selected cloud project,
  sanitizes embedded binary data, and preserves the original local copy during rollback.
- Adds browser specs for feature routing, scene limits, migration/recovery, and existing autosave,
  conflict, resource, baseline, and comparison flows.

**Delivered evidence:** 240/240 browser specs, production build, lint/design lint, and Storybook build
pass. Backend integration/performance/security evidence and Dokploy rollout are recorded in the shared
ProjectCompletion ledger.

## ✅ Planner Phase 22 — Primary requirements and change comparison (2026-08-28)

- Enabled the Planner Requirements control with irreversible Baseline 1 finalization, immutable
  ordered snapshot inspection, and clear separation between requirement scope and execution progress.
- Added New/Changed/Removed working-change filters, optional reasons, actor/time metadata, and
  field-level baseline/current differences backed entirely by server-authored history.
- Added repository/facade signals for all five baseline/history/comparison APIs and refreshed the
  comparison automatically after Planner-aware work mutations.
- Verified 236/236 frontend specs, production build, lint/design lint, 22/22 backend tests, and EF drift.

## ✅ Planner Phase 21 — Notes, documents, and secure media (2026-08-28)

- Added Note, Link, and Document cards backed by owner-authorized resource records rather than scene JSON.
- Added upload, preview/download, rename, unlink/relink retention, and permanent delete flows with a
  25 MB allowlist, safe names, SHA-256, private object storage, and scan-status hook in the API.
- Enabled Phase 20 Note/Document templates and preserved their immutable presentation snapshots.
- Verified 234/234 frontend specs, production build, lint/design lint, 21/21 backend tests, and EF drift.

## ✅ Planner Phase 20 — Admin-managed template library (2026-08-28)

- Added Admin template management for the five fixed Planner object types with draft, publish,
  published-edit versioning, archive, active state, ordering, fields/defaults, and visual configuration.
- Added a member Planner library that lists published active versions, applies safe defaults, and
  renders linked cards with their snapshotted colors and dimensions. Old cards survive later edits/archive.
- Note and Document templates are visible but disabled until Phase 21 supplies resource records.
- Verified all 232 frontend specs, production build, lint/design lint, Storybook, detector, plus the
  backend's 18 tests and EF model-drift check. Phase 21's secure resources are next.

## ✅ Planner Phase 19 — Linked work objects and live progress (2026-08-28)

- Added stable Project/Task/Subtask cards backed by canonical TaskFlow records rather than scene JSON.
- Added an Add work flow, project/task/subtask forms, a compact inspector, backend-derived status,
  counts and progress, and explicit unlink-card versus delete-record actions.
- Canvas load refreshes business data and restores missing linked cards while preserving Excalidraw
  position, dimensions, connectors, and presentation ownership.
- Verified all 231 frontend specs, production build, lint/design lint, Storybook build, and the
  Impeccable UI detector. The template-library follow-up was delivered in Phase 20.

## ✅ Planner Phase 18 — Cloud persistence and conflict-safe autosave (2026-08-28)

- Replaced the temporary browser-authoritative scene with the owner-authorized Planner board API;
  scene loads, debounced saves, ETags/revisions, and immutable revision history are now wired.
- IndexedDB is retained only as an ordered recovery cache. Offline, failed, unavailable-recovery,
  embedded-file, and stale-revision conflict states have explicit, truthful UI and recovery actions.
- Planner serialization excludes binary files and blocks cloud saves while embedded images remain.
- Verified the complete 230-spec frontend suite, production build, lint/design lint, and Storybook
  build. Backend HTTP/PostgreSQL integration tests cover cross-device restore and concurrency.

## ✅ Phase 32 — Private personal projects + Planner (2026-08-15)

- Individual accounts can create, edit, delete, and search personal projects, then create normal tasks
  and subtasks inside them. The UI intentionally has no team, assignee, member, or organization controls.
- Added **Projects** and **Planner** to the personal workspace header. Planner embeds Excalidraw 0.18.1
  as a lazy route and autosaves per signed-in user in that browser for this first integration phase.
- Privacy is structural rather than cosmetic: personal projects use `organizationId: null`, ownership is
  taken from the JWT, and joining an organization never changes or exposes personal data.
- Verified production build + lint. Live API checks covered project → task → subtask linkage, anonymous
  denial, creator-only listings, and bidirectional cross-user reads returning 403.

## ✅ Phase 31 — Joined organization workspaces for Individual accounts (2026-08-15)

- Individual accounts still land in the personal portal, but may now enter the organization portal
  for workspaces they own or joined through an invitation.
- The personal header exposes **Workspaces** when memberships exist; the organization sidebar exposes
  **Personal workspace** for Individual accounts. Accepting an invitation refreshes membership state
  immediately without changing account type or mixing personal tasks into organization data.
- Direct organization navigation with no membership shows an honest invitations/personal-workspace
  recovery state instead of the Organization-account creation form.
- Added portal-policy regression coverage. Lint, design lint, production build, and all 16 focused
  browser specs pass. A broader run passed 215/215 specs after excluding the four-test public-header
  spec whose real navigation deliberately triggers Karma's existing full-page-reload disconnect.

## ✅ Phase 30 — Account recovery & email-code sign-in (2026-08-14)

- Personal, organization, and admin login variants now switch between password and email-code
  sign-in without changing the authoritative post-login role/account routing.
- Added `/auth/forgot-password` with generic email submission, six-digit code entry, strong and
  confirmed new-password validation, resend cooldown, error/retry states, and safe return to the
  login variant that opened it.
- Consumes the API's four new auth endpoints. Coverage **80/82 → 84/86**; the same two deliberate
  read-endpoint skips remain. `ng build`, lint, and design lint pass. Karma bundles successfully,
  but sandboxed Chrome crashes before executing specs because its GPU sandbox cannot initialize.

---

## ▶ NEXT SESSION — START HERE (**every API endpoint is consumed** — Phases 26–29 closed the last four)

**All three portals plus account recovery are complete.** The API surface and the UI now match exactly:

| Acceptance | Status |
|---|---|
| API coverage | **80 of 82** endpoints wired — everything except the 2 long-standing **deliberate skips** (`GET /task/mine`, `GET /worklog/mine`; both would be a third rendering of data already on screen). Nothing is unconsumed for want of a screen. |
| Lint | **`npx ng lint` passes with zero errors.** |
| Build | `ng build` passes. |
| Unit tests | **204/204 green.** |
| a11y | Every live template lint-clean; all 42 token contrast pairings meet AA in both themes (`npm run a11y:contrast`). |
| Loading states | Content-shaped `Skeleton` on every page that loads data. |
| List pages | `.list-toolbar` + `createPagination` + `<app-pagination>` on every list. |
| Forms | Every reactive form validates through the `@shared/validations` decorator engine. |

**→ Read [V1-GAPS.md](V1-GAPS.md) before picking anything up.** §1 (backend-blocked) and §2 (backend
defects) are **empty**. The only backend gap left anywhere is **forgot-password**, and it blocks no
built screen. Remaining work is all §3 (deferred v1.x): **CSV/PDF report export** is the highest-value
item, then the **calendar page** (Phase 25, still open), per-member trend charts, and E2E tests.

**Phases 24–29 status:** 26, 27, 28, 29 are **done** (below). **24** (report export + member trend
charts) and **25** (calendar page) remain — both need zero backend work.

**No re-explaining needed.** Org portal is feature/theme-complete (Phases 8–10); Admin has a live Users
page + dashboard (Phase 11); the **`shared/validations/` engine** is built (Phase 12) and now backs
**every** form (Phase 22); **confirm dialogs** gate destructive actions (Phase 13); **loading skeletons**
(Phases 14, 22) cover every data-loading page; an **accessible-drawer directive** (`appDialog`) gives
every slide-in drawer focus-trap + Escape + `role=dialog` (Phase 15); **client-side pagination + list
filtering** ship on every list (Phases 16, 22); **edit + delete** exist for projects, tasks, teams and
roles (Phase 17); the **invitation flow works from both sides** (Phase 18); an **org settings page**
closes the last entity CRUD gap (Phase 19); the **admin user-detail drawer + subtask rename** close the
last two reachable endpoints (Phase 20); the **a11y pass** is done (Phase 21); and the **v1 completion
pass** removed the dead code and made lint clean (Phase 22).

**Before building:** run the API (`https://localhost:7086/api`), dev server on **4200**, accept the
self-signed cert once at `https://localhost:7086`. Test org = **Northwind Labs (orgId 2)**, owner
**nadia.owens+org1@taskflow.test / Passw0rd!** (org login variant `/auth/organization`). Active member
seeded: **Jane Doe (userId 2, Manager)** — on the **Engineering** team (teamId 2); taskId 3 has a 2.5h
work log. BCrypt is slow (~5s) — one login at a time. Admin portal test login = **admin@taskflow.com /
Admin@123** (seeded Individual/Admin → `/admin`, variant `/auth/admin`). See
[[taskflow-api-integration-gotchas]] memory for the recurring traps (raw-vs-enveloped responses,
email-verify DB step, org-seeds-no-roles).

### Still open / blocked
> Now maintained in full in **[V1-GAPS.md](V1-GAPS.md)**. Kept here for continuity:
- **Backend gap flagged (separate session/repo): `GET /user/{id}` has no Admin bypass.** The query is
  marked `IUserScopedRequest`, so `AccessGuardBehavior` runs `EnsureUserAsync`, which permits only
  **yourself** or someone who **shares an organization** with you. The seeded platform admin belongs to no
  organization, so it can list every account (`GET /user` is AdminOnly) but **open none** — the two
  authorization models disagree. The admin user-detail drawer is built and works for a permitted caller
  (verified on the admin's own row); it needs an Admin short-circuit in the guard to be usable across the
  platform portal.
- **Backend gap flagged (separate session/repo): no authorization on org update/delete.**
  `AccessGuardBehavior` only gates requests marked with the read-side scoped interfaces;
  `UpdateOrganizationCommand`/`DeleteOrganizationCommand` are unmarked and their handlers check only
  existence — so **any authenticated user can rename or delete any organization by id**. The frontend
  gates on ownership (usability only, not a security boundary). Needs an ownership check in the handlers
  or `IOrganizationScopedRequest` on the write side.
- **Backend gap flagged (separate session/repo):** `POST /worklog/manual` returns a generic **500** when
  domain validation fails (e.g. end time in the future) — domain `ArgumentException` isn't mapped to 400
  in the API middleware. The frontend guards the future-time case client-side; the backend should still
  map it. See `TaskFlow.Domain/.../TaskWorkLog.cs` (LogManual).
- **Member (Individual) portal is backend-blocked**: no personal-task create endpoint (`CreateTask` needs
  a non-null `OrganizationId`). Don't build it until the backend adds one — flag it, don't fake it.

> ⚠️ The three items above are now **resolved** (Phase 9, both sides) — kept as historical continuity
> notes per the section header. The Member portal shipped in Phase 23. The remaining backend gaps are
> tracked below and in the backend's own `docs/PHASES.md` Phases 10–13.

---

## ▶ PLANNED — Path to 100%: Organization, Reporting, Admin (Phases 24–29)

> Individual is complete (Phase 23). **Phases 26, 27, 28 and 29 are now DONE** — see the Current
> Status entry below. **Phases 24 and 25 remain**, and neither needs any backend work.

### Phase 24 — Reporting export + trend charts (⬜ STILL OPEN, zero backend dependency)
From V1-GAPS §3 — the reports page already holds every figure it needs.
- **24.1 CSV / PDF export** — an Export button on the reports page. CSV is a client-side serialization of
  the data already on screen (dashboard summary, member report, team performance, project report); PDF
  can be a print-stylesheet (`window.print()` scoped to the report panel) or a lightweight lib if the
  print approach doesn't look right. **Highest-value item in the whole v1.x backlog.**
- **24.2 Per-member trend charts** — `GET /report/member/{id}?from&to` already exists; loop it over
  weekly/monthly buckets and render a line chart with the existing `ngx-echarts` setup (already used for
  the team-performance bar chart).

### Phase 25 — Calendar page (⬜ STILL OPEN, zero backend dependency)
- The org sidebar still has a `disabled` "Coming soon" nav item. Tasks already carry `startDate` +
  `expectedCompletionDate` from the list/detail DTOs — enough for a month-grid view with tasks plotted on
  their due date. Route at `/organization/calendar` following the existing feature-page conventions.

### Phase 26 — Admin drawer unblock + member-removal copy ✅ **DONE**
- **26.1** `EnsureUserAsync` now short-circuits for a platform admin. **Verified on the backend side:
  admin → `GET /user/2` = 200** (was 403). This needs **no frontend code change** — do a live pass
  confirming the drawer opens for any user, then delete the `selectedUserDenied` branch and its
  denied-state template, which is now dead code.
- **26.2** `RemoveMember` now really removes (verified: the member vanishes from the list, 2 → 1);
  `DeactivateMember` stays a reversible toggle (member stays listed as Inactive). Update the
  members-page confirm copy for "Remove" back to describing a **real removal** — it currently says
  "will be marked inactive" as an honest workaround for the old collapsed behaviour.
- Org update/delete authorization needed **no frontend change** — the UI's ownership gate was always a
  usability affordance; there is a real 403 behind it now.

### Phase 27 — Admin: Organizations + Platform Settings ✅ **DONE**
The biggest remaining gap in the ledger. The admin dashboard's "backend-blocked" copy is now stale.
- **27.1 Admin → Organizations page** (`/admin/organizations`) — consume **`GET /admin/organizations`**
  (AdminOnly). Returns `{ id, name, description, ownerUserId, ownerFullName, ownerEmail, status,
  memberCount, projectCount, taskCount, createdAt }[]`. Mirror the existing Users page exactly: stat
  tiles, search, status filter, `createPagination` + `<app-pagination>`, `Skeleton` loading state. New
  `admin.repository.ts` method + `AdminFacade.organizations` signal + a DTO in `admin.models.ts`.
- **27.2 Admin → Platform Settings page** (`/admin/settings`) — consume **`GET`/`PUT /admin/settings`**.
  Shape: `{ id, applicationName, supportEmail, registrationOpen, maintenanceMode, maintenanceMessage,
  createdAt, updatedAt }`. `PUT` takes all five editable fields and returns 204. One reactive form
  through `@shared/validations`, same shape as the org settings page (Phase 19). **Both flags are really
  enforced** by the API (registration → 403 `REGISTRATION_CLOSED`; maintenance → 503 for non-admins), so
  the form is not cosmetic — say so in the UI copy.
  - ⚠️ **Worth handling:** with maintenance on, every non-admin request returns **503
    `MAINTENANCE_MODE`** with the admin's message. Consider surfacing that in `errorInterceptor` as a
    banner rather than a generic toast.
- Remove the "coming soon / backend-blocked" copy on the admin dashboard once both land.

### Phase 28 — Team-scoped tasks + role-filtered assignment ✅ **DONE**
Closes the Organization vision gap: "tasks and reports can be viewed per team."
- **28.1** Consume **`GET /team/{teamId}/tasks`** → the standard `TaskListItem[]`. Add a **Tasks** panel
  to `team-detail-page` alongside the member list, reusing the org tasks-page row markup.
- **28.2** Task create/edit: **`POST /task` now accepts an optional `teamId`**. For *changing* the team
  on an existing task, use the dedicated routes — **`PUT /task/{taskId}/team/{teamId}`** to set and
  **`DELETE /task/{taskId}/team`** to clear. ⚠️ **`PUT /task` (update) deliberately does NOT carry
  `teamId`** — the backend kept it off the update command precisely so a form save can't blank it, the
  same trap that already bit task `description` (Phase 17). Don't try to add it to `TaskFormModel`'s
  save payload; call the dedicated route instead.
- **28.3** Assignee filtering: **`GET /organizationmember/organization/{id}?organizationRoleId=&activeOnly=`**.
  Verified: `activeOnly=true` narrowed 2 → 1; `organizationRoleId=2` → 2; a role nobody holds → 0. Add a
  role filter beside the assignee `<select>`, and pass `activeOnly=true` for assignee pickers — an
  inactive member should never be a candidate.
- `TaskListItem` and `TaskDetail` now both carry **`teamId` + `teamName`**, so a team column needs no
  extra request.

### Phase 29 — Reporting depth ✅ **DONE**
- **29.1** Priority breakdown — `DashboardSummaryDto` now carries `lowPriorityTasks`,
  `mediumPriorityTasks`, `highPriorityTasks`, `criticalPriorityTasks`. Render like the existing
  status donut.
- **29.2** Project timeline — `ProjectReportDto` now carries `startDate`, `expectedCompletionDate`,
  `actualCompletionDate`, `firstTaskStartDate`, `lastTaskCompletionDate`. Render a planned-vs-actual
  date-range bar (not a full Gantt — v1.x scope).
- **29.3** "Which tasks" per team — `TeamPerformanceReportDto` now carries a **`tasks[]`** array of
  `{ taskId, title, status, priority, startDate, actualCompletionDate, assignedToUserId,
  assignedToFullName, trackedHours }`. Extend the team-performance table with an expandable task list.
  - ⚠️ Note the two numbers measure different things: the aggregate counts are based on the team's
    *members*, while `tasks[]` lists what the team *owns* (`Task.TeamId`). They can legitimately differ
    — label them so the difference doesn't read as a bug.

### Remaining order
Only **24** and **25** are left; take them in either order. Neither touches the backend.

### Test data already in place
Backend verification left **task 3 ("Build the responsive nav bar") assigned to team 2 (Engineering)**
in org 2, so `GET /team/2/tasks` returns a real row. Clear it with `DELETE /api/task/3/team` if you
want a pristine seed. Platform settings are seeded at defaults (`TaskFlow`, registration **open**,
maintenance **off**) with `supportEmail` now set to `support@taskflow.com` by the Phase 27 live pass.

---

## Current Status (2026-07-26, Phases 26–29 — **Admin + Organization**: the last unconsumed endpoints)
- ✅ **Endpoint consumption is now 74 → 80 of 82** (re-derived from the controllers and the `API` map,
  not incremented by hand). The only two left are the standing deliberate skips — `GET /task/mine` and
  `GET /worklog/mine`. Suite **179 → 195 green**; `ng lint` still **0 errors**; `ng build` passes.
- ✅ **Phase 26 — admin drawer unblocked.** `EnsureUserAsync` now short-circuits for a platform admin,
  so the `selectedUserDenied` signal, its template branch and its `.denied` styles were **deleted as
  dead code**. Verified live: as `admin@taskflow.com`, opening **Jane Doe (userId 2)** — a user the
  admin shares no organization with — renders the full drawer (was 403 before). A failure now closes
  the drawer rather than parking it on a skeleton. The members-page **Remove** copy went back to
  describing a **real removal** and points at Deactivate for the reversible option.
- ✅ **Phase 27.1 — Admin → Organizations** (`/admin/organizations`, 4 files) on `GET
  /admin/organizations`. Stat tiles (organizations / active / projects and tasks platform-wide),
  search across name + owner + owner email, status filter, `createPagination` + `<app-pagination>`,
  `Skeleton` rows, and a read-only detail drawer. **No second request to open a row** — the list DTO
  already carries owner, counts and `createdAt`. Verified live against 2 real orgs.
- ✅ **Phase 27.2 — Admin → Platform Settings** (`/admin/settings`, 4 files) on `GET`/`PUT
  /admin/settings`, validated through a new `admin.form-models.ts` (`PlatformSettingsFormModel`). The
  save sends **all five fields** — the command is not partial, so omitting one would blank it — and
  blank optional strings go back as `null`. Verified live: `PUT 204` → re-read → `updatedAt` moved and
  the support email persisted; a malformed address renders the `@Email` decorator's message and
  disables Save.
- ⚠️ **Maintenance mode found a real lie in sign-in.** `POST /auth/login` is exempt from the
  maintenance middleware but the `GET /user/me` that follows is not — so a non-admin authenticated
  **successfully** and was then told *"Check your credentials and try again."* `AuthFacade` now
  inspects the status and names maintenance instead. Verified live at both ends.
- ✅ **503 `MAINTENANCE_MODE` gets a banner, not a toast.** New `core/services/maintenance.service.ts`
  + a sticky banner at the **app root** (so it shows in every portal); `errorInterceptor` records the
  state instead of firing one toast per failed request, and any successful response clears it.
  Verified by really enabling the flag: org user → 503 with the admin's own message rendered in the
  banner, admin → 200 throughout. **Flag restored to off.**
- ✅ **Phase 28 — team-scoped tasks + role-filtered assignment.** `team-detail-page` gained a **Team
  tasks** panel on `GET /team/{id}/tasks` (search + status filter + pager + remove-from-team). The
  tasks page and project-detail drawer gained an **owning team** field; `TaskListItem`/`TaskDetail`
  carry `teamId`/`teamName`, so the row renders a team `<select>` with no extra request. Verified live:
  `PUT /api/task/2/team/2 → 204` and `DELETE /api/task/2/team → 204`, both reflected in the UI.
- ⚠️ **`PUT /task` carries no `teamId` on purpose** — the backend kept it off the update command so a
  form save can't blank it (the trap that bit `description` in Phase 17). `submit()` therefore calls
  the dedicated route, and **only when the value changed**, so an ordinary save fires no second request.
- ✅ **Assignee pickers are server-filtered.** A second signal, `assignableMembers`, is fed by
  `?activeOnly=true` and narrowed by `?organizationRoleId=` from a new toolbar select — kept separate
  from `members` (the members page deliberately manages inactive rows). Verified live: the network log
  shows `?activeOnly=true` on load and `?organizationRoleId=2&activeOnly=true` on filter. The row
  `<select>` re-adds the **current** assignee when the filter excludes them, so an assigned task never
  renders as "Unassigned".
- ✅ **Phase 29 — reporting depth.** A **priority donut** beside the status one on the org dashboard
  (verified: High **2**, matching the summary DTO); a **planned-vs-actual timeline** on the project
  report (two bars over one shared span, open-ended ranges faded, a "Finished after target" badge only
  when a *finished* run overran); and an **expandable task list** per team on the performance table.
- ⚠️ **The team report's two numbers legitimately disagree** — `tasksAssigned/Completed` aggregate over
  the team's **members**, `tasks[]` is what the team **owns**. Live data shows Completed **0** next to
  **1** owned task, so the drill-down carries a note saying which is which.
- ✅ **`OrganizationStatus` moved to `shared/models`** (with its meta + tone map), re-exported from both
  `organization.models` and `admin.models` — the third enum after `Tone` and `InvitationStatus` that
  two features need. Every existing import still resolves.
- ✅ **Verified live in both themes** across the admin portal (organizations, settings, users drawer)
  and the organization portal (dashboard donuts, tasks, team detail, reports). No console errors. All
  test data restored: task 2 off its team, maintenance off.
- ✅ **Follow-up fix — feature state no longer outlives a session.** A reported 403 on the reports page
  turned out to be an admin token in the browser (two tabs share one `localStorage`), *not* an endpoint
  fault — all 28 org GETs return 200 for the owner. But it surfaced a real bug: the facades are root
  singletons whose `init()` no-ops once `_loaded` is true, and nothing cleared them on logout, so a
  second account inherited the first's data. New `core/auth/session-reset.ts` →
  `resetOnSessionChange()`, called by the organization, admin and member facades. Suite **195 → 198**.
- ⏭️ **Next:** Phases **24** (CSV/PDF report export + per-member trend charts) and **25** (calendar
  page). Both are pure frontend. Backend-side only **forgot-password** remains, and it blocks nothing.

---

## Current Status (2026-07-26, Phase 23 — **Member portal**: the Individual account, end to end)
- ✅ **The Individual account is now complete on both sides.** Backend Phase 9 unblocked it
  (`POST /task/personal`, `GET /report/me`, `PUT /task/{id}/reopen`, `POST /auth/verify-email`), and this
  phase built the whole client half. Endpoint consumption **68 → 74 of 76**; suite **164 → 179 green**;
  `ng lint` still **0 errors**; all 42 contrast pairings still AA.
- ✅ **New `my-tasks-page`** (`/member/my-tasks`, 4 files) — the personal workspace. Search + status +
  priority filters with `createPagination`, a create/edit drawer, Start / **Done** / **Reopen** on the
  row, a **subtask drawer** (add, inline rename, tick to complete, delete) and a **time-tracking
  drawer** (live timer + manual entry + history). It follows the org tasks-page patterns exactly, minus
  everything an organization owns: no project, no assignee, no assignment column.
- ✅ **Member dashboard is real data now.** It previously showed "My Tasks — coming soon". It now
  renders live counts off the personal task list (active / completed / overdue / tracked) plus a
  **`GET /report/me`** panel with week / month / year presets. Nothing is hardcoded — an empty
  workspace shows zeros and a "create your first task" card.
- ✅ **New `verify-email-page`** (`/auth/verify-email`, 5 files) — lands from the link in the welcome
  email, verifies automatically, and offers **resend** when the link is missing or expired. **Register
  now redirects here instead of to the sign-in form**, which could not have worked: a new account is
  PendingVerification until the link is opened.
- ✅ **Member data layer** — `member.models.ts` (re-exports the task DTOs from `organization.models`
  rather than duplicating them, plus `PersonalTaskReport`), `member.form-models.ts` (own decorated
  models: a personal task has no project or assignee, so sharing the org model would invite fields the
  API rejects), and the repository/facade grown with personal tasks, subtasks, work logs and the report.
- ⚠️ **The new page immediately found two real bugs**, both pre-existing:
  1. **`POST /worklog/start` 500'd** when notes were empty — `TaskWorkLogs.Notes` was NOT NULL in the DB
     while the domain wrote `notes?.Trim()`. The org portal never hit it because its form always sent a
     string. Fixed in the backend (`string?` + `IsRequired(false)` + migration `MakeWorkLogNotesNullable`).
  2. **`.badge[data-tone]` was copied into six org page stylesheets and defined nowhere globally**, so
     the new page rendered white-on-transparent — invisible in light mode. Moved into the global
     `styles/components/_badge.scss`; the six local copies now simply override it with identical values.
- ⚠️ **Tracked hours rendered as `2.505008592222222h`.** The API returns a raw double. Added
  `| number: '1.0-1'` on the member dashboard **and** the four org places with the same defect.
- ✅ **Verified live as a brand-new account created through the real sign-up form**: register → the
  verify page → email link → "Email verified" → sign in → create tasks → Start → Done → **Reopen** →
  subtask ticked and the parent auto-completed (1/1) → timer start/stop → manual 2h30m entry →
  dashboard showed **2.5h tracked**. Checked in light *and* dark.
- ⏭️ **Next:** the remaining V1-GAPS §3 items — CSV/PDF export, the calendar page, richer trend charts,
  E2E tests. Backend-side, the §3.0 vision gaps and defects §4.2/§4.3/§4.4 remain.

## Current Status (2026-07-26, Phase 22 — **v1 completion pass**: dead code, skeletons, lists, validation)
- ✅ **v1 is complete.** This phase closed every item left in the "Polish & Hardening" bucket, so the
  frontend now matches the API surface end to end. `npx ng lint` **passes with zero errors** (71 → 46 →
  **0**), `ng build` passes, suite **152 → 164 green** (+12 new, −46 belonging to deleted components).
- ✅ **Deleted the 9 dead `*-molecule` components** — `task-detail-modal`, `view-project-modal`,
  `create-project-modal`, `notification-pop-up`, `project-overview`, `deadline`, `recent-activity`,
  `donut-chart` and `bar-chart` (Phase 21 flagged 8; `bar-chart-molecule` proved equally dead — the
  reports page uses `ngx-echarts` directly). Each selector *and* class name was grepped first; nothing
  rendered them. They held **all 27 remaining a11y lint errors**, which is why lint is now clean.
- ✅ **Skeletons everywhere a page loads data.** Added content-shaped `Skeleton` states to **teams**
  (6 card skeletons), **roles** (6 cards), **project-detail** (header + 5 table rows), **team-detail**
  (header + 4 member rows), **settings** (two-panel form shape), the **org dashboard** (4 stat tiles + 4
  recent-project rows) and **reports** (chart + table block, member tiles, project ring). No page is left
  on a text or Lottie loading state. Two of these fixed a real lie: the dashboard's recent-projects panel
  and the reports team panel both showed their **empty state** while still loading, i.e. "No projects
  yet" on a workspace that has projects.
- ✅ **The list pattern now covers every list.** Search + `createPagination` + `<app-pagination>` on
  **teams** (name/description, 9/page), **roles** (name/description, 9/page), **project-detail tasks**
  (title search + status filter, 10/page), **team-detail members** (name/email, 10/page), and a pager on
  the **pending-invitations** panel (5/page, shown only when it overflows — the panel is short by nature,
  so a search box there would be noise).
- ✅ **Every form now validates through `@shared/validations`.** New
  `features/organization/organization.form-models.ts` holds one decorated model per *concept* —
  `OrganizationFormModel`, `OrganizationSettingsFormModel`, `ProjectFormModel`, `TaskFormModel`,
  `SubTaskFormModel`, `ManualWorkLogFormModel`, `TimerNotesFormModel`, `TeamFormModel`, `RoleFormModel`,
  `InviteFormModel` — plus `features/auth/login-page/login-page.model.ts`. They live at the **feature**
  level, not per page, because the task drawer exists on both `tasks-page` and `project-detail-page` and
  the team drawer on both `teams-page` and `team-detail-page`; one model per concept stops the copies
  drifting. All inline `Validators.*` are gone from the org portal and login (10 files), and templates
  render `fieldError('x')` instead of hand-written strings — so a message now lives next to the rule.
- ⚠️ **A `@MaxLength` message that never showed is a rule that isn't really enforced.** Most drawers
  validated `maxLength` but only rendered a "required" message, so overrunning the limit silently
  disabled submit with no explanation. Every field with a rule now has a message slot.
- ✅ **Lint is clean for the first time** — beyond the deleted molecules: `Button`/`SignInButton` had an
  `@Output() click`, which **shadows the native DOM event and fires the handler twice**; renamed to
  `buttonClick` (neither is rendered anywhere, so nothing broke). `Button`'s `any` icon inputs became
  `Type<unknown>`, and `pagination`'s `let end` became `const`.
- ✅ **Resolved the 7 `layouts → features` boundary errors properly rather than by suppressing them.**
  Portal shells legitimately render feature state (the org switcher, the invitation badge, sign-out). A
  new **`feature-api`** element type in `eslint.config.js` matches only `features/*/*.{facade,models,
  form-models}.ts` and is declared *before* `features` so it wins first-match — layouts may import a
  feature's facade and DTOs, but still **cannot** reach a page, a route file or a repository. The fitness
  function survives; it just states the real rule.
- ✅ **New `docs/V1-GAPS.md`** — the single honest list of what v1 excludes, grouped by *why*:
  backend-blocked (§1), backend defects for the API repo (§2), deferred v1.x work (§3), non-goals (§4).
- ✅ **Verified**: `ng lint` 0 errors, `ng build` passes, **164/164** unit tests (new specs cover teams /
  roles / project-detail / team-detail filtering, the login model's messages, and that project-detail
  still fetches the description before an edit). Live on the dev server: the sign-in form renders
  `"Enter a valid email address."` **from the `@Email` decorator** on a malformed address.
- ⏭️ **Next:** post-v1 — start from [V1-GAPS.md](V1-GAPS.md) §3. CSV/PDF report export is the
  highest-value item, then the calendar page and richer member trend charts. §1 and §2 need backend work.

## Current Status (2026-07-26, Phase 21 — Accessibility pass: contrast, keyboard, semantics)
- ✅ **Every live template is now a11y-lint clean.** `npx ng lint` went **71 → 46** problems; all 52
  a11y errors in shipped code are gone. The 27 that remain are entirely inside **8 dead
  `*-molecule` components** that nothing renders (see below) — no live page or layout has one.
- ✅ **Drawer backdrops became labelled `<button>`s** (12 of them, across projects / teams / members /
  roles ×2 / tasks ×3 / team-detail ×2 / project-detail ×2, plus admin users). A `<div (click)>` backdrop
  is invisible to the keyboard; each now carries a purpose-specific label ("Close permissions editor",
  "Close time tracking"). One global reset in `styles/components/_modal.scss` strips the UA button chrome,
  so no page needed its own rule.
- ✅ **The register account-type toggle got real radio semantics.** It claimed `role="radiogroup"` but its
  children were `aria-pressed` buttons — a screen reader announced a radio group containing two
  independent toggles. Now `role="radio"` + `aria-checked`, a **roving tabindex** (the group is one Tab
  stop) and **arrow keys that move selection *and* focus** per WAI-ARIA APG. The heading above it stopped
  being a `<label>` (it names a group, which `<label for>` can't target) and became a span +
  `aria-labelledby`. Verified live: ArrowRight flipped `aria-checked`, moved focus, and carried the
  tabindex with it.
- ✅ **Contrast audit — and it found real failures.** `npm run a11y:contrast`
  (`scripts/a11y-contrast.mjs`) **parses the actual token values out of `_light.scss` / `_dark.scss`** —
  it holds no copy of its own — and checks 21 pairings per theme, exiting non-zero on a failure. First
  run: **9 failures, all in light mode.** Dark was already compliant.
- ✅ **What failed and what changed** (light theme only; dark was fine and is untouched apart from
  `--text-subtle`):

  | Token | Was | Now | On `--surface` |
  |---|---|---|---|
  | `--warning` | `#f59e0b` | `#96530b` | 2.15 → **5.93** |
  | `--success` | `#10b981` | `#047857` | 2.54 → **5.48** |
  | `--info` | `#3b82f6` | `#1d4ed8` | 3.68 → **6.70** |
  | `--danger` | `#ef4444` | `#c81e1e` | 3.76 → **5.74** |
  | `--text-subtle` | `#878da0` | `#6b7180` | 3.31 → **4.88** |

  The 500-weight hues simply cannot pass AA as text on white, so **every status badge in the app was
  failing** (the warning badge sat at 1.93:1). They're used as text in 75 places and as a fill in only 7,
  all paired with white text — which the darker values *improve*. Dark-mode `--text-subtle` also moved
  `#6f7488 → #7d8296` (3.94 → 4.79).
- ✅ **New `--border-input` token** (`#848da0` light / `rgba(255,255,255,.34)` dark, both ≥3:1). WCAG
  1.4.11 wants 3:1 for a control's boundary, but `--border` is 1.18:1 — correct for a *decorative*
  divider, wrong for the only thing outlining an input. Splitting it fixed all 11 `.form-control`
  definitions + the shared `.list-search` / `.list-filter` without darkening every card edge. The stale
  global `_input.scss` (still on pre-token `$border-light` / `$primary-500` SCSS variables) was rewritten
  onto tokens at the same time. **All 42 pairings now pass.**
- ✅ **Storybook a11y** — the addon was already installed and registered; it now runs at
  `a11y: { test: 'error' }` in `.storybook/preview.ts`, so an axe violation **fails** a story instead of
  merely annotating it.
- ⚠️ **8 dead `*-molecule` components found** — `task-detail-modal`, `view-project-modal`,
  `create-project-modal`, `notification-pop-up`, `project-overview`, `deadline`, `recent-activity`,
  `donut-chart` (all with the `-molecule` suffix). Grepping each selector *and* class name matches only
  its own 5 files: nothing renders them. They're pre-restructure scaffold, they violate the naming
  convention, and they hold **all 27 remaining a11y errors**. Flagged for deletion rather than spending
  the pass polishing code nobody runs.
- ✅ **Verified live in both themes**: badges/inputs on the admin users page (computed
  `--success #047857`, search border `#848da0`), the register radiogroup keyboard behaviour, and a
  converted drawer backdrop (`BUTTON`, `aria-label="Close team form"`, border `none`) still closing on
  click with `appDialog`'s `role=dialog` / Escape intact. `ng build` passes; suite **198/198 green**.
- ⏭️ **Next:** delete the dead molecules (chip raised); extend the `Skeleton` atom + the list pattern to
  the pages still on text/Lottie loading states (teams, roles, reports, project-detail, team-detail,
  invitations); adopt `@shared/validations` in the login + org create-drawer forms. Then reporting export
  (CSV/PDF) and the auth leftovers (forgot-password, surfacing login errors).

## Current Status (2026-07-26, Phase 20 — Admin user-detail drawer + subtask rename)
- ✅ **Every endpoint the backend actually exposes to the UI is now wired.** Coverage **66/71 → 68/71**;
  the remaining 3 are the personal-task/work-log "mine" reads, which stay **backend-blocked**.
- ✅ **Subtask rename (`PUT /subtask`)** — the subtask drawer's rows gained a pencil that swaps the row
  into **inline edit** (its own `subTaskEditForm`, so the Add box is untouched), with a green save, a
  cancel, and Escape-to-cancel. New `OrganizationFacade.renameSubTask()` reuses `afterSubTaskChange`, so
  the list and the row's `n/m` badge refresh together. Closing the drawer cancels a pending rename.
- ✅ **Admin user-detail drawer (`GET /user/{id}`)** — clicking a row on `/admin/users` opens a drawer
  (`appDialog`, so focus-trap + Escape come free) with the fields the list DTO doesn't carry: phone,
  email-verified, last login, registered date, first/last name. `AdminFacade` gained
  `selectedUser`/`selectedUserId`/`detailLoading` + `selectUser`/`clearSelectedUser`; the loading branch
  uses the `Skeleton` atom. A `.drawer-note` states it is read-only (`UserController` has no PUT/DELETE).
- ✅ **Rows became `<button>`s, not `<div>`s** — the whole row is now keyboard-reachable with Enter/Space
  and a visible `:focus-visible` ring, which is also what the a11y lint rules want. The skeleton
  placeholder rows keep their original padding via `.user-row.sk-row`.
- ⚠️ **Backend finding: `GET /user/{id}` refuses the admin.** Clicking another user as
  **admin@taskflow.com** returned *"You do not have access to this resource."* The query is marked
  `IUserScopedRequest`, and `EnsureUserAsync` allows only **yourself or someone who shares an
  organization** with you — there is **no Admin bypass**, so the AdminOnly list and the scoped detail
  disagree. Rather than paper over it, the drawer now has a **denied state** that names the exact guard
  and what needs to change; `selectUser`'s error path sets `selectedUserDenied` instead of silently
  closing. Confirmed the endpoint and the drawer are otherwise correct by opening the **admin's own row**
  (`GET /user/1 → 200`), which renders every field.
- ✅ **Verified live**: as the org owner, added a subtask to taskId 3, renamed it inline
  (`PUT /api/subtask 204`, "Subtask renamed." toast, list reloaded with the new title — the delete
  confirm then quoted the *renamed* title, proving it persisted), then deleted it to restore seed state.
  As admin: own row → full drawer; Jane's row → the denied state. Checked in **dark mode**. `ng build`
  passes; suite **198/198 green** (+7).
- ⏭️ **Next:** no wiring work remains — move to the **broader a11y pass** (contrast audit, form-label
  associations, Storybook a11y addon), extend the `Skeleton` atom + the list pattern to the remaining
  pages (teams, roles, reports, project-detail, team-detail, invitations), and adopt the validation engine
  in the login + org create-drawer forms. Then reporting export (CSV/PDF) and the auth leftovers.

## Current Status (2026-07-26, Phase 19 — Organization settings: rename + delete)
- ✅ **The last entity CRUD gap is closed.** New `settings-page` (4 files) at `/organization/settings`,
  plus `getOrganization`/`updateOrganization`/`deleteOrganization` through repository → facade → UI, and
  an `OrganizationDetail` DTO + `UpdateOrganizationPayload` + `organizationStatusMeta` in the models.
  Endpoint coverage **63/71 → 66/71** (`GET /organization/{id}`, `PUT /organization`, `DELETE /{id}`).
- ✅ **The page has three panels**: **General** (a reactive form for name ≤200 / description ≤1000,
  mirroring `UpdateOrganizationCommandValidator`, with Save + Discard that stay disabled while pristine),
  **Details** (read-only status badge, active member count, created date, owner, org id), and a
  **Danger zone** (owner-only) for delete. A `.drawer-note` explains that status isn't editable — the
  API's update command takes only name + description.
- ⚠️ **Same data-loss trap as Phase 17, one level up:** `OrganizationListItem` (`/mine`, what the sidebar
  switcher holds) carries **no `description`**, but `UpdateOrganizationCommand` requires one — a form
  filled from the switcher would have blanked every org's description on the first rename. The page loads
  `GET /organization/{id}` and fills from that instead. Covered by a unit test.
- ✅ **Reactive to the org switcher.** An `effect()` on `currentOrgId()` reloads the detail, so switching
  workspaces re-points the whole page. After a save the facade re-fetches the detail **and** `/mine` (the
  sidebar renders the name from the list DTO, so refreshing only the detail would leave it stale) —
  `refreshOrganizations()` updates `_currentOrg` in place rather than re-forkJoining all seven org lists.
- ✅ **New `DialogService.confirmTyped()`** — type-to-confirm (SweetAlert `input` + `preConfirm`) for the
  one action where a single click was too cheap. The user must type the organization's name; the message
  names the real consequence from the dashboard summary ("3 project(s), 12 task(s)… will be deleted").
  Delete resets every org-scoped signal, clears `tf_org_id`, re-resolves `/mine`, and navigates to the
  dashboard on success only.
- ✅ **Verified live end-to-end** as the org owner: settings loaded with the **description** populated
  (proving the detail fetch); renamed to "Northwind Labs Ltd" → `PUT /api/organization 204` → sidebar
  switcher, page subtitle and danger-zone copy all updated and the **description survived**; renamed back.
  Then created a throwaway org via the API, **switched to it in the switcher** (page reloaded reactively,
  showing org #3), hit Delete → typed a wrong name and got "Doesn't match." → typed the right one →
  `DELETE /api/organization/3 204` → "Organization deleted." toast, navigated to the dashboard, and the
  portal **fell back to Northwind Labs with its own data reloaded**. Checked in light + dark, and at 375px
  (single column, no horizontal overflow). No console errors. `ng build` passes; suite **191/191 green**
  (+7). The non-owner path (disabled form, no danger zone) is unit-tested but not exercised live — it
  needs a second Organization account that is a member of an org it doesn't own.
- ⚠️ **Backend finding: org update/delete are unauthorized** — see "Still open / blocked" above. Any
  authenticated user can rename or delete any organization by id.
- ⏭️ **Next:** admin user-detail drawer (`GET /user/{id}`), subtask rename (`PUT /subtask`); then the
  broader a11y pass and extending skeletons / the list pattern to the remaining pages. Personal tasks
  stay backend-blocked.

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

## Phase 1 — Design System / Component Library ✅ (every component a feature needs exists)
- ✅ Atoms: `buttons/` (`button`, `sign-in-button`, `sign-up-button`), `inputs/` (`text-input`,
  `email-input`, `text-area-input`) — full 5 files each.
- ✅ Molecules (5 files each): `pricing-card`, `review-card`, `feature-card`, `landing-feature-card`,
  `master-card`, `form-field`, `search-bar`, `pagination` (list pager — summary, rows-per-page,
  windowed page buttons).
- ✅ Atoms also include `skeletons/skeleton` and `animations/lottie-player`.
- ✅ Organisms: `productivity-chart`, `project-health-chart`.
- ✅ **The 9 `*-molecule` scaffold components were deleted in Phase 22** — unused, wrongly named, and
  holding the last 27 a11y lint errors.
- 🟡 `Button`, `SignInButton`, `FeatureCard`, `FormField`, `MasterCard`, `SearchBar` exist with stories
  but nothing renders them. Kept as design-system stock; adopt or delete deliberately (V1-GAPS §3).
- ⏭️ Possible later: `sidebar`/`navbar`/`data-table` organisms (the portals inline their own chrome,
  which works fine).

## Phase 2 — Auth, Session & Role-Based Portals ✅ (except backend-blocked screens)

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
- ✅ Login/register errors are surfaced **on the form** (`<div class="form-error" role="alert">`), not
  only as a toast.

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
  page; detail pages carry header Edit/Delete; every delete is confirm-gated.
- ✅ **Org settings** (Phase 19) — rename + type-to-confirm delete, closing the last entity CRUD gap.
  Every entity in the portal now has full create/read/update/delete.
- ✅ Org portal is feature- and theme-complete. Next work moves to other portals/polish (see START HERE).
- ⬜ Sidebar is inline in the layout (fine); a dedicated sidebar organism is optional.

## Phase 5 — Member (Individual) Portal ✅
- ✅ `MemberLayout` shell + Dashboard/Invitations nav (with a pending-invitation badge); `/member` branch
  guarded with `portalGuard('member')`.
- ✅ **My invitations** page (Phase 18) — accept/decline invitations addressed to your email. Also mounted
  at `/organization/invitations`, because invitations are user-scoped, not portal-scoped.
- ✅ Dashboard shows real invitation data instead of the old hardcoded task stats.
- ✅ Personal tasks, subtasks, lifecycle, time tracking, reports, and private projects are complete.
  Personal creation uses `/task/personal`; private projects use `/project/personal` and are creator-only.

## Phase 6 — Admin Portal 🟡 (Users done)
- ✅ `AdminLayout` shell (now with Dashboard/Users nav); `/admin` branch guarded with `roleGuard('Admin')`.
- ✅ **User list** page (`GET /user`, AdminOnly) with search + status/account-type filters + stat tiles;
  real dashboard fed from the derived user counts. Feature slice: `admin.models/repository/facade`.
- ✅ **User detail drawer** (`GET /user/{id}`, Phase 20) — built and rendering, but the API refuses it for
  an admin (`EnsureUserAsync` has no Admin bypass), so it shows a state naming the guard. Backend fix
  needed; **no frontend work left** on it.
- ⬜ Organizations overview + platform settings — **backend-blocked** (no list-all-orgs or settings
  endpoint; only `GET /organization/mine`).

## Phase 7 — Reporting & Dashboard (headline feature) ✅ (export + trends deferred to v1.x)
- ✅ Reports page consuming dashboard summary + member/team/project report endpoints; echarts team
  bar chart, member stat tiles, project completion ring + workload table (fed by the org facade).
- ✅ Date-window (From/To) controls with Week/Month/Year/All presets, reactive via effects.
- ✅ Work-log durations UI (Phase 9) — time-tracking drawer feeds `trackedHours` on dashboard/reports.
- ⬜ Richer per-member trend charts; export (CSV/PDF). **Both are doable with today's API** — see
  V1-GAPS §3; export is the highest-value post-v1 item.

## Phase 8 — Polish & Hardening ✅ (closed by Phase 22)
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
- ✅ **Skeletons now cover every page that loads data** (Phase 22): teams, roles, project-detail,
  team-detail, settings, org dashboard, reports. Loading branches are ordered before empty branches.
- ✅ **Every reactive form now validates through the engine** (Phase 22) — no inline `Validators.*` left
  anywhere in the app. Models: `organization.form-models.ts` + `login-page.model.ts`.
- ✅ **Drawer a11y** — `DialogDirective` (`appDialog`) gives all 10 slide-in drawers focus-trap, Escape,
  focus-restore, and `role=dialog`/`aria-modal`/`aria-labelledby`. See Phase 15.
- ✅ **Broader a11y pass** (Phase 21) — every live template is a11y-lint clean (drawer backdrops and row
  click-targets are real `<button>`s; the register account-type toggle has proper radiogroup semantics);
  `npm run a11y:contrast` parses the theme partials and holds all 42 token pairings to AA in both themes;
  the Storybook a11y addon now fails a story on an axe violation. See Phase 21 status.
- ✅ **Deleted the 9 dead `*-molecule` components** (Phase 22) — `npx ng lint` now passes with **zero**
  errors.
- ✅ **Pagination/filtering for list views** — `createPagination()` (`@shared/utils/pagination`) + the
  `Pagination` molecule + the global `.list-toolbar` styles, on the admin-users / tasks / projects /
  members pages. Client-side until the API pages. See Phase 16 status and CONVENTIONS "List pages".
- ✅ **The list pattern now covers every list** (Phase 22): teams, roles, project-detail tasks,
  team-detail members, and a pager on the pending-invitations panel.
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
