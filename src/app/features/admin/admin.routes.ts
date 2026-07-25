import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard-page/dashboard-page').then((m) => m.AdminDashboardPage),
  },
  {
    path: 'users',
    loadComponent: () => import('./users-page/users-page').then((m) => m.AdminUsersPage),
  },
  // Organizations overview + platform settings need new backend endpoints
  // (only GET /organization/mine exists today) — see PHASES.md.
];
