import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_SETTINGS } from '@core/config/app.tokens';
import { MeetingsGuestRepository } from './meetings-guest.repository';

describe('MeetingsGuestRepository', () => {
  let repository: MeetingsGuestRepository; let http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: APP_SETTINGS, useValue: { api: { baseUrl: 'https://taskflow.test/api' } } }] }); repository = TestBed.inject(MeetingsGuestRepository); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('sends the invitation token in a POST body and the guest session in its narrow header', () => {
    repository.inspect('secret').subscribe(); const inspect = http.expectOne('https://taskflow.test/api/meeting/guest/access/inspect');
    expect(inspect.request.method).toBe('POST'); expect(inspect.request.body).toEqual({ token: 'secret' }); inspect.flush({});
    repository.session('guest-session').subscribe(); const session = http.expectOne('https://taskflow.test/api/meeting/guest/session');
    expect(session.request.headers.get('X-Meeting-Guest-Session')).toBe('guest-session'); expect(session.request.headers.has('Authorization')).toBeFalse(); session.flush({});
  });
  it('keeps guest moderation inside the one-meeting session header', () => {
    repository.removeRoomParticipant('guest-session', 9).subscribe();
    const request = http.expectOne('https://taskflow.test/api/meeting/guest/room/participants/9/remove');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('X-Meeting-Guest-Session')).toBe('guest-session');
    expect(request.request.headers.has('Authorization')).toBeFalse(); request.flush(null);
  });
});
