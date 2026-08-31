import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { APP_SETTINGS } from '@core/config/app.tokens';
import { GuestJoinPage } from './guest-join-page';

describe('GuestJoinPage', () => {
  afterEach(() => sessionStorage.clear());

  it('creates and scrubs a fragment token from the visible URL', async () => {
    sessionStorage.clear();
    history.replaceState(null, '', '/meetings/join#token=test-token');
    await TestBed.configureTestingModule({ imports: [GuestJoinPage], providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: APP_SETTINGS, useValue: { api: { baseUrl: 'https://taskflow.test/api' } } }] }).compileComponents();
    const fixture = TestBed.createComponent(GuestJoinPage); fixture.detectChanges();
    expect(fixture.componentInstance.token()).toBe('test-token'); expect(location.hash).toBe('');
    TestBed.inject(HttpTestingController).expectOne('https://taskflow.test/api/meeting/guest/access/inspect').flush({}, { status: 404, statusText: 'Not Found' });
  });

  it('preserves the server reason when a restored guest session is no longer valid', async () => {
    sessionStorage.clear(); sessionStorage.setItem('taskflow.meeting.guest-session', 'revoked-session');
    history.replaceState(null, '', '/meetings/join');
    await TestBed.configureTestingModule({ imports: [GuestJoinPage], providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: APP_SETTINGS, useValue: { api: { baseUrl: 'https://taskflow.test/api' } } }] }).compileComponents();
    const fixture = TestBed.createComponent(GuestJoinPage); fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne('https://taskflow.test/api/meeting/guest/session').flush(
      { message: 'The host has ended this guest access.' }, { status: 401, statusText: 'Unauthorized' },
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('The host has ended this guest access.');
    expect(sessionStorage.getItem('taskflow.meeting.guest-session')).toBeNull();
  });
});
