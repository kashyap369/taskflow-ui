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

### Reporting & Dashboard (headline feature)
A strong dashboard backed by the API's Dapper read side:
- Which team performed which tasks, and in what duration.
- Weekly / monthly / yearly reports for a member and for a team.
- Task reports (created vs completed, overdue, by status/priority).
- Project reports (progress, workload distribution, timeline).
- Time & tracking — durations from start → completion (the API's live timer + manual work logs).

## Where the Frontend Stands vs This Vision
**Foundation is complete; feature build-out has just begun.** In short:
- ✅ **Architecture & tooling** — folder buckets, path aliases, ESLint boundaries, Storybook, SCSS design system, environments, HTTP interceptor pipeline, guards, signal-based auth session.
- ✅ **Public marketing site** — a substantial landing page renders through the public layout.
- 🟡 **Design system (component library)** — a growing set of atoms/molecules/organisms exist with Storybook stories; many categories are still empty placeholders.
- 🟡 **Auth** — **login is wired end-to-end with role-based redirect**: the login form calls the API, stores the session (token + refresh token), fetches the profile for account type, and routes the user to their portal (Admin role → admin, Organization → org, Individual → member). Three login entry screens (solo / organization / admin) share one component. Register, refresh-token rotation, real logout call, and forgot-password are **not** built yet.
- 🟡 **Organization portal** — a dashboard page renders with charts, but on **static/hardcoded data**; no API wiring.
- 🟡 **Member & Admin portals** — themed layout shells + placeholder dashboards exist as redirect destinations; real features not built yet.
- ⬜ **Projects, tasks, teams, members, roles, invitations, work logs, reports** — not yet built as pages/features.
- ⬜ **Custom validations engine** — `shared/validations/` folders exist but are empty (planned FluentValidation-style decorator engine).
- ⬜ **Automated tests** beyond the generated "should create" specs.

The backend is fully implemented end-to-end; the frontend is the newer of the two projects. See [PHASES.md](PHASES.md) for the phased roadmap and current status, and [ARCHITECTURE.md](ARCHITECTURE.md) for how the pieces fit together.
