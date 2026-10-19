import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@core/api/api.service';
import { API } from '@core/api/api-endpoints';
import { ApiParams } from '@core/api/api-params';

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

/** HTTP access for attendance and field tracking. Every permission is enforced again by the API. */
@Injectable({ providedIn: 'root' })
export class AttendanceRepository {
  private readonly api = inject(ApiService);

  getRoster(organizationId: number, date: string | null): Observable<AttendanceRoster> {
    return this.api.get<AttendanceRoster>(
      API.Attendance.Roster(organizationId),
      date ? ApiParams.create({ date }) : undefined,
    );
  }

  /** Only the members with an attendance session on `date` — what the map pickers offer. */
  getAttendedMembers(organizationId: number, date: string): Observable<AttendedMembers> {
    return this.api.get<AttendedMembers>(
      API.Attendance.AttendedMembers(organizationId),
      ApiParams.create({ date }),
    );
  }

  getMemberHistory(organizationId: number, userId: number, from: string, to: string): Observable<AttendanceDay[]> {
    return this.api.get<AttendanceDay[]>(
      API.Attendance.Member(organizationId, userId),
      ApiParams.create({ from, to }),
    );
  }

  getSettings(organizationId: number): Observable<AttendanceSettings> {
    return this.api.get<AttendanceSettings>(API.Attendance.Settings(organizationId));
  }

  updateSettings(organizationId: number, payload: UpdateAttendanceSettingsPayload): Observable<void> {
    return this.api.put<void>(API.Attendance.Settings(organizationId), payload);
  }

  adjust(sessionId: number, payload: AdjustAttendancePayload): Observable<void> {
    return this.api.put<void>(API.Attendance.Adjust(sessionId), payload);
  }

  /** Selfies are private: fetched with the session's token and shown from an object URL. */
  getPhoto(sessionId: number, kind: 'in' | 'out'): Observable<Blob> {
    return this.api.getBlobSilently(API.Attendance.Photo(sessionId, kind));
  }

  getLive(organizationId: number): Observable<LiveFieldTracking> {
    return this.api.getSilently<LiveFieldTracking>(API.Attendance.TrackingLive(organizationId));
  }

  getMemberRoute(organizationId: number, userId: number, date: string): Observable<FieldTrackingDay> {
    return this.api.get<FieldTrackingDay>(
      API.Attendance.TrackingMember(organizationId, userId),
      ApiParams.create({ date }),
    );
  }

  getMemberRoutePoints(organizationId: number, userId: number, date: string): Observable<FieldTrackingPoints> {
    return this.api.get<FieldTrackingPoints>(
      API.Attendance.TrackingMemberPoints(organizationId, userId),
      ApiParams.create({ date }),
    );
  }

  getTrackingSettings(organizationId: number): Observable<FieldTrackingSettings> {
    return this.api.get<FieldTrackingSettings>(API.Attendance.TrackingSettings(organizationId));
  }

  updateTrackingSettings(organizationId: number, payload: UpdateFieldTrackingSettingsPayload): Observable<void> {
    return this.api.put<void>(API.Attendance.TrackingSettings(organizationId), payload);
  }
}
