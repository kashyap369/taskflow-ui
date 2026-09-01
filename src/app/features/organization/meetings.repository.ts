import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '@core/api/api-endpoints';
import { ApiParams } from '@core/api/api-params';
import { ApiService } from '@core/api/api.service';
import { CreateMeetingAccessLinkPayload, CreatedMeetingAccessLink, MeetingAccessLevel, MeetingAccessLink, MeetingBadgeInput, MeetingDetail, MeetingListQuery, MeetingPage, MeetingParticipantState, MeetingPayload, MeetingRecording, MeetingRoomModerationPayload, MeetingRoomToken } from './meetings.models';

@Injectable({ providedIn: 'root' })
export class MeetingsRepository {
  private readonly api = inject(ApiService);
  list(organizationId: number, query: MeetingListQuery): Observable<MeetingPage> {
    return this.api.get<MeetingPage>(API.Meeting.ByOrganization(organizationId), ApiParams.create({ ...query }));
  }
  detail(id: number): Observable<MeetingDetail> { return this.api.get<MeetingDetail>(API.Meeting.GetById(id)); }
  create(payload: MeetingPayload): Observable<number> { return this.api.post<number>(API.Meeting.Create, payload); }
  update(id: number, payload: MeetingPayload): Observable<void> { return this.api.put<void>(API.Meeting.Update(id), payload); }
  start(id: number): Observable<void> { return this.api.post<void>(API.Meeting.Start(id), {}); }
  end(id: number): Observable<void> { return this.api.post<void>(API.Meeting.End(id), {}); }
  joinToken(id: number): Observable<MeetingRoomToken> { return this.api.post<MeetingRoomToken>(API.Meeting.JoinToken(id), {}); }
  removeRoomParticipant(id: number, participantId: number): Observable<void> {
    return this.api.post<void>(API.Meeting.RemoveRoomParticipant(id, participantId), {});
  }
  muteRoomParticipant(id: number, participantId: number,
    payload: MeetingRoomModerationPayload): Observable<void> {
    return this.api.post<void>(API.Meeting.MuteRoomParticipant(id, participantId), payload);
  }
  cancel(id: number): Observable<void> { return this.api.post<void>(API.Meeting.Cancel(id), {}); }
  addBadge(id: number, badge: MeetingBadgeInput): Observable<number> { return this.api.post<number>(API.Meeting.AddBadge(id), badge); }
  addParticipant(id: number, userId: number, accessLevel: MeetingAccessLevel, badgeDefinitionId: number | null): Observable<number> {
    return this.api.post<number>(API.Meeting.AddParticipant(id), { userId, accessLevel, badgeDefinitionId });
  }
  updateParticipant(id: number, participantId: number, accessLevel: MeetingAccessLevel,
    badgeDefinitionId: number | null, state: MeetingParticipantState): Observable<void> {
    return this.api.put<void>(API.Meeting.UpdateParticipant(id, participantId),
      { accessLevel, badgeDefinitionId, state });
  }
  accessLinks(id: number): Observable<MeetingAccessLink[]> { return this.api.get<MeetingAccessLink[]>(API.Meeting.AccessLinks(id)); }
  createAccessLink(id: number, payload: CreateMeetingAccessLinkPayload): Observable<CreatedMeetingAccessLink> {
    return this.api.post<CreatedMeetingAccessLink>(API.Meeting.AccessLinks(id), payload);
  }
  revokeAccessLink(id: number, linkId: number): Observable<void> { return this.api.delete<void>(API.Meeting.RevokeAccessLink(id, linkId)); }
  rotateAccessLink(id: number, linkId: number): Observable<CreatedMeetingAccessLink> { return this.api.post<CreatedMeetingAccessLink>(API.Meeting.RotateAccessLink(id, linkId), {}); }
  recordings(id: number): Observable<MeetingRecording[]> { return this.api.getSilently<MeetingRecording[]>(API.Meeting.Recordings(id)); }
  requestRecording(id: number): Observable<MeetingRecording> { return this.api.post<MeetingRecording>(API.Meeting.Recordings(id), {}); }
  recordingConsent(id: number, recordingId: number, accepted: boolean): Observable<MeetingRecording> { return this.api.post<MeetingRecording>(API.Meeting.RecordingConsent(id, recordingId), { accepted }); }
  stopRecording(id: number, recordingId: number): Observable<MeetingRecording> { return this.api.post<MeetingRecording>(API.Meeting.StopRecording(id, recordingId), {}); }
  recordingContent(id: number, recordingId: number): Observable<Blob> { return this.api.getBlobSilently(API.Meeting.RecordingContent(id, recordingId)); }
  deleteRecording(id: number, recordingId: number): Observable<void> { return this.api.delete<void>(API.Meeting.Recording(id, recordingId)); }
}
