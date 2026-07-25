import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@core/api/api.service';
import { API } from '@core/api/api-endpoints';

import { AdminUser, AdminUserDetail } from './admin.models';

/**
 * Data layer for the platform Admin portal. These endpoints return raw values (the API only wraps
 * Auth responses in `ApiResponse<T>`), so the generics below are the bare DTO shapes.
 * `GET /user` is AdminOnly (`AuthorizationPolicies.AdminOnly`).
 */
@Injectable({ providedIn: 'root' })
export class AdminRepository {
  private readonly api = inject(ApiService);

  /** `GET /user` → UserListItemDto[] (AdminOnly). */
  getUsers(): Observable<AdminUser[]> {
    return this.api.get<AdminUser[]>(API.User.GetAll);
  }

  /** `GET /user/{id}` → UserDetailDto. */
  getUser(userId: number): Observable<AdminUserDetail> {
    return this.api.get<AdminUserDetail>(API.User.GetById(userId));
  }
}
