# TaskFlow UI — What v1 Does *Not* Include

> **v1 is complete as of 2026-07-26 (Phase 22).** "Complete" here means one specific thing:
> **every endpoint the backend actually exposes is reachable from the UI, and every screen that
> consumes one is built, themed, accessible and tested.** This file is the honest list of what was
> deliberately left out, so nobody has to re-derive it later.
>
> Nothing below blocks using the app. Items are grouped by *why* they're out, because that decides
> who can act on them.

---

## 1. Backend-blocked — the frontend cannot build these yet

These need API work first. **Don't fake them in the UI.**

| Gap | What's missing in the API | Frontend impact |
|---|---|---|
| **Member (Individual) portal — personal tasks** | No endpoint creates a task without an `OrganizationId`. `CreateTask` 404s on a null org. Only the *read* side exists (`GET /task/mine`, `/task/mine/personal`, `GET /worklog/mine`). | The whole personal-task workspace. The member dashboard says so plainly rather than showing invented numbers. These are the **only 3 of 71 endpoints still unwired** — they are read-only views of data nothing can create. |
| **Admin → Organizations overview** | No list-all-organizations endpoint. Only `GET /organization/mine` (the caller's own). | The admin portal can manage users but not organizations. |
| **Admin → Platform settings** | No settings endpoint at all. | Nothing to build against. |
| **Admin → open any user** | `GET /user/{id}` is marked `IUserScopedRequest`, so `AccessGuardBehavior.EnsureUserAsync` permits only **yourself or someone sharing an organization with you** — there is **no Admin bypass**. The seeded platform admin belongs to no org. | The user-detail drawer **is built** and works for a permitted caller; for anyone else it renders a *denied* state naming the exact guard. Add an Admin short-circuit in the guard and the drawer starts working platform-wide with no frontend change. |
| **Forgot password / email verification screens** | No `forgot-password`, `reset-password` or `verify-email` endpoints. Dev accounts are verified directly in the database. | The "Forgot?" link on the sign-in form is inert (`href="#"`). |

## 2. Backend defects found while building v1 (frontend has a workaround; the API should still be fixed)

1. **No authorization on organization update/delete.** `UpdateOrganizationCommand` /
   `DeleteOrganizationCommand` are unmarked by the scoped-request interfaces and their handlers check
   only existence — so **any authenticated user can rename or delete any organization by id**. The
   settings page gates on ownership, but that is *usability*, not a security boundary. Fix: an ownership
   check in the handlers, or `IOrganizationScopedRequest` on the write side.
2. **`POST /worklog/manual` returns 500 on a domain validation failure** (e.g. an end time in the
   future) — the domain `ArgumentException` isn't mapped to 400 in the API middleware. The manual
   time-entry form blocks the future-time case client-side so users never hit it. See
   `TaskFlow.Domain/.../TaskWorkLog.cs` (`LogManual`).
3. **`RemoveMember` and `DeactivateMember` are the same operation** — both handlers call
   `member.Deactivate()`, so a "removed" member stays in the list as *Inactive*. The confirm dialog now
   describes what actually happens instead of promising a deletion. Decide: hard-remove, or drop one of
   the two endpoints.

## 3. Deliberately deferred to v1.x — buildable today, just not v1 scope

- **Reporting export (CSV / PDF).** The reports page reads every figure it would export; only the
  serialisation + download is missing.
- **Richer per-member trend charts.** Currently six stat tiles per member; a time-series would need the
  report queried per interval (the API supports `?from&to`, so this is client-side looping).
- **Calendar page.** The only nav item still marked "Coming soon".
- **Server-side pagination.** All list paging and filtering is **client-side** over the full list the
  facade holds, because no API endpoint accepts page/size. `createPagination()` + the `Pagination`
  molecule are already the seam — when the API grows paging, swap the source signal for a paged fetch
  and the pages don't change.
- **Manager-role portal.** The API has a Manager role but no distinct portal was specified; managers
  currently land in the organization portal.
- **Tighten the `layouts → features` boundary.** A portal shell may now import a feature's
  `*.facade.ts` / `*.models.ts` (declared as the `feature-api` element type in `eslint.config.js`) —
  it needs the org switcher, the invitation badge and sign-out. The stricter alternative is to promote
  that portal-chrome state into `core`. Working as intended, worth revisiting.
- **The unused library atoms/molecules** — `Button`, `SignInButton`, `FeatureCard`, `FormField`,
  `MasterCard`, `SearchBar`. Nothing renders them, but unlike the nine deleted `*-molecule` components
  they follow the naming convention and have Storybook stories, so they were kept as design-system
  stock. Adopt or delete deliberately.
- **`eslint-plugin-boundaries` v6 migration.** Lint passes but warns that `boundaries/element-types` is
  renamed to `boundaries/dependencies` and that the selector syntax is legacy.
- **E2E tests.** Coverage is 164 unit specs (TestBed) plus manual live verification. No Playwright/
  Cypress suite.

## 4. Known non-goals

- **Real-time updates** (SignalR/WebSocket). Everything refetches after a mutation.
- **Offline / PWA.**
- **i18n.** Copy is English-only and inline.
- **File attachments on tasks.** No API surface for it.

---

## How to pick this back up

1. Items in **§1** need a backend change first — they're logged in the API repo's docs too.
2. Items in **§2** are bugs; the frontend workarounds are commented at each call site.
3. Items in **§3** are ordinary frontend work and follow existing patterns — see
   [CONVENTIONS.md](CONVENTIONS.md) for the list, drawer, validation and a11y patterns to copy.
