import { Injectable, inject } from '@angular/core';

import { User } from '../models/user.model';
import { AuthStore } from './auth.store';
import { Role } from './roles.enum';
import { TokenService } from './token.service';

/**
 * App-wide session/authentication state.
 *
 * The login/refresh HTTP calls live in features/auth/data/auth.repository.ts;
 * this service owns the *resulting* session (token + current user) so that
 * guards and interceptors have one place to ask "who is logged in?".
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokens = inject(TokenService);
  private readonly store = inject(AuthStore);

  readonly user = this.store.user;
  readonly isAuthenticated = this.store.isAuthenticated;

  startSession(user: User, token: string, remember = false): void {
    this.tokens.setToken(token, remember);
    this.store.setUser(user);
  }

  endSession(): void {
    this.tokens.clearToken();
    this.store.clear();
  }

  hasRole(role: Role): boolean {
    return this.store.hasRole(role);
  }

  isLoggedIn(): boolean {
    return this.tokens.isLoggedIn();
  }
}
