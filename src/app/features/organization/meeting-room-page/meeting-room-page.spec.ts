import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MeetingRoomParticipantView, MeetingRoomService } from '@core/meetings/meeting-room.service';
import { MeetingAccessLevel, MeetingRecordingConsentStatus, MeetingRecordingStatus, MeetingRoomToken } from '../meetings.models';
import { MeetingsRepository } from '../meetings.repository';
import { MeetingRoomPage } from './meeting-room-page';

describe('MeetingRoomPage', () => {
  let fixture: ComponentFixture<MeetingRoomPage>;
  let component: MeetingRoomPage;
  let repository: jasmine.SpyObj<MeetingsRepository>;
  let room: ReturnType<typeof roomStub>;

  const viewerToken: MeetingRoomToken = {
    webSocketUrl: 'ws://meeting.test', token: 'viewer-token', expiresAtUtc: '2026-09-01T00:00:00Z',
    meetingId: 42, participantId: 7, displayName: 'Viewer', accessLevel: MeetingAccessLevel.Viewer,
    badgeLabel: 'Observer', canPublish: false, canShareScreen: false, canModerate: false,
    participantIdentity: 'm42-p7-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', meetingTitle: 'Design review',
  };

  beforeEach(async () => {
    repository = jasmine.createSpyObj<MeetingsRepository>('MeetingsRepository', [
      'joinToken', 'end', 'removeRoomParticipant', 'muteRoomParticipant', 'recordings',
      'recordingConsent', 'requestRecording', 'stopRecording',
    ]);
    repository.joinToken.and.returnValue(of(viewerToken));
    repository.recordings.and.returnValue(of([]));
    room = roomStub();
    await TestBed.configureTestingModule({
      imports: [MeetingRoomPage],
      providers: [
        provideRouter([]),
        { provide: MeetingsRepository, useValue: repository },
        { provide: MeetingRoomService, useValue: room },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '42' } } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MeetingRoomPage); component = fixture.componentInstance;
  });

  it('keeps viewer media disabled in pre-join and does not request devices', async () => {
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();

    expect(component.stage()).toBe('prejoin');
    expect(room.loadDevices).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('View-only access');
    expect(fixture.nativeElement.textContent).toContain('Design review');
  });

  it('passes only server-granted media preferences into the room connection', async () => {
    const participantToken = { ...viewerToken, accessLevel: MeetingAccessLevel.Participant,
      canPublish: true, canShareScreen: true, displayName: 'Member' };
    repository.joinToken.and.returnValue(of(participantToken));
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    component.microphoneOn.set(true); component.cameraOn.set(false);

    const joining = component.join(); fixture.detectChanges(); await joining;

    expect(room.connect).toHaveBeenCalledWith('ws://meeting.test', 'viewer-token', jasmine.any(HTMLElement),
      jasmine.objectContaining({ microphoneEnabled: true, cameraEnabled: false }));
    expect(component.stage()).toBe('room');
  });

  it('allows a host to mute a participant but never moderate the host or local user', () => {
    component.token.set({ ...viewerToken, accessLevel: MeetingAccessLevel.Host, canModerate: true });
    const participant = participantView(MeetingAccessLevel.Participant);
    const host = participantView(MeetingAccessLevel.Host);
    repository.muteRoomParticipant.and.returnValue(of(void 0));

    expect(component.canModerate(participant)).toBeTrue();
    expect(component.canModerate(host)).toBeFalse();
    expect(component.canModerate({ ...participant, isLocal: true })).toBeFalse();
    component.mute(participant);

    expect(repository.muteRoomParticipant).toHaveBeenCalledWith(42, 9, {
      participantIdentity: participant.identity, trackSid: 'TR_audio', muted: true,
    });
  });

  it('requires explicit recording consent before requesting a join token', async () => {
    repository.recordings.and.returnValue(of([{ id: 3, status: MeetingRecordingStatus.Recording,
      createdAt: '2026-09-01T00:00:00Z', consentExpiresAtUtc: '2026-09-01T00:01:00Z', startedAtUtc: null,
      stoppedAtUtc: null, readyAtUtc: null, failureReason: null, sizeBytes: null, durationMilliseconds: null,
      canManage: false, myConsent: MeetingRecordingConsentStatus.Pending, consents: [] }]));
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(repository.joinToken).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('This meeting is being recorded');
  });

  function roomStub() {
    return {
      connectionState: signal<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected'),
      participants: signal<MeetingRoomParticipantView[]>([]), participantCount: signal(0),
      microphoneEnabled: signal(false), cameraEnabled: signal(false), screenShareEnabled: signal(false),
      audioInputDevices: signal<MediaDeviceInfo[]>([]), videoInputDevices: signal<MediaDeviceInfo[]>([]),
      audioOutputDevices: signal<MediaDeviceInfo[]>([]), deviceError: signal<string | null>(null),
      actionError: signal<string | null>(null), disconnectMessage: signal<string | null>(null),
      lastError: signal<string | null>(null), loadDevices: jasmine.createSpy().and.resolveTo(),
      preparePreview: jasmine.createSpy().and.resolveTo(), stopPreview: jasmine.createSpy().and.resolveTo(),
      connect: jasmine.createSpy().and.resolveTo(), disconnect: jasmine.createSpy().and.resolveTo(),
      setMicrophoneEnabled: jasmine.createSpy().and.resolveTo(), setCameraEnabled: jasmine.createSpy().and.resolveTo(),
      setScreenShareEnabled: jasmine.createSpy().and.resolveTo(), switchDevice: jasmine.createSpy().and.resolveTo(),
      enableAudioPlayback: jasmine.createSpy().and.resolveTo(),
      readLastDisconnect: jasmine.createSpy().and.returnValue(null),
      clearLastDisconnect: jasmine.createSpy(),
    };
  }

  function participantView(level: MeetingAccessLevel): MeetingRoomParticipantView {
    return { identity: 'm42-p9-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', participantId: 9, displayName: 'Remote',
      accessLevel: level, badgeLabel: 'Designer', isLocal: false, isSpeaking: false,
      microphoneEnabled: true, cameraEnabled: true, screenShareEnabled: false,
      audioTrackSid: 'TR_audio', connectionQuality: 'excellent' };
  }
});
