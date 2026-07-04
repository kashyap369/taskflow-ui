import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/pages/public-landing-page/public-landing-page').then(
        (m) => m.PublicLandingPage,
      ),
  },
];
