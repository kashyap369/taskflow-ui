import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MeetingRoomParticipantView, MeetingRoomService } from '@core/meetings/meeting-room.service';
import { MeetingAccessLevel, MeetingRoomToken } from '@features/organization/meetings.models';
import { MeetingsGuestRepository } from '../meetings-guest.repository';
import { GuestRoomPage } from './guest-room-page';

describe('GuestRoomPage', () => {
  let fixture: ComponentFixture<GuestRoomPage>;
  let component: GuestRoomPage;
  let repository: jasmine.SpyObj<MeetingsGuestRepository>;

  beforeEach(async () => {
    sessionStorage.setItem('taskflow.meeting.guest-session', 'guest-session');
    repository = jasmine.createSpyObj<MeetingsGuestRepository>('MeetingsGuestRepository', [
      'joinToken', 'removeRoomParticipant', 'muteRoomParticipant',
    ]);
    repository.joinToken.and.returnValue(of(token()));
    await TestBed.configureTestingModule({ imports: [GuestRoomPage], providers: [
      { provide: MeetingsGuestRepository, useValue: repository },
      { provide: MeetingRoomService, useValue: roomStub() },
      provideRouter([]),
    ] }).compileComponents();
    fixture = TestBed.createComponent(GuestRoomPage); component = fixture.componentInstance;
  });

  afterEach(() => sessionStorage.removeItem('taskflow.meeting.guest-session'));

  it('uses the scoped guest session for room access', async () => {
    fixture.detectChanges(); await fixture.whenStable();
    expect(repository.joinToken).toHaveBeenCalledOnceWith('guest-session');
    expect(component.stage()).toBe('prejoin');
  });

  it('enforces co-host target restrictions before showing moderation actions', () => {
    component.token.set(token());
    expect(component.canModerate(participant(MeetingAccessLevel.Participant))).toBeTrue();
    expect(component.canModerate(participant(MeetingAccessLevel.CoHost))).toBeFalse();
    expect(component.canModerate(participant(MeetingAccessLevel.Host))).toBeFalse();
  });

  it('sends removal through the guest-scoped moderation route', () => {
    repository.removeRoomParticipant.and.returnValue(of(void 0));
    const target = participant(MeetingAccessLevel.Participant);
    component.remove(target);
    expect(repository.removeRoomParticipant).toHaveBeenCalledOnceWith('guest-session', 12);
  });

  function token(): MeetingRoomToken {
    return { webSocketUrl: 'ws://meeting.test', token: 'token', expiresAtUtc: '2026-09-01T00:00:00Z',
      meetingId: 4, participantId: 8, displayName: 'Guest co-host', accessLevel: MeetingAccessLevel.CoHost,
      badgeLabel: 'Facilitator', canPublish: true, canShareScreen: true, canModerate: true,
      participantIdentity: 'm4-p8-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', meetingTitle: 'Guest review' };
  }
  function participant(level: MeetingAccessLevel): MeetingRoomParticipantView {
    return { identity: 'm4-p12-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', participantId: 12, displayName: 'Target',
      accessLevel: level, badgeLabel: null, isLocal: false, isSpeaking: false, microphoneEnabled: true,
      cameraEnabled: true, screenShareEnabled: false, audioTrackSid: 'TR_audio', connectionQuality: 'good' };
  }
  function roomStub() {
    return { connectionState: signal('disconnected'), participants: signal([]), participantCount: signal(0),
      microphoneEnabled: signal(false), cameraEnabled: signal(false), screenShareEnabled: signal(false),
      audioInputDevices: signal([]), videoInputDevices: signal([]), audioOutputDevices: signal([]),
      deviceError: signal(null), actionError: signal<string | null>(null), disconnectMessage: signal(null),
      lastError: signal(null), loadDevices: jasmine.createSpy().and.resolveTo(),
      preparePreview: jasmine.createSpy().and.resolveTo(), stopPreview: jasmine.createSpy().and.resolveTo(),
      connect: jasmine.createSpy().and.resolveTo(), disconnect: jasmine.createSpy().and.resolveTo(),
      setMicrophoneEnabled: jasmine.createSpy().and.resolveTo(), setCameraEnabled: jasmine.createSpy().and.resolveTo(),
      setScreenShareEnabled: jasmine.createSpy().and.resolveTo(), switchDevice: jasmine.createSpy().and.resolveTo(),
      enableAudioPlayback: jasmine.createSpy().and.resolveTo() };
  }
});
