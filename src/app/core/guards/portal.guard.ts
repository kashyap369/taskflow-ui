import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { Portal } from '../auth/roles.enum';

/**
 * Portal-access guard: allows the route only when the current user's resolved portal matches.
 * A signed-out user is sent to login; a signed-in user in the wrong portal is bounced to their own.
 *
 * Usage: `{ path: 'member', canActivate: [authGuard, portalGuard('member')], ... }`
 */
export const portalGuard = (portal: Portal): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      return router.parseUrl('/auth/login');
    }

    return auth.canAccessPortal(portal) ? true : router.parseUrl(auth.homeRoute());
  };
};
