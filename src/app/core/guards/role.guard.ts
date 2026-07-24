import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { SystemRole } from '../auth/roles.enum';

/**
 * Route-*matching* guard: a portal branch only matches when the current user holds the required
 * system role. Combined with `loadChildren`, an unauthorized portal's bundle is never downloaded.
 *
 * Usage: `{ path: 'admin', canMatch: [roleGuard('Admin')], ... }`
 */
export const roleGuard = (role: SystemRole): CanMatchFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isLoggedIn() && auth.hasRole(role)) {
      return true;
    }

    return router.parseUrl(auth.isLoggedIn() ? auth.homeRoute() : '/auth/login');
  };
};
