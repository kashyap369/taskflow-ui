import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { APP_SETTINGS } from '@core/config/app.tokens';
import { MeetingRoomService } from '@core/meetings/meeting-room.service';

import { LiveKitProbePage } from './livekit-probe-page';

describe('LiveKitProbePage', () => {
  it('gets an API-issued token and connects through the TaskFlow room wrapper', async () => {
    await TestBed.configureTestingModule({
      imports: [LiveKitProbePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: APP_SETTINGS,
          useValue: {
            production: false,
            api: { baseUrl: 'https://localhost:7086/api' },
            features: { planner: true, meetingsProbe: true },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LiveKitProbePage);
    const room = TestBed.inject(MeetingRoomService);
    spyOn(room, 'isSupported').and.returnValue(true);
    const connect = spyOn(room, 'connect').and.resolveTo();
    fixture.detectChanges();

    const join = fixture.componentInstance.join();
    const request = TestBed.inject(HttpTestingController).expectOne(
      'https://localhost:7086/api/dev/meetings/livekit/token',
    );
    expect(request.request.method).toBe('POST');
    request.flush({
      webSocketUrl: 'ws://localhost:7880',
      roomName: 'taskflow-meeting-phase0',
      participantIdentity: 'probe-123',
      token: 'scoped-token',
      expiresAtUtc: '2026-08-30T00:05:00Z',
    });
    await join;

    expect(connect).toHaveBeenCalledWith(
      'ws://localhost:7880',
      'scoped-token',
      jasmine.any(HTMLElement),
    );
    expect(fixture.componentInstance.participantIdentity()).toBe('probe-123');
    TestBed.inject(HttpTestingController).verify();
  });
});
