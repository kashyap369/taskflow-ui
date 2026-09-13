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

  // Production regression: the local microphone was attached to the DOM and only muted afterwards.
  // livekit-client resets `element.muted` every time it re-attaches a restarting local track, and
  // selecting a microphone restarts it — so callers heard their own voice back with nobody else in
  // the room. The element must never be created in the first place.
  it('never renders the local microphone track', () => {
    const service = TestBed.inject(MeetingRoomService);
    const container = document.createElement('div');
    const attach = jasmine.createSpy('attach');
    const internals = attachInternals(service, container);

    internals.attachTrack({ kind: 'audio', sid: 'TR_local', attach }, { identity: 'me', name: 'Me', isLocal: true });

    expect(attach).not.toHaveBeenCalled();
    expect(container.querySelector('audio')).toBeNull();
  });

  it('renders a remote audio track unmuted so the room can be heard', () => {
    const service = TestBed.inject(MeetingRoomService);
    const container = document.createElement('div');
    const element = document.createElement('audio');
    const attachedElements: HTMLMediaElement[] = [];
    const attach = jasmine.createSpy('attach').and.callFake(() => { attachedElements.push(element); return element; });
    const internals = attachInternals(service, container);

    internals.attachTrack({ kind: 'audio', sid: 'TR_remote', attach, attachedElements }, { identity: 'them', name: 'Them', isLocal: false });

    expect(attach).toHaveBeenCalled();
    expect(element.muted).toBeFalse();
    expect(container.querySelector('audio')).toBe(element);
  });

  // Production regression: `track.attach()` mints a new element every call, so the same remote track
  // delivered twice — TrackSubscribed plus attachExistingTracks() on join, or a reconnect re-emitting
  // subscriptions — played twice over itself. The overlap count tracked the participant count, which
  // is what callers heard as one echo per person in the room.
  it('attaches a track once however many times the room delivers it', () => {
    const service = TestBed.inject(MeetingRoomService);
    const container = document.createElement('div');
    const element = document.createElement('audio');
    const attachedElements: HTMLMediaElement[] = [];
    const attach = jasmine.createSpy('attach').and.callFake(() => { attachedElements.push(element); return element; });
    const internals = attachInternals(service, container);
    const track = { kind: 'audio', sid: 'TR_remote', attach, attachedElements };
    const participant = { identity: 'them', name: 'Them', isLocal: false };

    internals.attachTrack(track, participant);
    internals.attachTrack(track, participant);
    internals.attachTrack(track, participant);

    expect(attach).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll('audio').length).toBe(1);
  });

  function attachInternals(service: MeetingRoomService, container: HTMLElement): {
    attachTrack: (track: unknown, participant: unknown) => void;
  } {
    const internals = service as unknown as {
      mediaContainer: HTMLElement | null;
      attachTrack: (track: unknown, participant: unknown) => void;
    };
    internals.mediaContainer = container;
    return { attachTrack: internals.attachTrack.bind(service) };
  }

  it('skips audio-output selection when the browser cannot do it', () => {
    const service = TestBed.inject(MeetingRoomService);
    const supports = (service as unknown as { supportsAudioOutputSelection: () => boolean })
      .supportsAudioOutputSelection.bind(service);

    expect(supports()).toBe('setSinkId' in HTMLMediaElement.prototype);
  });
});
