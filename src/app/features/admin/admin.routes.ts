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
  {
    path: 'organizations',
    loadComponent: () =>
      import('./organizations-page/organizations-page').then((m) => m.AdminOrganizationsPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings-page/settings-page').then((m) => m.AdminSettingsPage),
  },
];
