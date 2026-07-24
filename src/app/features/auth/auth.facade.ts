import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';

import { AuthService } from '@core/auth/auth.service';

import { AuthRepository } from './auth.repository';
import { LoginRequest, toUser } from './auth.models';

/**
 * Application layer for auth. Orchestrates the login use-case:
 *   repository (POST /auth/login) → store tokens → repository (GET /user/me for account type)
 *   → AuthService (session state) → navigate to the user's portal home.
 * Presentation talks ONLY to this facade.
 */
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly repository = inject(AuthRepository);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  login(request: LoginRequest, remember = false): void {
    this._loading.set(true);
    this._error.set(null);

    this.repository
      .login(request)
      .pipe(
        switchMap((loginRes) => {
          // Persist tokens first so the /user/me request is authenticated.
          this.auth.setTokens(loginRes.data.token, loginRes.data.refreshToken, remember);

          return this.repository
            .me()
            .pipe(map((profileRes) => ({ login: loginRes.data, profile: profileRes.data })));
        }),
      )
      .subscribe({
        next: ({ login, profile }) => {
          this._loading.set(false);

          this.auth.setUser(toUser(login, profile));

          // Authoritative redirect: Admin → /admin, Organization → /organization, else → /member.
          void this.router.navigateByUrl(this.auth.homeRoute());
        },
        error: () => {
          this._loading.set(false);
          this._error.set('Sign in failed. Check your credentials and try again.');
          // Roll back any half-established session (tokens may have been set before /me failed).
          this.auth.endSession();
        },
      });
  }

  logout(): void {
    const refreshToken = this.auth.refreshToken();

    // Fire-and-forget the server call; clear the local session regardless of its outcome.
    this.repository.logout(refreshToken).subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private finishLogout(): void {
    this.auth.endSession();
    void this.router.navigate(['/auth/login']);
  }
}
