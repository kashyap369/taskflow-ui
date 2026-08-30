# TaskFlow UI — Session Log

## 2026-08-30 (Organization Meetings Phase 2 — management and scheduling)

- Added lazy Meetings list/detail routes and sidebar navigation with Upcoming, Live and Past states,
  search/status filtering, paging and complete loading/error/empty behavior.
- Added validated create/edit scheduling, initial display badges, server-authoritative lifecycle
  actions and registered-member access management; later guest links, media, chat, files and recording
  are clearly unavailable rather than represented by dead controls.
- Calendar derives scheduled/live meetings directly from Meeting records, never duplicate calendar
  rows. Organization switching clears stale meeting state. All 262 specs, production build, lint,
  design lint, detector and 42 contrast checks pass. Phase 3 is READY.

## 2026-08-30 (Organization Meetings Phase 0 — LiveKit feasibility)

- Pinned `livekit-client` `2.22.1` and isolated it behind a TaskFlow-owned room service; added a
  disposable, development-gated probe route rather than exposing unfinished Meetings product UI.
- Two isolated Chromium contexts joined on independently issued five-minute tokens, exchanged
  microphone/camera tracks, shared/stopped a screen and completed disconnect/fresh-token reconnect.
- Frontend specs pass 258/258 and production build, lint/design lint and all 42 contrast checks pass;
  the backend passes 42/42 with no EF drift. Phase 0 is DONE and Phase 1 is READY.

## 2026-08-30 (Organization Meetings — plan approved)

- Added a durable pointer to the canonical Phase 0–7 Meetings contract in the backend sibling repo,
  covering secure registered/guest email access, separate access levels and display badges, custom
  Angular/LiveKit calls, collaboration/attendance, recording and production hardening.
- Phase 0 is READY; there is no Meetings route, dependency, API binding or UI implementation yet.
- Future meeting sessions must read the canonical plan completely and use its phase gates/evidence
  protocol so frontend and backend continue together without relying on conversation history.

## 2026-08-29 (Organization Calendar Phase 4)

- Added calendar-owned organization events, member leave and holidays end to end with the additive
  `AddCalendarEntries` migration, `ManageCalendar`, focused CRUD/window routes and bounded recurrence.
- Schedule now merges server occurrences through the existing mapper and exposes an accessible,
  permission-aware create/edit/delete drawer; project/task rows remain derived and independent.
- Frontend is 256/256, backend is 40/40 with real HTTP/PostgreSQL recurrence/isolation/delete coverage;
  production build, lint/design lint, EF drift and all 42 contrast checks pass. Optional booking is next.

## 2026-08-29 (Organization Calendar Phase 3)

- Added a six-week Team Capacity lens using server-owned estimates and weekly working capacities,
  with sticky member rows, Light/Balanced/Heavy bands and explicit `Not enough data` cells.
- Managers can set weekly hours and fill missing task estimates in context; the existing permissions
  remain the authority and every successful edit refetches server-computed totals.
- Frontend is 254/254; production build, lint/design lint and all 42 contrast checks pass. Capacity
  styles are separated from renderer styles to keep Angular's component-style budget clean.

## 2026-08-29 (Organization Calendar Phase 2)

- Added organization-scoped shared filters and one accessible detail drawer for both calendar tabs.
- Added a focused schedule API command using `ManageTasks`; only authorized task bars can move/resize,
  project bars stay immutable, and both renderers revert visibly on failed persistence.
- Frontend is 253/253, backend is 30/30, and build/lint/design lint/contrast pass. Phase 3 capacity must
  add real estimates and working hours rather than infer availability from task counts.

## 2026-08-29 (Organization Calendar Phase 1)

- Enabled the organization Calendar route/navigation with a shared-canvas Schedule and Project Timeline.
  FullCalendar and Frappe Gantt receive only TaskFlow-owned mapped records; no new API or schema exists.
- The browser pass exposed two library-edge issues: FullCalendar v7 needs its explicit theme plugin/CSS,
  and the app's responsive `svg` rule must not collapse Frappe's generated timeline width. Both are fixed.
- The full frontend suite passes 247/247; build, lint/design lint and all 42 contrast checks pass.
  Desktop/mobile Schedule and Timeline rendering, selection and horizontal scrolling were verified.

## 2026-08-28 (Planner Phase 23 — hardening and production rollout)

- Coalesced large-canvas serialization without delaying selection UI and flushes the newest scene before
  project switches or teardown; a shared 5,000-element limit now fails visibly.
- Added Planner build flags/route guards/navigation gating plus explicit legacy browser-scene import,
  embedded-data sanitization, and preservation of the original rollback copy.
- Browser specs pass 240/240; production build, lint/design lint, and Storybook pass. Frontend and API
  were released through Dokploy and live health checks are recorded in the shared completion ledger.

## 2026-08-28 (Planner Phase 22 — primary requirements and comparison)

- Enabled Requirements with immutable Baseline 1 finalization, ordered snapshot inspection, and an
  explicit warning that the primary checkpoint cannot be overwritten.
- Added New/Changed/Removed filters, optional reasons, actor/time history, and field-level diffs using
  five owner-authorized APIs; Angular never infers audit state from Excalidraw.
- Frontend passes 236/236 specs, production build, and lint/design lint; backend passes 22/22 plus EF drift.
  Phase 23 hardening, performance, observability, E2E, and rollout is next.

## 2026-08-28 (Planner Phase 21 — secure project resources)

- Enabled Note/Document templates and added direct Note, Link, and File creation with backend-backed cards.
- Added resource inspector editing, authorized preview/download, safe filename changes, unlink/relink
  retention through the Library, and explicit deletion of stored assets.
- Full Angular suite passes 234/234 and production build/lint pass; backend passes 21/21 with no EF drift.
  Phase 22 primary requirements and comparison is next.

## 2026-08-28 (Planner Phase 20 — admin templates and member library)

- Added `/admin/planner-templates` with draft/edit/publish/archive flows and immutable version visibility.
- Replaced the disabled Planner Library control with published-active template selection, safe defaults,
  and snapshotted colors/dimensions; Note/Document entries wait for Phase 21 resources.
- Full suite is 232/232; production build, lint/design lint, Storybook, detector, backend tests, and EF
  model-drift checks pass. Next is Phase 21 notes, documents, and secure media.

> Append-only. 3–5 lines per session. Focus on gotchas, dead ends, and decisions — things git
> history doesn't capture.
>
> **Planner roadmap complete:** Phases 17–23 are delivered. The current baseline is **115 of 117**
> API endpoints consumed and **240/240** browser specs green, with production build, lint/design lint,
> Storybook, hardened API coverage, and the Dokploy rollout passing.
>
> ⚠️ **Two tabs share one `localStorage`.** Signing into a second portal in another tab re-points the
> first tab's token, and every org-scoped call then 403s ("You do not have access to this resource")
> because the platform admin belongs to no organization. Decode the JWT before suspecting an endpoint.
>
> The **Admin portal** now has Organizations + Platform Settings alongside Users; the **Organization
> portal** has team-scoped tasks, role-filtered assignment, a priority breakdown, a planned-vs-actual
> project timeline and per-team task drill-down. Nothing in the API is unconsumed and nothing in the
> UI is waiting on the backend.
>
> **Read [V1-GAPS.md](V1-GAPS.md) first.** §1 and §2 are empty — the only backend gap left anywhere is
> **forgot-password**, which blocks no built screen. Remaining work is §3 (v1.x): CSV/PDF report
> export, the calendar page, per-member trend charts, E2E tests.

## 2026-08-15 (Individual ↔ organization workspace switching)
- Account type remains the default landing choice, no longer an exclusive portal lock: Individual
  users can use both their private `/member` workspace and organizations they have joined. Admin and
  Organization-account boundaries remain unchanged and have pure policy tests.
- The member facade now loads `GET /organization/mine`, refreshes it after invitation acceptance, and
  reveals a Workspaces switch only when relevant. The organization layout provides the return path;
  an Individual with no memberships gets a recovery state rather than misleading org onboarding.
- Lint/design lint and production build pass. All 16 changed-area specs pass in ChromeHeadless, and
  a broader run passed 215/215 specs after excluding the four-test public-header spec whose real
  navigation deliberately triggers Karma's existing full-page-reload disconnect.

## 2026-08-14 (Forgot password + OTP login, end to end)
- Added a password/email-code method switch to the shared login page, so personal, organization, and
  admin variants inherit the same passwordless flow and continue through the existing session/profile
  routing pipeline.
- Added a dedicated recovery page with generic request copy, one-time-code autofill semantics,
  resend countdown, cross-field password confirmation, strong-password rules, loading/error/success
  states, responsive composition, and reduced-motion handling.
- Wired four new API endpoints through the existing repository/facade layers. Build and lint are clean;
  Karma compiled all specs but ChromeHeadless crashed during sandbox/GPU startup before test execution.

## 2026-07-27 (Design Phases 6 & 7 — functional sweep + accessibility)
- **`type="button"` added to 77 buttons** (0 untyped remain). Inside a `<form>` an untyped button
  defaults to `type="submit"`, so icon buttons in drawers were submitting the form.
- **BOTH mobile menus were completely broken, and neither was in the plan.** `angular.json` has
  `scripts: []` — **no Bootstrap JS is loaded** — so the public header's `data-bs-toggle="collapse"`
  hamburger never opened anything. The org layout's hamburger had no handler at all and its sidebar
  was `d-none d-lg-flex`, meaning **below 992px the org portal had zero navigation**. Both now
  signal-driven (off-canvas + backdrop + `aria-expanded` + Menu→X). Check `scripts: []` before
  trusting any `data-bs-*` attribute in this repo.
- **Hardcoded colors also live in `.ts`.** `productivity-chart.ts` held `#4F6EF7`/`#00A3FF`/`#E8ECF4`
  for its ECharts palette; `design-lint` only scans SCSS so Phase 2 missed them. ECharts is canvas
  and can't read CSS vars — they now resolve tokens through `getComputedStyle`. **Extend design-lint
  to `.ts`.**
- **Two of my own audit numbers were wrong**, both from regexes matching inside HTML comments and not
  handling multi-line tags: "126 buttons missing type" was really **77**; "footer socials ×3" don't
  exist (those were the Product/Company/Resources link columns). **Strip comments before auditing
  markup** — same lesson as design-lint.
- **Programmatic `.focus()` does NOT trigger `:focus-visible`** in Chrome, so an automated focus
  sweep reports false "no focus ring" everywhere. Verify with a real `Tab` keypress.
- **A unit test caught a production bug**: the sidebar swaps its icon to `X`, which wasn't registered
  in the org layout's `LucideIconProvider` — blank icon for real users. The org portal needs the API
  running to browser-verify, so its sidebar is covered by 4 new specs instead (213 tests, +9).
- Dead UI resolved per user decision: org top bar's ⌘K search / "+ Create" / notification bell /
  "See plans" **removed**; "View live demo" scrolls to the mockup; the hero board's fake toolbar is
  now presentational `<div>`s inside `aria-hidden`; legal links are text; login "Forgot?" removed
  (backend-blocked). `pricing-card` and `productivity-chart` now emit real outputs.
- 213/213 tests · contrast 42/42 · `ng lint` clean · design-lint clean · 0 untyped buttons ·
  0 `href="#"` · 0 unnamed icon controls.

## 2026-07-27 (Design Phases 4 & 5 — the button and input systems)
- **92 duplicate definitions deleted** across ~30 files (47 button + 45 form), replaced by two files:
  `styles/components/_button.scss` and `_input.scss`. **Zero templates edited**, so no click handler
  could break — the legacy class names are carried on the new skins' selector lists.
- **`@extend` is a trap in this codebase.** `@extend .btn` also extends **Bootstrap's** `.btn`
  (bootstrap is imported first in `styles.scss`), silently pulling its padding/font/`--bs-*` machinery
  into all 49 legacy buttons. Use explicit selector lists. A `$btn-all` SCSS variable now holds the
  alias list so every rule covers the same set.
- **A bare `.btn.is-loading` matched nothing where it mattered** — auth submits carry
  `sign-in-btn is-loading`, never `btn`. Caught only by testing the state in the browser.
- **Buttons are now pills** (`--btn-radius: var(--radius-full)`), settling the decision deferred from
  Phase 3. The landing page was already pill while app pages were 16px. One token to revert.
- **`.icon-btn` meant three different controls**: 34px row action, 40px circular top-bar affordance,
  and the password-reveal glyph *inside* an input — that last one is an input affordance and moved to
  `_input.scss`. Row actions raised 30–34px → 36px.
- **Three form states did not exist anywhere in the app**: read-only (0 files), invalid (0 files),
  consistent disabled (10 of ~25). All three added and verified live.
- **Debugging trap that cost real time:** reading `getComputedStyle` immediately after toggling
  `disabled`/`aria-invalid` returns the **pre-transition** value, because background/border-color are
  transitioned. Only `cursor` appeared to change, which looks exactly like a specificity bug — I went
  hunting through Bootstrap's cascade and Angular's injected component styles before realising the CSS
  was fine and the *test* was wrong. **Let the transition settle (~350ms) before asserting.**
- **Duplicates hide at two levels.** A top-level-only search found 37 form definitions; the auth pages
  had another full set nested inside `.input-icon-group`. Grep for the class, not just `^.class {`.
- Buttons gained a real **loading spinner** (pseudo-element, no template change — `[class.is-loading]`
  was already bound). Previously "saving…" was a label swap only, so a slow request looked dead.
- 204/204 tests · contrast 42/42 · `ng lint` clean · design-lint clean · landing/login/register
  verified in both themes.

## 2026-07-27 (Design Phases 2 & 3 — color tokens, radius/spacing/elevation rhythm)
- **Phase 2:** 202 color literals → semantic tokens across 40 files. Zero hex left outside masks.
- **The trap worth remembering: `color: #fff` must NOT become `--on-primary`.** ~65 of those sit on a
  brand gradient or a status fill. `--on-primary` flips to near-black in dark mode (because
  `--primary` becomes a light violet), so that mapping would have turned the auth showcase panel's
  text black. Added an **`--on-accent`** set that is deliberately *identical* in both themes, since a
  gradient stays saturated regardless of theme.
- **`mask-image: #000` is an alpha channel, not a color** — tokenising it breaks the mask. The linter
  now skips mask properties; it's the one sanctioned raw-color exception.
- **Decorative ≠ semantic, and only the eye caught it.** A rating star mapped to `--warning` rendered
  **brown** — light-mode status hues are deliberately darkened (`#96530b`) so warning *text* clears
  4.5:1. Decorative gold is `--accent-amber`. Every automated check was green while the stars were
  brown; found by looking at the page.
- **Phase 3:** 285 radius values (24 distinct sizes → 8 steps), **1185** spacing values snapped to the
  4px scale, 18 bespoke shadows tokenised. There was **no spacing token in the codebase at all** before
  this — hence `styles/abstracts/_spacing.scss`.
- **Gave the spacing scale mid-range steps** (`--space-7`=28px, `9`=36px, `11`=44px). A sparse scale
  forces destructive snapping — `1.75rem → 2rem` is a visible reflow; with `--space-7` it's exact.
- **Deliberately did NOT make buttons pills**, though the plan said to. That's Phase 4's call as part
  of building the one button skin; doing it here meant a jarring interim look plus work Phase 4 redoes.
  Phase 3 only quantised existing geometry. **Phase 4 still owes that decision.**
- `design-lint` now **strips comments before matching** — it flagged a hex inside a comment that was
  explaining why that hex had been replaced. Verified it still catches real violations via a probe file.
- Enabled rules are now **font-size, color-literal, border-radius**; only `duration` (89, Phase 8)
  remains pending. 204/204 tests · contrast 42/42 · `ng lint` clean · both themes verified.

## 2026-07-27 (Design Phase 1 — typefaces + type scale + the design linter)
- New work stream: **[DESIGN-PHASES.md](DESIGN-PHASES.md)**, a 10-phase design remediation plan from a
  full audit of the frontend. Headline finding: **the token system is well built and almost entirely
  unused** — 0 uses of the type scale, 0 spacing tokens, 0 radius tokens in features, 197 hardcoded hex,
  `.btn-primary-cta` *defined* in 17 separate files, and the whole `shared/ui` atomic library
  (`<app-button>`, `<app-text-input>`, `<app-form-field>`) referenced **0 times**.
- **Typefaces: Plus Jakarta Sans + Inter → Satoshi (display) + Geist (body) + Geist Mono (metrics).**
  Satoshi is served from the **Fontshare** CDN — self-hosting its woff2 under `assets/fonts/satoshi/`
  is still open. Geist/Geist Mono are Google Fonts. Verified all three load; tabular figures confirmed
  by measuring `1111` vs `8888` at equal width.
- **381 font-size declarations across 39 files** swept onto the scale. Two gotchas worth remembering:
  (1) my first sweep silently skipped every `rem` value because the guard regex `/em$/` also matches
  `rem` — use `(?<!r)em$`; (2) `git ls-files` missed **5 untracked SCSS files**, so the sweep must walk
  the filesystem, not the index. Both cost a re-run.
- **The `clamp()` headlines were tokenised, not flattened.** The plan said map them to discrete steps;
  that would have visibly resized the landing hero. Added `--fs-fluid-hero/-h1/-h2/-h4` instead, which
  also collapsed 6 clamp signatures into 4. Added `--fs-label` (13px) and `--fs-body-2xs` (11px) for the
  two real roles the sprawl clustered around.
- **`styles/base/_typography.scss` was empty** — that is *why* every page sized its own headings. It now
  sizes `h1`–`h6` from the scale, so pages only override when they mean something different.
- **New guardrail: `npm run design:lint`** (`scripts/design-lint.mjs`), wired into `npm run lint`. Only
  the font-size rule is **enabled**; the Phase 2/3/8 rules ship written-but-disabled so the lint can
  never be "temporarily red". `npm run design:report` prints their counts —
  **color-literal 208 · border-radius 284 · duration 89** — which is the Phase 2/3/8 burndown.
- Type CSS vars live in `abstracts/_typography.scss` (alongside their SCSS tokens, per the `_motion.scss`
  pattern), **not** in the theme files — type is not theme-dependent. Family declarations were removed
  from `themes/_light.scss`.
- 204/204 tests green · `a11y:contrast` 42/42 · build clean · no horizontal overflow at 375px.

## 2026-07-26 (follow-up 2 — should the token move to sessionStorage?)
- **It already is, conditionally.** `TokenService.setTokens` picks `remember ? localStorage :
  sessionStorage`, so an unchecked "Keep me signed in" already gives a **tab-scoped** session. The
  cross-tab token swapping happened because the login form defaults `rememberMe: [true]`, so both
  sign-ins went to the shared store. **Rejected making it sessionStorage-only:** it would delete the
  30-day remember-me feature and sign users out whenever they open a link in a new tab — a real cost
  to fix what is only a *testing* inconvenience. It is also **not** a security upgrade: both stores are
  readable by any script on the origin, and the real hardening is httpOnly cookies (a backend change).
- **The question did expose a genuine bug: read precedence was backwards.** `read()` was
  `localStorage ?? sessionStorage`, so a tab holding its own non-remembered session would **silently
  adopt whoever signed in with remember-me in another tab**. Reads now prefer `sessionStorage`, and
  `updateTokens`/`setUser` share the same precedence through a new private `activeStorage()` — a
  tab-scoped session is the more specific answer to "who is using *this* tab". 6 specs added.

## 2026-07-26 (follow-up — "You do not have access to this resource" on the reports page)
- **The reported 403 was not an endpoint bug.** A full sweep of all 28 org GETs as the owner returns
  **200 across the board**; the same four reporting URLs as the **platform admin** return **403**,
  because an admin belongs to no organization. The browser was simply carrying the admin's token —
  two tabs on one origin share `localStorage`, so signing into `/auth/admin` in one tab re-pointed the
  other. **Check the JWT's `nameidentifier` before blaming an endpoint**; decoding it took one line and
  ended the guesswork.
- **But it exposed a real bug: feature state outlived the session.** Every facade is a
  `providedIn: 'root'` singleton whose `init()` no-ops once `_loaded` is true, and **nothing reset
  them on logout** — so signing out and back in as a *different* account left the previous account's
  organizations, tasks and members on screen, with `init()` refusing to refetch. Wrong, and a small
  data leak between accounts.
- **Fixed with one `core` helper, not three ad-hoc effects.** `core/auth/session-reset.ts` exposes
  `resetOnSessionChange(reset)`; the organization, admin and member facades each call it with a
  callback clearing every signal they own, `_loaded` flags included. Keyed on the **user id**, so it
  covers logout *and* account switching, not just the explicit sign-out path.
- **It deliberately ignores the signed-out → signed-in transition.** There is nothing stale to drop
  there, and resetting would race with the `init()` the destination page has already started. Three
  specs pin all of this, including that non-reset.

## 2026-07-26 (Phases 26–29 — Admin + Organization: the last unconsumed endpoints)
- **Maintenance mode exposed a two-request lie in sign-in.** `POST /auth/login` is exempt from the
  maintenance middleware (an admin must be able to get in to turn it off) but the `GET /user/me` that
  follows is not — so a non-admin authenticated **successfully** (login 200), got a 503 on the second
  call, and was told *"Check your credentials and try again."* The password was right. Whenever a
  use-case is two requests, one error branch cannot honestly describe both; `AuthFacade` now reads the
  status and names maintenance explicitly.
- **A 503 is a platform state, not a request failure — so it gets a banner, not a toast.** Maintenance
  fails *every* non-admin request, which with the generic handler meant a toast storm that scrolls the
  one useful message away. New `MaintenanceService` + a sticky banner at the app root; any successful
  response clears it. Verified live: message text came from the admin's own field.
- **`PUT /task` deliberately has no `teamId`, and that's load-bearing.** The backend kept team off the
  update command so a form save can't blank it — the same trap that bit `description` in Phase 17. The
  drawer still shows a team field, but `submit()` routes it to `PUT/DELETE /task/{id}/team` **and only
  when the value actually changed**, so an ordinary save doesn't fire a second request.
- **Assignee pickers must not offer inactive people, and the API is the authority on that.** Added a
  second members signal (`assignableMembers`) fed by `?activeOnly=true`, kept separate from `members`
  (the members page manages inactive rows deliberately). Same endpoint, two different questions. The
  row `<select>` re-adds the *current* assignee when the filter excludes them — otherwise an assigned
  task silently renders as "Unassigned".
- **The team report's two numbers genuinely disagree, so the UI says so.** `tasksAssigned/Completed`
  aggregate over the team's **members**; `tasks[]` is what the team **owns** (`Task.TeamId`). Live data
  shows Completed **0** next to **1** owned task — correct, and it would read as a bug without the note.
- **Moved `OrganizationStatus` into `shared/models`** rather than importing it across feature slices —
  the third time (after `Tone` and `InvitationStatus`) that two features needed the same enum. Lint
  allows features→features, but the precedent is clearer than the permission.

## 2026-07-26 (Phase 23 — Member portal: the Individual account, end to end)
- **Building the new portal was the best test the old code ever got.** Two pre-existing bugs surfaced
  within minutes: `POST /worklog/start` **500'd** on empty notes (`TaskWorkLogs.Notes` was NOT NULL while
  the domain wrote `notes?.Trim()` — the org form always happened to send a string), and
  `.badge[data-tone]` turned out to be **copied into six org page stylesheets and defined nowhere
  globally**, so the new page rendered white-on-transparent — invisible in light mode, accidentally
  readable in dark. A duplicated style isn't a style: it's six chances to forget the seventh.
- **Moved `.badge` into the global `_badge.scss`** rather than adding a seventh copy. The six local
  definitions are identical and now just override it with the same values — deletable as each page is
  next touched.
- **Re-exported the task DTOs instead of redefining them.** `member.models.ts` re-exports
  `TaskListItem` / `SubTask` / `WorkLog` from `organization.models` — same API shapes, so a second
  definition would only create drift. But the **form models are separate**: a personal task has no
  project and no assignee, and `POST /task/personal` rejects both, so sharing the org form model would
  have invited fields the API refuses.
- **Register redirected to a login form that could not work.** With verification live, a new account is
  PendingVerification, so "Account created, please sign in" was a dead end. It now goes to
  `/auth/verify-email`, whose no-token state explains the inbox step and offers resend.
- **`| number: '1.0-1'` on every tracked-hours figure.** The API returns a raw double and the dashboard
  proudly displayed `2.505008592222222h`. Fixed in the member portal and the four org places with the
  same defect.
- **`GET /report/me` and `/worklog/mine` require `?from&to`** — omit them and the model binder yields
  `0001-01-01`, so you get an empty result that reads as "no data" rather than an error. The facade
  always sends a window.

## 2026-07-26 (Phase 22 — v1 completion pass: dead code, skeletons, lists, validation)
- **Deleting nine dead components was the single highest-leverage change.** They held **all 27 remaining
  a11y lint errors**, so removing code nobody rendered took lint from 46 problems to **zero** — the first
  clean lint the project has had. Worth doing before any polish: I nearly spent the a11y budget fixing
  markup that never reaches a browser. Grep the **selector *and* the class name** before deleting, and
  check the barrel/stories too; `bar-chart-molecule` turned out dead as well (the reports page uses
  `ngx-echarts` directly), which the previous session's list of 8 had missed.
- **Two pages were showing an *empty state while still loading*.** The org dashboard's recent-projects
  panel and the reports team panel both branch on "no data", and "not fetched yet" is also no data — so a
  workspace full of projects greeted you with "No projects yet." The fix is ordering: the loading branch
  must come **before** the empty branch, gated on `loading() && !hasData()`. Worth grepping for any
  `@if (x().length)` / `@else` pair that has no loading arm.
- **A `@MaxLength` whose message never renders isn't enforced, it's decorative.** Nearly every drawer
  validated max length but only printed a *required* message, so overrunning a limit silently disabled
  the submit button with no explanation on screen. Every rule now has a message slot.
- **Put the form models at the feature level, not per page.** The task drawer lives on both `tasks-page`
  and `project-detail-page`, the team drawer on both `teams-page` and `team-detail-page` — per-page
  `*.model.ts` files would have been two copies free to drift apart. One
  `organization.form-models.ts` keyed by *concept* (not by page) solves that.
  `login-page.model.ts` stayed page-local because nothing else signs in.
- **The `layouts → features` boundary errors were the rule being wrong, not the code.** A portal shell
  genuinely needs feature state (org switcher, invitation badge, sign-out). Rather than widening
  `allow: ["features"]` — which would delete the fitness function for layouts — declared a **`feature-api`**
  element type matching only `features/*/*.{facade,models,form-models}.ts`, listed **before** `features`
  so it wins first-match. Layouts can now import a facade but still not a page, a route file or a
  repository. Element order matters in `boundaries/elements`: first match wins.
- **`@Output() click` shadows the native DOM event and fires the handler twice.** Two library atoms
  (`Button`, `SignInButton`) had it; neither is rendered anywhere, so it was a latent trap rather than a
  live bug. Renamed to `buttonClick`.

## 2026-07-26 (Phase 21 — Accessibility pass: contrast, keyboard, semantics)
- **The contrast audit was the whole point, and it earned its keep: 9 real failures, all in light mode.**
  The status tokens were on the 500-weight palette (`#10b981` / `#f59e0b` / `#ef4444` / `#3b82f6`), which
  tops out at 2.1–3.8:1 as text on white — so **every status badge in the app failed AA**, the warning
  badge worst at **1.93:1**. Nobody would have caught that by eye; the badges *look* fine. Darkened all
  four plus `--text-subtle`. Dark mode was already compliant (bright hues on near-black) and is untouched
  bar `--text-subtle`.
- Checked before changing: the status tokens are used as **text in 75 places and as a fill in only 7**,
  and all 7 fills pair with `#fff` text — which darker values *improve*. That's what made a single-token
  darkening safe instead of needing to split into `--x` (fill) + `--x-text` (label) pairs. A split would
  also have been fragile: any usage I missed would silently stay inaccessible, whereas one accessible
  token can't be got wrong.
- **The audit script parses `_light.scss` / `_dark.scss` rather than carrying its own copy of the
  values.** A script with hardcoded tokens is a lie waiting to happen — it passes forever while the real
  theme drifts. `npm run a11y:contrast` exits non-zero, so it can go in CI.
- **`--border` was doing two incompatible jobs.** It outlined both decorative dividers *and* form
  controls at 1.18:1. WCAG 1.4.11's 3:1 applies to a control's boundary (it's the only thing identifying
  the control) but not to a separator, so darkening one token would have made every card edge heavy.
  Split out `--border-input` instead — 11 `.form-control` blocks + the shared toolbar controls now use it,
  card edges are unchanged.
- **`role="radiogroup"` with `aria-pressed` children is a lie.** The register account-type toggle
  announced a radio group containing two independent toggle buttons. Fixed to `role="radio"` +
  `aria-checked` + roving tabindex + arrow keys (APG). Lesson: don't claim a role you haven't implemented
  the keyboard contract for — the un-roled version was *more* honest than the half-roled one. Note the
  `keydown` binds on the radios, not the group: the group isn't focusable, so a handler there fails
  `interactive-supports-focus`.
- Converted 12 drawer backdrops from `<div (click)>` to labelled `<button>`s, with one global chrome
  reset in `_modal.scss` so no page needed its own rule. Same trick as the Phase 20 user rows — reaching
  for a real button beats bolting `tabindex` + `keydown` onto a div every time.
- ⚠️ **Found 8 dead `*-molecule` components** (pre-restructure scaffold, wrong naming convention,
  referenced only by their own 5 files). They hold **all 27 remaining a11y lint errors**. Flagged for
  deletion rather than spending the a11y pass fixing code nobody renders — polishing dead code would have
  made the lint number look good while changing nothing a user experiences. **198/198 green.**

## 2026-07-26 (Phase 20 — Admin user-detail drawer + subtask rename)
- Closed the last two *reachable* endpoints. Coverage **66/71 → 68/71**; the remaining 3 are the
  personal-task "mine" reads, which have no create-side endpoint, so **there is no wiring work left**.
- ⚠️ **The finding of the session: `GET /user/{id}` refuses a platform admin.** Clicking a row as
  `admin@taskflow.com` returned *"You do not have access to this resource."* The query is marked
  `IUserScopedRequest`, so `AccessGuardBehavior` runs `EnsureUserAsync` — which allows only **yourself or
  someone who shares an organization with you**, with **no Admin bypass**. So `GET /user` (AdminOnly)
  hands the admin a list of accounts it is then forbidden to open: the two authorization models disagree.
- **How that was handled matters more than the bug.** The first cut let the error interceptor's toast
  fire and closed the drawer, which reads as "the feature is broken". Instead the facade now
  distinguishes *refused* from *loading*, and the drawer holds open with a state naming the exact guard
  and the fix it needs. Confirmed the drawer itself is correct by opening the **admin's own row**
  (`EnsureUserAsync` returns early for self) → `GET /user/1 → 200` and every field rendered. Worth
  remembering: when an endpoint is wired correctly but the API's authorization makes it unusable, say so
  in the UI rather than hiding it — a silent toast would have looked like a frontend defect forever.
- Turned the user rows from `<div>` into `<button>`. A clickable div is invisible to the keyboard, and
  the a11y lint rules (`click-events-have-key-events`, `interactive-supports-focus`) exist for exactly
  this; making it a real button gets Enter/Space and a focus ring for free instead of bolting on
  `tabindex` + `keydown` handlers.
- Subtask rename is **inline** with its own form group rather than reusing the Add box — sharing one
  control would have meant the Add field mysteriously filling with an existing title. Closing the drawer
  cancels a pending rename, otherwise reopening it would land mid-edit on a stale subtask id.

## 2026-07-26 (Phase 19 — Organization settings: rename + delete)
- Closed the last entity CRUD gap. Coverage **63/71 → 66/71** (`PUT /organization`,
  `DELETE /organization/{id}`, `GET /organization/{id}`).
- **The same list-DTO-vs-update-command trap as Phase 17, one level up.** `OrganizationListItem`
  (`/mine`, what the sidebar switcher holds) carries **no `description`**, but `UpdateOrganizationCommand`
  requires one — a form filled from the switcher would have silently blanked every org's description on
  the first rename. Only `GET /organization/{id}` → `OrganizationDetailDto` has it, so the page loads the
  detail and fills from that. Worth treating as a rule now: **always diff the list DTO against the update
  command before writing an edit form.**
- After a rename the page re-fetches the detail *and* `/mine` — the name is rendered by the sidebar
  switcher, which reads the list DTO, so refreshing only the detail would have left a stale name on screen.
  `refreshOrganizations()` re-points `_currentOrg` in place rather than calling `loadOrganizations()`, which
  would have re-forkJoined all seven org-scoped lists for a name change.
- **New `DialogService.confirmTyped()`** (SweetAlert `input` + `preConfirm`) — deleting an organization
  takes its projects, tasks, teams, roles and memberships with it, and a one-click `confirmDelete` felt
  far too cheap for that. The user must type the org's name; the message names the real counts pulled
  from the dashboard summary.
- Delete resets every org-scoped signal before re-resolving `/mine`, so the portal lands on either a
  remaining workspace or the create-organization onboarding with no stale data. Verified exactly that:
  created a throwaway org via the API, switched to it in the switcher (the settings page reloaded
  reactively — the `currentOrgId` effect), deleted it, and the portal fell back to Northwind Labs with
  its own data reloaded.
- ⚠️ **Backend finding — no authorization on org update/delete.** `AccessGuardBehavior` only gates
  requests marked with the read-side scoped interfaces; `UpdateOrganizationCommand` and
  `DeleteOrganizationCommand` are unmarked and their handlers check only that the org exists. So **any
  authenticated user can rename or delete any organization by id**. The frontend gates the form and the
  danger zone on ownership, but that is a usability gate, not a security boundary — the backend needs an
  ownership check (or `IOrganizationScopedRequest` extended to the write side). **191/191 green.**

## 2026-07-26 (Phase 18 — Invitation accept/reject: the invitee's side)
- **The design call that mattered:** the roadmap said "a my-invitations screen on the member portal", but
  invitations are addressed to a **user**, not a portal — an Organization account can be invited into
  another org too. Building it member-only would have hidden invitations from exactly the account type
  that owns an organization. So the standalone page is mounted at **both** `/member/invitations` and
  `/organization/invitations`, one component, badge on both navs.
- That decision also made the feature **testable with existing credentials**. The only Individual test
  account is Jane, whose password isn't recorded anywhere, and registering a new user is a dead end (new
  accounts are `PendingVerification`, login throws `EMAIL_NOT_VERIFIED`, and there's still no verify
  endpoint). But the **org owner had no membership row**, so she was a legitimate invitee: she invited her
  own address and ran the whole loop. **No DB writes were needed** — worth remembering next time this
  looks blocked.
- `GET /mine` only returns **Pending** rows, but a pending row can still be past `expiryDate`, and the
  API 400s if you accept one. The page therefore splits actionable from expired (dimmed, Dismiss only) and
  the badge counts only actionable — otherwise the UI would offer a button the server always refuses.
- Extracted `Tone` and the invitation DTO into `shared/models/` (first real occupants of that folder).
  `Tone` had been copy-pasted in both the organization and admin slices; a third copy in `member` was the
  push to share it. `organization.models.ts` re-exports both, so no existing import changed.
- Replaced the member dashboard's hardcoded stats ("8 active tasks", "23 completed this week") with the
  real invitation count. Those numbers were pure fiction for a portal with no task data.
- ⚠️ **Backend finding: `RemoveMember` and `DeactivateMember` are literally the same handler** — both call
  `member.Deactivate()`. So "Remove" doesn't remove: the member stays listed as *Inactive*. Found it while
  restoring test state and wondering why the owner was still in the list. Frontend copy now tells the
  truth; the backend should pick one behaviour. **184/184 green.**

## 2026-07-26 (Phase 17 — Edit & delete pass: projects, tasks, teams, roles)
- Audited the API against the frontend before starting: **71 endpoints, 51 reachable from the UI**. The gap
  wasn't random — 9 of the 20 unused endpoints were update/delete, i.e. nothing in the app could be edited
  or deleted. That audit set this phase's scope; coverage is now **60/71**.
- **The trap of the session:** `UpdateTaskCommand` requires `Description`, but `TaskListItemDto` — what
  every task table renders — **doesn't carry one**. Filling an edit form from a row and saving would have
  silently wiped the description on every task edited. Only `GET /task/{id}` (`TaskDetailDto`) has it, so
  the edit flow opens the drawer from the row and then patches the description in from the detail call.
  **Lesson: before writing an edit form, diff the list DTO against the update command — a missing field is
  a silent data-loss bug, not a compile error.** Two tests pin it.
- The update commands are all **partial** (no status / start date / project reassignment). Rather than
  ship inputs that silently do nothing, edit mode hides those fields and shows a `.drawer-note` saying why.
  Same idea on projects: status follows the tasks, so it isn't editable by hand.
- Detail-page deletes need to navigate away, but only if the delete actually succeeded — so
  `deleteProject`/`deleteTeam` take an optional `onDeleted` callback that fires in the `next` handler.
  Kept the facade signal-based everywhere else; the callback is only for "the record I'm looking at is gone".
- Also deleted `API.User.Update` / `API.User.Delete` from the endpoint map — `UserController` has no PUT or
  DELETE, so the map was advertising routes that never existed.
- Verified live with throwaway records so the dev DB is left exactly as found: temp task created→deleted,
  temp project created→deleted from its detail page (navigated back), Engineering's description edited,
  task description round-tripped through an edit to prove the blank-out trap is closed. **177/177 green.**

## 2026-07-26 (Phase 16 — List pagination + filtering)
- Built the pager as **two independent pieces**: `createPagination()` (`shared/utils/pagination.ts`, pure
  signal state) and a dumb `Pagination` molecule that only takes `page`/`pageSize`/`total` and emits intent.
  The molecule never imports the helper, so either can be used alone (and the molecule stays testable with
  plain inputs).
- **Key design decision:** the pager's public `page` is a `computed()` clamp over a private writable, not
  the writable itself. Filtering while on the last page then just resolves to the last real page — with an
  `effect()` you'd get a second change-detection pass and an intermediate empty render. Re-widening the
  filter even restores the originally requested page, which falls out of the same trick for free.
- Toolbar styles went **global** (`styles/components/_toolbar.scss` → `.list-toolbar`/`.list-search`/
  `.list-filter`/`.list-no-match`) rather than being copy-pasted per page. Deliberately used `list-`
  prefixed names instead of the admin page's generic `.toolbar`/`.search`/`.filter-select`: global rules
  pierce component encapsulation, so generic names would have collided with page-local `.search` blocks.
  The admin users page was migrated to the shared classes and its local copies deleted.
- Gotcha: `TaskListItem` has **no `description`** (unlike `Project`), so the tasks search is title-only —
  check the DTO before writing a search predicate.
- Testing: the org pages get real data by stubbing **`OrganizationRepository`** (all 9 methods
  `OrganizationFacade.init()` fans out to, each returning `of(...)`) — much simpler than faking the facade,
  and it exercises the real facade→page signal wiring. Verified live at 1 row/page (temporarily) to see real
  page buttons, since the test org only has 2 tasks. `ng build` passes; suite **159/159**.

## 2026-07-25 (Phase 15 — Accessible drawers: focus-trap dialog directive)
- Built `DialogDirective` (`appDialog`, `shared/directives/dialog.directive.ts`) and put it on all **10**
  slide-in drawers in the org portal. It marks the panel `role="dialog"` + `aria-modal="true"` +
  `tabindex="-1"`, auto-links `aria-labelledby` to the drawer's first heading, moves focus to the first form
  field on open, traps Tab/Shift+Tab, emits `(dismiss)` on Escape (each wired to the drawer's existing close
  handler), and restores focus to the trigger on close. Pure DOM; uses `output()`; relies on the drawers
  being `@if`-created so open=ngAfterViewInit, close=ngOnDestroy.
- **Focus-restore gotcha while verifying:** opening the drawer via a programmatic `element.click()` in the
  console does NOT focus the trigger button, so `document.activeElement` at init was `<body>` and focus
  "returned" to body on Escape — looked like a bug but wasn't. A **real mouse click** focuses the button, so
  a real click → Escape correctly returned focus to the "New project" trigger. Lesson: verify focus-restore
  with a real click, not JS `.click()`.
- Refined `focusFirst()` to prefer the first INPUT/TEXTAREA/SELECT over a leading close button (nicer for
  form drawers) — confirmed focus lands on `INPUT[fc=title]` on open.
- Verified live on the create-project drawer (aria attrs + focus-in + Escape-close + focus-restore); 4 unit
  tests via a test-host component (aria wiring, labelledby, Escape-dismiss, Tab-wrap). `ng build` passes,
  full suite **126/126**.

## 2026-07-25 (Phase 14 — Loading skeletons)
- Built a theme-aware `Skeleton` atom (`shared/ui/atoms/skeletons/skeleton/`, 5 files) wrapping
  `ngx-skeleton-loader` (installed but unused). The wrapper exists because ngx-skeleton-loader renders a
  light shimmer that looks wrong in dark mode — the atom paints the base with the `--surface-inset` token
  and picks `progress` / `progress-dark` animation from `ThemeService.isDark()` via the `[theme]` +
  `[animation]` inputs, so every skeleton matches the design system in both themes with no per-usage styling.
- Replaced the generic loading states (plain "Loading…" text on projects/tasks, Lottie dots on
  users/members) with **content-shaped** skeletons: users → member-row shape, projects → 6 card skeletons,
  tasks → table rows matching the 5 columns, members → member-grid rows. Each loading branch is
  `aria-busy="true"` + aria-labelled. Tiny per-page `.sk-lines`/`.sk-card` flex helpers space the stacked lines.
- **Verifying a transient skeleton:** the org facade caches its data, so SPA nav doesn't refetch and the
  skeleton never re-shows; a **full page reload** re-bootstraps the app → `loadOrgData` forkJoins ~7 calls →
  a wide enough loading window. Issue `navigate` + `screenshot` back-to-back (same turn) to catch it — doing
  them in separate turns is too slow. Caught the projects card-grid skeleton in light, toggled dark + reloaded
  to confirm theme-awareness.
- `ng build` passes; full suite **122/122** (+4 skeleton tests). Remaining list pages (teams/roles/reports/
  project-detail/team-detail/dashboard) still use the old loading states — same atom applies when wanted.

## 2026-07-25 (Phase 13 — Confirm dialogs on destructive actions)
- Wired confirmation dialogs into every destructive action so nothing deletes on a single click. Used the
  pre-existing `core/services/dialog.service.ts` (sweetalert2), but first **made it theme-aware**: sweetalert
  renders in a portal at the document root (outside Angular's `[data-theme]` scope), so it was white in dark
  mode. Fix: read the design tokens off `:root` at call time via
  `getComputedStyle(documentElement).getPropertyValue('--surface'|'--text'|'--danger'|…)` and pass
  `background`/`color`/button colors through — now on-palette in both themes with zero token duplication.
  Added a `confirmDelete(title, text?, confirmText?)` helper (red confirm, Cancel focused).
- **Layering decision:** put the confirm at the **page/handler** level (presentation), not in the facade —
  the dialog is a UI concern, and the facades stay pure orchestration. Handlers (`remove`, `cancelInvite`,
  `deleteSubtask`, `deleteLog`) became `async` and only call the facade after `await dialog.confirm…`
  returns true. Covered: member remove, invitation cancel (members-page), team-member remove (team-detail),
  subtask + worklog delete (tasks-page). Left `deactivateMember` un-gated (reversible toggle, not destructive).
- **Verified live** as the org owner on Engineering (teamId 2): Remove → "Remove from team? Jane Doe will be
  removed from Engineering." with a red Remove + focused Cancel; cancelled both times so Jane stays seeded.
  Confirmed themed correctly in dark mode too (dark card / light text / red button). `ng build` passes.
- **Turned the test suite green** while here: 15 specs were failing on missing TestBed providers (not real
  bugs), surfaced once I ran the full suite. Fixes by category: facade-backed pages → `APP_SETTINGS`
  (+ http/toastr/router for login & org-layout); echarts organisms → `provideEchartsCore({ echarts })`;
  public partials + landing card → `provideRouter([])`; `LandingFeatureCard` → set its required `feature`
  input via `fixture.componentRef.setInput` + provide the lucide icon; replaced the stale CLI App "should
  render title" test with a router-outlet check. **118/118 green.** Reusable rule: any page whose facade
  reaches `ApiService` needs `APP_SETTINGS` provided in TestBed.

## 2026-07-25 (Phase 12 — Validation engine + register form)
- Built the `shared/validations/` decorator engine (the flagship Polish item; folders were empty). Design:
  property decorators register rules into a class-keyed `WeakMap` registry (prototype-chain-aware for
  inheritance); `validate(Model, obj)` runs them into an immutable `ValidationResult`. Angular glue:
  `controlValidators` (per-control, field-scoped) + `crossFieldValidator` (group-level, model-scoped like
  `@Matches`) + `messageFor` (touched-gated template message). Import from `@shared/validations`.
- **Decorator flavor matters:** tsconfig has `experimentalDecorators: true` and **no** `emitDecoratorMetadata`,
  so property decorators use the legacy `(target, propertyKey)` signature (`target` = prototype) and there's
  no `design:type` metadata — hence the explicit registry as the single source of truth. Rules PASS on empty
  (except `@Required`/`@IsTrue`) so an optional field isn't flagged by `@MaxLength` etc., mirroring
  FluentValidation's `.NotEmpty().MaximumLength()` chaining.
- **Kept the Angular adapters pure** (return error maps, never `setErrors`) to dodge the classic
  validator-setting-errors recursion. Controls still get `.ng-invalid` because field rules become real
  per-control `ValidatorFn`s; cross-field lives on the group and `messageFor` routes it back to the target
  property.
- **Wired into register** (`register-page.model.ts` = `RegisterFormModel` mirroring `RegisterUserCommandValidator`).
  Replaced inline `Validators.*` + the ad-hoc `passwordsMatch` fn; templates now use `fieldError(prop)`.
  Verified live: bad email / short phone / weak password / mismatched confirm each show the decorator's
  message (incl. cross-field "Passwords don't match.").
- **Spec gotcha:** the pre-existing register spec was already broken — a facade-backed page needs
  `APP_SETTINGS` provided (AuthFacade → AuthRepository → ApiService → APP_SETTINGS), on top of the usual
  toastr/animations. Added it. 16 engine + 4 register tests green. `ng build` passes.

## 2026-07-25 (Phase 11 — Admin portal: Users + real dashboard)
- Built the first real Admin-portal features, mirroring the org feature-slice shape exactly:
  `admin.models.ts` (UserStatus/AccountType exact-int enums + `userStatusMeta`/`accountTypeMeta` tone
  helpers), `admin.repository.ts` (`getUsers` → `GET /user`, `getUser` → `GET /user/{id}`), `admin.facade.ts`
  (users signal, once-only `init()`, derived stat computeds). **Users page** (4 files) = stat tiles + search +
  status/account-type filter selects + accounts table; **dashboard** rewired to real counts + a link card.
- **`GET /user` is AdminOnly** (`AuthorizationPolicies.AdminOnly`) — the only platform-wide admin endpoint
  that exists. There is **no list-all-organizations** endpoint (`GET /organization/mine` is per-user) and
  **no platform-settings** endpoint, so the dashboard's "organizations & settings" card is an honest
  backend-blocked note, not a fake page. `GET /user/{id}` (UserDetailDto) exists for a future detail drawer.
- **Seeded admin creds** (found in `TaskFlow.Infra/Seeder/Identity/User/UserSeader.cs`):
  **admin@taskflow.com / Admin@123**, Individual account + Admin system role, email pre-verified → lands on
  `/admin`. Verified the login API + `GET /user` returns 3 users with the exact DTO shape before driving the UI.
- **Spec gotcha (same as org pages):** a page whose facade injects `NotificationService` pulls in
  `ToastrService` → needs `provideToastr()` + `provideAnimations()` in TestBed, and `provideLottieOptions()`
  for the `LottiePlayer` atom. Without them even "should create" fails with NG0201 (No provider for
  ToastConfig). Wrote 4 real tests (stats/search/status) with a mocked `AdminRepository` — all green.
- Verified live as admin: dashboard real counts, Users filters (Organization → 1 row), dark mode fully
  tokenized. `ng build` passes.

## 2026-07-25 (Phase 10 — Dark-mode theming of the org portal)
- Broad, mechanical SCSS sweep: converted every light-only hardcoded color in the org portal to the
  semantic CSS-var tokens so **dark mode works**. Touched **10 files** — the org-layout shell, all 9 org
  pages, and the shared `organisms/project-health-chart` (the dashboard donut card was the one panel still
  white in dark until I tokenized the organism too — reminder: shared organisms used by the portal need
  the same treatment, they're outside `features/organization/`).
- **Mapping** (kept consistent so it's easy to extend): `#fff`→`--surface`, subtle bg→`--surface-2`,
  inset→`--surface-inset`, page→`--bg`; borders→`--border`/`--border-strong`; `#111827`→`--text`,
  muted→`--text-muted`, subtle→`--text-subtle`; accents→`--primary`, fills→`--gradient-brand`; badge pairs
  →`--info`/`--info-soft` etc.; shadows→`--shadow-*`; focus→`--ring`. **Kept literal `#fff`** for text/glyphs
  sitting on gradients/colored chips, and kept the stat-card icon chips as fixed saturated hues (white
  glyphs read on both themes — the semantic status tokens go too light in dark for white text).
- **Removed the `color-scheme: light` pins** on the date/datetime inputs (tasks + reports) that earlier
  sessions added for the light-only era — now the native pickers follow the theme via the root
  `color-scheme`. The org top-bar theme toggle already existed, so dark mode "just worked" once tokens landed.
- **Verified both themes live**: dark dashboard (incl. the previously-white Task-status donut card now dark),
  the time-tracking drawer (primary-soft tracked pill, themed datetime inputs, running/timer cards), reports
  (echarts + tables + date inputs), then toggled back to light — unchanged. `ng build` passes, no budget regressions.

## 2026-07-25 (Phase 9 — Work-log / time-tracking + Org switcher)
- Built the **work-log** slice (read the backend `WorkLogController` + `TaskWorkLog` first): a time-tracking
  drawer on each Tasks-page row (Time button) with Start/Stop timer, manual entry, total, and a history list.
  `api/worklog` (all raw): `GET /task/{id}`, `POST /start {TaskId,Notes?}`, `PUT /stop {WorkLogId,Notes?}`,
  `POST /manual {TaskId,StartedAt,EndedAt,Notes?}`, `DELETE /{id}`. Verified all live (start 200/stop 204/
  manual 200/delete 204); dashboard then showed **2.5h tracked** — so `trackedHours` finally populates.
- **Two backend behaviors to remember:** (1) **one running timer per user** across all tasks — starting a
  second returns **409** `WORK_LOG_ALREADY_RUNNING` (surfaced by the error interceptor). (2) `POST /worklog/
  manual` throws a domain `ArgumentException` for end-in-future / end≤start, and the API **maps that to a
  generic 500** (not 400). Hit this live because the **server clock is UTC** and "11:30 today" local
  (UTC+5:30) is future in UTC. Added a **client guard** (future/order errors + `max` on the datetime inputs)
  so users never trigger the 500, and **flagged the backend mapping** as a separate task (spawn_task).
- **Org switcher:** the org-layout sidebar still had a hardcoded "Acme Inc." card — replaced it with a real
  one bound to `OrganizationFacade` (`organizations`/`currentOrg`/`selectOrganization`), a dropdown when
  there's >1 org (check on the active one) and a static card for a single org. Layout now calls
  `orgFacade.init()`. Only one test org exists, so multi-org switching is code-verified, single-org rendering
  live-verified ("Northwind Labs / NL").
- **datetime-local gotcha** (same family as the Phase 6 date-input one): pinned `color-scheme: light` on the
  tasks-page `.form-control` so native pickers match the light theme. To send UTC, `new Date(localValue).
  toISOString()` (datetime-local value is local wall-clock).
- `ng build` passes (tasks-page chunk grew to 30.8 kB / 7.2 kB gz — under budget). Design tokens/dark mode
  across the org portal is the last big polish item → Phase 10.

## 2026-07-25 (Phase 8 — Team detail + Subtasks)
- Built the last two org-portal gaps, mirroring the existing feature slice exactly. **Team detail**
  (`team-detail-page`, 5 files, `/organization/teams/:id`): `GET /team/{id}` (TeamDetailDto w/ members),
  add via `POST /team/{teamId}/members/{userId}`, remove via `DELETE` (both 204). Picker = active org
  members minus those already on the team (`availableMembers` computed). **Subtasks**: a drawer opened from
  a clickable chip on each Tasks-page row — `GET/POST/DELETE /subtask`, `PUT /subtask/{id}/complete|reopen`.
  Added `API.SubTask.*` + repo/facade methods, `SubTask`/`TeamDetail`/`TeamMember` models.
- **Backend auto-completes the parent task when all its subtasks complete** (and flips it back to
  In progress on reopen) — observed live: completing the one subtask on taskId 3 moved the task Todo→
  Completed; reopening moved it Completed→In progress. Good to know for the reports/dashboard counts.
- **Facade pattern for badge freshness:** `afterSubTaskChange(taskId)` reloads the open drawer's subtasks
  **and** the org task list (+ open project tasks) so the `completedSubTaskCount/subTaskCount` row badge
  recomputes immediately (0/0→0/1→1/1→0/1→0/0 verified). `afterTeamMemberChange` reloads team detail +
  teams list (member counts).
- **Add-member endpoint takes userId in the URL, empty body** (`POST /team/{id}/members/{userId}`, not a
  body command). `getTeam` uses the existing `API.Team.GetById`. All raw (unenveloped), like the rest.
- Verified the full CRUD loop live against the API (see PHASES Current Status for the exact 204/200 trail),
  incl. mobile 375px (header stacks, member rows → stacked cards, drawers full-width). `ng build` passes
  (new lazy chunks: tasks-page 21.9 kB, team-detail-page 11.7 kB). Left Jane on the Engineering team as
  seed data.

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

## 2026-08-15 (Private personal projects + Excalidraw Planner)

- Added the Individual **Projects** workflow end to end: creator-scoped repository/facade state, project
  CRUD UI, and optional project selection when creating personal tasks. Organization assignment/team
  controls remain absent by design.
- Added `/member/planner` and the header link. Excalidraw is mounted as a React island inside Angular,
  lazy-loaded, with fonts/CSS packaged locally and a per-user browser autosave key. Cloud persistence is
  deliberately deferred until the Planner data model is designed.
- Local development now runs the Angular and .NET servers directly. The API uses development-only local
  filesystem object storage, while production keeps the existing S3-compatible provider.
- `npm run build`, `npm run lint`, and backend build passed. Karma compiled the suite, but this Windows
  host's ChromeHeadless GPU process crashed before test execution; live browser/API checks were used for
  functional verification.

## 2026-08-28 (Planner Phase 18 — cloud persistence and recovery)

- Connected the Planner to the authorized board/scene/history API with debounced revisioned saves;
  cloud state is authoritative and IndexedDB is now only an ordered per-user/project recovery cache.
- Added truthful saving/saved/offline/failed/conflict states, local-vs-server conflict resolution,
  recovery-unavailable messaging, and protection against serializing embedded binary files.
- Added a stable Karma launcher for this Windows host and repaired pre-existing specs exposed by the
  first complete browser run. All 230 specs pass; production build, lint/design lint, and Storybook
  build pass. Phase 19's linked canonical work objects are next.

## 2026-08-28 (Planner Phase 19 — linked work objects and inspector)

- Added stable project/task/subtask canvas cards whose layout stays in Excalidraw while business
  fields, status, dates, counts, and completion remain authoritative in TaskFlow.
- Added Add work and Details flows with responsive drawers, canonical create/edit commands, live
  progress labels, automatic linked-card rehydration, and explicit unlink-versus-delete controls.
- Extended project typing for problem statement, budget/currency, and approximate duration while
  keeping old personal and organization project screens compatible.
- All 231 browser specs, production build, lint/design lint, Storybook, and UI detector pass; backend
  integration covers ownership, exact-once creation, external completion refresh, and removal semantics.

## 2026-08-30 (Organization Meetings Phase 1 — backend contract handoff)

- The backend-first Phase 1 is complete: the meeting aggregate, migration, three permissions and 13
  feature-gated management/metadata endpoints are ready for the organization UI.
- No Angular production surface changed in this phase. Phase 2 can now add the Meetings navigation,
  management/scheduling pages and Calendar derivation against a tested authoritative contract.
