import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@core/api/api.service';
import { API } from '@core/api/api-endpoints';
import { ApiResponse } from '@core/api/api-response';

import { LoginRequest } from './dto/login-request';
import { LoginResponse } from './dto/login-response';

/**
 * Data layer (infrastructure) for the auth feature — the only place that
 * talks to the auth HTTP endpoints. Write side of CQRS.
 */
@Injectable({ providedIn: 'root' })
export class AuthRepository {
  private readonly api = inject(ApiService);

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.api.post<ApiResponse<LoginResponse>>(API.Auth.Login, request);
  }

  logout(): Observable<ApiResponse<void>> {
    return this.api.post<ApiResponse<void>>(API.Auth.Logout, {});
  }
}
