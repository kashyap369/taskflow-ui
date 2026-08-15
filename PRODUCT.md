# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

TaskFlow serves Individual accounts managing private personal work, Organization accounts managing
shared workspaces, active organization members collaborating inside those workspaces, and platform
administrators operating the service.

## Product Purpose

TaskFlow gives people one place to plan projects, break work into tasks and subtasks, track progress
and time, and—when they explicitly enter an organization workspace—collaborate with teams.

## Positioning

One account can move between a strictly private personal workspace and explicitly joined organization
workspaces without merging their ownership, permissions, or data.

## Operating Context

Individual users plan their own projects and tasks, use a visual Planner canvas for notes and diagrams,
and may separately accept invitations to organization workspaces. Organization work includes roles,
members, teams, assignment, and organization reporting; personal work does not.

## Capabilities and Constraints

- Personal projects, tasks, subtasks, work logs, and Planner data belong only to their creator.
- Joining or owning an organization never exposes, imports, assigns, or reports personal work.
- Personal projects support ordinary project/task/subtask lifecycle features but have no teams,
  assignees, members, organization roles, or organization settings.
- Organization projects retain their existing organization-scoped permission model.
- Planner initially embeds the open-source Excalidraw editor for Individual accounts. Its first phase
  is a private per-user browser autosave; backend/cloud canvas persistence is deliberately deferred.
- Authentication supports password and one-time email code flows. Secrets stay in deployment or
  developer secret configuration and are not copied into client code.

## Brand Commitments

The product name is TaskFlow. Product copy is calm, direct, and operational. The existing member,
organization, and admin portal identities and established design system remain authoritative.

## Evidence on Hand

The repository contains working personal tasks, subtasks, work logs, personal reporting, organization
projects, email-code authentication, and an established Angular design system. No customer claims,
benchmarks, pricing, or collaboration claims should be invented.

## Product Principles

- Privacy boundaries are structural, not presentation-only.
- Account type chooses the default workspace; explicit membership controls shared workspace access.
- Personal planning stays lightweight and omits organization-only complexity.
- Authorization is enforced on the server for every resource read and write.
- New capabilities preserve the existing task lifecycle and terminology.

## Accessibility & Inclusion

Interactive surfaces support keyboard operation, visible focus, reduced motion, responsive layouts,
and the established WCAG AA color and control-boundary checks.
