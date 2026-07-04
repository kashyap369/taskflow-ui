import { Routes } from '@angular/router';

import { PublicLayout } from '@layouts/public-layout/public-layout';
import { AuthLayout } from '@layouts/auth-layout/auth-layout';
import { OrganizationLayout } from '@layouts/organization-layout/organization-layout';

import { authGuard } from '@core/guards/auth.guard';
import { guestGuard } from '@core/guards/guest.guard';

export const routes: Routes = [
  // ── Public marketing site ──────────────────────────────
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('@features/public/landing/public.routes').then((m) => m.PUBLIC_ROUTES),
      },
    ],
  },

  // ── Authentication (all login screens share this shell) ─
  {
    path: 'auth',
    component: AuthLayout,
    canActivate: [guestGuard],
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // ── Organization portal ────────────────────────────────
  {
    path: 'organization',
    component: OrganizationLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('@features/organization/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },
      // Projects (scaffold) — wire when features/organization/projects has pages:
      // {
      //   path: 'projects',
      //   loadChildren: () =>
      //     import('@features/organization/projects/projects.routes').then((m) => m.PROJECTS_ROUTES),
      // },
    ],
  },

  // ── Admin & Member portals (scaffolded) ─────────────────
  // Layouts exist at @layouts/admin-layout and @layouts/member-layout.
  // Wire with role-based CanMatch once their features/pages exist, e.g.:
  //   { path: 'admin', component: AdminLayout, canActivate: [authGuard],
  //     canMatch: [roleGuard(Role.Admin)], loadChildren: () => import('@features/admin/...') }

  // ── Fallback ────────────────────────────────────────────
  { path: '**', redirectTo: '' },
];
