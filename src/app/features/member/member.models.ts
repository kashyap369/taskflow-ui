/**
 * DTOs for the Member (Individual) portal.
 *
 * Tasks, subtasks and work logs are the **same API shapes** the organization portal consumes, so
 * they are re-exported from `organization.models` rather than duplicated — one definition, no drift.
 * Only the personal-report DTO and the personal create payload are genuinely new here.
 */
export {
  TaskPriority,
  TaskStatus,
  taskPriorityMeta,
  taskStatusMeta,
} from '../organization/organization.models';

export type {
  OrganizationListItem,
  Project,
  SubTask,
  TaskDetail,
  TaskListItem,
  WorkLog,
} from '../organization/organization.models';

export {
  ProjectStatus,
  projectStatusMeta,
} from '../organization/organization.models';

export type { Tone } from '@shared/models/tone.model';

/**
 * `POST /task/personal`. Deliberately carries no organizationId. A project id is optional and must
 * refer to a private project owned by the signed-in user; the creator comes from the JWT.
 */
export interface CreatePersonalTaskPayload {
  title: string;
  description: string;
  startDate: string;
  priority: number;
  expectedCompletionDate: string | null;
  projectId?: number | null;
}

export interface CreatePersonalProjectPayload {
  title: string;
  description: string;
  startDate: string;
  expectedCompletionDate: string | null;
}

export interface UpdatePersonalProjectPayload {
  projectId: number;
  title: string;
  description: string;
  expectedCompletionDate: string | null;
}

/** `PUT /task` — the update command is shared with org tasks (partial: no status/startDate). */
export interface UpdatePersonalTaskPayload {
  taskId: number;
  title: string;
  description: string;
  priority: number;
  expectedCompletionDate: string | null;
}

/**
 * `GET /report/me?from&to` → PersonalTaskReportDto (raw).
 * Note there is no `tasksAssigned`: a personal task cannot be assigned to anyone.
 */
export interface PersonalTaskReport {
  userId: number;
  fullName: string;
  from: string;
  to: string;
  tasksCreated: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksTodo: number;
  tasksOverdue: number;
  trackedHours: number;
}
