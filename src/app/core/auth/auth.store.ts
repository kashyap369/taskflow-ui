import { Injectable, computed, signal } from '@angular/core';

import { User } from '../models/user.model';
import { Role } from './roles.enum';

/**
 * Signal-based store for the current session principal.
 * State only — no HTTP, no orchestration (that lives in AuthService / feature facades).
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _user = signal<User | null>(null);

  readonly user = this._user.asReadonly();

  readonly isAuthenticated = computed(() => this._user() !== null);

  readonly roles = computed<Role[]>(() => this._user()?.roles ?? []);

  setUser(user: User): void {
    this._user.set(user);
  }

  clear(): void {
    this._user.set(null);
  }

  hasRole(role: Role): boolean {
    return this.roles().includes(role);
  }
}
