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
    path: 'invitations',
    loadComponent: () =>
      import('./invitations-page/invitations-page').then((m) => m.MemberInvitationsPage),
  },
  // Additional member pages (my-tasks, calendar, reports, settings) go here.
];
