/**
 * Project-plan import contracts.
 *
 * These live in `shared/` for the same reason invitations do: **two portals** import a plan — the
 * organization projects page and the member (personal) projects page — and the CSV parser that
 * produces them (`@shared/utils/project-plan-csv`) is shared code, which may not reach into a
 * feature. `organization.models.ts` re-exports them so its own consumers are unaffected.
 */

/** Mirrors the API's `TaskPriority` enum; the numbers are the wire values. */
export enum TaskPriority {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4,
}

export interface ProjectPlanTaskPayload {
  key: string;
  title: string;
  description: string;
  startDate: string;
  expectedCompletionDate: string | null;
  priority: TaskPriority;
  estimateMinutes: number | null;
  teamName: string | null;
  assigneeEmail: string | null;
  subTasks: string[];
}

/** `POST /project/plan` — one transactional import of a whole project. */
export interface ProjectPlanImportPayload {
  title: string;
  description: string;
  startDate: string;
  expectedCompletionDate: string | null;
  organizationId?: number | null;
  tasks: ProjectPlanTaskPayload[];
}
