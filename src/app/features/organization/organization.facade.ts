import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from '@core/services/notification.service';

import { OrganizationRepository } from './organization.repository';
import {
  CreateProjectPayload,
  CreateTaskPayload,
  DashboardSummary,
  MemberTaskReport,
  OrganizationDetail,
  OrganizationInvitation,
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

const SELECTED_ORG_KEY = 'tf_org_id';

/**
 * Application layer for the organization portal. Owns the "current organization" and the data
 * loaded for it (dashboard summary, projects, tasks). Pages read the signals and call the actions;
 * they never touch the repository directly.
 *
 * Onboarding: a freshly registered Organization account has no organization yet (register does not
 * create one), so `needsOrganization` drives a create-organization state in the dashboard.
 */
@Injectable({ providedIn: 'root' })
export class OrganizationFacade {
  private readonly repository = inject(OrganizationRepository);
  private readonly auth = inject(AuthService);
  private readonly notification = inject(NotificationService);

  // ── State ──
  private readonly _organizations = signal<OrganizationListItem[]>([]);
  private readonly _currentOrg = signal<OrganizationListItem | null>(null);
  private readonly _orgDetail = signal<OrganizationDetail | null>(null);
  private readonly _summary = signal<DashboardSummary | null>(null);
  private readonly _projects = signal<Project[]>([]);
  private readonly _tasks = signal<TaskListItem[]>([]);
  private readonly _roles = signal<OrganizationRole[]>([]);
  private readonly _members = signal<OrganizationMember[]>([]);
  private readonly _invitations = signal<OrganizationInvitation[]>([]);
  private readonly _teams = signal<Team[]>([]);
  private readonly _teamDetail = signal<TeamDetail | null>(null);
  private readonly _subTasks = signal<SubTask[]>([]);
  private readonly _subTasksTaskId = signal<number | null>(null);
  private readonly _workLogs = signal<WorkLog[]>([]);
  private readonly _workLogsTaskId = signal<number | null>(null);
  private readonly _permissionCatalog = signal<OrganizationPermission[]>([]);
  private readonly _selectedRole = signal<OrganizationRoleDetail | null>(null);
  private readonly _projectDetail = signal<Project | null>(null);
  private readonly _projectTasks = signal<TaskListItem[]>([]);
  private readonly _teamReport = signal<TeamPerformanceReport[]>([]);
  private readonly _memberReport = signal<MemberTaskReport | null>(null);
  private readonly _projectReport = signal<ProjectReport | null>(null);
  private readonly _reportLoading = signal(false);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);
  private readonly _loaded = signal(false);

  readonly organizations = this._organizations.asReadonly();
  readonly currentOrg = this._currentOrg.asReadonly();
  readonly orgDetail = this._orgDetail.asReadonly();
  readonly summary = this._summary.asReadonly();
  readonly projects = this._projects.asReadonly();
  readonly tasks = this._tasks.asReadonly();
  readonly roles = this._roles.asReadonly();
  readonly members = this._members.asReadonly();
  readonly invitations = this._invitations.asReadonly();
  readonly teams = this._teams.asReadonly();
  readonly teamDetail = this._teamDetail.asReadonly();
  readonly subTasks = this._subTasks.asReadonly();
  readonly subTasksTaskId = this._subTasksTaskId.asReadonly();
  readonly workLogs = this._workLogs.asReadonly();
  readonly workLogsTaskId = this._workLogsTaskId.asReadonly();
  readonly permissionCatalog = this._permissionCatalog.asReadonly();
  readonly selectedRole = this._selectedRole.asReadonly();
  readonly projectDetail = this._projectDetail.asReadonly();
  readonly projectTasks = this._projectTasks.asReadonly();
  readonly teamReport = this._teamReport.asReadonly();
  readonly memberReport = this._memberReport.asReadonly();
  readonly projectReport = this._projectReport.asReadonly();
  readonly reportLoading = this._reportLoading.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();

  /** The signed-in principal (for greetings / ownership). */
  readonly user = this.auth.user;

  /** True once we've loaded orgs and found none — show the create-organization onboarding. */
  readonly needsOrganization = computed(() => this._loaded() && this._organizations().length === 0);

  readonly currentOrgId = computed(() => this._currentOrg()?.id ?? null);

  /**
   * True when the signed-in user owns the current organization. Renaming/deleting an organization is
   * an owner-only affordance in this UI — the API does **not** enforce that (see SESSIONS), so this
   * is a usability gate, not a security boundary.
   */
  readonly isCurrentOrgOwner = computed(() => {
    const org = this._currentOrg();
    const user = this.user();
    return org != null && user != null && org.ownerUserId === user.id;
  });

  /** Resolve the current organization (once) and load its dashboard data. */
  init(): void {
    if (this._loaded()) {
      return;
    }
    this.loadOrganizations();
  }

  /** Re-fetch the user's organizations, choose the current one, then load its data. */
  loadOrganizations(): void {
    this._loading.set(true);

    this.repository.getMyOrganizations().subscribe({
      next: (orgs) => {
        this._organizations.set(orgs);
        this._loaded.set(true);

        if (orgs.length === 0) {
          this._currentOrg.set(null);
          this._loading.set(false);
          return;
        }

        const persistedId = Number(localStorage.getItem(SELECTED_ORG_KEY));
        const current = orgs.find((o) => o.id === persistedId) ?? orgs[0];
        this.selectOrganization(current);
      },
      error: () => {
        this._loaded.set(true);
        this._loading.set(false);
      },
    });
  }

  /** Switch the active organization and reload its dashboard/projects/tasks. */
  selectOrganization(org: OrganizationListItem): void {
    this._currentOrg.set(org);
    localStorage.setItem(SELECTED_ORG_KEY, String(org.id));
    this.loadOrgData(org.id);
  }

  private loadOrgData(organizationId: number): void {
    this._loading.set(true);

    // Everything the org portal pages read, loaded together so any page has data immediately and
    // switching orgs refreshes all of it. All of these endpoints return raw (unenveloped) DTOs.
    forkJoin({
      summary: this.repository.getDashboard(organizationId),
      projects: this.repository.getProjects(organizationId),
      tasks: this.repository.getTasks(organizationId),
      roles: this.repository.getRoles(organizationId),
      members: this.repository.getMembers(organizationId),
      invitations: this.repository.getInvitations(organizationId),
      teams: this.repository.getTeams(organizationId),
    }).subscribe({
      next: ({ summary, projects, tasks, roles, members, invitations, teams }) => {
        this._summary.set(summary);
        this._projects.set(projects);
        this._tasks.set(tasks);
        this._roles.set(roles);
        this._members.set(members);
        this._invitations.set(invitations);
        this._teams.set(teams);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });

    // The permission catalog is global — fetch once.
    if (this._permissionCatalog().length === 0) {
      this.repository.getPermissionCatalog().subscribe({
        next: (catalog) => this._permissionCatalog.set(catalog),
      });
    }
  }

  /** Reload just the dashboard summary (after a create/lifecycle change). */
  private refreshSummary(organizationId: number): void {
    this.repository.getDashboard(organizationId).subscribe({
      next: (summary) => this._summary.set(summary),
    });
  }

  // ── Actions ──

  createOrganization(name: string, description: string): void {
    this._saving.set(true);

    this.repository.createOrganization({ name, description }).subscribe({
      next: (newId) => {
        this._saving.set(false);
        this.notification.success('Organization created.');
        localStorage.setItem(SELECTED_ORG_KEY, String(newId));
        this._loaded.set(false);
        this.loadOrganizations();
      },
      error: () => this._saving.set(false),
    });
  }

  /**
   * Load an organization's full detail — the settings form's source of truth. `OrganizationListItem`
   * (what the switcher holds) carries no `description`, so a form filled from it would blank the
   * description on save; always come through here before editing.
   */
  loadOrgDetail(organizationId: number): void {
    this.repository.getOrganization(organizationId).subscribe({
      next: (org) => this._orgDetail.set(org),
    });
  }

  clearOrgDetail(): void {
    this._orgDetail.set(null);
  }

  /** `PUT /organization`. Partial: name + description only — status isn't editable through the API. */
  updateOrganization(payload: UpdateOrganizationPayload): void {
    this._saving.set(true);
    this.repository.updateOrganization(payload).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Organization updated.');
        this.loadOrgDetail(payload.organizationId);
        // The name is rendered by the sidebar switcher, which reads the *list* DTO — refresh it too.
        this.refreshOrganizations();
      },
      error: () => this._saving.set(false),
    });
  }

  /**
   * `DELETE /organization/{id}` — removes the organization and everything under it. Resets the
   * portal's org-scoped state and re-resolves the user's organizations, so the caller lands on
   * either a remaining workspace or the create-organization onboarding. `onDeleted` fires only on
   * success, so a failed delete doesn't navigate.
   */
  deleteOrganization(organizationId: number, onDeleted?: () => void): void {
    this.repository.deleteOrganization(organizationId).subscribe({
      next: () => {
        this.notification.success('Organization deleted.');
        localStorage.removeItem(SELECTED_ORG_KEY);
        this.resetOrgScopedState();
        this._loaded.set(false);
        this.loadOrganizations();
        onDeleted?.();
      },
    });
  }

  /** Re-read `/mine` in place (name changes) without reloading every org-scoped list. */
  private refreshOrganizations(): void {
    const currentId = this.currentOrgId();
    this.repository.getMyOrganizations().subscribe({
      next: (orgs) => {
        this._organizations.set(orgs);
        const current = orgs.find((o) => o.id === currentId);
        if (current) {
          this._currentOrg.set(current);
        }
      },
    });
  }

  /** Drop everything scoped to an organization, so nothing stale survives a delete. */
  private resetOrgScopedState(): void {
    this._currentOrg.set(null);
    this._orgDetail.set(null);
    this._summary.set(null);
    this._projects.set([]);
    this._tasks.set([]);
    this._roles.set([]);
    this._members.set([]);
    this._invitations.set([]);
    this._teams.set([]);
    this.clearProjectDetail();
    this.clearTeamDetail();
  }

  createProject(payload: Omit<CreateProjectPayload, 'organizationId'>): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }

    this._saving.set(true);
    this.repository.createProject({ ...payload, organizationId }).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Project created.');
        this.reloadProjects(organizationId);
        this.refreshSummary(organizationId);
      },
      error: () => this._saving.set(false),
    });
  }

  /**
   * `PUT /project`. The command is partial (title/description/expected date only) — status and
   * start date aren't editable through the API.
   */
  updateProject(payload: UpdateProjectPayload): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }

    this._saving.set(true);
    this.repository.updateProject(payload).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Project updated.');
        this.reloadProjects(organizationId);
        if (this._projectDetail()?.id === payload.projectId) {
          this.reloadProjectDetail(payload.projectId);
        }
      },
      error: () => this._saving.set(false),
    });
  }

  /**
   * `DELETE /project/{id}`. `onDeleted` fires only on success, so a caller can navigate away
   * without guessing (the project-detail page uses it to go back to the list).
   */
  deleteProject(projectId: number, onDeleted?: () => void): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }

    this.repository.deleteProject(projectId).subscribe({
      next: () => {
        this.notification.success('Project deleted.');
        if (this._projectDetail()?.id === projectId) {
          this.clearProjectDetail();
        }
        this.reloadProjects(organizationId);
        this.reloadTasks(organizationId);
        this.refreshSummary(organizationId);
        onDeleted?.();
      },
    });
  }

  createTask(payload: Omit<CreateTaskPayload, 'organizationId'>): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }

    this._saving.set(true);
    this.repository.createTask({ ...payload, organizationId }).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Task created.');
        this.reloadTasks(organizationId);
        this.refreshSummary(organizationId);
      },
      error: () => this._saving.set(false),
    });
  }

  /**
   * Fetch a task's full detail before editing it. `TaskListItem` (what the tables render) has no
   * `description`, so an edit form filled from a row would blank it on save — always come through
   * here. `onLoaded` runs once, on success, with the shape the form needs.
   */
  loadTaskForEdit(taskId: number, onLoaded: (task: TaskDetail) => void): void {
    this.repository.getTask(taskId).subscribe({ next: onLoaded });
  }

  /** `PUT /task`. Partial: status, start date and project stay where they are. */
  updateTask(payload: UpdateTaskPayload): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }

    this._saving.set(true);
    this.repository.updateTask(payload).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Task updated.');
        this.afterTaskChange(organizationId);
      },
      error: () => this._saving.set(false),
    });
  }

  deleteTask(taskId: number): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }
    this.repository.deleteTask(taskId).subscribe({
      next: () => {
        this.notification.success('Task deleted.');
        this.afterTaskChange(organizationId);
      },
    });
  }

  startTask(taskId: number): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }
    this.repository.startTask(taskId).subscribe({
      next: () => {
        this.notification.success('Task started.');
        this.reloadTasks(organizationId);
        this.refreshSummary(organizationId);
      },
    });
  }

  completeTask(taskId: number): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }
    this.repository.completeTask(taskId).subscribe({
      next: () => {
        this.notification.success('Task completed.');
        this.reloadTasks(organizationId);
        this.refreshSummary(organizationId);
      },
    });
  }

  assignTask(taskId: number, userId: number): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }
    this.repository.assignTask(taskId, userId).subscribe({
      next: () => {
        this.notification.success('Task assigned.');
        this.afterTaskChange(organizationId);
      },
    });
  }

  unassignTask(taskId: number): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }
    this.repository.unassignTask(taskId).subscribe({
      next: () => {
        this.notification.success('Task unassigned.');
        this.afterTaskChange(organizationId);
      },
    });
  }

  /**
   * Refresh org tasks + summary, and the open project's tasks *and header* (if any) after a task
   * change — the header's task counts / completion % move with its tasks.
   */
  private afterTaskChange(organizationId: number): void {
    this.reloadTasks(organizationId);
    this.refreshSummary(organizationId);
    const project = this._projectDetail();
    if (project) {
      this.reloadProjectTasks(project.id);
      this.reloadProjectDetail(project.id);
    }
  }

  // ── Project detail ──

  loadProjectDetail(projectId: number): void {
    this._loading.set(true);
    forkJoin({
      project: this.repository.getProject(projectId),
      tasks: this.repository.getProjectTasks(projectId),
    }).subscribe({
      next: ({ project, tasks }) => {
        this._projectDetail.set(project);
        this._projectTasks.set(tasks);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  clearProjectDetail(): void {
    this._projectDetail.set(null);
    this._projectTasks.set([]);
  }

  /** Create a task already scoped to a project (from the project detail page). */
  createProjectTask(
    projectId: number,
    payload: Omit<CreateTaskPayload, 'organizationId' | 'projectId'>,
  ): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }
    this._saving.set(true);
    this.repository.createTask({ ...payload, organizationId, projectId }).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Task created.');
        this.reloadProjectTasks(projectId);
        this.reloadProjectDetail(projectId);
        this.reloadTasks(organizationId);
        this.refreshSummary(organizationId);
      },
      error: () => this._saving.set(false),
    });
  }

  private reloadProjectTasks(projectId: number): void {
    this.repository.getProjectTasks(projectId).subscribe({
      next: (tasks) => this._projectTasks.set(tasks),
    });
  }

  /** Re-fetch a project's header (its counts/progress are server-computed). */
  private reloadProjectDetail(projectId: number): void {
    this.repository.getProject(projectId).subscribe({
      next: (project) => this._projectDetail.set(project),
    });
  }

  private reloadProjects(organizationId: number): void {
    this.repository.getProjects(organizationId).subscribe({
      next: (projects) => this._projects.set(projects),
    });
  }

  private reloadTasks(organizationId: number): void {
    this.repository.getTasks(organizationId).subscribe({
      next: (tasks) => this._tasks.set(tasks),
    });
  }

  // ── Roles & permissions ──

  createRole(name: string, description: string): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }
    this._saving.set(true);
    this.repository.createRole(organizationId, name, description).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Role created.');
        this.reloadRoles(organizationId);
      },
      error: () => this._saving.set(false),
    });
  }

  updateRole(payload: UpdateRolePayload): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }
    this._saving.set(true);
    this.repository.updateRole(payload).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Role updated.');
        this.reloadRoles(organizationId);
        if (this._selectedRole()?.id === payload.roleId) {
          this.selectRole(payload.roleId);
        }
      },
      error: () => this._saving.set(false),
    });
  }

  deleteRole(roleId: number): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }
    this.repository.deleteRole(roleId).subscribe({
      next: () => {
        this.notification.success('Role deleted.');
        if (this._selectedRole()?.id === roleId) {
          this.clearSelectedRole();
        }
        this.reloadRoles(organizationId);
        // Members carry a role name, so a deleted role changes what the members list shows.
        this.reloadMembers(organizationId);
      },
    });
  }

  /** Load a role's detail (with its granted permission names) for the permissions editor. */
  selectRole(roleId: number): void {
    this.repository.getRole(roleId).subscribe({
      next: (role) => this._selectedRole.set(role),
    });
  }

  clearSelectedRole(): void {
    this._selectedRole.set(null);
  }

  togglePermission(roleId: number, permissionName: string, grant: boolean): void {
    const call = grant
      ? this.repository.grantPermission(roleId, permissionName)
      : this.repository.revokePermission(roleId, permissionName);

    call.subscribe({
      next: () => {
        this.notification.success(grant ? 'Permission granted.' : 'Permission revoked.');
        this.selectRole(roleId);
      },
    });
  }

  private reloadRoles(organizationId: number): void {
    this.repository.getRoles(organizationId).subscribe({
      next: (roles) => this._roles.set(roles),
    });
  }

  // ── Members ──

  activateMember(userId: number): void {
    this.memberAction((orgId) => this.repository.activateMember(orgId, userId), 'Member activated.');
  }

  deactivateMember(userId: number): void {
    this.memberAction(
      (orgId) => this.repository.deactivateMember(orgId, userId),
      'Member deactivated.',
    );
  }

  removeMember(userId: number): void {
    this.memberAction((orgId) => this.repository.removeMember(orgId, userId), 'Member removed.');
  }

  changeMemberRole(userId: number, organizationRoleId: number): void {
    this.memberAction(
      (orgId) => this.repository.changeMemberRole(orgId, userId, organizationRoleId),
      'Member role updated.',
    );
  }

  private memberAction(
    call: (organizationId: number) => Observable<void>,
    successMessage: string,
  ): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }
    call(organizationId).subscribe({
      next: () => {
        this.notification.success(successMessage);
        this.reloadMembers(organizationId);
        this.refreshSummary(organizationId);
      },
    });
  }

  private reloadMembers(organizationId: number): void {
    this.repository.getMembers(organizationId).subscribe({
      next: (members) => this._members.set(members),
    });
  }

  // ── Invitations ──

  invite(email: string, organizationRoleId: number): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }
    this._saving.set(true);
    this.repository.invite(organizationId, email, organizationRoleId).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Invitation sent.');
        this.reloadInvitations(organizationId);
      },
      error: () => this._saving.set(false),
    });
  }

  cancelInvitation(invitationId: number): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }
    this.repository.cancelInvitation(invitationId).subscribe({
      next: () => {
        this.notification.success('Invitation cancelled.');
        this.reloadInvitations(organizationId);
      },
    });
  }

  private reloadInvitations(organizationId: number): void {
    this.repository.getInvitations(organizationId).subscribe({
      next: (invitations) => this._invitations.set(invitations),
    });
  }

  // ── Teams ──

  createTeam(name: string, description: string): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }
    this._saving.set(true);
    this.repository.createTeam(organizationId, name, description).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Team created.');
        this.reloadTeams(organizationId);
        this.refreshSummary(organizationId);
      },
      error: () => this._saving.set(false),
    });
  }

  updateTeam(payload: UpdateTeamPayload): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }
    this._saving.set(true);
    this.repository.updateTeam(payload).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Team updated.');
        this.reloadTeams(organizationId);
        if (this._teamDetail()?.id === payload.teamId) {
          this.loadTeamDetail(payload.teamId);
        }
      },
      error: () => this._saving.set(false),
    });
  }

  /** `DELETE /team/{id}`; `onDeleted` fires on success so the detail page can navigate back. */
  deleteTeam(teamId: number, onDeleted?: () => void): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }
    this.repository.deleteTeam(teamId).subscribe({
      next: () => {
        this.notification.success('Team deleted.');
        if (this._teamDetail()?.id === teamId) {
          this.clearTeamDetail();
        }
        this.reloadTeams(organizationId);
        this.refreshSummary(organizationId);
        onDeleted?.();
      },
    });
  }

  private reloadTeams(organizationId: number): void {
    this.repository.getTeams(organizationId).subscribe({
      next: (teams) => this._teams.set(teams),
    });
  }

  // ── Team detail + members ──

  loadTeamDetail(teamId: number): void {
    this._loading.set(true);
    this.repository.getTeam(teamId).subscribe({
      next: (team) => {
        this._teamDetail.set(team);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  clearTeamDetail(): void {
    this._teamDetail.set(null);
  }

  addTeamMember(userId: number): void {
    const team = this._teamDetail();
    if (!team) {
      return;
    }
    this._saving.set(true);
    this.repository.addTeamMember(team.id, userId).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Member added to team.');
        this.afterTeamMemberChange(team.id);
      },
      error: () => this._saving.set(false),
    });
  }

  removeTeamMember(userId: number): void {
    const team = this._teamDetail();
    if (!team) {
      return;
    }
    this.repository.removeTeamMember(team.id, userId).subscribe({
      next: () => {
        this.notification.success('Member removed from team.');
        this.afterTeamMemberChange(team.id);
      },
    });
  }

  /** Reload the open team and the teams list (member counts) after a membership change. */
  private afterTeamMemberChange(teamId: number): void {
    this.repository.getTeam(teamId).subscribe({
      next: (team) => this._teamDetail.set(team),
    });
    const organizationId = this.currentOrgId();
    if (organizationId != null) {
      this.reloadTeams(organizationId);
    }
  }

  // ── Subtasks ──

  /** Load the subtasks for a task (opens the task's subtask drawer). */
  loadSubTasks(taskId: number): void {
    this._subTasksTaskId.set(taskId);
    this.repository.getSubTasks(taskId).subscribe({
      next: (subs) => this._subTasks.set(subs),
    });
  }

  clearSubTasks(): void {
    this._subTasks.set([]);
    this._subTasksTaskId.set(null);
  }

  addSubTask(taskId: number, title: string): void {
    this._saving.set(true);
    this.repository.createSubTask(taskId, title).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Subtask added.');
        this.afterSubTaskChange(taskId);
      },
      error: () => this._saving.set(false),
    });
  }

  /** `PUT /subtask` — title only; the command carries no status (that moves via complete/reopen). */
  renameSubTask(taskId: number, subTaskId: number, title: string): void {
    this._saving.set(true);
    this.repository.updateSubTask(subTaskId, title).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Subtask renamed.');
        this.afterSubTaskChange(taskId);
      },
      error: () => this._saving.set(false),
    });
  }

  completeSubTask(taskId: number, subTaskId: number): void {
    this.repository.completeSubTask(subTaskId).subscribe({
      next: () => this.afterSubTaskChange(taskId),
    });
  }

  reopenSubTask(taskId: number, subTaskId: number): void {
    this.repository.reopenSubTask(subTaskId).subscribe({
      next: () => this.afterSubTaskChange(taskId),
    });
  }

  deleteSubTask(taskId: number, subTaskId: number): void {
    this.repository.deleteSubTask(subTaskId).subscribe({
      next: () => {
        this.notification.success('Subtask deleted.');
        this.afterSubTaskChange(taskId);
      },
    });
  }

  /** Refresh the open drawer's subtasks + the task-list badges after any subtask change. */
  private afterSubTaskChange(taskId: number): void {
    if (this._subTasksTaskId() === taskId) {
      this.repository.getSubTasks(taskId).subscribe({
        next: (subs) => this._subTasks.set(subs),
      });
    }
    const organizationId = this.currentOrgId();
    if (organizationId != null) {
      this.reloadTasks(organizationId);
    }
    const project = this._projectDetail();
    if (project) {
      this.reloadProjectTasks(project.id);
    }
  }

  // ── Work logs (time tracking) ──

  /** Load the work logs for a task (opens the task's time-tracking drawer). */
  loadWorkLogs(taskId: number): void {
    this._workLogsTaskId.set(taskId);
    this.repository.getWorkLogs(taskId).subscribe({
      next: (logs) => this._workLogs.set(logs),
    });
  }

  clearWorkLogs(): void {
    this._workLogs.set([]);
    this._workLogsTaskId.set(null);
  }

  startWorkLog(taskId: number, notes: string | null): void {
    this._saving.set(true);
    this.repository.startWorkLog(taskId, notes).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Timer started.');
        this.afterWorkLogChange(taskId);
      },
      error: () => this._saving.set(false),
    });
  }

  stopWorkLog(taskId: number, workLogId: number, notes: string | null): void {
    this._saving.set(true);
    this.repository.stopWorkLog(workLogId, notes).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Timer stopped.');
        this.afterWorkLogChange(taskId);
      },
      error: () => this._saving.set(false),
    });
  }

  logManualWork(
    taskId: number,
    startedAt: string,
    endedAt: string,
    notes: string | null,
  ): void {
    this._saving.set(true);
    this.repository.logManualWork(taskId, startedAt, endedAt, notes).subscribe({
      next: () => {
        this._saving.set(false);
        this.notification.success('Time logged.');
        this.afterWorkLogChange(taskId);
      },
      error: () => this._saving.set(false),
    });
  }

  deleteWorkLog(taskId: number, workLogId: number): void {
    this.repository.deleteWorkLog(workLogId).subscribe({
      next: () => {
        this.notification.success('Work log deleted.');
        this.afterWorkLogChange(taskId);
      },
    });
  }

  /** Refresh the open drawer's logs + the org summary (tracked hours) after any work-log change. */
  private afterWorkLogChange(taskId: number): void {
    if (this._workLogsTaskId() === taskId) {
      this.repository.getWorkLogs(taskId).subscribe({
        next: (logs) => this._workLogs.set(logs),
      });
    }
    const organizationId = this.currentOrgId();
    if (organizationId != null) {
      this.refreshSummary(organizationId);
    }
  }

  // ── Reporting ──

  /** Team performance across the org for a date window. */
  loadTeamReport(from: string, to: string): void {
    const organizationId = this.currentOrgId();
    if (organizationId == null) {
      return;
    }
    this._reportLoading.set(true);
    this.repository.getTeamReport(organizationId, from, to).subscribe({
      next: (report) => {
        this._teamReport.set(report);
        this._reportLoading.set(false);
      },
      error: () => this._reportLoading.set(false),
    });
  }

  loadMemberReport(userId: number, from: string, to: string): void {
    this.repository.getMemberReport(userId, from, to).subscribe({
      next: (report) => this._memberReport.set(report),
    });
  }

  clearMemberReport(): void {
    this._memberReport.set(null);
  }

  loadProjectReport(projectId: number): void {
    this.repository.getProjectReport(projectId).subscribe({
      next: (report) => this._projectReport.set(report),
    });
  }

  clearProjectReport(): void {
    this._projectReport.set(null);
  }
}
