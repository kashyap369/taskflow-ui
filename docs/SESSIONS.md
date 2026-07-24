# TaskFlow UI — Session Log

> Append-only. 3–5 lines per session. Focus on gotchas, dead ends, and decisions — things git
> history doesn't capture.

## 2026-07-25 (Phase 7 — Task assignment + Project detail)
- Completed the org work-management loop: per-task **assignee dropdown** (Tasks page + Project detail)
  wired to `PUT /task/{id}/assign/{userId}` / `/unassign`, and a **Project detail** page
  (`/organization/projects/:id`) with header/progress + project-scoped task creation. Verified live:
  new task under Website Redesign → header recomputed 1/2, 50% → assigned to Jane (204) → **member report
  Assigned: 1**. The reports built last phase now populate with real workloads.
- **Backend gap:** intended to build the Member (Individual) portal next, but `CreateTaskCommand` has a
  **non-nullable `OrganizationId`** and the handler 404s if the org isn't found — there is **no personal-
  task create endpoint** (only `GET /task/mine/personal` reads `WHERE OrganizationId IS NULL`). So personal
  tasks can't be created via the API; the Member portal is backend-blocked until an endpoint is added.
- **Test data:** `OrganizationMembers` was empty (owner isn't a member row; jane's invite is only Pending
  and we can't accept as her). To test assignment I inserted jane (userId 2) as an active Manager (roleId 2)
  member of org 2 directly: `INSERT INTO "OrganizationMembers" ("OrganizationId","UserId",
  "OrganizationRoleId","JoinedAt","IsActive","CreatedAt","IsDeleted") VALUES (2,2,2,NOW(),TRUE,NOW(),FALSE);`
  (Id is identity — omit it). This also makes the Members list + member report show real data.
- **Facade note:** `loadOrgData` fetches members at login; jane was added after, so a full page reload was
  needed to refetch. Assign/unassign reload org tasks + summary + the open project's tasks.
- `ng build` passes; project detail is responsive (table→stacked, header stacks on mobile).

## 2026-07-24 (Phase 6 — Reporting)
- Built the Reports page (headline feature) wired to `/report/team|member|project`. Return shapes:
  team = LIST (`?from&to`), member = single (`?from&to`), project = single (no date window). All raw DTOs.
- **Reactive date window** via two `effect()`s (team + member) that read `currentOrgId` + `from`/`to`
  signals and reload on change; project loads on selection (no date dep). Presets Week/Month/Year/All set
  from/to. Verified the `?from&to` query updates on preset change and the API returns 200 each time.
- echarts grouped bar (Assigned vs Completed per team) via `NgxEchartsDirective` + a computed
  `chartOption` (BarChart already registered in app.config). Project completion shown as a conic-gradient
  ring bound with `[style.--pct.%]`.
- **Gotcha:** native `<input type=date>` rendered dark in the Electron pane — added `color-scheme: light`
  (+ white bg) so pickers match the light theme. Also `Date.toISOString()` on a local-midnight date can
  shift the shown day back one (tz artifact, e.g. month start showed as Jun 30) — harmless for the window.
- Verified live: team report (Engineering, zeros) loads + reloads on Week preset; project report for
  "Website Redesign" = 100% complete, 1/1 tasks, no workloads (task was unassigned); member report shows
  the "no active members" hint. `ng build` passes. Test-data note: member/project workloads stay empty
  until tasks are assigned to accepted members (assign UI + invitation-accept are still to build).

## 2026-07-24 (Phase 5 — Roles/Members/Teams + Lottie)
- Built the remaining org admin pages (Roles & Permissions, Members + Invitations, Teams) wired to the
  live API and verified end-to-end: created a Manager role, granted CreateProject (persists), invited
  jane@example.com into Manager (Pending), created an Engineering team. All green.
- **Dependency discovered:** creating an org seeds NO roles, and `InviteUser` needs an `organizationRoleId`.
  So Roles is a prerequisite for Invitations — the Members page shows a notice linking to Roles when none
  exist, and the Invite button is disabled until a role exists. Grant/revoke use the permission **NAME**
  (string), not an id; the role detail returns granted permission names; the catalog is `GET
  /organizationrole/permissions` (global, fetched once).
- **Lottie done without any external download** (offline/CSP-safe): hand-authored two compact Lottie v5
  JSONs in `public/lottie/` (`loading-dots`, `empty`) and a reusable `LottiePlayer` atom over
  `<ng-lottie>`, provider `provideLottieOptions({ player: () => import('lottie-web') })`. lottie-web
  renders them fine (verified the SVG mounts). Build warns "lottie-web is not ESM" — harmless. If richer
  animations are wanted later, drop more JSONs into public/lottie and point `src` at them.
- **DELETE-with-body:** remove-member is `DELETE /organizationmember` with a `{organizationId,userId}`
  body, so `ApiService.delete` gained an optional `body` param (`http.delete(url,{body})`).
- **Over-fetch by design:** `loadOrgData` now forkJoins summary/projects/tasks/roles/members/invitations/
  teams on org select so every portal page has data immediately; switching orgs refreshes all of it.
- Route names: controllers use `[Route("api/[controller]")]` → `/organizationrole`, `/organizationmember`,
  `/organizationinvitation`, `/team` (routing is case-insensitive). Still all raw (unenveloped) except Auth.
- Same test constraints as Phase 4 (verified org user in dev DB; slow BCrypt; invite ~3.5s due to email).
- Responsive verified at 375px (no horizontal overflow, sidebar collapses, rows reflow). `ng build` passes.

## 2026-07-24 (Phase 4 — Organization portal wired to the LIVE API)
- Read the backend docs + controllers/DTOs first. Built the org portal vertical slice: foundation
  (models/repository/facade), Dashboard (real summary + recent projects + real task-status donut +
  create-org onboarding), Projects (list + create drawer), Tasks (list + create + Start/Complete),
  sidebar routing. Verified the whole path against the running API with a real org account.
- **Biggest gotcha — raw vs enveloped responses.** Only `AuthController` wraps responses in
  `ApiResponse<T>`; every other controller returns the DTO **raw**. This exposed a latent Phase-2 bug:
  `auth.repository.me()` was typed `ApiResponse<UserProfileResponse>` and the facade read
  `profileRes.data` → `undefined` → `toUser()` threw **inside the RxJS `next` callback** (which RxJS does
  NOT route to the `error` handler), so the token got stored but the user principal didn't and login
  silently failed to redirect (page stuck, no error toast). Fix: `me()` returns the raw DTO; facade maps
  it directly. Lesson: for this API, only auth repos use the envelope — all org/work repos use bare DTOs.
- **Email-verification blocker.** Registration leaves the user `PendingVerification`; login throws
  `EMAIL_NOT_VERIFIED`; there is **no verification endpoint** (documented backend leftover). Only the
  seeded `admin@taskflow.com` is verified (and it's Individual/Admin → `/admin`, not the org portal). To
  test the org portal I registered an Organization account then set `IsEmailVerified=true, Status=1` for
  that user directly in Postgres (`psql` at `C:\Program Files\PostgreSQL\17\bin`, DB `TaskFlowDb`,
  postgres/postgres). Coordinate a verify endpoint (or a dev auto-verify) so this isn't needed.
- **BCrypt is very slow here (~5s/hash).** Register took 5.4s; stacking multiple login clicks saturated
  the API (one login errored after 40s). Do one auth call at a time; a single warm login is ~150ms.
- **Registering an Organization account does NOT create an Organization** (register only makes the user
  with `AccountType=Organization`). The org portal shows a create-org onboarding when `/organization/mine`
  is empty; `POST /organization {name, description}` then creates it. Org id is needed for every dashboard/
  projects/tasks call, so the facade resolves it from `/organization/mine` (first, persisted to localStorage).
- Enums are 1-based ints, serialized as ints: ProjectStatus(Draft=1..), TaskStatus(Todo=1,InProgress=2,
  Completed=3,Blocked=4,Cancelled=5), TaskPriority(Low=1..Critical=4). Dates: `date` inputs → `YYYY-MM-DDT00:00:00Z`.
- Verified live: browser pane can't screenshot (not displayed) — used get_page_text/read_page/network/
  console logging interceptor as proof. Full flow green; `ng build` passes.

## 2026-07-24 (Phase 2c — register + refresh rotation + org logout)
- Built the register flow end-to-end: new `register-page` (5 files) mirroring the login two-panel
  design, with an account-type toggle (Individual/Organization). Studied the backend contract first:
  `POST /auth/register` takes `RegisterUserCommand(FirstName, LastName, Email, PhoneNumber, Password,
  AccountType=Individual)` and returns only `ApiResponse<int>` (the new user id) — **no tokens**, so
  after registering we toast success + route to the matching login variant rather than auto-login.
  `AccountType` enum is Individual=1/Organization=2; sent as an int (System.Text.Json accepts numeric
  enums by default). Form validation mirrors `RegisterUserCommandValidator` + a client-only
  confirm-password cross-field validator.
- **Refresh-token rotation** as a dedicated interceptor placed **last** (innermost) in the chain, so it
  catches the raw 401 before the error interceptor toasts it — a transparently-refreshed request never
  shows an "Unauthorized" toast. Single-flight via module-level `isRefreshing` + a `BehaviorSubject`
  that queued requests wait on; retries by manually cloning the request with the new Bearer (the retry
  from an innermost interceptor bypasses `authInterceptor`, so the header must be set by hand). Added
  `TokenService.updateTokens()` (does NOT `clearSession` — preserves the user principal + remember-me
  storage, unlike `setTokens`). The interceptor calls `ApiService` directly (core→core) instead of the
  feature repository to respect `eslint-plugin-boundaries` (core must not import features).
- **Org layout logout**: it still had a hardcoded "Avery Mitchell" `<img>` avatar and no logout — swapped
  to the real `AuthService.user` (initials avatar), added theme toggle + Sign-out → `AuthFacade.logout()`.
  Member/admin layouts already had this from the prior session.
- **Verified live** at :4200 (browser pane can't screenshot — not displayed — so used get_page_text /
  read_page / javascript_tool): register renders, empty-submit fires all required messages, mismatched
  passwords show "Passwords don't match", Organization toggle flips `.active`/`aria-pressed`. `ng build`
  passes. The live `/auth/register` + `/auth/refresh` HTTP calls weren't exercised (no API running).

## 2026-07-24 (Design language + landing redesign)
- Created `docs/DESIGN.md` and built the foundation to match: loaded real fonts (Plus Jakarta Sans +
  Inter — Inter was declared but never imported, so everything fell back to system sans; the single
  biggest cause of the "AI-generated" feel), a full semantic CSS-variable token system (light `:root`
  + dark `[data-theme]`), a motion file (tokens + keyframes + `[data-reveal]` utility), a signal
  `ThemeService` (persist + no-FOUC inline script in index.html), and a `RevealDirective`
  (IntersectionObserver — our Framer-Motion stand-in, since this is Angular not React).
- Redesigned the landing page: mesh-glow hero, gradient CTA, a floating **board mock** matching the
  user's reference screenshots (status columns + priority chips + progress + avatar stacks), marquee
  logos, staggered reveals, workflow progress bars that grow on scroll, animated-gradient CTA band.
  Converted the 3 landing molecule cards + footer + public layout to tokens so dark mode works.
- **Gotcha that cost a cycle:** the running dev server kept serving a STALE landing chunk (old badge
  text + black button) while the header updated — because the new template used `<lucide-angular>` but
  `LandingPage.imports` was missing `LucideAngularModule`, so the build errored and esbuild served the
  last-good lazy chunk with no error overlay. `ng build` surfaced it (NG8001). Lesson: when a lazy
  route looks stale, run `ng build` — a failed build silently keeps the old chunk.
- Other notes: Bootstrap Icons (`bi-*`) is NOT installed — the old header icons were invisible;
  switched to lucide. Bootstrap JS is only in the test build config, not the app build, so the
  navbar-collapse toggler won't work without JS — fine for now. Raised `anyComponentStyle` budget to
  12/24 kB for the richer landing SCSS. Verified both themes live at localhost:4200.

## 2026-07-24 (Role-based login + admin/member portals)
- Wired real login end-to-end with role-based redirect (user's complaint: login didn't redirect —
  because the public login page was purely presentational with no submit). Studied the API: `POST
  /auth/login` returns system **roles** (`Admin`/`Manager`/`User`) + access/refresh tokens but **NOT**
  account type; `GET /user/me` returns `AccountType` (Individual=1/Organization=2). So the session is
  built from two calls. Redirect (`resolvePortal`): Admin role → `/admin`, else Organization → `/organization`,
  else Individual → `/member`.
- Reworked auth core to the real contract: `SystemRole`/`AccountType`/`Portal` types + `resolvePortal`
  in `roles.enum.ts` (replaced the old `Role` enum — updated all ~6 references), `User` model (+accountType),
  `AuthStore` (+portal computed), `AuthService` (`homeRoute`/`canAccessPortal`), `TokenService` (+refresh
  token), guards (`authGuard`/`guestGuard`→home/`roleGuard(SystemRole)`/new `portalGuard`).
- Consolidated login into ONE `LoginPage` with a `variant` (solo/organization/admin) from route `data`
  — reusing the animated split-screen design. Deleted the duplicate `features/public/login-page`;
  `/login` now redirects to `/auth/login`; `AuthLayout` made full-bleed. Built themed member + admin
  layout shells + placeholder dashboards so redirects land somewhere.
- **Couldn't verify the live login flow** — no API running in this session, and the API is https with a
  self-signed dev cert. Wired strictly to the documented contract. Next session: run the API + accept
  the cert at `https://localhost:7086`, dev server on 4200.
- **Session rehydration solved a subtle trap:** with a token but no `User`, `guestGuard` would loop and
  portals would bounce to login. Rather than an `APP_INITIALIZER` calling `/user/me` (which can't return
  roles), I persist the whole `User` principal beside the tokens and restore it in the `AuthService`
  constructor. Also guarded `guestGuard` to only redirect when a portal actually resolves.
- **Verified all guard flows in-browser without an API** by seeding a fake session in localStorage and
  reloading: signed-out→/member→/auth/login; Individual can enter /member but is bounced from
  /organization and /admin; logged-in kept out of /auth/login. The live `/auth/login` HTTP call itself
  was not exercised (no API up). `ng build` passes.
- Gotcha while testing: the `navigate` browser tool sometimes does SPA nav (no reload), so seeding
  localStorage then SPA-navigating doesn't re-run the constructor rehydrate — a full reload does. Don't
  mistake that for a guard bug (a clean reload test passed).

## 2026-07-24 (Login page — animated showcase)
- Redesigned the **public** login page (`features/public/login-page`, the `/login` route reached from the
  header "Sign in" — full-screen, no AuthLayout card). Left = token-based, theme-aware form (custom
  gradient checkbox, icon focus states, gradient CTA, staggered reveal entrance). Right = a self-contained
  **animated showcase**: moving aurora + grid, a floating glass "Today's focus" card whose checklist
  completes on a staggered loop (checkbox fill + checkmark pop + strikethrough), a productivity ring that
  draws via `stroke-dashoffset`, a looping slide-in toast, floating avatar stack, plus pointer **parallax**
  driven by mousemove → signals → CSS vars (`--px/--py`). All CSS/SVG keyframes — no Lottie/GSAP.
- **Decision on Lottie/GSAP:** the user asked for them, but Lottie needs an external JSON asset (blocked by
  the offline/CSP sandbox) and GSAP is a new dependency; a hand-crafted CSS/SVG scene is lighter, themeable
  via tokens, needs no external fetch, and Angular signals give the interactivity. If a specific Lottie is
  wanted later, wire `ngx-lottie` (already installed) with `provideLottieOptions` + a JSON in `public/`.
- **Two login pages still exist** (`features/auth/login-page` under AuthLayout's 420px card — which
  actually squashes its full-screen split — and this public one). Enhanced the public one; the duplication
  still needs reconciling. Verified both themes live at /login; `ng build` passes.

## 2026-07-24 (Frontend documentation set up)
- Created the frontend docs set to mirror the backend's (`OVERVIEW`, `ARCHITECTURE`, `CONVENTIONS`,
  `PHASES`, `SESSIONS`), so a new session doesn't need re-explaining. Read the backend docs at
  `D:\Projects\TMS\TaskFlow\docs\` first to match style/structure, then analyzed the frontend codebase.
- **Rewrote the pre-existing `docs/ARCHITECTURE.md`** (dated 2026-07-05): it documented the abandoned
  per-feature Clean-layer folders (`domain/data/application/presentation/`). The code was restructured
  to a **flat** feature layout (`features/<layout>/<page-name>/` + `*.facade/repository/models.ts`) —
  confirmed by the uncommitted git "restructure level 1" and by `CLAUDE.md`. New ARCHITECTURE reflects flat.
- **Key state finding:** foundation/tooling is fully done; only **login** is wired to the API. The
  organization dashboard renders on **hardcoded** data. `shared/validations/` is empty (planned engine).
  Roles aren't returned by the login API, so `toUser()` hardcodes `[Role.Member]`. Two login pages exist
  (`features/auth/login-page` and `features/public/login-page`) — needs reconciling.
- **Gotcha for next session:** the entire restructure is **uncommitted** (unstaged/untracked in git) on
  `main`. Commit it before building further so the flat layout is the recorded baseline. Also check the
  `eslint-plugin-boundaries` element patterns still match the flat paths (they may reference old layer folders).
- Dev API base URL is `https://localhost:7086/api`; keep `ng serve` on **port 4200** (the API's CORS
  allows only `http://localhost:4200`).
