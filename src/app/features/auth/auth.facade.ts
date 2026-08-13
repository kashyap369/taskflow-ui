import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { ApiResponse } from '@core/api/api-response';

import { AuthRepository } from './auth.repository';
import {
  LoginRequest,
  LoginResponse,
  LoginWithCodeRequest,
  RegisterRequest,
  ResetPasswordRequest,
  toUser,
} from './auth.models';

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

  private readonly _loginCodeSent = signal(false);
  readonly loginCodeSent = this._loginCodeSent.asReadonly();

  private readonly _recoveryCodeSent = signal(false);
  readonly recoveryCodeSent = this._recoveryCodeSent.asReadonly();

  private readonly _passwordReset = signal(false);
  readonly passwordReset = this._passwordReset.asReadonly();

  login(request: LoginRequest, remember = false): void {
    this.completeLogin(this.repository.login(request), remember);
  }

  requestLoginCode(email: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.repository.requestLoginCode({ email }).subscribe({
      next: () => {
        this._loading.set(false);
        this._loginCodeSent.set(true);
      },
      error: (error: HttpErrorResponse) => {
        this._loading.set(false);
        this._error.set(this.requestErrorMessage(error));
      },
    });
  }

  loginWithCode(request: LoginWithCodeRequest, remember = false): void {
    this.completeLogin(this.repository.loginWithCode(request), remember);
  }

  requestPasswordReset(email: string): void {
    this._loading.set(true);
    this._error.set(null);
    this._passwordReset.set(false);

    this.repository.forgotPassword({ email }).subscribe({
      next: () => {
        this._loading.set(false);
        this._recoveryCodeSent.set(true);
      },
      error: (error: HttpErrorResponse) => {
        this._loading.set(false);
        this._error.set(this.requestErrorMessage(error));
      },
    });
  }

  resetPassword(request: ResetPasswordRequest): void {
    this._loading.set(true);
    this._error.set(null);

    this.repository.resetPassword(request).subscribe({
      next: () => {
        this._loading.set(false);
        this._passwordReset.set(true);
        this.notification.success('Password updated. You can sign in with it now.');
      },
      error: (error: HttpErrorResponse) => {
        this._loading.set(false);
        this._error.set(this.apiMessage(error, 'We could not reset your password. Request a new code and try again.'));
      },
    });
  }

  resetCodeFlow(): void {
    this._error.set(null);
    this._loginCodeSent.set(false);
  }

  resetRecoveryFlow(): void {
    this._error.set(null);
    this._recoveryCodeSent.set(false);
    this._passwordReset.set(false);
  }

  private completeLogin(
    source: Observable<ApiResponse<LoginResponse>>,
    remember: boolean,
  ): void {
    this._loading.set(true);
    this._error.set(null);

    source
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
        error: (error: HttpErrorResponse) => {
          this._loading.set(false);
          this._error.set(this.loginErrorMessage(error));
          // Roll back any half-established session (tokens may have been set before /me failed).
          this.auth.endSession();
        },
      });
  }

  /**
   * Sign-in is two requests, and only the first one is about credentials.
   *
   * `POST /auth/login` stays open during maintenance (so an admin can always get in to turn it off),
   * but the `GET /user/me` that follows does not — a non-admin therefore authenticates successfully
   * and *then* gets a 503. Reporting that as "check your credentials" is simply false, and sends the
   * user to re-type a password that was right. Name the real reason instead.
   */
  private loginErrorMessage(error: HttpErrorResponse): string {
    if (error?.status === 503) {
      return 'TaskFlow is in maintenance mode. Your sign-in was accepted, but the platform is temporarily unavailable — please try again shortly.';
    }
    return this.apiMessage(error, 'Sign in failed. Check your details and try again.');
  }

  private requestErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 429) {
      return 'Too many requests. Wait a minute, then try again.';
    }
    return this.apiMessage(error, 'We could not send a code. Check your connection and try again.');
  }

  private apiMessage(error: HttpErrorResponse, fallback: string): string {
    const message = (error.error as { message?: string } | null)?.message;
    return message?.trim() || fallback;
  }

  /**
   * Register use-case. The API returns only the new user id (no tokens) **and the account starts
   * PendingVerification**, so signing in would fail with `EMAIL_NOT_VERIFIED`. Send the user to the
   * verify-email screen (its no-token state explains the inbox step and offers a resend) rather
   * than to a login form that cannot yet work for them.
   */
  register(request: RegisterRequest): void {
    this._loading.set(true);
    this._error.set(null);

    this.repository.register(request).subscribe({
      next: () => {
        this._loading.set(false);
        this.notification.success(
          'Account created. Check your inbox to verify your email before signing in.',
        );

        void this.router.navigateByUrl('/auth/verify-email');
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
