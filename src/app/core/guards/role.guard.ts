import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { Role } from '../auth/roles.enum';

/**
 * Route-*matching* guard: a portal branch only matches when the current user
 * holds the required role. Combined with `loadChildren`, an unauthorized
 * portal's bundle is never even downloaded.
 *
 * Usage: `{ path: 'admin', canMatch: [roleGuard(Role.Admin)], ... }`
 */
export const roleGuard = (role: Role): CanMatchFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isLoggedIn() && auth.hasRole(role)) {
      return true;
    }

    return router.createUrlTree([auth.isLoggedIn() ? '/' : '/auth/login']);
  };
};
