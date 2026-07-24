import { Injectable, computed, signal } from '@angular/core';

import { User } from '../models/user.model';
import { AccountType, Portal, SystemRole, resolvePortal } from './roles.enum';

/**
 * Signal-based store for the current session principal.
 * State only — no HTTP, no orchestration (that lives in AuthService / feature facades).
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _user = signal<User | null>(null);

  readonly user = this._user.asReadonly();

  readonly isAuthenticated = computed(() => this._user() !== null);

  readonly roles = computed<SystemRole[]>(() => this._user()?.roles ?? []);

  readonly accountType = computed<AccountType | null>(() => this._user()?.accountType ?? null);

  /** Which portal the current user belongs to, or null when signed out. */
  readonly portal = computed<Portal | null>(() => {
    const user = this._user();
    return user ? resolvePortal(user.roles, user.accountType) : null;
  });

  setUser(user: User): void {
    this._user.set(user);
  }

  clear(): void {
    this._user.set(null);
  }

  hasRole(role: SystemRole): boolean {
    return this.roles().includes(role);
  }
}
