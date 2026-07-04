import { Injectable } from '@angular/core';

/**
 * Persists the access token. Storage is chosen by the "remember me" flag:
 *   remember = true  -> localStorage   (survives browser restart)
 *   remember = false -> sessionStorage (cleared when the tab closes)
 */
@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'access_token';

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) ?? sessionStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string, remember = false): void {
    this.clearToken();
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(this.TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
