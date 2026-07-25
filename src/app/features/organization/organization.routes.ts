import { Routes } from '@angular/router';

export const ORGANIZATION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard-page/dashboard-page').then((m) => m.DashboardPage),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./projects-page/projects-page').then((m) => m.ProjectsPage),
  },
  {
    path: 'projects/:id',
    loadComponent: () =>
      import('./project-detail-page/project-detail-page').then((m) => m.ProjectDetailPage),
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks-page/tasks-page').then((m) => m.TasksPage),
  },
  {
    path: 'members',
    loadComponent: () => import('./members-page/members-page').then((m) => m.MembersPage),
  },
  {
    path: 'teams',
    loadComponent: () => import('./teams-page/teams-page').then((m) => m.TeamsPage),
  },
  {
    path: 'teams/:id',
    loadComponent: () =>
      import('./team-detail-page/team-detail-page').then((m) => m.TeamDetailPage),
  },
  {
    path: 'roles',
    loadComponent: () => import('./roles-page/roles-page').then((m) => m.RolesPage),
  },
  {
    path: 'reports',
    loadComponent: () => import('./reports-page/reports-page').then((m) => m.ReportsPage),
  },
  {
    // Invitations are addressed to a *user*, not a portal — an Organization account can be invited
    // into another organization too. Same standalone page the member portal mounts.
    path: 'invitations',
    loadComponent: () =>
      import('@features/member/invitations-page/invitations-page').then(
        (m) => m.MemberInvitationsPage,
      ),
  },
  // Additional organization pages (settings) are added here.
];
