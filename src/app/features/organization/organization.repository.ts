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
  OrganizationListItem,
  OrganizationMember,
  OrganizationPermission,
  OrganizationRole,
  OrganizationRoleDetail,
  Project,
  ProjectReport,
  SubTask,
  TaskListItem,
  Team,
  TeamDetail,
  TeamPerformanceReport,
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

  // ── Tasks ──
  getTasks(organizationId: number): Observable<TaskListItem[]> {
    return this.api.get<TaskListItem[]>(API.Task.ByOrganization(organizationId));
  }

  createTask(payload: CreateTaskPayload): Observable<number> {
    return this.api.post<number>(API.Task.Create, payload);
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

  grantPermission(organizationRoleId: number, permissionName: string): Observable<void> {
    return this.api.post<void>(API.Role.Grant, { organizationRoleId, permissionName });
  }

  revokePermission(organizationRoleId: number, permissionName: string): Observable<void> {
    return this.api.post<void>(API.Role.Revoke, { organizationRoleId, permissionName });
  }

  // ── Members ──
  getMembers(organizationId: number): Observable<OrganizationMember[]> {
    return this.api.get<OrganizationMember[]>(API.Member.ByOrganization(organizationId));
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

  getTeam(teamId: number): Observable<TeamDetail> {
    return this.api.get<TeamDetail>(API.Team.GetById(teamId));
  }

  addTeamMember(teamId: number, userId: number): Observable<void> {
    return this.api.post<void>(API.Team.AddMember(teamId, userId), {});
  }

  removeTeamMember(teamId: number, userId: number): Observable<void> {
    return this.api.delete<void>(API.Team.RemoveMember(teamId, userId));
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
