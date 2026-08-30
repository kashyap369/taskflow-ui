# TaskFlow UI — Project Overview

## What It Is
TaskFlow UI is the **Angular 20 frontend** for the TaskFlow Task Management System. It is a single-page SaaS application that consumes the TaskFlow API (ASP.NET Core + PostgreSQL, Clean Architecture/DDD/CQRS — see the backend docs at `D:\Projects\TMS\TaskFlow\docs\`). The API already has CORS configured for `http://localhost:4200` (the Angular dev server).

The app mirrors the backend's **two account types** through separate **portals**, each with its own layout shell and route branch:

1. **Individual (normal user)** → the **member** portal — a person managing their own tasks.
2. **Organization (company)** → the **organization** portal — a company workspace with an owner, custom roles, teams, members, projects, and a reporting dashboard.

Plus two supporting portals: a **public** marketing site (landing, pricing) and an **auth** shell (login and, later, register / forgot-password). An **admin** portal is scaffolded for platform administration.

## Design Philosophy
The project is deliberately built to enterprise standards, applying backend discipline (Clean Architecture, DDD, CQRS-style read/write split) to an Angular frontend. The owner is a senior .NET developer, so patterns are chosen to feel familiar coming from ASP.NET Core:

| ASP.NET Core | Angular equivalent used here |
|---|---|
| Middleware | HTTP Interceptors |
| Authorization Policy | Route Guards |
| Services / DI | Services + `inject()` / DI tokens |
| DTOs + Mappers | Feature `*.models.ts` (DTO + mapper) |
| Repository | Feature `*.repository.ts` |
| Application service | Feature `*.facade.ts` |
| appsettings.json | `src/environments/*` + `AppSettings` |

Two structural pillars:
- **Component-Driven Development with Atomic Design** — a reusable UI library under `src/app/shared/ui/` split into atoms → molecules → organisms, developed and documented in Storybook. See [ATOMIC-DESIGN-GUIDE.md](ATOMIC-DESIGN-GUIDE.md).
- **Multi-portal architecture** — one layout per portal, lazy-loaded feature slices, role-driven route matching so an unauthorized portal's bundle is never downloaded.

State is **signals + facades** (not NgRx). Boundaries between the four buckets (`core` / `shared` / `layouts` / `features`) are enforced with TypeScript path aliases and `eslint-plugin-boundaries`.

## What the Frontend Must Eventually Cover (mirrors the backend surface)

### Individual users
- Register / log in as an Individual account.
- Personal workspace: create tasks with subtasks; track lifecycle (Todo → InProgress → Completed, reopen).
- Personal tracking & reports: tasks created/completed over weekly / monthly / yearly views.

### Organizations
- **Owner** registers the organization and administers it.
- **Custom roles** with a **permission** catalog (e.g. "can create projects", "can assign tasks"); grant/revoke per role.
- **Invitations** — invite members by email; accept/reject; activate/deactivate/remove/move roles.
- **Teams** — group members (e.g. Developer Team, Designer Team); per-team task and report views.
- **Tasks & assignment** — org tasks (standalone or under a project) assigned to members, optionally role-filtered.
- **Projects** — permission-designated members create projects, add tasks/subtasks, and assign members.

### Approved post-v1 roadmap: Meetings

Organization Meetings is approved but not implemented. It will support registered members and
email-verified guests without TaskFlow accounts, revocable invite/share links, separate meeting
capabilities and custom display badges, a custom Angular/LiveKit room, durable collaboration/attendance,
and consent-aware recording. Start from [MEETINGS.md](MEETINGS.md).

### Reporting & Dashboard (headline feature)
A strong dashboard backed by the API's Dapper read side:
- Which team performed which tasks, and in what duration.
- Weekly / monthly / yearly reports for a member and for a team.
- Task reports (created vs completed, overdue, by status/priority).
- Project reports (progress, workload distribution, timeline).
- Time & tracking — durations from start → completion (the API's live timer + manual work logs).

## Where the Frontend Stands vs This Vision
**All three portals are complete (Phases 26–29, 2026-07-26).** Every endpoint the backend exposes that warrants a screen is reachable from the UI — **80 of 82**, the two exceptions being deliberate skips that would only re-render data already on screen. Every screen is built, themed, accessible and tested. In short:
- ✅ **Architecture & tooling** — folder buckets, path aliases, ESLint boundaries (zero violations), Storybook, SCSS design system with light/dark tokens, environments, HTTP interceptor pipeline, guards, signal-based auth session.
- ✅ **Public marketing site** — a substantial landing page renders through the public layout.
- ✅ **Design system** — atoms/molecules/organisms with Storybook stories and the a11y addon set to fail on an axe violation.
- ✅ **Auth** — register → **email verification** → login, with role-based redirect (Admin → admin, Organization → org, Individual → member); three login entry screens share one component; session rehydration and logout work. **Forgot-password is still backend-blocked** (no endpoint).
- ✅ **Organization portal** — dashboard, projects, project detail, tasks, subtasks, work-log/time-tracking, teams, team detail, members + invitations, roles + permissions, reports and settings, all on live API data with full create/edit/delete. Tasks carry an **owning team** (with a per-team task list on team detail), assignee pickers are **filtered server-side by role and active status**, and reporting covers **priority breakdown, project planned-vs-actual timeline and which tasks each team owns**.
- ✅ **Admin portal** — dashboard, Users (with a detail drawer that opens **any** account), **Organizations** (every workspace with its owner and counts) and **Platform settings** (application name, support email, and the registration + maintenance switches, both genuinely enforced by the API). A 503 `MAINTENANCE_MODE` surfaces as a banner across every portal.
- ✅ **Member (Individual) portal** — a real personal workspace: **My tasks** (filters, paging, create/edit drawer, Start/Done/**Reopen**, subtasks, time tracking) and a dashboard on live counts + `GET /report/me`. Plus the invitations page, mounted in both portals.
- ✅ **Custom validations engine** — the FluentValidation-style decorator engine in `shared/validations/` is built and backs **every** reactive form in the app.
- ✅ **Automated tests** — 204 unit specs (TestBed), covering facades, page filtering/paging, the validation engine and the shared components. No E2E suite yet.

The backend is fully implemented end-to-end. See **[V1-GAPS.md](V1-GAPS.md)** for exactly what v1 excludes and why, [PHASES.md](PHASES.md) for the phased history and current status, and [ARCHITECTURE.md](ARCHITECTURE.md) for how the pieces fit together.
