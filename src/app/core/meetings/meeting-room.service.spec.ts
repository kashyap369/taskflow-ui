import { TestBed } from '@angular/core/testing';

import { MeetingRoomService } from './meeting-room.service';

describe('MeetingRoomService', () => {
  it('starts disconnected and cleanup remains idempotent before a room exists', async () => {
    const service = TestBed.inject(MeetingRoomService);

    await service.disconnect();
    await service.disconnect();

    expect(service.connectionState()).toBe('disconnected');
    expect(service.participantCount()).toBe(0);
    expect(service.microphoneEnabled()).toBeFalse();
    expect(service.cameraEnabled()).toBeFalse();
    expect(service.screenShareEnabled()).toBeFalse();
  });

  // Production regression: Android Chrome has no setSinkId, so selecting a speaker threw inside
  // connect() and tore down a call whose audio and video had already published. A preference must
  // never end a connected meeting.
  it('keeps a connected call when an optional device preference fails', async () => {
    const service = TestBed.inject(MeetingRoomService);
    const failing = jasmine.createSpy('switchActiveDevice').and.rejectWith(
      new Error('cannot switch audio output, the current browser does not support it'),
    );

    const applyPreference = (service as unknown as {
      applyPreference: (action: () => Promise<unknown>, when: boolean) => Promise<void>;
    }).applyPreference.bind(service);

    await expectAsync(applyPreference(failing, true)).toBeResolved();

    expect(failing).toHaveBeenCalled();
    expect(service.deviceError()).toContain('audio output');
    expect(service.connectionState()).toBe('disconnected');
  });

  it('skips audio-output selection when the browser cannot do it', () => {
    const service = TestBed.inject(MeetingRoomService);
    const supports = (service as unknown as { supportsAudioOutputSelection: () => boolean })
      .supportsAudioOutputSelection.bind(service);

    expect(supports()).toBe('setSinkId' in HTMLMediaElement.prototype);
  });
});
