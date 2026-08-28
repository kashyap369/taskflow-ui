import { Routes } from '@angular/router';
import { plannerFeatureGuard } from '@core/guards/planner-feature.guard';

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
    path: 'planner-templates',
    canMatch: [plannerFeatureGuard('/admin/dashboard')],
    loadComponent: () => import('./templates-page/templates-page').then((m) => m.AdminTemplatesPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings-page/settings-page').then((m) => m.AdminSettingsPage),
  },
];
