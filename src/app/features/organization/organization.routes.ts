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
  // Additional organization pages (projects, tasks, reports, settings)
  // are added here as sibling <page-name>/ folders.
];
