import { Routes } from '@angular/router';

export const MEMBER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard-page/dashboard-page').then((m) => m.MemberDashboardPage),
  },
  {
    path: 'my-tasks',
    loadComponent: () => import('./my-tasks-page/my-tasks-page').then((m) => m.MyTasksPage),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./projects-page/projects-page').then((m) => m.MemberProjectsPage),
  },
  {
    path: 'invitations',
    loadComponent: () =>
      import('./invitations-page/invitations-page').then((m) => m.MemberInvitationsPage),
  },
  {
    path: 'help',
    loadChildren: () => import('@features/help/help.routes').then((m) => m.HELP_ROUTES),
  },
  // Additional member pages (calendar, settings) go here.
];
