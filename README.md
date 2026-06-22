# TaskFlow UI

Modern Task Management SaaS application built with Angular 20, TypeScript, SCSS, and Bootstrap 5.

The primary goal of this project is to implement a scalable frontend architecture inspired by Clean Architecture, Domain-Driven Design (DDD), and enterprise-grade ASP.NET Core development practices.

---

# Project Goals

* Scalable and maintainable architecture
* Feature-based organization
* Reusable UI component library
* Authentication & Authorization
* Route Guards & Interceptors
* Signals-based state management
* Responsive design
* Modern SaaS user experience
* Consistent coding standards
* Minimal code duplication

---

# Angular Architecture Inspired by ASP.NET Core

| ASP.NET Core               | Angular              |
| -------------------------- | -------------------- |
| Middleware                 | Interceptors         |
| Authorization Policy       | Guards               |
| Services                   | Services             |
| DTOs                       | Interfaces / Models  |
| Extension Methods          | Utility Functions    |
| Filters                    | Directives           |
| Dependency Injection       | Dependency Injection |
| Clean Architecture Modules | Feature Modules      |

This structure allows frontend development to follow similar architectural principles used in enterprise ASP.NET Core applications.

---

# Application Folder Structure

```text
app/

├── core/
│   ├── auth/
│   ├── interceptors/
│   ├── guards/
│   ├── services/
│   ├── config/
│   ├── constants/
│   └── enums/
│
├── shared/
│   ├── components/
│   │   ├── button/
│   │   ├── card/
│   │   ├── modal/
│   │   ├── table/
│   │   ├── form/
│   │   ├── skeleton/
│   │   ├── empty-state/
│   │   ├── page-header/
│   │   ├── dropdown/
│   │   ├── badge/
│   │   └── loader/
│   │
│   ├── directives/
│   ├── pipes/
│   ├── validators/
│   ├── services/
│   ├── interfaces/
│   └── utils/
│
├── layout/
│   ├── main-layout/
│   ├── auth-layout/
│   ├── public-layout/
│   └── error-layout/
│
├── pages/
│   ├── landing/
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   └── errors/
│       ├── not-found/
│       ├── unauthorized/
│       ├── forbidden/
│       └── server-error/
│
├── features/
│   ├── dashboard/
│   ├── tasks/
│   ├── projects/
│   ├── users/
│   ├── organizations/
│   ├── reports/
│   └── settings/
│
├── state/
│   ├── signals/
│   ├── facades/
│   └── stores/
│
├── app.routes.ts
└── app.config.ts
```

---

# Folder Responsibilities

## Core

Application-wide infrastructure.

Contains:

* Authentication
* Authorization
* Guards
* Interceptors
* Global Services
* Application Configuration
* Constants
* Enums

Examples:

```text
AuthService
AuthGuard
RoleGuard
JwtInterceptor
ApiConfiguration
```

---

## Shared

Reusable building blocks used throughout the application.

Contains:

* Reusable Components
* Custom Directives
* Custom Pipes
* Validators
* Utility Functions
* Shared Interfaces

Examples:

```text
Button Component
Table Component
Card Component
Status Pipe
NumberOnly Directive
```

---

## Layout

Application shells.

Different sections of the application use different layouts.

### Main Layout

Used after login.

Examples:

```text
Dashboard
Tasks
Projects
Reports
```

### Auth Layout

Used by:

```text
Login
Register
Forgot Password
```

### Public Layout

Used by:

```text
Landing Page
Marketing Pages
```

### Error Layout

Used by:

```text
404
403
500
```

---

## Pages

Entry pages of the application.

Examples:

```text
Landing Page
Login
Register
Forgot Password
404 Page
```

Pages are not reusable components.

---

## Features

Business modules.

Each feature owns its own:

```text
Components
Pages
Services
Models
State
```

Examples:

```text
Dashboard
Tasks
Projects
Users
Reports
```

This keeps business logic isolated and scalable.

---

## State

Client-side state management.

Contains:

```text
Signals
Facades
Stores
```

Angular Signals will be the primary state management approach.

---

# Shared Component Strategy

The application follows a reusable component-driven approach.

Examples:

```html
<app-button></app-button>

<app-card></app-card>

<app-table></app-table>

<app-modal></app-modal>

<app-page-header></app-page-header>
```

Goal:

* Consistent UI
* Reduced duplication
* Easier maintenance
* Faster feature development

---

# Libraries & Tooling

## Bootstrap 5

Purpose:

* Responsive Grid System
* Layout Utilities
* Forms
* Spacing Utilities

Installation:

```bash
npm install bootstrap
```

Usage:

```text
Layout foundation and responsive design.
```

---

## SCSS

Purpose:

* Variables
* Mixins
* Nesting
* Modular styling

Benefits:

```text
Better organization
Reusable styles
Theme management
```

Selected during Angular project creation.

---

## Lucide Icons

Purpose:

* Modern SVG icons
* Lightweight
* Tree-shakable

Installation:

```bash
npm install lucide lucide-angular
```

Usage:

```text
Navigation
Buttons
Cards
Dashboard widgets
```

---

## SweetAlert2

Purpose:

* Confirmation dialogs
* Success alerts
* Error alerts
* Warning messages

Installation:

```bash
npm install sweetalert2
```

Examples:

```text
Delete confirmation
Logout confirmation
Status updates
```

---

## ngx-toastr

Purpose:

* Non-blocking notifications
* Success messages
* Error messages
* Warning messages

Installation:

```bash
npm install ngx-toastr
```

Examples:

```text
Data Saved
Task Updated
Login Successful
```

---

## Lottie

Purpose:

* Modern animations
* Empty states
* Success screens
* Loading states

Installation:

```bash
npm install ngx-lottie lottie-web
```

Examples:

```text
No Data Found
Success Animation
Loading Animation
```

---

## Angular CDK

Purpose:

Angular's low-level UI toolkit.

Installation:

```bash
npm install @angular/cdk
```

Features:

```text
Drag & Drop
Overlay
Portal
Virtual Scroll
Accessibility
```

Future Usage:

```text
Kanban Board
Custom Modals
Advanced UI Components
```

---

## date-fns

Purpose:

Modern date utility library.

Installation:

```bash
npm install date-fns
```

Examples:

```text
Date Formatting
Date Calculations
Relative Time
```

---

## ngx-skeleton-loader

Purpose:

Skeleton loading states.

Installation:

```bash
npm install ngx-skeleton-loader
```

Examples:

```text
Dashboard Loading
Table Loading
Card Loading
```

Improves perceived performance.

---

## ECharts

Purpose:

Enterprise-grade charting library.

Installation:

```bash
npm install echarts ngx-echarts
```

Examples:

```text
Analytics Dashboard
Reports
Performance Metrics
Task Statistics
```

Supported Charts:

```text
Bar Charts
Line Charts
Pie Charts
Area Charts
Heatmaps
```

---

# Development Principles

## Single Responsibility Principle

Each component should have one responsibility.

Example:

```text
TaskListComponent
Displays tasks only.
```

---

## Reusability First

Before creating a new component ask:

```text
Can this be reused elsewhere?
```

If yes, move it to:

```text
shared/components
```

---

## Feature Isolation

Each feature should be independent.

Example:

```text
tasks/
projects/
users/
```

A feature should own its own business logic.

---

## Avoid Direct HTTP Calls in Components

Bad:

```typescript
this.http.get(...)
```

Preferred:

```typescript
TaskService
ProjectService
UserService
```

Components should focus on presentation.

---

# Planned Features

* Authentication & Authorization
* Role-Based Access Control
* Dashboard Analytics
* Project Management
* Task Management
* Team Management
* Reports & Insights
* Responsive UI
* Reusable Component Library
* Signal-Based State Management
* Dark/Light Theme Support

---

# Status

🚧 Under Active Development

TaskFlow UI is currently being developed as a modern Angular 20 SaaS application focused on scalability, maintainability, and enterprise-grade frontend architecture.
