import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./presentation/pages/login-page/login-page').then((m) => m.LoginPage),
  },
  // Additional auth screens (org-login, admin-login, register, forgot-password)
  // are added here as pages under presentation/pages/.
];
