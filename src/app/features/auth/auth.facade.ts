import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';

import { AuthService } from '@core/auth/auth.service';
import { AccountType } from '@core/auth/roles.enum';
import { NotificationService } from '@core/services/notification.service';

import { AuthRepository } from './auth.repository';
import { LoginRequest, RegisterRequest, toUser } from './auth.models';

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
  private readonly notification = inject(NotificationService);

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

          // `/user/me` is NOT enveloped (raw DTO), unlike the login response which is.
          return this.repository
            .me()
            .pipe(map((profile) => ({ login: loginRes.data, profile })));
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

  /**
   * Register use-case. The API returns only the new user id (no tokens), so on success we send the
   * user to the sign-in screen — the Organization variant for org accounts, else the solo one.
   */
  register(request: RegisterRequest): void {
    this._loading.set(true);
    this._error.set(null);

    this.repository.register(request).subscribe({
      next: () => {
        this._loading.set(false);
        this.notification.success('Account created successfully. Please sign in.');

        const target =
          request.accountType === AccountType.Organization ? '/auth/organization' : '/auth/login';
        void this.router.navigateByUrl(target);
      },
      error: () => {
        this._loading.set(false);
        // The error interceptor already toasts the server message; surface an inline hint too.
        this._error.set('Registration failed. Please review your details and try again.');
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
