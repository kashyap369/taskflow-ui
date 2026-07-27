import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@core/api/api.service';
import { API } from '@core/api/api-endpoints';
import { ApiParams } from '@core/api/api-params';

import {
  CreateOrganizationPayload,
  CreateProjectPayload,
  CreateTaskPayload,
  DashboardSummary,
  MemberTaskReport,
  OrganizationInvitation,
  OrganizationDetail,
  OrganizationListItem,
  OrganizationMember,
  OrganizationPermission,
  OrganizationRole,
  OrganizationRoleDetail,
  Project,
  ProjectReport,
  SubTask,
  TaskDetail,
  TaskListItem,
  Team,
  TeamDetail,
  TeamPerformanceReport,
  UpdateOrganizationPayload,
  UpdateProjectPayload,
  UpdateRolePayload,
  UpdateTaskPayload,
  UpdateTeamPayload,
  WorkLog,
} from './organization.models';

/**
 * Data layer for the organization portal. These endpoints return raw values (the API only wraps
 * Auth responses in `ApiResponse<T>`), so the generics below are the bare DTO shapes.
 */
@Injectable({ providedIn: 'root' })
export class OrganizationRepository {
  private readonly api = inject(ApiService);

  // ── Organization ──
  getMyOrganizations(): Observable<OrganizationListItem[]> {
    return this.api.get<OrganizationListItem[]>(API.Organization.Mine);
  }

  createOrganization(payload: CreateOrganizationPayload): Observable<number> {
    return this.api.post<number>(API.Organization.Create, payload);
  }

  /** The full organization (description / memberCount / createdAt), which `/mine` omits. */
  getOrganization(organizationId: number): Observable<OrganizationDetail> {
    return this.api.get<OrganizationDetail>(API.Organization.GetById(organizationId));
  }

  updateOrganization(payload: UpdateOrganizationPayload): Observable<void> {
    return this.api.put<void>(API.Organization.Update, payload);
  }

  deleteOrganization(organizationId: number): Observable<void> {
    return this.api.delete<void>(API.Organization.Delete(organizationId));
  }

  // ── Dashboard ──
  getDashboard(organizationId: number): Observable<DashboardSummary> {
    return this.api.get<DashboardSummary>(API.Report.Dashboard(organizationId));
  }

  // ── Projects ──
  getProjects(organizationId: number): Observable<Project[]> {
    return this.api.get<Project[]>(API.Project.ByOrganization(organizationId));
  }

  createProject(payload: CreateProjectPayload): Observable<number> {
    return this.api.post<number>(API.Project.Create, payload);
  }

  updateProject(payload: UpdateProjectPayload): Observable<void> {
    return this.api.put<void>(API.Project.Update, payload);
  }

  deleteProject(projectId: number): Observable<void> {
    return this.api.delete<void>(API.Project.Delete(projectId));
  }

  // ── Tasks ──
  getTasks(organizationId: number): Observable<TaskListItem[]> {
    return this.api.get<TaskListItem[]>(API.Task.ByOrganization(organizationId));
  }

  createTask(payload: CreateTaskPayload): Observable<number> {
    return this.api.post<number>(API.Task.Create, payload);
  }

  /** The full task (incl. `description`, which the list DTO omits) — used to fill the edit form. */
  getTask(taskId: number): Observable<TaskDetail> {
    return this.api.get<TaskDetail>(API.Task.GetById(taskId));
  }

  updateTask(payload: UpdateTaskPayload): Observable<void> {
    return this.api.put<void>(API.Task.Update, payload);
  }

  deleteTask(taskId: number): Observable<void> {
    return this.api.delete<void>(API.Task.Delete(taskId));
  }

  startTask(taskId: number): Observable<void> {
    return this.api.put<void>(API.Task.Start(taskId), {});
  }

  completeTask(taskId: number): Observable<void> {
    return this.api.put<void>(API.Task.Complete(taskId), {});
  }

  assignTask(taskId: number, userId: number): Observable<void> {
    return this.api.put<void>(API.Task.Assign(taskId, userId), {});
  }

  unassignTask(taskId: number): Observable<void> {
    return this.api.put<void>(API.Task.Unassign(taskId), {});
  }

  /**
   * Put a task under a team, or clear it (`teamId: null`). Two dedicated routes rather than a field
   * on `PUT /task` — the update command deliberately omits `teamId` so a form save can't blank it.
   */
  setTaskTeam(taskId: number, teamId: number | null): Observable<void> {
    return teamId === null
      ? this.api.delete<void>(API.Task.ClearTeam(taskId))
      : this.api.put<void>(API.Task.AssignTeam(taskId, teamId), {});
  }

  getProject(projectId: number): Observable<Project> {
    return this.api.get<Project>(API.Project.GetById(projectId));
  }

  getProjectTasks(projectId: number): Observable<TaskListItem[]> {
    return this.api.get<TaskListItem[]>(API.Task.ByProject(projectId));
  }

  // ── Roles & permissions ──
  getRoles(organizationId: number): Observable<OrganizationRole[]> {
    return this.api.get<OrganizationRole[]>(API.Role.ByOrganization(organizationId));
  }

  getRole(roleId: number): Observable<OrganizationRoleDetail> {
    return this.api.get<OrganizationRoleDetail>(API.Role.GetById(roleId));
  }

  getPermissionCatalog(): Observable<OrganizationPermission[]> {
    return this.api.get<OrganizationPermission[]>(API.Role.Permissions);
  }

  createRole(organizationId: number, name: string, description: string): Observable<number> {
    return this.api.post<number>(API.Role.Create, { organizationId, name, description });
  }

  updateRole(payload: UpdateRolePayload): Observable<void> {
    return this.api.put<void>(API.Role.Update, payload);
  }

  deleteRole(roleId: number): Observable<void> {
    return this.api.delete<void>(API.Role.Delete(roleId));
  }

  grantPermission(organizationRoleId: number, permissionName: string): Observable<void> {
    return this.api.post<void>(API.Role.Grant, { organizationRoleId, permissionName });
  }

  revokePermission(organizationRoleId: number, permissionName: string): Observable<void> {
    return this.api.post<void>(API.Role.Revoke, { organizationRoleId, permissionName });
  }

  // ── Members ──
  /**
   * Both filters are optional and server-side: `organizationRoleId` narrows to one org role, and
   * `activeOnly` drops deactivated members — which is what an assignee picker wants, since an
   * inactive member should never be a candidate. Omitting both returns every member.
   */
  getMembers(
    organizationId: number,
    filters?: { organizationRoleId?: number | null; activeOnly?: boolean },
  ): Observable<OrganizationMember[]> {
    const params = ApiParams.create({
      organizationRoleId: filters?.organizationRoleId ?? undefined,
      activeOnly: filters?.activeOnly ? 'true' : undefined,
    });
    return this.api.get<OrganizationMember[]>(API.Member.ByOrganization(organizationId), params);
  }

  activateMember(organizationId: number, userId: number): Observable<void> {
    return this.api.put<void>(API.Member.Activate, { organizationId, userId });
  }

  deactivateMember(organizationId: number, userId: number): Observable<void> {
    return this.api.put<void>(API.Member.Deactivate, { organizationId, userId });
  }

  changeMemberRole(
    organizationId: number,
    userId: number,
    organizationRoleId: number,
  ): Observable<void> {
    return this.api.put<void>(API.Member.ChangeRole, { organizationId, userId, organizationRoleId });
  }

  removeMember(organizationId: number, userId: number): Observable<void> {
    return this.api.delete<void>(API.Member.Remove, { organizationId, userId });
  }

  // ── Invitations ──
  getInvitations(organizationId: number): Observable<OrganizationInvitation[]> {
    return this.api.get<OrganizationInvitation[]>(API.Invitation.ByOrganization(organizationId));
  }

  invite(organizationId: number, email: string, organizationRoleId: number): Observable<number> {
    return this.api.post<number>(API.Invitation.Invite, {
      organizationId,
      email,
      organizationRoleId,
    });
  }

  cancelInvitation(invitationId: number): Observable<void> {
    return this.api.post<void>(API.Invitation.Cancel, { invitationId });
  }

  // ── Teams ──
  getTeams(organizationId: number): Observable<Team[]> {
    return this.api.get<Team[]>(API.Team.ByOrganization(organizationId));
  }

  createTeam(organizationId: number, name: string, description: string): Observable<number> {
    return this.api.post<number>(API.Team.Create, { organizationId, name, description });
  }

  updateTeam(payload: UpdateTeamPayload): Observable<void> {
    return this.api.put<void>(API.Team.Update, payload);
  }

  deleteTeam(teamId: number): Observable<void> {
    return this.api.delete<void>(API.Team.Delete(teamId));
  }

  getTeam(teamId: number): Observable<TeamDetail> {
    return this.api.get<TeamDetail>(API.Team.GetById(teamId));
  }

  addTeamMember(teamId: number, userId: number): Observable<void> {
    return this.api.post<void>(API.Team.AddMember(teamId, userId), {});
  }

  removeTeamMember(teamId: number, userId: number): Observable<void> {
    return this.api.delete<void>(API.Team.RemoveMember(teamId, userId));
  }

  /** `GET /team/{teamId}/tasks` — the tasks this team owns, in the standard list shape. */
  getTeamTasks(teamId: number): Observable<TaskListItem[]> {
    return this.api.get<TaskListItem[]>(API.Team.Tasks(teamId));
  }

  // ── Subtasks ──
  getSubTasks(taskId: number): Observable<SubTask[]> {
    return this.api.get<SubTask[]>(API.SubTask.ByTask(taskId));
  }

  createSubTask(taskId: number, title: string): Observable<number> {
    return this.api.post<number>(API.SubTask.Create, { title, taskId });
  }

  updateSubTask(subTaskId: number, title: string): Observable<void> {
    return this.api.put<void>(API.SubTask.Update, { subTaskId, title });
  }

  deleteSubTask(subTaskId: number): Observable<void> {
    return this.api.delete<void>(API.SubTask.Delete(subTaskId));
  }

  completeSubTask(subTaskId: number): Observable<void> {
    return this.api.put<void>(API.SubTask.Complete(subTaskId), {});
  }

  reopenSubTask(subTaskId: number): Observable<void> {
    return this.api.put<void>(API.SubTask.Reopen(subTaskId), {});
  }

  // ── Work logs (time tracking) ──
  getWorkLogs(taskId: number): Observable<WorkLog[]> {
    return this.api.get<WorkLog[]>(API.WorkLog.ByTask(taskId));
  }

  startWorkLog(taskId: number, notes: string | null): Observable<number> {
    return this.api.post<number>(API.WorkLog.Start, { taskId, notes });
  }

  stopWorkLog(workLogId: number, notes: string | null): Observable<void> {
    return this.api.put<void>(API.WorkLog.Stop, { workLogId, notes });
  }

  logManualWork(
    taskId: number,
    startedAt: string,
    endedAt: string,
    notes: string | null,
  ): Observable<number> {
    return this.api.post<number>(API.WorkLog.Manual, { taskId, startedAt, endedAt, notes });
  }

  deleteWorkLog(workLogId: number): Observable<void> {
    return this.api.delete<void>(API.WorkLog.Delete(workLogId));
  }

  // ── Reporting ──
  getMemberReport(userId: number, from: string, to: string): Observable<MemberTaskReport> {
    return this.api.get<MemberTaskReport>(API.Report.Member(userId), ApiParams.create({ from, to }));
  }

  getTeamReport(
    organizationId: number,
    from: string,
    to: string,
  ): Observable<TeamPerformanceReport[]> {
    return this.api.get<TeamPerformanceReport[]>(
      API.Report.Team(organizationId),
      ApiParams.create({ from, to }),
    );
  }

  getProjectReport(projectId: number): Observable<ProjectReport> {
    return this.api.get<ProjectReport>(API.Report.Project(projectId));
  }
}
