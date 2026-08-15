import { Injectable, inject } from '@angular/core';

import { User } from '../models/user.model';
import { AuthStore } from './auth.store';
import { PORTAL_HOME, Portal, SystemRole, canAccessPortal } from './roles.enum';
import { TokenService } from './token.service';

/**
 * App-wide session/authentication state.
 *
 * The login/refresh HTTP calls live in features/auth/auth.repository.ts; this service owns the
 * *resulting* session (tokens + current user) so that guards and interceptors have one place to
 * ask "who is logged in, and which portal do they belong to?".
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokens = inject(TokenService);
  private readonly store = inject(AuthStore);

  readonly user = this.store.user;
  readonly isAuthenticated = this.store.isAuthenticated;
  readonly portal = this.store.portal;

  constructor() {
    // Rehydrate the session on app start (hard refresh / new tab reusing localStorage).
    const persisted = this.tokens.getUser();
    if (persisted && this.tokens.isLoggedIn()) {
      this.store.setUser(persisted);
    }
  }

  /** Persist tokens (call before any authenticated request, e.g. `/user/me`). */
  setTokens(accessToken: string, refreshToken: string, remember = false): void {
    this.tokens.setTokens(accessToken, refreshToken, remember);
  }

  setUser(user: User): void {
    this.store.setUser(user);
    this.tokens.setUser(user);
  }

  endSession(): void {
    this.tokens.clearSession();
    this.store.clear();
  }

  hasRole(role: SystemRole): boolean {
    return this.store.hasRole(role);
  }

  isLoggedIn(): boolean {
    return this.tokens.isLoggedIn();
  }

  /** The stored refresh token (for the logout / refresh payloads). */
  refreshToken(): string | null {
    return this.tokens.getRefreshToken();
  }

  /** The route the current user should land on, or the login page when signed out. */
  homeRoute(): string {
    const portal = this.store.portal();
    return portal ? PORTAL_HOME[portal] : '/auth/login';
  }

  /** Whether the current user is allowed into the given portal. */
  canAccessPortal(portal: Portal): boolean {
    const primaryPortal = this.store.portal();
    return primaryPortal !== null && canAccessPortal(primaryPortal, portal);
  }
}
