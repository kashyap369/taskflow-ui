import { Routes } from '@angular/router';

/**
 * Auth screens. All three login variants render the same `LoginPage`, differentiated by the
 * `variant` in route `data` (branding/copy only). The post-login redirect is always resolved from
 * the API response (system role + account type), not from which screen was used.
 */
export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    data: { variant: 'solo' },
    loadComponent: () => import('./login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'organization',
    data: { variant: 'organization' },
    loadComponent: () => import('./login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'admin',
    data: { variant: 'admin' },
    loadComponent: () => import('./login-page/login-page').then((m) => m.LoginPage),
  },
  // Future auth screens (register, forgot-password) are added here as sibling routes.
];
