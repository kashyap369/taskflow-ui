// ============================================================
// Organization feature — DTOs + enums + mappers mirroring the API.
// The API returns raw values (NO ApiResponse<T> envelope) for every
// controller except Auth, so these types are the bare response shapes.
// ============================================================

// ── Enums (exact API int values) ──────────────────────────
export enum OrganizationStatus {
  Active = 1,
  Inactive = 2,
  Suspended = 3,
}

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

export enum InvitationStatus {
  Pending = 1,
  Accepted = 2,
  Rejected = 3,
  Expired = 4,
  Cancelled = 5,
}

// ── Response DTOs (mirror the API query DTOs) ─────────────

/** `GET /organization/mine` → OrganizationListItemDto[] */
export interface OrganizationListItem {
  id: number;
  name: string;
  ownerUserId: number;
  status: OrganizationStatus;
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
}

/** `GET /project/organization/{organizationId}` → ProjectDto[] */
export interface Project {
  id: number;
  organizationId: number;
  title: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string;
  expectedCompletionDate: string | null;
  actualCompletionDate: string | null;
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

/** `GET /organizationinvitation/organization/{id}` → OrganizationInvitationDto[] */
export interface OrganizationInvitation {
  id: number;
  organizationId: number;
  organizationName: string;
  email: string;
  organizationRoleId: number;
  roleName: string;
  status: InvitationStatus;
  expiryDate: string;
  createdAt: string;
}

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

/** `GET /report/team/{organizationId}?from&to` → TeamPerformanceReportDto[] */
export interface TeamPerformanceReport {
  teamId: number;
  teamName: string;
  activeMembers: number;
  tasksAssigned: number;
  tasksCompleted: number;
  trackedHours: number;
  avgCompletionDays: number;
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

/** `POST /task` → int (new task id). */
export interface CreateTaskPayload {
  title: string;
  description: string;
  startDate: string;
  priority: TaskPriority;
  organizationId: number;
  expectedCompletionDate: string | null;
  projectId: number | null;
}

// ── UI label / tone helpers ───────────────────────────────

/** A tone maps to the design-system color families used by badges/cards. */
export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'purple';

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

export const INVITATION_STATUS_META: Record<InvitationStatus, { label: string; tone: Tone }> = {
  [InvitationStatus.Pending]: { label: 'Pending', tone: 'warning' },
  [InvitationStatus.Accepted]: { label: 'Accepted', tone: 'success' },
  [InvitationStatus.Rejected]: { label: 'Rejected', tone: 'danger' },
  [InvitationStatus.Expired]: { label: 'Expired', tone: 'neutral' },
  [InvitationStatus.Cancelled]: { label: 'Cancelled', tone: 'neutral' },
};

export function invitationStatusMeta(status: InvitationStatus): { label: string; tone: Tone } {
  return INVITATION_STATUS_META[status] ?? { label: 'Unknown', tone: 'neutral' };
}
