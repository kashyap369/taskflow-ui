import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_SETTINGS } from '@core/config/app.tokens';
import { MeetingArchive, MeetingAsset, MeetingMessage, MeetingMessagePage, MeetingNote } from './meeting-collaboration.models';

@Injectable({ providedIn: 'root' })
export class MeetingCollaborationRepository {
  private readonly http = inject(HttpClient); private readonly base = inject(APP_SETTINGS).api.baseUrl;
  messages(meetingId: number, guestToken: string | null): Observable<MeetingMessagePage> { return this.http.get<MeetingMessagePage>(this.url(meetingId, guestToken, 'messages'), { headers: this.headers(guestToken) }); }
  sendMessage(meetingId: number, guestToken: string | null, clientMessageId: string, body: string): Observable<MeetingMessage> { return this.http.post<MeetingMessage>(this.url(meetingId, guestToken, 'messages'), { clientMessageId, body }, { headers: this.headers(guestToken) }); }
  note(meetingId: number, guestToken: string | null): Observable<MeetingNote> { return this.http.get<MeetingNote>(this.url(meetingId, guestToken, 'note'), { headers: this.headers(guestToken) }); }
  saveNote(meetingId: number, guestToken: string | null, content: string, expectedVersion: number): Observable<MeetingNote> { return this.http.put<MeetingNote>(this.url(meetingId, guestToken, 'note'), { content, expectedVersion }, { headers: this.headers(guestToken) }); }
  assets(meetingId: number, guestToken: string | null): Observable<MeetingAsset[]> { return this.http.get<MeetingAsset[]>(this.url(meetingId, guestToken, 'assets'), { headers: this.headers(guestToken) }); }
  upload(meetingId: number, guestToken: string | null, file: File): Observable<MeetingAsset> { const data = new FormData(); data.append('file', file, file.name); return this.http.post<MeetingAsset>(this.url(meetingId, guestToken, 'assets'), data, { headers: this.headers(guestToken) }); }
  download(meetingId: number, guestToken: string | null, assetId: number): Observable<Blob> { return this.http.get(this.url(meetingId, guestToken, `assets/${assetId}`), { headers: this.headers(guestToken), responseType: 'blob' }); }
  delete(meetingId: number, guestToken: string | null, assetId: number): Observable<void> { return this.http.delete<void>(this.url(meetingId, guestToken, `assets/${assetId}`), { headers: this.headers(guestToken) }); }
  archive(meetingId: number, guestToken: string | null): Observable<MeetingArchive> { return this.http.get<MeetingArchive>(this.url(meetingId, guestToken, 'archive'), { headers: this.headers(guestToken) }); }
  private url(meetingId: number, guestToken: string | null, suffix: string): string { return `${this.base}${guestToken ? `/meeting/guest/${suffix}` : `/meeting/${meetingId}/${suffix}`}`; }
  private headers(token: string | null): HttpHeaders { return token ? new HttpHeaders({ 'X-Meeting-Guest-Session': token }) : new HttpHeaders(); }
}
