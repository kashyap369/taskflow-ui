import { Routes } from '@angular/router';

import { PublicLayout } from '@layouts/public-layout/public-layout';
import { AuthLayout } from '@layouts/auth-layout/auth-layout';
import { OrganizationLayout } from '@layouts/organization-layout/organization-layout';
import { MemberLayout } from '@layouts/member-layout/member-layout';
import { AdminLayout } from '@layouts/admin-layout/admin-layout';

import { authGuard } from '@core/guards/auth.guard';
import { guestGuard } from '@core/guards/guest.guard';
import { roleGuard } from '@core/guards/role.guard';
import { portalGuard } from '@core/guards/portal.guard';
import { plannerFeatureGuard } from '@core/guards/planner-feature.guard';

export const routes: Routes = [
  // ── Public marketing site ──────────────────────────────
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('@features/public/public.routes').then((m) => m.PUBLIC_ROUTES),
      },
    ],
  },

  // ── Authentication (solo / organization / admin login) ──
  {
    path: 'auth',
    component: AuthLayout,
    canActivate: [guestGuard],
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  // Legacy /login → canonical auth route
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },

  // Planner is an immersive workspace, so it deliberately bypasses MemberLayout's top bar,
  // max-width and page padding while keeping the canonical /member/planner URL and member guards.
  {
    path: 'member/planner',
    canMatch: [plannerFeatureGuard('/member/dashboard')],
    canActivate: [authGuard, portalGuard('member')],
    loadComponent: () =>
      import('@features/member/planner-page/planner-page').then((m) => m.PlannerPage),
  },

  // ── Organization portal (AccountType.Organization) ──────
  {
    path: 'organization',
    component: OrganizationLayout,
    canActivate: [authGuard, portalGuard('organization')],
    loadChildren: () =>
      import('@features/organization/organization.routes').then((m) => m.ORGANIZATION_ROUTES),
  },

  // ── Member portal (AccountType.Individual / solo user) ──
  {
    path: 'member',
    component: MemberLayout,
    canActivate: [authGuard, portalGuard('member')],
    loadChildren: () => import('@features/member/member.routes').then((m) => m.MEMBER_ROUTES),
  },

  // ── Admin portal (Admin system role) ────────────────────
  {
    path: 'admin',
    component: AdminLayout,
    canMatch: [roleGuard('Admin')],
    canActivate: [authGuard],
    loadChildren: () => import('@features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },

  // ── Fallback ────────────────────────────────────────────
  { path: '**', redirectTo: '' },
];
