import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@core/api/api.service';
import { API } from '@core/api/api-endpoints';
import { ApiResponse } from '@core/api/api-response';

import {
  LoginRequest,
  LoginWithCodeRequest,
  EmailRequest,
  ResetPasswordRequest,
  LoginResponse,
  RegisterRequest,
  UserProfileResponse,
  toRegisterPayload,
} from './auth.models';

/**
 * Data layer for the auth feature — the only place that talks to the auth/profile HTTP endpoints.
 */
@Injectable({ providedIn: 'root' })
export class AuthRepository {
  private readonly api = inject(ApiService);

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.api.post<ApiResponse<LoginResponse>>(API.Auth.Login, request);
  }

  requestLoginCode(request: EmailRequest): Observable<ApiResponse<void>> {
    return this.api.post<ApiResponse<void>>(API.Auth.RequestLoginCode, request);
  }

  loginWithCode(request: LoginWithCodeRequest): Observable<ApiResponse<LoginResponse>> {
    return this.api.post<ApiResponse<LoginResponse>>(API.Auth.LoginWithCode, request);
  }

  forgotPassword(request: EmailRequest): Observable<ApiResponse<void>> {
    return this.api.post<ApiResponse<void>>(API.Auth.ForgotPassword, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<ApiResponse<void>> {
    return this.api.post<ApiResponse<void>>(API.Auth.ResetPassword, request);
  }

  /** Create an account. Returns the new user's id (no tokens — the user then signs in). */
  register(request: RegisterRequest): Observable<ApiResponse<number>> {
    return this.api.post<ApiResponse<number>>(API.Auth.Register, toRegisterPayload(request));
  }

  /**
   * Current user's profile — carries `accountType`, which the login response does not.
   * NOTE: `UserController` returns the DTO RAW (no `ApiResponse<T>` envelope — only AuthController
   * wraps its responses), so this is the bare `UserProfileResponse`.
   */
  me(): Observable<UserProfileResponse> {
    return this.api.get<UserProfileResponse>(API.User.Me);
  }

  logout(refreshToken: string | null): Observable<ApiResponse<void>> {
    return this.api.post<ApiResponse<void>>(API.Auth.Logout, { refreshToken });
  }

  /**
   * `POST /auth/verify-email` — turns a PendingVerification account into an Active one.
   * A new account **cannot sign in** until this succeeds. Idempotent server-side.
   */
  verifyEmail(token: string): Observable<ApiResponse<void>> {
    return this.api.post<ApiResponse<void>>(API.Auth.VerifyEmail, { token });
  }

  /**
   * `POST /auth/resend-verification`. Always reports success, even for an unknown or
   * already-verified address — the API deliberately refuses to confirm whether an account exists.
   */
  resendVerification(email: string): Observable<ApiResponse<void>> {
    return this.api.post<ApiResponse<void>>(API.Auth.ResendVerification, { email });
  }
}
