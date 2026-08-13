import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./landing-page/landing-page').then(
        (m) => m.LandingPage,
      ),
  },
  {
    path: 'privacy',
    loadComponent: () => import('./legal-page/legal-page').then((m) => m.LegalPage),
    data: { documentKey: 'privacy' },
  },
  {
    path: 'terms',
    loadComponent: () => import('./legal-page/legal-page').then((m) => m.LegalPage),
    data: { documentKey: 'terms' },
  },
  {
    path: 'cookies',
    loadComponent: () => import('./legal-page/legal-page').then((m) => m.LegalPage),
    data: { documentKey: 'cookies' },
  },
];
