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
  {
    path: 'register',
    loadComponent: () => import('./register-page/register-page').then((m) => m.RegisterPage),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password-page/forgot-password-page').then(
        (m) => m.ForgotPasswordPage,
      ),
  },
  {
    // Landed on from the welcome email (`?token=…`). Without this step a new
    // account is PendingVerification and cannot sign in at all.
    path: 'verify-email',
    loadComponent: () =>
      import('./verify-email-page/verify-email-page').then((m) => m.VerifyEmailPage),
  },
];
