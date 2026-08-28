// ============================================================
// Organization feature — DTOs + enums + mappers mirroring the API.
// The API returns raw values (NO ApiResponse<T> envelope) for every
// controller except Auth, so these types are the bare response shapes.
// ============================================================

import { Tone } from '@shared/models/tone.model';
import { OrganizationStatus } from '@shared/models/organization-status.model';

// ── Enums (exact API int values) ──────────────────────────
export enum ProjectStatus {
  Draft = 1,
  Active = 2,
  OnHold = 3,
  Completed = 4,
  Archived = 5,
  Cancelled = 6,
}

export enum TaskStatus {
  Todo = 1,
  InProgress = 2,
  Completed = 3,
  Blocked = 4,
  Cancelled = 5,
}

export enum TaskPriority {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4,
}

// Invitations are shared with the member portal (the invitee's side), so their model lives in
// `shared/models`. Re-exported here so `organization.models` stays the one import for org pages.
export {
  INVITATION_STATUS_META,
  InvitationStatus,
  invitationStatusMeta,
} from '@shared/models/invitation.model';
export type { OrganizationInvitation } from '@shared/models/invitation.model';

// Organization status is rendered by this portal *and* by the admin portal's platform-wide
// organizations list, so it lives in `shared/models` too — same reason as the two above.
export {
  ORGANIZATION_STATUS_META,
  OrganizationStatus,
  organizationStatusMeta,
} from '@shared/models/organization-status.model';

// ── Response DTOs (mirror the API query DTOs) ─────────────

/** `GET /organization/mine` → OrganizationListItemDto[] */
export interface OrganizationListItem {
  id: number;
  name: string;
  ownerUserId: number;
  status: OrganizationStatus;
}

/**
 * `GET /organization/{id}` → OrganizationDetailDto. The only shape carrying `description`,
 * `memberCount` and `createdAt` — `OrganizationListItem` (what the switcher renders) has none of
 * them, so the settings form must load this before saving or it would blank the description.
 */
export interface OrganizationDetail {
  id: number;
  name: string;
  description: string | null;
  ownerUserId: number;
  status: OrganizationStatus;
  memberCount: number;
  createdAt: string;
}

/** `GET /report/dashboard/{organizationId}` → DashboardSummaryDto */
export interface DashboardSummary {
  organizationId: number;
  projectCount: number;
  memberCount: number;
  teamCount: number;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  unassignedTasks: number;
  totalTrackedHours: number;
  // Priority breakdown (backend Phase 12) — the counterpart to the status counts above.
  lowPriorityTasks: number;
  mediumPriorityTasks: number;
  highPriorityTasks: number;
  criticalPriorityTasks: number;
}

/** `GET /project/organization/{organizationId}` → ProjectDto[] */
export interface Project {
  id: number;
  organizationId: number | null;
  title: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string;
  expectedCompletionDate: string | null;
  actualCompletionDate: string | null;
  problemStatement?: string | null;
  budgetAmount?: number | null;
  budgetCurrency?: string | null;
  approximateDurationWeeks?: number | null;
  createdByUserId: number;
  taskCount: number;
  completedTaskCount: number;
  completionPercentage: number;
}

/** `GET /task/organization/{organizationId}` → TaskListItemDto[] */
export interface TaskListItem {
  id: number;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  expectedCompletionDate: string | null;
  actualCompletionDate: string | null;
  projectId: number | null;
  organizationId: number | null;
  /** The team responsible (`Task.TeamId`) — what makes "tasks viewed per team" possible. */
  teamId: number | null;
  teamName: string | null;
  createdByUserId: number;
  assignedToUserId: number | null;
  subTaskCount: number;
  completedSubTaskCount: number;
}

/** `GET /organizationrole/organization/{id}` → OrganizationRoleDto[] */
export interface OrganizationRole {
  id: number;
  organizationId: number;
  name: string;
  description: string | null;
}

/** `GET /organizationrole/{id}` → OrganizationRoleDetailDto (permissions are NAMES). */
export interface OrganizationRoleDetail extends OrganizationRole {
  permissions: string[];
}

/** `GET /organizationrole/permissions` → OrganizationPermissionDto[] (the grantable catalog). */
export interface OrganizationPermission {
  id: number;
  name: string;
  description: string | null;
}

/** `GET /organizationmember/organization/{id}` → OrganizationMemberDto[] */
export interface OrganizationMember {
  id: number;
  organizationId: number;
  userId: number;
  userFullName: string;
  email: string;
  organizationRoleId: number;
  roleName: string;
  isActive: boolean;
  joinedAt: string;
}

// `OrganizationInvitation` (`GET /organizationinvitation/organization/{id}` →
// OrganizationInvitationDto[]) is re-exported from `@shared/models/invitation.model` at the top.

/** `GET /team/organization/{id}` → TeamDto[] */
export interface Team {
  id: number;
  organizationId: number;
  name: string;
  description: string | null;
  memberCount: number;
}

/** A member row inside a team (raw). */
export interface TeamMember {
  userId: number;
  fullName: string;
  email: string;
  joinedAt: string;
}

/** `GET /team/{id}` → TeamDetailDto (raw). */
export interface TeamDetail {
  id: number;
  organizationId: number;
  name: string;
  description: string | null;
  members: TeamMember[];
}

/**
 * `GET /subtask/task/{taskId}` → SubTaskDto[] (raw).
 * `status` reuses the TaskStatus enum (a subtask is Todo=1 or Completed=3).
 */
export interface SubTask {
  id: number;
  taskId: number;
  title: string;
  status: TaskStatus;
  createdDate: string;
  completedDate: string | null;
}

/**
 * `GET /worklog/task/{taskId}` → WorkLogDto[] (raw).
 * A running log (`isRunning`, `endedAt` null) has `durationMinutes` counted up to "now" at fetch time.
 * Only one work log can run per user at a time (starting a second returns 409).
 */
export interface WorkLog {
  id: number;
  taskId: number;
  userId: number;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number;
  notes: string | null;
  isRunning: boolean;
}

// ── Reporting ──

/** `GET /report/member/{userId}?from&to` → MemberTaskReportDto */
export interface MemberTaskReport {
  userId: number;
  fullName: string;
  from: string;
  to: string;
  tasksCreated: number;
  tasksAssigned: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksOverdue: number;
  trackedHours: number;
}

/** One row of `TeamPerformanceReport.tasks` — a task the team *owns* (`Task.TeamId`). */
export interface TeamTaskReportItem {
  taskId: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  actualCompletionDate: string | null;
  assignedToUserId: number | null;
  assignedToFullName: string | null;
  trackedHours: number;
}

/** `GET /report/team/{organizationId}?from&to` → TeamPerformanceReportDto[] */
export interface TeamPerformanceReport {
  teamId: number;
  teamName: string;
  activeMembers: number;
  tasksAssigned: number;
  tasksCompleted: number;
  trackedHours: number;
  avgCompletionDays: number;
  /**
   * ⚠️ Measures something different from the counts above: `tasks` is what the team **owns**
   * (`Task.TeamId`), while `tasksAssigned`/`tasksCompleted` aggregate over the team's **members**.
   * A task assigned to a member of team A but owned by team B counts in both, differently — so the
   * two legitimately disagree and the UI must label which is which.
   */
  tasks: TeamTaskReportItem[];
}

export interface ProjectMemberWorkload {
  userId: number;
  fullName: string;
  tasksAssigned: number;
  tasksCompleted: number;
  trackedHours: number;
}

/** `GET /report/project/{projectId}` → ProjectReportDto */
export interface ProjectReport {
  projectId: number;
  title: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  trackedHours: number;
  // Timeline (backend Phase 12): the project's own *planned* window, plus the *actual* span its
  // tasks occupied. Enough to render planned-vs-actual from one call.
  startDate: string;
  expectedCompletionDate: string | null;
  actualCompletionDate: string | null;
  firstTaskStartDate: string | null;
  lastTaskCompletionDate: string | null;
  memberWorkloads: ProjectMemberWorkload[];
}

// ── Request payloads (mirror the API commands) ────────────

/** `POST /organization` → int (new org id). */
export interface CreateOrganizationPayload {
  name: string;
  description: string;
}

/** `POST /project` → int (new project id). */
export interface CreateProjectPayload {
  title: string;
  description: string;
  startDate: string;
  expectedCompletionDate: string | null;
  organizationId: number;
}

/**
 * `POST /task` → int (new task id). `teamId` is optional and **create-only** — see
 * `UpdateTaskPayload` for why changing it later goes through its own route.
 */
export interface CreateTaskPayload {
  title: string;
  description: string;
  startDate: string;
  priority: TaskPriority;
  organizationId: number;
  expectedCompletionDate: string | null;
  projectId: number | null;
  teamId: number | null;
}

/**
 * `GET /task/{id}` → TaskDetailDto. The **only** shape that carries `description` — `TaskListItem`
 * (the list DTO) does not, so an edit form must load this first or it would blank the description.
 */
export interface TaskDetail {
  id: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  expectedCompletionDate: string | null;
  actualCompletionDate: string | null;
  projectId: number | null;
  organizationId: number | null;
  teamId: number | null;
  teamName: string | null;
  createdByUserId: number;
  assignedToUserId: number | null;
  assignedToFullName: string | null;
  subTasks: SubTask[];
}

/**
 * `PUT /project` → UpdateProjectCommand. Deliberately **partial**: the API's update command takes
 * only these fields, so status/startDate/organization are not editable (status moves through the
 * task lifecycle, not by hand).
 */
export interface UpdateProjectPayload {
  projectId: number;
  title: string;
  description: string;
  expectedCompletionDate: string | null;
}

/**
 * `PUT /task` → UpdateTaskCommand. Partial: no status/startDate/project reassignment.
 *
 * ⚠️ It deliberately carries **no `teamId`** either. The backend kept it off the update command so
 * a form save can't blank the team — the same trap that already bit `description`. Changing a
 * task's team goes through `PUT /task/{id}/team/{teamId}` and `DELETE /task/{id}/team` instead.
 */
export interface UpdateTaskPayload {
  taskId: number;
  title: string;
  description: string;
  priority: TaskPriority;
  expectedCompletionDate: string | null;
}

/** `PUT /organization` → UpdateOrganizationCommand (name + description only; status isn't editable). */
export interface UpdateOrganizationPayload {
  organizationId: number;
  name: string;
  description: string;
}

/** `PUT /team` → UpdateTeamCommand. */
export interface UpdateTeamPayload {
  teamId: number;
  name: string;
  description: string;
}

/** `PUT /organizationrole` → UpdateRoleCommand. */
export interface UpdateRolePayload {
  roleId: number;
  name: string;
  description: string;
}

// ── UI label / tone helpers ───────────────────────────────

/** A tone maps to the design-system color families used by badges/cards (see `@shared/models`). */
export type { Tone };

export const TASK_STATUS_META: Record<TaskStatus, { label: string; tone: Tone }> = {
  [TaskStatus.Todo]: { label: 'To do', tone: 'neutral' },
  [TaskStatus.InProgress]: { label: 'In progress', tone: 'info' },
  [TaskStatus.Completed]: { label: 'Completed', tone: 'success' },
  [TaskStatus.Blocked]: { label: 'Blocked', tone: 'danger' },
  [TaskStatus.Cancelled]: { label: 'Cancelled', tone: 'neutral' },
};

export const TASK_PRIORITY_META: Record<TaskPriority, { label: string; tone: Tone }> = {
  [TaskPriority.Low]: { label: 'Low', tone: 'neutral' },
  [TaskPriority.Medium]: { label: 'Medium', tone: 'info' },
  [TaskPriority.High]: { label: 'High', tone: 'warning' },
  [TaskPriority.Critical]: { label: 'Critical', tone: 'danger' },
};

export const PROJECT_STATUS_META: Record<ProjectStatus, { label: string; tone: Tone }> = {
  [ProjectStatus.Draft]: { label: 'Draft', tone: 'neutral' },
  [ProjectStatus.Active]: { label: 'Active', tone: 'info' },
  [ProjectStatus.OnHold]: { label: 'On hold', tone: 'warning' },
  [ProjectStatus.Completed]: { label: 'Completed', tone: 'success' },
  [ProjectStatus.Archived]: { label: 'Archived', tone: 'neutral' },
  [ProjectStatus.Cancelled]: { label: 'Cancelled', tone: 'danger' },
};

export function taskStatusMeta(status: TaskStatus): { label: string; tone: Tone } {
  return TASK_STATUS_META[status] ?? { label: 'Unknown', tone: 'neutral' };
}

export function taskPriorityMeta(priority: TaskPriority): { label: string; tone: Tone } {
  return TASK_PRIORITY_META[priority] ?? { label: 'Unknown', tone: 'neutral' };
}

export function projectStatusMeta(status: ProjectStatus): { label: string; tone: Tone } {
  return PROJECT_STATUS_META[status] ?? { label: 'Unknown', tone: 'neutral' };
}

// `INVITATION_STATUS_META` / `invitationStatusMeta` are re-exported from
// `@shared/models/invitation.model` at the top of this file.
