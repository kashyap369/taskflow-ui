import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@core/api/api.service';
import { API } from '@core/api/api-endpoints';
import { ApiResponse } from '@core/api/api-response';

import { LoginRequest, LoginResponse, UserProfileResponse } from './auth.models';

/**
 * Data layer for the auth feature — the only place that talks to the auth/profile HTTP endpoints.
 */
@Injectable({ providedIn: 'root' })
export class AuthRepository {
  private readonly api = inject(ApiService);

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.api.post<ApiResponse<LoginResponse>>(API.Auth.Login, request);
  }

  /** Current user's profile — carries `accountType`, which the login response does not. */
  me(): Observable<ApiResponse<UserProfileResponse>> {
    return this.api.get<ApiResponse<UserProfileResponse>>(API.User.Me);
  }

  logout(refreshToken: string | null): Observable<ApiResponse<void>> {
    return this.api.post<ApiResponse<void>>(API.Auth.Logout, { refreshToken });
  }
}
