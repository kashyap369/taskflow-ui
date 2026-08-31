import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '@core/api/api-endpoints';
import { APP_SETTINGS } from '@core/config/app.tokens';
import { MeetingGuestAccess, MeetingGuestSession, VerifiedMeetingGuest } from './meetings-guest.models';
import { MeetingRoomModerationPayload, MeetingRoomToken } from '@features/organization/meetings.models';

@Injectable({ providedIn: 'root' })
export class MeetingsGuestRepository {
  private readonly http = inject(HttpClient); private readonly base = inject(APP_SETTINGS).api.baseUrl;
  inspect(token: string): Observable<MeetingGuestAccess> { return this.http.post<MeetingGuestAccess>(`${this.base}${API.Meeting.GuestInspect}`, { token }); }
  requestCode(token: string, email: string): Observable<void> { return this.http.post<void>(`${this.base}${API.Meeting.GuestRequestCode}`, { token, email }); }
  verify(token: string, email: string, code: string, displayName: string, bindRegisteredAccount: boolean): Observable<VerifiedMeetingGuest> {
    return this.http.post<VerifiedMeetingGuest>(`${this.base}${API.Meeting.GuestVerifyCode}`, { token, email, code, displayName, bindRegisteredAccount });
  }
  session(sessionToken: string): Observable<MeetingGuestSession> { return this.http.get<MeetingGuestSession>(`${this.base}${API.Meeting.GuestSession}`, { headers: this.headers(sessionToken) }); }
  displayName(sessionToken: string, displayName: string): Observable<MeetingGuestSession> { return this.http.put<MeetingGuestSession>(`${this.base}${API.Meeting.GuestDisplayName}`, { displayName }, { headers: this.headers(sessionToken) }); }
  joinToken(sessionToken: string): Observable<MeetingRoomToken> { return this.http.post<MeetingRoomToken>(`${this.base}${API.Meeting.GuestJoinToken}`, {}, { headers: this.headers(sessionToken) }); }
  removeRoomParticipant(sessionToken: string, participantId: number): Observable<void> {
    return this.http.post<void>(`${this.base}${API.Meeting.GuestRemoveRoomParticipant(participantId)}`, {}, { headers: this.headers(sessionToken) });
  }
  muteRoomParticipant(sessionToken: string, participantId: number,
    payload: MeetingRoomModerationPayload): Observable<void> {
    return this.http.post<void>(`${this.base}${API.Meeting.GuestMuteRoomParticipant(participantId)}`, payload, { headers: this.headers(sessionToken) });
  }
  private headers(token: string): HttpHeaders { return new HttpHeaders({ 'X-Meeting-Guest-Session': token }); }
}
