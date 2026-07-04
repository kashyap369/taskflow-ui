import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
];
