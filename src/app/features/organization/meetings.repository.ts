import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '@core/api/api-endpoints';
import { ApiParams } from '@core/api/api-params';
import { ApiService } from '@core/api/api.service';
import { MeetingAccessLevel, MeetingDetail, MeetingListQuery, MeetingPage, MeetingParticipantState, MeetingPayload } from './meetings.models';

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
  cancel(id: number): Observable<void> { return this.api.post<void>(API.Meeting.Cancel(id), {}); }
  addParticipant(id: number, userId: number, accessLevel: MeetingAccessLevel, badgeDefinitionId: number | null): Observable<number> {
    return this.api.post<number>(API.Meeting.AddParticipant(id), { userId, accessLevel, badgeDefinitionId });
  }
  updateParticipant(id: number, participantId: number, accessLevel: MeetingAccessLevel,
    badgeDefinitionId: number | null, state: MeetingParticipantState): Observable<void> {
    return this.api.put<void>(API.Meeting.UpdateParticipant(id, participantId),
      { accessLevel, badgeDefinitionId, state });
  }
}
