# TaskFlow UI — Design Context

The canonical, detailed design language is [docs/DESIGN.md](docs/DESIGN.md). It defines the existing
typography, semantic color tokens, spacing, radii, elevation, theme behavior, motion, responsive rules,
and component conventions. Treat that document and the implemented token system under `src/styles/` as
authoritative for every new surface.

Durable product-specific additions:

- Personal Projects reuse the established productivity workspace language: calm surfaces, compact
  metadata, privacy-forward copy, responsive drawers, and the existing semantic tokens.
- Planner embeds Excalidraw as a tool surface inside the TaskFlow shell. TaskFlow owns the page header,
  privacy status, responsive frame, and theme entry state; Excalidraw owns canvas interaction controls.
- Personal data must never gain organization-oriented affordances such as members, teams, assignees, or
  organization settings. Privacy messaging should state the creator-only boundary plainly.
- Avoid hardcoded visual values in feature components when an established token exists.
