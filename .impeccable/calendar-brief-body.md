Scope: Organization Calendar at `/organization/calendar`. Visitor mode: Operate.

Audience/job: organization members and managers need one place to understand scheduled project and
task work, then inspect one project's task sequence without leaving the organization workspace.

Primary tasks: switch between Schedule and Project Timeline; scan project ranges and task deadlines;
select a project and understand task dates, progress, assignee, team, and priority. Phase 1 is strictly
read-only and uses existing organization-scoped data.

Direction: a full-width shared work canvas beneath a compact header and two-tab control. Schedule owns
the canvas as a month/week/list calendar; Project Timeline reuses it as a project selector plus Gantt.
The context strip carries only the organization identity and legend. No permanent detail rail, dashboard
metrics, Phase-2 filters, or calendar-specific visual identity.

Approved comp: `.impeccable/mocks/calendar-shared-canvas.png`. Translate its topology, density, and
hierarchy into the existing TaskFlow shell; do not copy its invented sidebar items, data, or controls.

Implementation inventory: existing sidebar and header remain; calendar title/description, accessible
two-tab strip, compact legend/context strip, responsive schedule canvas, responsive project selector,
read-only Gantt canvas, loading/empty/error states. HTML/CSS owns layout and controls; Lucide owns icons;
FullCalendar and Frappe Gantt own only their visualization canvases.

