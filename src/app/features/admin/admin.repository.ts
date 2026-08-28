import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@core/api/api.service';
import { API } from '@core/api/api-endpoints';

import {
  AdminOrganization,
  AdminUser,
  AdminUserDetail,
  PlatformSettings,
  UpdatePlatformSettingsPayload,
  PlannerTemplate,
  PlannerTemplateDefinition,
} from './admin.models';

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

  /** `GET /admin/organizations` → AdminOrganizationListItemDto[] (AdminOnly). */
  getOrganizations(): Observable<AdminOrganization[]> {
    return this.api.get<AdminOrganization[]>(API.Admin.Organizations);
  }

  /** `GET /admin/settings` → PlatformSettingDto (AdminOnly). */
  getSettings(): Observable<PlatformSettings> {
    return this.api.get<PlatformSettings>(API.Admin.Settings);
  }

  /** `PUT /admin/settings` → 204. */
  updateSettings(payload: UpdatePlatformSettingsPayload): Observable<void> {
    return this.api.put<void>(API.Admin.Settings, payload);
  }
  getPlannerTemplates(): Observable<PlannerTemplate[]> { return this.api.get<PlannerTemplate[]>(API.Admin.PlannerTemplates); }
  createPlannerTemplate(payload: PlannerTemplateDefinition): Observable<string> { return this.api.post<string>(API.Admin.PlannerTemplates, payload); }
  updatePlannerTemplate(id: string, payload: PlannerTemplateDefinition): Observable<string | null> { return this.api.put<string | null>(API.Admin.PlannerTemplate(id), payload); }
  publishPlannerTemplate(id: string): Observable<string> { return this.api.post<string>(API.Admin.PublishPlannerTemplate(id), {}); }
  archivePlannerTemplate(id: string): Observable<void> { return this.api.post<void>(API.Admin.ArchivePlannerTemplate(id), {}); }
}
