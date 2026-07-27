import { Injectable } from '@angular/core';

import { User } from '../models/user.model';

/**
 * Persists the session (access + refresh tokens and the user principal). Storage is chosen by the
 * "remember me" flag:
 *   remember = true  -> localStorage   (survives browser restart)
 *   remember = false -> sessionStorage (cleared when the tab closes)
 *
 * The user principal is persisted alongside the tokens so a hard refresh can rehydrate the session
 * without a network round-trip (roles come from the login response, not `/user/me`).
 */
@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly ACCESS_KEY = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';
  private readonly USER_KEY = 'auth_user';

  getToken(): string | null {
    return this.read(this.ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return this.read(this.REFRESH_KEY);
  }

  setTokens(accessToken: string, refreshToken: string, remember = false): void {
    this.clearSession();

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(this.ACCESS_KEY, accessToken);
    storage.setItem(this.REFRESH_KEY, refreshToken);
  }

  /**
   * Swap in rotated tokens (from `POST /auth/refresh`) without clearing the stored user principal or
   * changing the remember-me storage choice — writes to whichever storage currently holds the session.
   */
  updateTokens(accessToken: string, refreshToken: string): void {
    const storage = this.activeStorage();
    storage.setItem(this.ACCESS_KEY, accessToken);
    storage.setItem(this.REFRESH_KEY, refreshToken);
  }

  /** Persist the principal in the same storage that holds the access token. */
  setUser(user: User): void {
    this.activeStorage().setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const raw = this.read(this.USER_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  clearSession(): void {
    for (const store of [localStorage, sessionStorage]) {
      store.removeItem(this.ACCESS_KEY);
      store.removeItem(this.REFRESH_KEY);
      store.removeItem(this.USER_KEY);
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Reads prefer `sessionStorage`, because a **tab-scoped session must beat a shared one**.
   *
   * Both stores are visible to every tab on the origin, so a remember-me sign-in in one tab writes a
   * `localStorage` token that every other tab can see. If `localStorage` won here, a tab holding its
   * own `sessionStorage` session would silently start acting as whoever signed in elsewhere. The
   * per-tab session is the more specific answer to "who is using *this* tab", so it wins.
   */
  private read(key: string): string | null {
    return sessionStorage.getItem(key) ?? localStorage.getItem(key);
  }

  /** The store holding this tab's session — must use the same precedence as `read`. */
  private activeStorage(): Storage {
    return sessionStorage.getItem(this.ACCESS_KEY) ? sessionStorage : localStorage;
  }
}
