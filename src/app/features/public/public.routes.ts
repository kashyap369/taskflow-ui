import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./landing-page/landing-page').then(
        (m) => m.LandingPage,
      ),
  }
];
