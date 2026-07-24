import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';

/**
 * Keeps already-authenticated users out of the auth pages, sending them to their portal home.
 * Only redirects when a real principal is resolved (a bare token without a user still sees login).
 */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn() && auth.portal() ? router.parseUrl(auth.homeRoute()) : true;
};
