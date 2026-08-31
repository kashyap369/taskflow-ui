import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MeetingsGuestRepository } from './meetings-guest.repository';
import { MeetingGuestAccess, MeetingGuestSession } from './meetings-guest.models';

@Injectable()
export class MeetingsGuestFacade {
  private readonly repository = inject(MeetingsGuestRepository);
  private readonly accessKey = 'taskflow.meeting.pending-access'; private readonly sessionKey = 'taskflow.meeting.guest-session';
  readonly access = signal<MeetingGuestAccess | null>(null); readonly session = signal<MeetingGuestSession | null>(null);
  readonly loading = signal(false); readonly error = signal<string | null>(null); readonly codeSent = signal(false);
  captureFragment(): string | null {
    const params = new URLSearchParams(location.hash.slice(1)); const token = params.get('token');
    history.replaceState(null, '', `${location.pathname}${location.search}`);
    if (token) sessionStorage.setItem(this.accessKey, token);
    return token ?? sessionStorage.getItem(this.accessKey);
  }
  restore(done: (restored: boolean) => void): void {
    const token = sessionStorage.getItem(this.sessionKey); if (!token) { done(false); return; }
    this.loading.set(true); this.repository.session(token).subscribe({ next: (session) => { this.session.set(session); this.loading.set(false); done(true); }, error: (error) => { sessionStorage.removeItem(this.sessionKey); this.error.set(this.message(error, 'Your guest session expired or was revoked. Open the original invitation to verify again.')); this.loading.set(false); done(false); } });
  }
  inspect(token: string): void { this.loading.set(true); this.error.set(null); this.repository.inspect(token).subscribe({ next: (access) => { this.access.set(access); this.loading.set(false); }, error: (error) => { this.loading.set(false); this.error.set(this.message(error, 'This invitation is invalid or no longer available.')); } }); }
  requestCode(token: string, email: string): void { this.loading.set(true); this.error.set(null); this.repository.requestCode(token, email).subscribe({ next: () => { this.loading.set(false); this.codeSent.set(true); }, error: (error) => { this.loading.set(false); this.error.set(this.message(error, 'A code could not be sent. Check the invitation and email, then try again.')); } }); }
  verify(token: string, email: string, code: string, displayName: string, bind: boolean): void { this.loading.set(true); this.error.set(null); this.repository.verify(token, email, code, displayName, bind).subscribe({ next: (result) => { sessionStorage.setItem(this.sessionKey, result.sessionToken); sessionStorage.removeItem(this.accessKey); this.session.set(result.session); this.loading.set(false); }, error: (error) => { this.loading.set(false); this.error.set(this.message(error, 'The code is invalid or expired. Request a new code.')); } }); }
  clearError(): void { this.error.set(null); }
  private message(error: HttpErrorResponse, fallback: string): string { return typeof error.error?.message === 'string' ? error.error.message : fallback; }
}
