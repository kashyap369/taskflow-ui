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
  OrganizationInvitation,
  OrganizationListItem,
  OrganizationMember,
  OrganizationPermission,
  OrganizationRole,
  OrganizationRoleDetail,
  Project,
  ProjectReport,
  TaskListItem,
  Team,
  TeamPerformanceReport,
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
  private readonly _summary = signal<DashboardSummary | null>(null);
  private readonly _projects = signal<Project[]>([]);
  private readonly _tasks = signal<TaskListItem[]>([]);
  private readonly _roles = signal<OrganizationRole[]>([]);
  private readonly _members = signal<OrganizationMember[]>([]);
  private readonly _invitations = signal<OrganizationInvitation[]>([]);
  private readonly _teams = signal<Team[]>([]);
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
  readonly summary = this._summary.asReadonly();
  readonly projects = this._projects.asReadonly();
  readonly tasks = this._tasks.asReadonly();
  readonly roles = this._roles.asReadonly();
  readonly members = this._members.asReadonly();
  readonly invitations = this._invitations.asReadonly();
  readonly teams = this._teams.asReadonly();
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

  /** Refresh org tasks + summary, and the open project's tasks (if any) after a task change. */
  private afterTaskChange(organizationId: number): void {
    this.reloadTasks(organizationId);
    this.refreshSummary(organizationId);
    const project = this._projectDetail();
    if (project) {
      this.reloadProjectTasks(project.id);
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
        this.repository.getProject(projectId).subscribe({
          next: (project) => this._projectDetail.set(project),
        });
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

  private reloadTeams(organizationId: number): void {
    this.repository.getTeams(organizationId).subscribe({
      next: (teams) => this._teams.set(teams),
    });
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
