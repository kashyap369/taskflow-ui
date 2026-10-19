import { Injectable, computed, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { AppSettings } from '@core/config/app.settings';
import { APP_SETTINGS } from '@core/config/app.tokens';
import { OrganizationFacade } from './organization.facade';
import { AttendanceRepository } from './attendance.repository';
import {
  AdjustAttendancePayload,
  AttendanceDay,
  AttendanceRoster,
  AttendanceSettings,
  AttendedMembers,
  FieldTrackingDay,
  FieldTrackingPoints,
  FieldTrackingSettings,
  LiveFieldTracking,
  UpdateAttendanceSettingsPayload,
  UpdateFieldTrackingSettingsPayload,
} from './attendance.models';

/**
 * The attendance section's door to the API. Holds no view state of its own — the page owns what
 * is selected — but scopes every call to the current organization and exposes the permission
 * flags the page locks its actions with (a usability gate; the API stays authoritative).
 */
@Injectable({ providedIn: 'root' })
export class AttendanceFacade {
  private readonly repository = inject(AttendanceRepository);
  private readonly organization = inject(OrganizationFacade);
  private readonly settings: typeof AppSettings = inject(APP_SETTINGS);

  readonly currentOrg = this.organization.currentOrg;
  readonly needsOrganization = this.organization.needsOrganization;
  readonly members = this.organization.members;
  readonly user = this.organization.user;
  readonly canViewAttendance = this.organization.canViewAttendance;
  readonly canManageAttendance = this.organization.canManageAttendance;
  readonly canViewFieldTracking = this.organization.canViewFieldTracking;
  readonly canSeeTrackingSettings = computed(
    () => this.canManageAttendance() || this.canViewFieldTracking(),
  );
  readonly map = this.settings.maps;

  private orgId(): number {
    const id = this.organization.currentOrgId();
    if (id == null) throw new Error('No organization is selected.');
    return id;
  }

  roster(date: string | null): Observable<AttendanceRoster> {
    return this.repository.getRoster(this.orgId(), date);
  }

  attendedMembers(date: string): Observable<AttendedMembers> {
    return this.repository.getAttendedMembers(this.orgId(), date);
  }

  history(userId: number, from: string, to: string): Observable<AttendanceDay[]> {
    return this.repository.getMemberHistory(this.orgId(), userId, from, to);
  }

  attendanceSettings(): Observable<AttendanceSettings> {
    return this.repository.getSettings(this.orgId());
  }

  saveAttendanceSettings(payload: UpdateAttendanceSettingsPayload): Observable<void> {
    return this.repository.updateSettings(this.orgId(), payload);
  }

  adjust(sessionId: number, payload: AdjustAttendancePayload): Observable<void> {
    return this.repository.adjust(sessionId, payload);
  }

  photoUrl(sessionId: number, kind: 'in' | 'out'): Observable<string> {
    return this.repository.getPhoto(sessionId, kind).pipe(map((blob) => URL.createObjectURL(blob)));
  }

  live(): Observable<LiveFieldTracking> {
    return this.repository.getLive(this.orgId());
  }

  route(userId: number, date: string): Observable<FieldTrackingDay> {
    return this.repository.getMemberRoute(this.orgId(), userId, date);
  }

  routePoints(userId: number, date: string): Observable<FieldTrackingPoints> {
    return this.repository.getMemberRoutePoints(this.orgId(), userId, date);
  }

  trackingSettings(): Observable<FieldTrackingSettings> {
    return this.repository.getTrackingSettings(this.orgId());
  }

  saveTrackingSettings(payload: UpdateFieldTrackingSettingsPayload): Observable<void> {
    return this.repository.updateTrackingSettings(this.orgId(), payload);
  }
}
