import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@core/api/api.service';
import { API } from '@core/api/api-endpoints';
import { OrganizationInvitation } from '@shared/models/invitation.model';
import {
  CreatePersonalProjectPayload,
  CreatePersonalTaskPayload,
  OrganizationListItem,
  PersonalTaskReport,
  Project,
  SubTask,
  TaskDetail,
  TaskListItem,
  UpdatePersonalProjectPayload,
  UpdatePersonalTaskPayload,
  WorkLog,
} from './member.models';

/**
 * Data layer for the Member (Individual) portal. Like the rest of the API outside Auth, these
 * endpoints return raw values (no `ApiResponse<T>` envelope).
 */
@Injectable({ providedIn: 'root' })
export class MemberRepository {
  private readonly api = inject(ApiService);

  /**
   * `GET /organizationinvitation/mine` → OrganizationInvitationDto[]. The API matches on the
   * **current user's email** and only ever returns **Pending** invitations.
   */
  getMyInvitations(): Observable<OrganizationInvitation[]> {
    return this.api.get<OrganizationInvitation[]>(API.Invitation.Mine);
  }

  /** Organization workspaces this user owns or has joined. */
  getMyOrganizations(): Observable<OrganizationListItem[]> {
    return this.api.get<OrganizationListItem[]>(API.Organization.Mine);
  }

  /** `POST /organizationinvitation/accept` (204). Creates the membership server-side. */
  acceptInvitation(invitationId: number): Observable<void> {
    return this.api.post<void>(API.Invitation.Accept, { invitationId });
  }

  /** `POST /organizationinvitation/reject` (204). */
  rejectInvitation(invitationId: number): Observable<void> {
    return this.api.post<void>(API.Invitation.Reject, { invitationId });
  }

  getMyPersonalProjects(): Observable<Project[]> {
    return this.api.get<Project[]>(API.Project.MinePersonal);
  }

  getProject(projectId: number): Observable<Project> {
    return this.api.get<Project>(API.Project.GetById(projectId));
  }

  createPersonalProject(payload: CreatePersonalProjectPayload): Observable<number> {
    return this.api.post<number>(API.Project.CreatePersonal, payload);
  }

  updatePersonalProject(payload: UpdatePersonalProjectPayload): Observable<void> {
    return this.api.put<void>(API.Project.Update, payload);
  }

  deletePersonalProject(projectId: number): Observable<void> {
    return this.api.delete<void>(API.Project.Delete(projectId));
  }

  getProjectTasks(projectId: number): Observable<TaskListItem[]> {
    return this.api.get<TaskListItem[]>(API.Task.ByProject(projectId));
  }

  // ── Personal tasks ──

  /** `GET /task/mine/personal` → TaskListItemDto[]. Tasks with no organization, created by me. */
  getMyPersonalTasks(): Observable<TaskListItem[]> {
    return this.api.get<TaskListItem[]>(API.Task.MinePersonal);
  }

  /** `GET /task/{id}` → TaskDetailDto. The list DTO has no `description`; this one does. */
  getTask(taskId: number): Observable<TaskDetail> {
    return this.api.get<TaskDetail>(API.Task.GetById(taskId));
  }

  /** `POST /task/personal` → new task id. */
  createPersonalTask(payload: CreatePersonalTaskPayload): Observable<number> {
    return this.api.post<number>(API.Task.CreatePersonal, payload);
  }

  /** `PUT /task` (204). Whole-record update — always send a real description. */
  updateTask(payload: UpdatePersonalTaskPayload): Observable<void> {
    return this.api.put<void>(API.Task.Update, payload);
  }

  /** `DELETE /task/{id}` (204). */
  deleteTask(taskId: number): Observable<void> {
    return this.api.delete<void>(API.Task.Delete(taskId));
  }

  /** `PUT /task/{id}/start` (204). */
  startTask(taskId: number): Observable<void> {
    return this.api.put<void>(API.Task.Start(taskId), {});
  }

  /** `PUT /task/{id}/complete` (204). Refused by the API when the task has subtasks. */
  completeTask(taskId: number): Observable<void> {
    return this.api.put<void>(API.Task.Complete(taskId), {});
  }

  /** `PUT /task/{id}/reopen` (204). Sends a completed task back to To do. */
  reopenTask(taskId: number): Observable<void> {
    return this.api.put<void>(API.Task.Reopen(taskId), {});
  }

  // ── Subtasks ──

  getSubTasks(taskId: number): Observable<SubTask[]> {
    return this.api.get<SubTask[]>(API.SubTask.ByTask(taskId));
  }

  createSubTask(taskId: number, title: string): Observable<number> {
    return this.api.post<number>(API.SubTask.Create, { title, taskId });
  }

  renameSubTask(subTaskId: number, title: string): Observable<void> {
    return this.api.put<void>(API.SubTask.Update, { subTaskId, title });
  }

  completeSubTask(subTaskId: number): Observable<void> {
    return this.api.put<void>(API.SubTask.Complete(subTaskId), {});
  }

  reopenSubTask(subTaskId: number): Observable<void> {
    return this.api.put<void>(API.SubTask.Reopen(subTaskId), {});
  }

  deleteSubTask(subTaskId: number): Observable<void> {
    return this.api.delete<void>(API.SubTask.Delete(subTaskId));
  }

  // ── Work logs ──

  getTaskWorkLogs(taskId: number): Observable<WorkLog[]> {
    return this.api.get<WorkLog[]>(API.WorkLog.ByTask(taskId));
  }

  startTimer(taskId: number, notes: string | null): Observable<number> {
    return this.api.post<number>(API.WorkLog.Start, { taskId, notes });
  }

  stopTimer(workLogId: number, notes: string | null): Observable<void> {
    return this.api.put<void>(API.WorkLog.Stop, { workLogId, notes });
  }

  logManualWork(
    taskId: number,
    startedAt: string,
    endedAt: string,
    notes: string | null,
  ): Observable<number> {
    return this.api.post<number>(API.WorkLog.Manual, {
      taskId,
      startedAt,
      endedAt,
      notes,
    });
  }

  deleteWorkLog(workLogId: number): Observable<void> {
    return this.api.delete<void>(API.WorkLog.Delete(workLogId));
  }

  // ── Personal report ──

  /**
   * `GET /report/me?from&to` → PersonalTaskReportDto.
   * **The window is required** — omitting from/to binds `0001-01-01` server-side and yields zeros.
   */
  getMyReport(from: string, to: string): Observable<PersonalTaskReport> {
    return this.api.get<PersonalTaskReport>(
      `${API.Report.Me}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    );
  }
}
