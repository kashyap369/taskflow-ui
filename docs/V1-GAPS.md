# TaskFlow UI — What v1 Does *Not* Include

> **v1 is complete as of 2026-07-26 (Phase 22), and Phase 23 added the Member portal** — so **both
> account types are now complete end to end.** "Complete" means: every endpoint the backend exposes is
> reachable from the UI, and every screen that consumes one is built, themed, accessible and tested.
> This file is the honest list of what was deliberately left out, so nobody has to re-derive it later.
>
> Nothing below blocks using the app. Items are grouped by *why* they're out, because that decides
> who can act on them.
>
> ---
>
> ### ⚠️ 2026-07-26 UPDATE — §1 and §2 are empty, and the frontend has caught up
> **Backend Phases 10–13 shipped**, taking the API to **82 endpoints**; **frontend Phases 26–29 then
> consumed every one that has a screen** (80/82 — the 2 left are the standing deliberate skips,
> `GET /task/mine` and `GET /worklog/mine`). Every backend-blocked item (§1) and every backend defect
> (§2) is resolved, and nothing in §1's "frontend action" column is outstanding.
>
> **What's left is §3 only** — deferred v1.x work that never needed the API: CSV/PDF report export,
> the calendar page, per-member trend charts, E2E tests. The one backend gap anywhere is
> **forgot-password**, and it blocks no built screen.

---

## 1. Backend-blocked — ✅ NOTHING IS BLOCKED ANY MORE (as of 2026-07-26)

**Backend Phases 10–13 closed every item in this section.** The API is feature-complete at **82
endpoints**; Organization, Reporting, Admin and Individual are all at 100%. What used to be blocked is
now ordinary frontend work — see [PHASES.md](PHASES.md) Phases 26–29.

| Former gap | Resolution | Frontend action |
|---|---|---|
| ~~Member (Individual) portal~~ | ✅ **backend Phase 9** — `POST /task/personal`, `GET /report/me`, `PUT /task/{id}/reopen`. | **Built** (frontend Phase 23). |
| ~~Admin → Organizations overview~~ | ✅ **backend Phase 13** — `GET /admin/organizations` (AdminOnly) with owner, member/project/task counts. | ✅ **Built** (frontend Phase 27.1). |
| ~~Admin → Platform settings~~ | ✅ **backend Phase 13** — `GET`/`PUT /admin/settings`. Both flags are really enforced (registration in the register handler, maintenance in middleware). | ✅ **Built** (frontend Phase 27.2), incl. a 503 `MAINTENANCE_MODE` banner at the app root. |
| ~~Admin → open any user~~ | ✅ **backend Phase 10** — `EnsureUserAsync` now short-circuits for a platform admin. Verified: admin → `GET /user/2` = **200** (was 403). | ✅ **Verified live and the "denied state" branch deleted** (frontend Phase 26.1). |
| **Forgot password** | ⬜ Still no `forgot-password` / `reset-password` endpoint — **the one remaining backend gap**, and it is not blocking any built screen. | The "Forgot?" link stays inert (`href="#"`). Email verification is done (Phase 23). |

## 2. Backend defects found while building v1 — ✅ ALL FIXED (2026-07-26)

1. ~~**No authorization on organization update/delete.**~~ ✅ **Fixed, backend Phase 10.** A new
   `EnsureOrganizationOwnerAsync` guard makes both **owner-only**; a non-owner now gets **403
   `NOT_ORGANIZATION_OWNER`**. The settings page's ownership gate is still just usability — but there is
   a real boundary behind it now.
2. ~~`POST /worklog/manual` returns 500 on a domain validation failure~~ — ✅ **fixed 2026-07-26**: the
   API middleware now maps `ArgumentException` / `InvalidOperationException` to **400**. The client-side
   future-time guard is kept as a nicer UX, but is no longer load-bearing.
3. ~~**`RemoveMember` and `DeactivateMember` are the same operation.**~~ ✅ **Fixed, backend Phase 10.**
   Remove now really removes (the member vanishes from the list); Deactivate stays a reversible toggle.
   ✅ **Frontend Phase 26.2 done** — the members-page confirm copy describes a real removal again, and
   points at Deactivate for the reversible option.
4. 🚨 **Also found and fixed in backend Phase 10 (the frontend never saw it):** all four
   `OrganizationMember` commands — remove, deactivate, activate, change-role — had **no authorization at
   all**, so any authenticated user could act on any organization's members. All four now require the
   `ManageMembers` permission. No frontend change needed.

## 3. Deliberately deferred to v1.x — buildable today, just not v1 scope

- **Reporting export (CSV / PDF).** The reports page reads every figure it would export; only the
  serialisation + download is missing.
- **Richer per-member trend charts.** Currently six stat tiles per member; a time-series would need the
  report queried per interval (the API supports `?from&to`, so this is client-side looping). *(Team,
  project and priority reporting all gained depth in Phase 29 — the member panel is the one left.)*
- **Calendar page.** The only nav item still marked "Coming soon" (organization sidebar).
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
- **E2E tests.** Coverage is 204 unit specs (TestBed) plus manual live verification. No Playwright/
  Cypress suite.

## 4. Known non-goals

- **Real-time updates** (SignalR/WebSocket). Everything refetches after a mutation.
- **Offline / PWA.**
- **i18n.** Copy is English-only and inline.
- **File attachments on tasks.** No API surface for it.

---

## How to pick this back up

**See also: `D:\Projects\TMS\TaskFlow\docs\ProjectCompletion.md`** — the API ⇄ UI parity ledger. This
file says what *the frontend* is missing; that one shows both sides at once and tracks who is blocking
whom. Update it alongside this one.

1. **§1 and §2 are done** — backend Phases 10–13 closed every one, and frontend Phases 26–29 consumed
   the endpoints they added (**80/82**; the 2 left are the deliberate skips). The only backend gap left
   anywhere is forgot-password, which blocks no built screen.
2. **Everything left is §3 frontend work that never needed the API.** In value order: **CSV/PDF report
   export** ([PHASES.md](PHASES.md) Phase 24.1), the **calendar page** (Phase 25), **per-member trend
   charts** (Phase 24.2), then E2E tests.
3. Items in **§3** follow existing patterns — see [CONVENTIONS.md](CONVENTIONS.md) for the list,
   drawer, validation and a11y patterns to copy.
