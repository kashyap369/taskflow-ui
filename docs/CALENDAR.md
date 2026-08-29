# Organization Calendar — Integration Plan

> Canonical end-to-end plan for the Angular app in `TaskFlowUI/TaskFlowApp` and the API in
> `TaskFlow`. Keep this file current as each phase ships.

## Session handoff

- **“calendar status”**: read this file, inspect the related git changes/tests, and report the current
  phase without changing code.
- **“complete next calendar phase”**: implement only the first `READY` or `IN PROGRESS` phase, meet its
  exit criteria, then update the status table and evidence here.
- **“continue calendar phase N”**: resume that phase; do not start a later phase until it is complete.
- Every implementation session must leave a short evidence entry: date, important files, tests run,
  and any remaining limitation.

## Product and technical decisions

- Calendar is **organization-scoped**. Personal work never appears in it.
- TaskFlow owns data, permissions and business rules. Open-source packages are rendering adapters,
  never the source of truth.
- Use **FullCalendar Standard** (MIT) for month/week/day/list views and **Frappe Gantt** (MIT) for the
  project timeline. Do not use FullCalendar Premium/Scheduler without an explicit license decision.
- Do not create duplicate calendar rows for projects and tasks. Derive them from their existing
  `StartDate`, `ExpectedCompletionDate`, status, assignment and progress fields.
- Add database tables only when a phase introduces genuinely new data such as estimates, working
  capacity, leave, meetings or recurrence.
- Pin dependency versions in `package-lock.json`; wrap each library behind TaskFlow-owned mapping and
  page code so it can be replaced later.

## Delivery status

| Phase | Outcome | Status |
|---|---|---|
| 0 | Scope, libraries and ownership rules agreed | DONE |
| 1 | Read-only Schedule + Project Timeline | DONE |
| 2 | Filters, detail drawer and authorized rescheduling | DONE |
| 3 | Team Capacity with real estimates and working hours | DONE |
| 4 | Leave, organization events, holidays and recurrence | DONE |
| 5 | Optional meeting-booking capability | NOT STARTED |

## Phase 1 — Read-only MVP

**Goal:** ship `/organization/calendar` with two tabs and no backend schema changes.

### Schedule tab

- FullCalendar Standard with Month, Week and List views.
- Render organization projects as date ranges and tasks as ranges or due-date items.
- Distinguish project, task, completed and overdue states through TaskFlow design tokens.
- Clicking an item opens its existing TaskFlow route or a small read-only details panel.

### Project Timeline tab

- Project selector, then Frappe Gantt using that project's existing tasks.
- Show task dates, completion from subtasks/status, assignee name, team and priority.
- Read-only: no drag, resize or dependency editing in this phase.

### Implementation shape

- Add `calendar-page/` using the established four page files and register the route/sidebar link.
- Add small TaskFlow-owned calendar view models and pure mapping functions; do not pass API DTOs
  directly into either library.
- Reuse `OrganizationFacade` data already loaded for projects, tasks, members and teams. Do not add a
  calendar repository or API endpoint merely to aggregate data the client already has.
- Lazy-load the timeline tab/library if its bundle materially affects the initial calendar route.

### Exit criteria

- Organization switching refreshes both tabs and cannot leak data from the previous organization.
- Empty, loading and error states are present; keyboard access and light/dark themes work.
- Mapper unit tests, page tests, lint, contrast check and production build pass.
- Third-party license notices and dependency versions are recorded.

### Phase 1 shipped shape

- Route and sidebar: `/organization/calendar` is lazy-loaded and the former disabled nav item is live.
- Schedule: FullCalendar month/week/list views with project/task/completed/overdue states and a compact
  read-only selection strip.
- Timeline: project-selectable Frappe Gantt with task progress, team/assignee context, Day/Week/Month
  scale selection and all mutation controls disabled.
- Safety: records are filtered against the current organization while a workspace switch is loading;
  load failure, no-organization, empty schedule and empty-project states are distinct.
- Integration boundary: `calendar-page.model.ts` owns every API-to-calendar/Gantt mapping. No database,
  migration, repository or API endpoint was added.

### Third-party notices

| Package | Pinned version | License | Purpose |
|---|---:|---|---|
| `@fullcalendar/angular` + `fullcalendar` | 7.0.2 | MIT | Schedule renderer and Angular connector |
| `temporal-polyfill` | 1.0.4 | MIT | FullCalendar runtime date dependency |
| `frappe-gantt` | 1.2.2 | MIT | Read-only project task timeline |

## Phase 2 — Operable planning

**Goal:** make the calendar useful for daily planning without turning it into a second task editor.

- Shared filters: project, team, member, item type, status, priority, overdue and completed.
- One reusable read-only detail drawer linked to the existing project/task actions.
- Add explicit API schedule commands for task dates; do not expand the general task update command.
- Reuse the existing organization task-update permission unless a real need for a separate permission
  appears. The API remains the authority.
- Enable drag/resize only for authorized users. Persist on drop, refetch on success, and restore the
  server state on failure. Project bars remain read-only unless a project scheduling command is added.

**Exit criteria:** filters persist across tabs, unauthorized users cannot reschedule through either UI
or API, scheduling validation is covered by API tests, and failed moves visibly revert.

### Phase 2 shipped shape

- Shared project, team, member, type, status, priority, overdue and completed filters drive both tabs
  from one organization-scoped persisted state.
- Schedule and Timeline selections open the same focus-trapped, read-only details drawer with links to
  the existing project/task actions.
- `PUT /task/{id}/schedule` changes only task dates, validates the planning window and requires the
  existing `ManageTasks` permission (with the standard owner bypass). Project bars remain immutable.
- Authorized task drag/resize works in FullCalendar and Frappe Gantt. Both refetch server-authoritative
  task data on success; failures rerender/revert and announce that the old dates were restored.

## Phase 3 — Team Capacity

**Goal:** show defensible availability rather than guessing that a member is “free.”

- Add nullable task estimate minutes and organization-member weekly capacity minutes.
- Add a focused capacity query returning member, week, assigned estimate and remaining capacity.
- Display member rows by week with Light, Balanced and Heavy workload states.
- Keep the first calculation simple and documented; do not build forecasting or automatic assignment.

**Exit criteria:** totals are server-computed, organization-scoped and timezone-safe; members without
estimates show “Not enough data,” never a false availability claim.

### Phase 3 shipped shape

- Added nullable `Task.EstimateMinutes` and `OrganizationMember.WeeklyCapacityMinutes` through the
  additive `AddCalendarCapacity` migration and focused `ManageTasks` / `ManageMembers` commands.
- `GET /report/capacity/{organizationId}?weekStart&weeks` returns active member/week rows computed in
  PostgreSQL. Weeks are Monday–Sunday date-only boundaries; an open task contributes its full estimate
  to its UTC due-date week (or start-date week when no due date exists).
- Light is at most 70%, Balanced is above 70% through 100%, and Heavy is above 100%. A missing weekly
  capacity or any unestimated assigned task makes that member/week `NotEnoughData`; partial known work
  is never presented as remaining availability.
- Calendar now has a responsive Team Capacity tab with six-week navigation, sticky member rows,
  semantic workload bands, permission-aware weekly-hours editing, and an estimate queue for data gaps.

## Phase 4 — Calendar-owned events

**Goal:** add information that does not already belong to projects or tasks.

- Introduce organization events, member leave/unavailability and organization holidays.
- Add simple recurrence only after one-off events work; define the recurrence contract in this phase.
- Add create/edit/delete permissions and API validation appropriate to each event type.
- Merge event DTOs with derived project/task items through the same TaskFlow calendar view model.

**Exit criteria:** timezone, all-day, recurrence and organization-boundary tests pass; deleting a
calendar event never deletes its related project or task.

### Phase 4 shipped shape

- Added one `CalendarEntry` aggregate with explicit Organization Event, Member Leave and Holiday
  kinds. Leave targets an active organization member; leave and holidays are always all-day.
- Timed entries store UTC boundaries plus their IANA/Windows timezone identifier. Recurrence is
  deliberately limited to None, Daily, Weekly or Monthly with a 1–30 interval and optional inclusive
  end date; the bounded query expands occurrences server-side without duplicating rows.
- Four `/calendar` routes are protected by organization read isolation and the new `ManageCalendar`
  permission for writes. Deletion soft-deletes only the calendar aggregate.
- The Schedule mapper now merges calendar DTOs with derived project/task items. Authorized users can
  create, edit and delete entries in an accessible drawer; roles gain the permission through the
  existing permission editor.

## Phase 5 — Optional booking

Treat this as a separate product decision, not an automatic dependency upgrade. First validate that
customers need public booking links, round-robin assignment or external calendar sync. If they do:

- Prefer a narrow Cal.com-style integration or API boundary over embedding the whole product.
- Review the current license and hosting model at implementation time.
- Keep TaskFlow IDs and authorization canonical; store only the booking data TaskFlow must own.
- Do not begin until Phases 1–4 are stable and the booking use case is approved.

## Evidence log

- **2026-08-29 — Planning:** existing project/task DTOs already provide dates, status, assignee IDs,
  team IDs and progress inputs. The organization sidebar has a disabled Calendar item and no route.
  Phase 1 therefore needs no backend migration or new API endpoint.
- **2026-08-29 — Phase 1 DONE:** added the lazy calendar route/sidebar entry, TaskFlow-owned adapters,
  FullCalendar Schedule, lazy Frappe Gantt Project Timeline, details/loading/error/empty states and
  responsive theming. The full frontend suite passes **247/247** (including 10 focused calendar/facade
  specs); production build, lint/design lint and all **42** contrast checks pass. Browser-verified at
  **1440×1000** and **390×844**, including
  Schedule item selection, Timeline rendering/scrolling and Gantt task selection. No backend change.
- **2026-08-29 — Phase 2 DONE:** added persistent shared filters, the reusable accessible details
  drawer, role-aware task drag/resize in both renderers, and the focused permission-gated task schedule
  API. Frontend tests pass **253/253** (13 calendar-focused); backend tests pass **30/30** (3 focused
  scheduling tests); production build, lint/design lint and all **42** contrast checks pass. The API
  suite needs `OneTimeCodeSettings__SecretKey` in the test process, as it did before this phase.
- **2026-08-29 — Phase 3 DONE:** added real task estimates/member weekly capacities, migration
  `AddCalendarCapacity`, three focused authorized routes, the server-computed date-only capacity query,
  and the six-week Team Capacity UI with explicit data-gap editing. Frontend specs pass **254/254**;
  backend tests pass **35/35**, including real HTTP/PostgreSQL coverage for UTC week edges, workload
  states, missing estimates and organization isolation. Production build, lint/design lint, EF drift
  and all **42** contrast checks pass.
- **2026-08-29 — Phase 4 DONE:** added the `AddCalendarEntries` migration, a dedicated calendar
  aggregate and permission, four CRUD/window routes, bounded recurrence expansion, and Schedule UI
  management for events, member leave and holidays. Frontend specs pass **256/256**; backend tests
  pass **40/40**, including live HTTP/PostgreSQL recurrence, all-day, delete and organization-isolation
  coverage. Production build, lint/design lint, EF drift and all **42** contrast checks pass.
